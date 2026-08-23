#!/bin/zsh
set -e

DEMO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$DEMO_ROOT"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")"

node backend/server.mjs &
API_PID=$!
node public-server.mjs &
WEB_PID=$!

cleanup() {
  kill "$API_PID" "$WEB_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 1
open "http://127.0.0.1:4173"

echo "Broke UP Demo 已启动： http://127.0.0.1:4173"
echo "手机同一 Wi-Fi 访问： http://${LAN_IP}:4173"
echo "关闭此窗口即可停止本地 Demo。"
wait
