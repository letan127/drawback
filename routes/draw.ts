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
var liveStrokes = {};
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

//app.get('')

router.get('', (req, res) => {
    var url = generateID();
    rooms[url] = new Room();
    var fullurl = '/rooms/' + url;
    res.redirect(fullurl);
})

// Adds unknown user rooms to the server and reinitializes the user's room
// TODO: Check if room is in database and replace init with database room data
function join(room, socket) {
    // Remove socket from its auto-generated room and add it to the 5-char canvas room
    socket.leave(socket.id);
    socket.join(room);

    rooms[room].addUser(socket.id);
    var init = {
        name: rooms[room].getName(),
        numUsers: rooms[room].getUsers(),
        strokes: rooms[room].getStrokes(),
        liveStrokes: rooms[room].getLiveStrokes(),
        socketID: socket.id
    };
    socket.emit('initUser', init);
    socket.to(room).emit('updateUserCount', 1);
}

// Begin listening for requests when a client connects
io.on('connection', (socket) => {
    console.info('user ' + socket.id + ' connected\n');
    // TODO: Socket should join the 5-char room as soon as they connect
    //       To be implemented when server decides the room ID, not the client

    // Check every packet to see if the user's room exists; add room to server if it doesn't
    socket.use((packet, next) => {
        var room = (typeof packet[1] === 'object') ? packet[1].room : packet[1];
        if (room in rooms == false) {
            rooms[room] = new Room(); // TODO: Remove this if we want to restrict users from creating their own rooms
            join(room, socket);
            console.warn("Unknown room " + room + " detected");
        }
        return next(); // Send packet to its socket.on
    });

    // Remove user's data from all of their rooms before they disconnect
    socket.on('disconnecting', () => {
        var socketRooms = Object.keys(socket.rooms)
        // TODO: Remove this check if server will decide client rooms
        if (socket.id !== socketRooms[0]) {
            rooms[socketRooms[0]].removeUser(socket.id);
            socket.to(socketRooms[0]).emit('updateUserCount', -1);
        }
        else {
            // User left the room before their socket could request to join their canvas room
            console.error("Socket " + socket.id + "is in an unspecified, unknown room");
        }
    });

    // Client has already left their rooms
    socket.on('disconnect', () => {
        console.info('user ' + socket.id + ' disconnected\n');
    });

    // When the server receives a room ID, it will add the client to that room,
    // give them the current state of the canvas, and notify all other clients
    socket.on('room', (room) => {
        join(room, socket);
    });

    // When a client sends a new title, send it to all other clients in that room
    socket.on('title', (roomTitle) => {
        rooms[roomTitle.room].rename(roomTitle.title);
        socket.to(roomTitle.room).emit('title', roomTitle.title);
    })

    // When a client sends a stroke, send it to all other clients in that room
    socket.on('stroke', (strokeMessage) => {
        var strokeMessagewithID = {
            strokeID: strokeMessage.strokeID,
            userID: socket.id
        }
        socket.to(strokeMessage.room).emit('stroke', strokeMessagewithID);
        rooms[strokeMessage.room].add(socket.id);
    });

    // When a client requests a strokeID, send an available ID for that room
    socket.on('strokeID', (room) => {
        socket.emit('strokeID', rooms[room].getID());
        rooms[room].incrementID();
    });

    // When a client clicks clear, tell all clients to clear, including the sender
    socket.on('clear', (room) => {
        io.in(room).emit('clear');
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
        var hasRoom = (newRoom in rooms) ? true : false;
        socket.emit('check', hasRoom);
    });

    socket.on('newLiveStroke', (liveStroke) => {
        var strokeAndID = {
            stroke: liveStroke.stroke,
            id: socket.id
        }
        socket.to(liveStroke.room).emit('startLiveStroke', strokeAndID);
        rooms[liveStroke.room].addLiveStroke(socket.id, liveStroke.stroke);
    });

    socket.on('newPixel', (pixel) => {
        var pixelAndID = {
            pixel: pixel.pixel,
            id: socket.id
        }
        socket.to(pixel.room).emit('addPixelToStroke', pixelAndID);
        rooms[pixel.room].addPixel(socket.id, pixel.pixel);
    });
});
module.exports = router;
