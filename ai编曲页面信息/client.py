import requests
import time

# 步骤1：发送生成请求
url = "http://127.0.0.1:3558/generate_hakka_music"
payload = {
    "prompt": "Hakka folk song about mountains and rivers",
    "duration": 30
}

print("提交生成请求中...")
response = requests.post(url, json=payload)
if response.status_code != 202:
    print("请求失败:", response.text)
    exit()

taskid = response.json()["taskid"]
print("任务ID:", taskid)

# 步骤2：轮询查询状态
status_url = f"http://127.0.0.1:3558/check_status/{taskid}"
while True:
    status_response = requests.get(status_url).json()
    print("当前状态:", status_response["status"])
    if status_response["status"] == "completed":
        break
    time.sleep(2)  # 等待2秒再查

# 步骤3：下载文件
download_url = f"http://127.0.0.1:3558/download/{taskid}"
audio_response = requests.get(download_url)
with open(f"downloaded_{taskid}.wav", "wb") as f:
    f.write(audio_response.content)
print(f"下载完成，文件保存为 downloaded_{taskid}.wav")
