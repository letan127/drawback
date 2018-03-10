import { Stroke } from '../src/app/stroke';
import { Room } from '../src/app/room';

let express = require('express');
let router = express.Router();
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
var rooms = {}; // Access each room's stroke data with its ID
var alphabet = '0123456789abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Generates a unique and random room ID
function generateID() {
    do {
        var url = '';
        for (var i = 0; i < 5; i++) {
            url += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
    }
    while (url in rooms);
    return url;
}

server.listen(4000);

router.get('', (req, res) => {
    var url = generateID();
    rooms[url] = new Room();
    var fullurl = '/rooms/' + url;
    res.redirect(fullurl);
})

// Begin listening for requests when a client connects
io.on('connection', (socket) => {
    console.log('user ' + socket.id + ' connected\n');

    // Remove user's data from all of their rooms before they disconnect
    socket.on('disconnecting', () => {
        Object.keys(socket.rooms).forEach(function(room) {
            if (room in rooms) {
                // Socket connections may be made before being redirected
                rooms[room].removeUser(socket.id);
            }
        });
    });

    // Client has already left their rooms
    socket.on('disconnect', () => {
        console.log('user ' + socket.id + ' disconnected\n');
    });

    // When the server receives a room ID, it will add the client to that room,
    // give them the current state of the canvas, and notify all other clients
    socket.on('room', (room) => {
        socket.join(room);
        if (!(room in rooms)) {
            // TODO: Remove this to ensure users can't create new rooms by changing URL
            // Only happens when user manually types a room URL
            rooms[room] = new Room();
        }
        rooms[room].addUser(socket.id);
        var init = {
            numUsers: rooms[room].getUsers(),
            strokes: rooms[room].getStrokes()
        };
        socket.emit('initUser', init);
        socket.to(room).emit('newUser');
    });

    // When a client sends a stroke, send it to all other clients in that room
    socket.on('stroke', (strokeMessage) => {
        socket.to(strokeMessage.room).emit('stroke', strokeMessage);
        rooms[strokeMessage.room].add(strokeMessage.stroke);
    });

    // When a client requests a strokeID, send an available ID for that room
    socket.on('strokeID', (room) => {
        socket.emit('strokeID', rooms[room].getID());
        rooms[room].incrementID();
    });

    // When a client clicks clear, tell all other clients to clear
    socket.on('clear', (room) => {
        socket.to(room).emit('clear');
        rooms[room].clear();
    });

    // When a client clicks undo, tell all other clients in the room to undo
    // that stroke
    socket.on('undo', (undoStroke) => {
       socket.to(undoStroke.room).emit('undo', undoStroke.strokeID);
       rooms[undoStroke.room].setDraw(undoStroke.strokeID, false);
   });

    // When a client clicks redo, tell all other clients in the room to redo
    // that stroke
    socket.on('redo', (redoStroke) => {
       socket.to(redoStroke.room).emit('redo', redoStroke.strokeID);
       rooms[redoStroke.room].setDraw(redoStroke.strokeID, true);
    });

    // Let client know if the room they want to move to exists
    socket.on('check', (newRoom) => {
        if (newRoom in rooms)
            var hasRoom = true;
        else
            var hasRoom = false;

        var checkRoom = {
            newRoom = newRoom,
            hasRoom = hasRoom
        }
        socket.emit('check', checkRoom);
    });
});

module.exports = router;
