let express = require('express');
let router = express.Router();
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
//const port = process.env.PORT || 3000;
let strokeIDMap = new Map();

server.listen(4000);

router.get('/', (req, res) => {
    res.send('api works');
});

// Begin listening for requests when a client connects
io.on('connection', (socket) => {
    console.log('user connected');

    // When the server receives a room ID, it will add the client to that room
    socket.on('room', function(room) {
        socket.join(room);
        if (!strokeIDMap.has(room))
            strokeIDMap.set(room, 0);
    });

    // When a client sends a stroke, send it to all other clients in that room
    socket.on('stroke', (strokeMessage) => {
        socket.to(strokeMessage.room).emit('stroke', strokeMessage);
    });

    // When a client requests a strokeID, send an available ID for that room
    socket.on('strokeID', (room) => {
        socket.emit('strokeID', strokeIDMap.get(room));
        strokeIDMap.set(room, strokeIDMap.get(room) + 1);
    });

    // When a client clicks clear, tell all other clients to clear
    socket.on('clear', (room) => {
        socket.to(room).emit('clear');
    });

    // When a client clicks undo, tell all other clients in the room to undo
    // that stroke
    socket.on('undo', (undoStroke) => {
        socket.to(undoStroke.room).emit('undo', undoStroke.strokeID);
    });

    // When a client clicks redo, tell all other clients in the room to redo
    // that stroke
    socket.on('redo', (redoStroke) => {
        socket.to(redoStroke.room).emit('redo', redoStroke.strokeID);
    });
});

module.exports = router;
