import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer;

export const clients = new Map<string, WebSocket>();

export const initWebSocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        const clientId = Math.random().toString(36).substring(2, 15);
        clients.set(clientId, ws);
        console.log(`Client ${clientId} connected`);

        // Enviar ID para o cliente
        ws.send(JSON.stringify({ type: 'connection', clientId }));

        ws.on('close', () => {
            clients.delete(clientId);
            console.log(`Client ${clientId} disconnected`);
        });

        ws.on('error', (error) => {
            console.error(`Client ${clientId} error:`, error);
            clients.delete(clientId);
        });

        // Opcional: responder a mensagens do cliente
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log(`Message from ${clientId}:`, message);

                // Echo opcional - enviar de volta para o mesmo cliente
                // ws.send(JSON.stringify({ ...message, echoed: true }));
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    });
};

export const broadcast = (message: object) => {
    if (!wss) {
        console.error('WebSocket server not initialized');
        return;
    }

    const serializedMessage = JSON.stringify(message);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(serializedMessage);
        }
    });
};

export const sendToClient = (clientId: string, message: object) => {
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        return true;
    }
    return false;
};

export const getConnectedClients = (): string[] => {
    return Array.from(clients.keys());
};