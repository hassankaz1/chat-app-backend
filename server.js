"use strict";
const { Server } = require("socket.io")



const app = require("./app");

const http = require("http");
const User = require("./models/user");
const FriendRequest = require("./models/friendrequest")
const Friendship = require("./models/friendship")
const Conversation = require("./models/conversation")
const Message = require("./models/message")
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

  });

  socket.on("start_conversation", async (data) => {


    const already_exists = await Conversation.findConversation(data.to, data.from)

    if (already_exists) {

      socket.emit("open_conversation", already_exists)
    } else {

      const res = await Conversation.createConversation(data.to, data.from)

      const from = await User.get(data.from)
      const to = await User.get(data.to)

      socket.emit("start_conversation", res)

      res.user = from

      io.to(to.socket_id).emit("start_conversation", res);


    }

  })


  socket.on("get_existing_convos", async ({ uid }, callback) => {
    const existing_conversations = await Conversation.findAllConversations(uid)

    const mod_conversations = await Promise.all(existing_conversations.map(async (convo) => {
      if (convo.member_one == Number(uid)) {
        const user = await User.get(convo.member_two)
        convo.user = user
        convo.messages = await Message.findAllMessages(convo.cid)

        return convo
      } else {
        const user = await User.get(convo.member_one)
        convo.user = user
        convo.messages = await Message.findAllMessages(convo.cid)


        return convo
      }


    }))

    console.log(mod_conversations);

    callback(existing_conversations);
  });

  socket.on("message", async (data) => {

    const from = await User.get(data.sender);
    const to = await User.get(data.recipient);



    const res = await Message.createMessage(data)

    io.to(to.socket_id).emit("new_message", {
      data: res
    });

    io.to(from.socket_id).emit("new_message", {
      data: res
    });




  })


  socket.on("end", async (data) => {

    console.log(data.uid)
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


