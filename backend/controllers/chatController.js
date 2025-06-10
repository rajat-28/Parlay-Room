const Chat = require("../models/chatModel.js");
const User = require("../models/userModel");

const addChat = async (req, res) => {
  const { userId } = req.body;

  // console.log("reqq", req.user.id);

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};

const fetchChats = async(req,res)=>{
    try{
        Chat.find({users: {$elemMatch: { $eq: req.user.id}}})
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt:-1})   //sort in order of latest message
        .then(async(result)=>{
            result = await User.populate(result, {
                path: "latestMessage.sender",
                select: "name pic email",
              });
            res.status(200).send(result);
        })
    }catch(error){
        res.status(400);
    throw new Error(error.message);
    }
}

const createGroup = async (req, res) => {
    const { name, users } = req.body;
  console.log(req.body);
    if (!users || !name) {
      return res.status(400).json("Please fill all the fields");
    }
  
    if (users.length < 2) {
      return res.status(400).json("More than 2 users are required to form a group chat");
    }
  
    users.push(req.user.id); // Add current user
  
    try {
      const groupChat = await Chat.create({
        chatName: name,
        users,
        isGroupChat: true,
        groupAdmin: req.user.id,
      });
  
      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
  
      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
const renameGroup = async(req,res) =>{
    const { chatId, chatName } = req.body;
    
    const updateName = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName
        },
        {
            new: true
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if(updateName){
        res.status(200).json("updated the name");
    }else{
        res.status(404).json("no updated")
    }
}

const addToGroup = async(req,res)=>{
    const { chatId,userId }=req.body;

    const addMember = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users:userId}
        },
        {
            new:true
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if(addMember){
        return res.status(400).json("User Added Successfully");
    }else{
        res.status(404).json("not added")
    }
}

const removeFromGrp = async(req,res) =>{
    const {chatId,userId} = req.body;

    const removeMem = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {users: userId}
        },
        {
            new:true
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if(removeMem){
        return res.status(400).json("User removed Successfully");
    }else{
        res.status(404).json("not removed")
    }
}
module.exports = { addChat,fetchChats,createGroup,renameGroup,addToGroup,removeFromGrp };
