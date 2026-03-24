import json
import socket
import struct


def handler(event: dict, context) -> dict:
    """Возвращает реальный онлайн Minecraft сервера VanilaKind."""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    host = "VanilaKind.minerent.io"
    port = 25565

    try:
        online, max_players = _ping_server(host, port)
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            "body": json.dumps({
                "online": True,
                "players": online,
                "max_players": max_players,
            }),
        }
    except Exception as e:
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            "body": json.dumps({
                "online": False,
                "players": 0,
                "max_players": 0,
                "error": str(e),
            }),
        }


def _pack_varint(val: int) -> bytes:
    result = b""
    while True:
        part = val & 0x7F
        val >>= 7
        if val:
            part |= 0x80
        result += bytes([part])
        if not val:
            break
    return result


def _read_varint(s: socket.socket) -> int:
    result = 0
    shift = 0
    while True:
        byte = s.recv(1)
        if not byte:
            raise ConnectionError("Соединение закрыто")
        b = byte[0]
        result |= (b & 0x7F) << shift
        if not (b & 0x80):
            break
        shift += 7
    return result


def _ping_server(host: str, port: int) -> tuple:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(5)
        s.connect((host, port))

        # Handshake
        host_bytes = host.encode("utf-8")
        handshake = (
            _pack_varint(0x00) +
            _pack_varint(47) +
            _pack_varint(len(host_bytes)) +
            host_bytes +
            struct.pack(">H", port) +
            _pack_varint(1)
        )
        packet = _pack_varint(len(handshake)) + handshake
        s.sendall(packet)

        # Status request
        s.sendall(b"\x01\x00")

        # Read response
        _read_varint(s)  # length
        _read_varint(s)  # packet id
        json_len = _read_varint(s)

        data = b""
        while len(data) < json_len:
            chunk = s.recv(json_len - len(data))
            if not chunk:
                break
            data += chunk

        status = json.loads(data.decode("utf-8"))
        players = status.get("players", {})
        online = players.get("online", 0)
        maximum = players.get("max", 0)
        return online, maximum
