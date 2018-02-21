let express = require('express');
let router = express.Router();
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
//const port = process.env.PORT || 3000;

server.listen(4000);

router.get('/', (req, res) => {
    res.send('api works');
});

// Begin listening for message when a client connects to the server
io.on('connection', (socket) => {
    console.log('user connected');

    // When the server receives a stroke from a client, it sends the stroke
    // to all clients in that room
    socket.on('stroke', (strokeMessage) => {
        io.to(strokeMessage.room).emit('stroke', strokeMessage);
    });

    // When the server receives a room ID, it will add the client to that room
    socket.on('room', function(room) {
        socket.join(room);
    });

    // When the server receives a clear, it sends the sender's room ID to all
    // clients in that room
    socket.on('clear', (room) => {
        io.to(room).emit('clear', room);
    });
});

module.exports = router;
