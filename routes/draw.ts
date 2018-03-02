import { Stroke } from '../src/app/stroke';
let express = require('express');
let router = express.Router();
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
let strokeIDMap = new Map();
let strokeArrays = {};
let currentRooms = {};
var alphabet = '0123456789abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Generates a unique and random room ID
function generateID() {
    do {
        var url = '';
        for (var i = 0; i < 5; i++) {
            url += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
    }
    while(url in currentRooms);
    return url;
}

server.listen(4000);

app.get('')



router.get('', (req, res) => {
    var url = generateID();
    currentRooms[url] = true;
    var fullurl = '/rooms/' + url;
    res.redirect(fullurl);
})

// Begin listening for requests when a client connects
io.on('connection', (socket) => {
    console.log('user connected');

    // When the server receives a room ID, it will add the client to that room
    // and give them the current state of the canvas
    socket.on('room', function(room) {
        socket.join(room);
        if (!strokeIDMap.has(room)) {
            strokeIDMap.set(room, 0);
            strokeArrays[room] = new Array<Stroke>();
        }
        io.to(socket.id).emit('newUser', strokeArrays[room]);
    });

    // When a client sends a stroke, send it to all other clients in that room
    socket.on('stroke', (strokeMessage) => {
        socket.to(strokeMessage.room).emit('stroke', strokeMessage);
        strokeArrays[strokeMessage.room].push(strokeMessage.stroke);
    });

    // When a client requests a strokeID, send an available ID for that room
    socket.on('strokeID', (room) => {
        socket.emit('strokeID', strokeIDMap.get(room));
        strokeIDMap.set(room, strokeIDMap.get(room) + 1);
    });

    // When a client clicks clear, tell all other clients to clear
    socket.on('clear', (room) => {
        socket.to(room).emit('clear');
        strokeArrays[room] = [];
        strokeIDMap.set(room, 0);
    });

    // When a client clicks undo, tell all other clients in the room to undo
    // that stroke
    socket.on('undo', (undoStroke) => {
       socket.to(undoStroke.room).emit('undo', undoStroke.strokeID);
       strokeArrays[undoStroke.room][undoStroke.strokeID].draw = false;
   });

   // When a client clicks redo, tell all other clients in the room to redo
   // that stroke
   socket.on('redo', (redoStroke) => {
       socket.to(redoStroke.room).emit('redo', redoStroke.strokeID);
       strokeArrays[redoStroke.room][redoStroke.strokeID].draw = true;
   });
});

module.exports = router;
