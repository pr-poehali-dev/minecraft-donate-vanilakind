import os
import json
import socket
import struct
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """Уведомления в Telegram о заявках на спонсорство. При нажатии 'Выдано' — авто-выдача через RCON LuckPerms."""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]

    body = json.loads(event.get("body") or "{}")

    # Telegram webhook — нажатие кнопки
    if "callback_query" in body:
        cq = body["callback_query"]
        cq_id = cq["id"]
        callback_data = cq.get("data", "")
        message = cq.get("message", {})
        msg_id = message.get("message_id")
        original_text = message.get("text", "")
        cq_chat_id = message.get("chat", {}).get("id")
        user_name = cq.get("from", {}).get("first_name", "Админ")

        if callback_data.startswith("done_"):
            nick = callback_data[len("done_"):]

            # Выдаём привилегию через RCON
            rcon_result = _rcon_command(
                host=os.environ["RCON_HOST"],
                port=int(os.environ.get("RCON_PORT", "25575")),
                password=os.environ["RCON_PASSWORD"],
                command=f"lp user {nick} group set sponsor",
            )

            _tg_post(token, "answerCallbackQuery", {
                "callback_query_id": cq_id,
                "text": f"✅ Привилегия выдана {nick}!",
            })

            status = f"✅ *Выдано* — {user_name}\n🎮 RCON: `{rcon_result}`"
            new_text = original_text + f"\n\n{status}"
            _tg_post(token, "editMessageText", {
                "chat_id": cq_chat_id,
                "message_id": msg_id,
                "text": new_text,
                "parse_mode": "Markdown",
            })

        elif callback_data.startswith("notfound_"):
            nick = callback_data[len("notfound_"):]

            _tg_post(token, "answerCallbackQuery", {
                "callback_query_id": cq_id,
                "text": "❌ Перевод не найден",
            })

            new_text = original_text + f"\n\n❌ *Перевод не найден* — {user_name}"
            _tg_post(token, "editMessageText", {
                "chat_id": cq_chat_id,
                "message_id": msg_id,
                "text": new_text,
                "parse_mode": "Markdown",
            })

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"ok": True}),
        }

    # Новая заявка с сайта
    nick = body.get("nick", "—")
    privilege = body.get("privilege", "—")
    price = body.get("price", "—")
    proof = body.get("proof", "").strip()

    text = (
        f"💎 *Новая заявка — Спонсор*\n\n"
        f"👤 Ник: `{nick}`\n"
        f"⭐ Привилегия: *{privilege}*\n"
        f"💰 Сумма: *{price}*\n"
    )
    if proof:
        text += f"📋 Доп. инфо: {proof}\n"
    text += f"\n⏳ Проверь перевод и нажми кнопку ниже."

    reply_markup = json.dumps({
        "inline_keyboard": [[
            {"text": "✅ Выдать привилегию", "callback_data": f"done_{nick}"},
            {"text": "❌ Перевод не найден", "callback_data": f"notfound_{nick}"},
        ]]
    })

    result = _tg_post(token, "sendMessage", {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
        "reply_markup": reply_markup,
    })

    if not result.get("ok"):
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"ok": False, "error": result}),
        }

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"ok": True}),
    }


def _rcon_command(host: str, port: int, password: str, command: str) -> str:
    """Отправляет команду на сервер через RCON протокол."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(10)
        s.connect((host, port))

        # Аутентификация
        _rcon_send(s, 1, 3, password)
        auth_resp = _rcon_recv(s)
        if auth_resp[0] == -1:
            return "Ошибка: неверный RCON пароль"

        # Отправка команды
        _rcon_send(s, 2, 2, command)
        resp = _rcon_recv(s)
        return resp[2] or "OK"


def _rcon_send(s: socket.socket, req_id: int, req_type: int, payload: str):
    data = payload.encode("utf-8")
    packet = struct.pack("<iii", 10 + len(data), req_id, req_type) + data + b"\x00\x00"
    s.sendall(packet)


def _rcon_recv(s: socket.socket):
    header = s.recv(4)
    if len(header) < 4:
        return (-1, -1, "")
    length = struct.unpack("<i", header)[0]
    data = b""
    while len(data) < length:
        chunk = s.recv(length - len(data))
        if not chunk:
            break
        data += chunk
    req_id, req_type = struct.unpack("<ii", data[:8])
    payload = data[8:-2].decode("utf-8", errors="replace")
    return (req_id, req_type, payload)


def _tg_post(token: str, method: str, data: dict) -> dict:
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/{method}",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": e.read().decode()}
