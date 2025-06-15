from flask import Flask, request, jsonify, send_file, render_template, send_from_directory
from flask_cors import CORS
import requests
import os
import uuid
import logging
import time
from datetime import datetime
import threading
import pathlib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # 允许所有跨域请求

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 第三方API配置
THIRD_PARTY_API_BASE = "https://api.hf55bec9b.nyat.app:54450"
GENERATE_ENDPOINT = f"{THIRD_PARTY_API_BASE}/generate_hakka_music"
STATUS_ENDPOINT = f"{THIRD_PARTY_API_BASE}/status"  # /status/{task_id}
DOWNLOAD_ENDPOINT = f"{THIRD_PARTY_API_BASE}/download"  # /download/{filename}

HEADERS = {
    "Content-Type": "application/json"
}

# 临时任务存储
TASKS = {}

# 计算 generated_audio 的路径（与 server.py 同级）
current_dir = os.path.dirname(os.path.abspath(__file__))
GENERATED_AUDIO_DIR = os.path.join(current_dir, "generated_audio")
os.makedirs(GENERATED_AUDIO_DIR, exist_ok=True)

print(f"音频文件存储路径: {GENERATED_AUDIO_DIR}")  # 调试用

def process_async(task_id, prompt, duration):
    try:
        # 1. 调用生成接口
        payload = {"prompt": prompt, "duration": duration}
        logger.info(f"调用生成接口: {GENERATE_ENDPOINT}")
        generate_resp = requests.post(GENERATE_ENDPOINT, json=payload, headers=HEADERS, timeout=30)
        
        if not generate_resp.ok:
            error_msg = f"生成请求失败: {generate_resp.text}"
            logger.error(error_msg)
            TASKS[task_id].update({"status": "failed", "error": error_msg})
            return

        # 2. 获取第三方API的task_id
        third_party_taskid = generate_resp.json().get("taskid")
        if not third_party_taskid:
            error_msg = "第三方API未返回taskid"
            logger.error(error_msg)
            TASKS[task_id].update({"status": "failed", "error": error_msg})
            return

        logger.info(f"第三方任务ID: {third_party_taskid}")

        # 3. 轮询状态接口
        max_retries = 30  # 最多轮询30次（约60秒）
        retry_count = 0
        filename = None

        while retry_count < max_retries:
            status_url = f"{STATUS_ENDPOINT}/{third_party_taskid}"
            logger.info(f"轮询状态: {status_url}")
            status_resp = requests.get(status_url, headers=HEADERS, timeout=10)

            if not status_resp.ok:
                error_msg = f"状态查询失败: {status_resp.text}"
                logger.error(error_msg)
                TASKS[task_id].update({"status": "failed", "error": error_msg})
                return

            status_data = status_resp.json()
            current_status = status_data.get("status")

            if current_status == "completed":
                filename = status_data.get("filename")
                if not filename:
                    error_msg = "状态为completed但未返回filename"
                    logger.error(error_msg)
                    TASKS[task_id].update({"status": "failed", "error": error_msg})
                    return
                break

            elif current_status == "failed":
                error_msg = f"任务失败: {status_data.get('error', '未知错误')}"
                logger.error(error_msg)
                TASKS[task_id].update({"status": "failed", "error": error_msg})
                return

            logger.info(f"任务状态: {current_status}, 等待中...")
            time.sleep(2)  # 每2秒查询一次
            retry_count += 1

        if not filename:
            error_msg = "轮询超时，未获取到文件名"
            logger.error(error_msg)
            TASKS[task_id].update({"status": "failed", "error": error_msg})
            return

        # 4. 下载音频
        download_url = f"{DOWNLOAD_ENDPOINT}/{filename}"
        logger.info(f"下载音频: {download_url}")
        audio_resp = requests.get(download_url, headers=HEADERS, timeout=30)

        if not audio_resp.ok:
            error_msg = f"音频下载失败: {audio_resp.text}"
            logger.error(error_msg)
            TASKS[task_id].update({"status": "failed", "error": error_msg})
            return

        # 5. 保存音频文件
        audio_path = os.path.join(GENERATED_AUDIO_DIR, f"{task_id}.wav")
        with open(audio_path, "wb") as f:
            f.write(audio_resp.content)

        TASKS[task_id].update({
            "status": "completed",
            "audio_path": audio_path
        })
        logger.info(f"音频生成完成: {audio_path}")

    except Exception as e:
        error_msg = f"异步处理异常: {str(e)}"
        logger.error(error_msg)
        TASKS[task_id].update({"status": "failed", "error": error_msg})

@app.route('/generate_hakka_music', methods=['POST'])
def generate_hakka_music():
    try:
        data = request.get_json()
        prompt = data.get("prompt")
        duration = data.get("duration", 30)

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        if not isinstance(duration, int) or not 5 <= duration <= 120:
            return jsonify({"error": "Duration must be integer between 5-120"}), 400

        task_id = str(uuid.uuid4())
        TASKS[task_id] = {
            "status": "processing",
            "start_time": datetime.now().isoformat(),
            "prompt": prompt,
            "duration": duration
        }

        thread = threading.Thread(target=process_async, args=(task_id, prompt, duration))
        thread.start()

        return jsonify({
            "status": "processing",
            "taskid": task_id,
            "message": "音乐生成任务已提交"
        }), 202

    except Exception as e:
        error_msg = f"服务器错误: {str(e)}"
        logger.error(error_msg)
        return jsonify({"error": error_msg}), 500

@app.route('/check_status/<task_id>', methods=['GET'])
def check_status(task_id):
    if task_id not in TASKS:
        return jsonify({"error": "Invalid task ID"}), 404
    
    task = TASKS[task_id]
    return jsonify({
        "status": task["status"],
        "start_time": task["start_time"],
        "error": task.get("error")
    })

@app.route('/download/<task_id>', methods=['GET'])
def download(task_id):
    if task_id not in TASKS or TASKS[task_id]["status"] != "completed":
        return jsonify({"error": "Task not completed or invalid"}), 400
    
    audio_path = TASKS[task_id].get("audio_path")
    if not audio_path or not os.path.exists(audio_path):
        return jsonify({"error": "Audio file not found"}), 404
    
    return send_file(audio_path, mimetype="audio/wav", as_attachment=True)

@app.route('/generated_audio/<path:filename>')
def static_files(filename):
    return send_from_directory(GENERATED_AUDIO_DIR, filename)
# 处理前端路由
@app.route('/<path:path>')
def frontend_route(path):
    return send_from_directory('frontend', path)
if __name__ == '__main__':
    os.makedirs("generated_audio", exist_ok=True)
    app.run(host='0.0.0.0', port=3558, threaded=False, debug=True)

