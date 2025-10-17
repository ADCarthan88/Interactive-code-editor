import io from 'socket.io-client';

export class CollaborationManager {
    constructor(editor) {
        this.editor = editor;
        this.socket = io('ws://localhost:3001');
        this.cursors = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('code-change', (data) => {
            this.editor.applyRemoterCHange(data);
        });

        this.socket.on('cursor-move', (data) => {
            this.updateRemoteCursor(data);
        });
    }

    broadcastChange(change) {
        this.socket.emit('code-change', {
            change,
            userId: this.userId,
            timestamp: Date.now()
        });
    }
}