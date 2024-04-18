// import library
import express from 'express'

import { Server } from "ws";

const PORT = 8080
const server = express()
    .listen(PORT, () => console.log(`[Server] Listening on https://localhost:${PORT}`))
const wss = new Server({ server })
let moraList: Mora[] = [];
// Connection opened
wss.on('connection', ws => {
    let message: Message;
    console.log('wss.clients.size',wss.clients.size)
    switch (wss.clients.size) {
        case 1:
            message = { UUID: '0', messageType: MessageType.UUID }
            ws.send(JSON.stringify(message))
            break;
        case 2:
            message = { UUID: '1', messageType: MessageType.UUID }
            ws.send(JSON.stringify(message))
            wss.clients.forEach(function (client) {
                client.send(JSON.stringify("玩家已經就位! 請決定你要出啥！"));
            });
            break;

        default:
            break;
    }
    ws.on('message', function message(data, isBinary) {
        const message: Message = isBinary ? data : JSON.parse(data);
        const messageType = message.messageType;

        switch (messageType) {
            case MessageType.MORA:
                const found = moraList.find((mora) => mora.UUID === message.UUID);
                if (found === undefined)
                    moraList.push({ UUID: message.UUID, Mora: message.messageContent });
                break;
            case MessageType.RESET:
                moraList = [];
                break;
            default:

                break;
        }
        if (moraList.length === wss.clients.size && wss.clients.size > 1) {
            wss.clients.forEach(function (client) {
                const message: Message = { messageType: MessageType.RESULT, messageResult: moraList }
                client.send(JSON.stringify(message));
            });
            moraList = [];
        }
    })
    // Connection closed
    ws.on('close', () => {
        console.log('Close connected')
    })
})

interface Mora {
    UUID: string,
    Mora: MoraTyep
}

interface Message {
    UUID?: string,
    messageType: MessageType,
    messageContent?: MoraTyep
    messageResult?: Mora[]
}

enum MessageType {
    UUID = 'UUID',
    MORA = 'MORA',//猜拳
    RESULT = 'RESULT',//結果
    RESET = 'RESET' //重來
}
enum MoraTyep {
    PAPER = 'PAPER',
    SCISSORS = 'SCISSORS',
    STONE = 'STONE'
}