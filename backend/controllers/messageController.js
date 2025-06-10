const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessage = async(req,res) =>{
    const {chatId,content} = req.body;

    if(!chatId || !content){
        return res.status(400).json("Invalid data passed into request");
    }
    const newMessage = {
        sender: req.user.id,
        content: content,
        chat: chatId
    }
    try{
        var message = await Message.create(newMessage);
        message = await message.populate("sender","name pic");
        message = await message.populate("chat")
        message = await User.populate(message,{
            path: "chat.users",
            select: "name pic email"
        });
        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage: message
        })
        res.json(message);
    }catch(error){
        return res.status(400).json(error.message);
    }
}

const allMessages = async(req,res)=>{
    try{
        const messages = await Message.find({chat: req.params.chatId})
                        .populate("sender","name pic email")
                        .populate("chat")

        res.status(200).json(messages);

    }catch(error){
        return res.status(400).json(error.message);
    }
}
module.exports = { sendMessage,allMessages };