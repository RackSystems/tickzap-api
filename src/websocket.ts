import { WebSocketServer, WebSocket } from 'ws';
import { Server, IncomingMessage } from 'http';
import IORedis from 'ioredis';
import cookie from 'cookie';

const redis = new IORedis(process.env.REDIS_URL);

//WebSocket types
export const ticketClients = new Map<string, WebSocket>();
export const globalClients = new Map<string, WebSocket>();

const initWebSocket = (
    server: Server,
    path: string,
    clientsMap: Map<string, WebSocket>,
    type: 'ticket' | 'global'
) => {
    const wss = new WebSocketServer({ server, path });

    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        const cookies = cookie.parse(req.headers.cookie || '');
        const userId = cookies.userId;

        if (!userId) {
            console.log(`Connection rejected from ${req.socket.remoteAddress}: missing userId cookie.`);
            ws.close(4001, 'Unauthorized');
            return;
        }

        const clientId = userId;
        clientsMap.set(clientId, ws);
        console.log(`${type === 'ticket' ? 'Ticket' : 'Global'} Client ${clientId} connected`);

        // send id for client
        ws.send(JSON.stringify({ type: 'connection', clientId, socketType: type }));

        ws.on('close', async () => {
            //clear and disconnect
            if (type === 'ticket') {
                await redis.del(`client:${clientId}:watching`);
            } else {
                const channelId = await redis.get(`client:${clientId}:channel`);
                if (channelId) {
                    await redis.srem(`channel:${channelId}:global`, clientId);
                }
                await redis.del(`client:${clientId}:channel`);
            }

            clientsMap.delete(clientId);
            console.log(`${type === 'ticket' ? 'Ticket' : 'Global'} Client ${clientId} disconnected`);
        });

        ws.on('error', (error) => {
            console.error(`${type === 'ticket' ? 'Ticket' : 'Global'} Client ${clientId} error:`, error);
            clientsMap.delete(clientId);
        });

        // client messages
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log(`${type === 'ticket' ? 'Ticket' : 'Global'} Message from ${clientId}:`, message);

                if (type === 'ticket') {
                    // ticket messages - send by frontend
                    if (message.type === 'watchTicket') {
                        const { ticketId } = message;
                        await redis.set(`client:${clientId}:watching`, ticketId);
                        console.log(`Client ${clientId} watching ticket ${ticketId}`);
                    }

                    if (message.type === 'unwatchTicket') {
                        await redis.del(`client:${clientId}:watching`);
                        console.log(`Client ${clientId} stopped watching ticket`);
                    }
                } else {
                    // global messages - send by frontend
                    if (message.type === 'joinChannel') {
                        const { channelId } = message;
                        await redis.sadd(`channel:${channelId}:global`, clientId);
                        await redis.set(`client:${clientId}:channel`, channelId);
                        console.log(`Client ${clientId} joined global channel ${channelId}`);
                    }

                    if (message.type === 'leaveChannel') {
                        const { channelId } = message;
                        await redis.srem(`channel:${channelId}:global`, clientId);
                        await redis.del(`client:${clientId}:channel`);
                        console.log(`Client ${clientId} left global channel ${channelId}`);
                    }
                }

            } catch (error) {
                console.error(`Error parsing ${type} message:`, error);
            }
        });
    });

    return wss;
};

export const initTicketWebSocket = (server: Server) => {
    return initWebSocket(server, '/ws-ticket', ticketClients, 'ticket');
};

export const initGlobalWebSocket = (server: Server) => {
    return initWebSocket(server, '/ws-global', globalClients, 'global');
};

// Ticket WebSocket
export const sendToTicketClient = (clientId: string, message: object) => {
    const client = ticketClients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        return true;
    }
    return false;
};

export const broadcastToWatchingTicket = async (ticketId: string, message: object) => {
    const keys = await redis.keys('client:*:watching');

    let count = 0;
    for (const key of keys) {
        const watchingTicketId = await redis.get(key);
        if (watchingTicketId === ticketId) {
            const clientId = key.replace('client:', '').replace(':watching', '');
            if (sendToTicketClient(clientId, message)) {
                count++;
            }
        }
    }
    console.log(`Broadcast to ${count} clients watching ticket ${ticketId}`);
    return count;
};

// Global WebSocket
export const sendToGlobalClient = (clientId: string, message: object) => {
    const client = globalClients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        return true;
    }
    return false;
};

export const broadcastToChannel = async (channelId: string, message: object) => {
    const clients = await redis.smembers(`channel:${channelId}:global`);
    let count = 0;

    clients.forEach(clientId => {
        if (sendToGlobalClient(clientId, message)) {
            count++;
        }
    });

    console.log(`Broadcast to ${count} clients in channel ${channelId}`);
    return count;
};

// broadcast geral
export const broadcastToAllTickets = (message: object) => {
    const serializedMessage = JSON.stringify(message);
    let count = 0;

    ticketClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(serializedMessage);
            count++;
        }
    });

    console.log(`Broadcast to ${count} ticket clients`);
    return count;
};

export const broadcastToAllGlobals = (message: object) => {
    const serializedMessage = JSON.stringify(message);
    let count = 0;

    globalClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(serializedMessage);
            count++;
        }
    });

    console.log(`Broadcast to ${count} global clients`);
    return count;
};

// helpers
export const getConnectedTicketClients = (): string[] => {
    return Array.from(ticketClients.keys());
};

export const getConnectedGlobalClients = (): string[] => {
    return Array.from(globalClients.keys());
};