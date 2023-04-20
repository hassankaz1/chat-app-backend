"use strict";
const { Server } = require("socket.io")


const app = require("./app");

const http = require("http");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

io.on("connection", async (socket) => {
  console.log(socket)
  console.log(JSON.stringify(socket.handshake.query))
  const user_id = socket.handshake.query("user_id");

  const socket_id = socket.id

  console.log(`User connected ${socket_id}`);

  if (user_id) {
    // update socket id in database for user 
  }

})


