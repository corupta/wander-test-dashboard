const { Server } = require("socket.io");

const io = new Server({ cors: true });

io.on("connection", (socket) => {
  console.log('new socket connection');
  socket.on("data", (data, timestamp = Date.now()) => {
    console.log('ts', timestamp);
    socket.broadcast.emit("data", data, timestamp);
  });
  socket.on('disconnect', () => {
    console.log('a socket disconnected');
  })
});

io.listen(8080);
console.log('socket.io broadcaster listening on http://localhost:8080')
