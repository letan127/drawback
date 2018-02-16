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


io.on('connection', (socket) => {
	console.log('user connected');
	socket.on('new-message', (message) => {
			 io.to(message.room).emit('new-message', message);
	 });
	socket.on('room', function(room) {
	 	socket.join(room);
	 });
});

module.exports = router;
