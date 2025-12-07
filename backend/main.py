import eventlet
eventlet.monkey_patch()

from app import create_app, socketio
from app.config import Config

app = create_app()

if __name__ == '__main__':
    # Disable the Flask reloader to avoid Windows conflict
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, use_reloader=False)
