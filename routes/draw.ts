import { Stroke } from '../src/app/stroke';
let express = require('express');
let router = express.Router();
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
//const port = process.env.PORT || 3000;
let strokeIDMap = new Map();
let strokeArrays = {};

server.listen(4000);

router.get('/', (req, res) => {
    res.send('api works');
});

// Begin listening for message when a client connects to the server
io.on('connection', (socket) => {
    console.log('user connected');

    // When the server receives a room ID, it will add the client to that room
    socket.on('room', function(room) {
        socket.join(room);
        if (!strokeIDMap.has(room)) {
            strokeIDMap.set(room, 0);
            strokeArrays[room] = new Array<Stroke>();
        }
        io.to(socket.id).emit('newUser', strokeArrays[room]);
    });

    // When the server receives a stroke from a client, it sends the stroke
    // to all clients in that room except for the sender
    socket.on('stroke', (strokeMessage) => {
        socket.to(strokeMessage.room).emit('stroke', strokeMessage);
        strokeArrays[strokeMessage.room].push(strokeMessage.stroke);
    });

    // When the server recieves a strokeID request from a client, it sends
    // an available ID in that room to the sender
    socket.on('strokeID', (room) => {
        socket.emit('strokeID', strokeIDMap.get(room));
        strokeIDMap.set(room, strokeIDMap.get(room) + 1);
    });

    // When the server receives a clear from a client in a certain room,
    // it sends a clear event back to all clients in that room except for the sender
    socket.on('clear', (room) => {
        socket.to(room).emit('clear');
    });
});

module.exports = router;
