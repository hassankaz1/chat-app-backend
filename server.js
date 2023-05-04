"use strict";
const { Server } = require("socket.io")



const app = require("./app");

const http = require("http");
const User = require("./models/user");
const FriendRequest = require("./models/friendrequest")
const Friendship = require("./models/friendship")
const Conversation = require("./models/conversation")
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
  const uid = socket.handshake.query["uid"];

  const socket_id = socket.id

  console.log(`User connected ${socket_id}`);

  // update socket id in db under user
  if (uid) {
    User.update(uid, {
      socket_id,
      on_line: true
    })
  }


  // We can write our socket event listeners in here...
  socket.on("friend_request", async (data) => {
    console.log(data)

    const recipient = data.to
    const sender = data.from

    await FriendRequest.createRequest(recipient, sender)


    const to = await User.get(recipient);
    const from = await User.get(sender);
    // const from = await User.findById(data.from).select("socket_id");

    // // create a friend request
    // await FriendRequest.create({
    //   sender: data.from,
    //   recipient: data.to,
    // });
    // emit event request received to recipient
    io.to(to.socket_id).emit("friend_request_recieved", {
      message: `${from.first_name} sent a friend request`,
    });
    io.to(from.socket_id).emit("request_sent", {
      message: "Request Sent successfully!",
    });
  });


  socket.on("accept_request", async (data) => {
    // accept friend request => add ref of each other in friends array
    console.log(data);
    const request = await FriendRequest.get(data.request_id);


    // create friendship
    const r = await Friendship.createFriendship(request.sender, request.recipient)


    // delete friend request 
    const l = await FriendRequest.remove(request.id)


    const to = await User.get(request.sender);
    const from = await User.get(request.recipient);


    // emit event to both of them
    // emit event request accepted to both
    io.to(to.socket_id).emit("friend_request_accepted", {
      message: `${from.first_name} has accepted your request`,
    });

    io.to(from.socket_id).emit("friend_request_accepted", {
      message: `${to.first_name} is your new friend`,
    });
    // io.to(sender?.socket_id).emit("request_accepted", {
    //   message: "Friend Request Accepted",
    // });
    // io.to(receiver?.socket_id).emit("request_accepted", {
    //   message: "Friend Request Accepted",
    // });
  });

  socket.on("start_conversation", async (data) => {

    const res = await Conversation.createOrFindConversation(data.to, data.from)

    console.log(res)

    socket.emit("start_conversation", res)
  })


  socket.on("end", async (data) => {
    // Find user by ID and set status as offline
    if (data.uid) {
      User.update(uid, {
        on_line: false
      })
    }



    // broadcast to all conversation rooms of this user that this user is offline (disconnected)
    console.log("closing connection");
    socket.disconnect(0);
  });

})


