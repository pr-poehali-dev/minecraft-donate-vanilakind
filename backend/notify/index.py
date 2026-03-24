import os
import json
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """Отправляет уведомление в Telegram при новой заявке на донат. Обрабатывает callback 'Выдано'."""

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

    # Telegram webhook — callback_query (нажатие кнопки "Выдано")
    if "callback_query" in body:
        cq = body["callback_query"]
        cq_id = cq["id"]
        message = cq.get("message", {})
        msg_id = message.get("message_id")
        original_text = message.get("text", "")
        cq_chat_id = message.get("chat", {}).get("id")
        user_name = cq.get("from", {}).get("first_name", "Админ")

        # Отвечаем на callback чтобы убрать часики
        _tg_post(token, "answerCallbackQuery", {
            "callback_query_id": cq_id,
            "text": "✅ Отмечено как выдано!",
        })

        # Редактируем сообщение — убираем кнопки, добавляем отметку
        new_text = original_text + f"\n\n✅ *Выдано* — {user_name}"
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

    # Обычная заявка с сайта
    nick = body.get("nick", "—")
    privilege = body.get("privilege", "—")
    price = body.get("price", "—")
    proof = body.get("proof", "").strip()

    text = (
        f"🎮 *Новая заявка на донат*\n\n"
        f"👤 Ник: `{nick}`\n"
        f"⭐ Привилегия: *{privilege}*\n"
        f"💰 Сумма: *{price}*\n"
    )
    if proof:
        text += f"📋 Доп. инфо: {proof}\n"
    text += f"\n⏳ Проверь перевод и выдай привилегию!"

    reply_markup = json.dumps({
        "inline_keyboard": [[
            {"text": "✅ Выдано", "callback_data": f"done_{nick}"},
            {"text": "❌ Не найден перевод", "callback_data": f"notfound_{nick}"},
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
