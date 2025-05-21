from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import time
import uuid

app = Flask(__name__)
CORS(app)

# 用于临时保存任务状态和路径
TASKS = {}


@app.route('/generate_hakka_music', methods=['POST'])
def generate_hakka_music():
    data = request.get_json()
    prompt = data.get("prompt")
    duration = data.get("duration", 30)

    # 模拟生成任务
    taskid = str(uuid.uuid4())
    fake_audio_path = os.path.join("generated", f"{taskid}.wav")

    # 模拟异步任务：先记录状态为 processing
    TASKS[taskid] = {"status": "processing", "path": fake_audio_path}

    # 你可以在这里调用真实的 AI API，这里简化为直接写一个伪文件
    # 模拟异步生成后生成音频
    def generate_audio():
        time.sleep(5)  # 模拟生成耗时
        with open(fake_audio_path, "wb") as f:
            f.write(b"RIFF....WAVEfmt ")  # 写个 WAV 文件头占位
        TASKS[taskid]["status"] = "completed"

    # 启动线程异步模拟生成
    import threading
    threading.Thread(target=generate_audio).start()

    return jsonify({"status": "success", "taskid": taskid}), 202


@app.route('/check_status/<taskid>', methods=['GET'])
def check_status(taskid):
    if taskid in TASKS:
        return jsonify({"status": TASKS[taskid]["status"]})
    else:
        return jsonify({"error": "Invalid taskid"}), 404


@app.route('/download/<taskid>', methods=['GET'])
def download(taskid):
    if taskid in TASKS and TASKS[taskid]["status"] == "completed":
        path = TASKS[taskid]["path"]
        return send_file(path, mimetype="audio/wav")
    else:
        return jsonify({"error": "Task not completed or invalid"}), 400


if __name__ == '__main__':
    os.makedirs("generated", exist_ok=True)
    app.run(debug=True, port=5000)
