const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userModel = new mongoose.Schema({
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
},
{ timestamps: true }
)
userModel.pre("save",async function(next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password,10);
  next();
})

userModel.methods.matchPassword = async function(password) {
  console.log("check pass");
  return await bcrypt.compare(password, this.password)
}
const User = mongoose.model("User",userModel);
module.exports = User;