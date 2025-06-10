const express = require("express");
const { chats } = require("./data/data.js");
const connectDb = require("./config/db.js");
const dotenv = require("dotenv");
const {
  registerUser,
  loginUser,
  allUsers,
} = require("./controllers/userController.js");
const { auth } = require("./middlewares/authUser.js");
const cookieParser = require("cookie-parser");
const {
  addChat,
  fetchChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeFromGrp,
} = require("./controllers/chatController.js");
const {
  sendMessage,
  allMessages,
} = require("./controllers/messageController.js");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

dotenv.config();
connectDb();

// app.get('/',(req,res)=>{
//     res.send("Api test");
// })
// app.get('/api/chat',(req,res)=>{
//     res.send(chats);
// })
// app.get('/api/chat/:id',(req,res)=>{
//     const partChat = chats.find((c)=>c._id === req.params.id);
//     res.send(partChat);
// })

//users
app.get("/users", auth, allUsers); // /   api/user
app.post("/login", loginUser); // api/user/login
app.post("/signup", registerUser); // api/user/

//chat
app.get("/getchats", auth, fetchChats); // /     api/chat
app.post("/addchat", auth, addChat); // /api/chat
app.post("/group", auth, createGroup); //  api/chat/group
app.put("/rename", auth, renameGroup); // api/chat/rename
app.post("/addtogrp", auth, addToGroup); // api/chat/groupadd
app.post("/removegrp", auth, removeFromGrp); // api/chat/groupremove

//message  //api/message
app.post("/sendMssg", auth, sendMessage); // /api/message
app.get("/allMssg/:chatId", auth, allMessages); // api/message/:id


app.use(express.json());
app.use(express.static('build'));

const server = app.listen(5000, () => {
  console.log("Running");
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("socket id ", userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room ", room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      console.log("chat.users not defined");
      return;
    }

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });


});