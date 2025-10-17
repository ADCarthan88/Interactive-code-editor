const WebSocket = require('ws');
const Redis = require('redis');

class CollaborationServer {
    constructor() {
        this.wss = new WebSocket.Server({ port: 8080 });
        this.redis = Redis.createClient();
        this.rooms = new Map();
        this.setupHandlers();
    }

    setupHandlers() {
        this.wss.on('connection', (ws) => {
            ws.on('message', (data) => {
                const message = JSON.parse(data);
                this.handleMessage(ws, message);
            });
        });
    }

    handleMessage(ws, message) {
        switch (message.type) {
            case 'join_room':
                this.joinRoom(ws, message.roomId);
                break;
            case 'code_change':
                this.broadcastChange(message);
                break;
            case 'cursor_move':
                this.broadcastCursor(message);
                break;        
        }
    }

    broadcastToRoom(roomId, message, sender) {
        const room = this.rooms.get(roomId);
        if(room) {
            room.forEach(client => {
                if (client !== sender && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    }
}