import os
import json
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """Отправляет уведомление в Telegram при новой заявке на донат."""

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

    body = json.loads(event.get("body") or "{}")
    nick = body.get("nick", "—")
    privilege = body.get("privilege", "—")
    price = body.get("price", "—")
    proof = body.get("proof", "").strip()

    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]

    text = (
        f"🎮 *Новая заявка на донат*\n\n"
        f"👤 Ник: `{nick}`\n"
        f"⭐ Привилегия: *{privilege}*\n"
        f"💰 Сумма: *{price}*\n"
    )
    if proof:
        text += f"📋 Доп. инфо: {proof}\n"

    text += f"\n✅ Проверь перевод и выдай привилегию!"

    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    }).encode("utf-8")

    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"ok": False, "error": error_body}),
        }

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"ok": True}),
    }
