"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import library
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const PORT = 8080;
const server = (0, express_1.default)()
    .listen(PORT, () => console.log(`[Server] Listening on https://:${PORT}`));
const wss = new ws_1.Server({ server });
let moraList = [];
// Connection opened
wss.on('connection', ws => {
    let message;
    console.log('wss.clients.size', wss.clients.size);
    switch (wss.clients.size) {
        case 1:
            message = { UUID: '0', messageType: MessageType.UUID };
            ws.send(JSON.stringify(message));
            break;
        case 2:
            message = { UUID: '1', messageType: MessageType.UUID };
            ws.send(JSON.stringify(message));
            wss.clients.forEach(function (client) {
                client.send(JSON.stringify("玩家已經就位! 請決定你要出啥！"));
            });
            break;
        default:
            break;
    }
    ws.on('message', function message(data, isBinary) {
        const message = isBinary ? data : JSON.parse(data);
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
                const message = { messageType: MessageType.RESULT, messageResult: moraList };
                client.send(JSON.stringify(message));
            });
            moraList = [];
        }
    });
    // Connection closed
    ws.on('close', () => {
        console.log('Close connected');
    });
});
var MessageType;
(function (MessageType) {
    MessageType["UUID"] = "UUID";
    MessageType["MORA"] = "MORA";
    MessageType["RESULT"] = "RESULT";
    MessageType["RESET"] = "RESET"; //重來
})(MessageType || (MessageType = {}));
var MoraTyep;
(function (MoraTyep) {
    MoraTyep["PAPER"] = "PAPER";
    MoraTyep["SCISSORS"] = "SCISSORS";
    MoraTyep["STONE"] = "STONE";
})(MoraTyep || (MoraTyep = {}));
