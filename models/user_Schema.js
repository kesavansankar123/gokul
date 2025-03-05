const mongoose =require('mongoose');
const Schema =mongoose.Schema;

const userSchema = new Schema({
    UserName:{
        type:String,
        required:true,
    },
    Email:{
        type:String,
        required:true, 
        Unique:true
    },
    Password:{
        type:String,
        minlenght:3,
        required:true,
        trim:true
       
    },
    resetpasswordToken:{
        type:String,
        default:null
    },
    resetpasswordExpires: {
        type: Date,
        default: null
    }


},{ tinestamps:true       
})

const User_Schema= mongoose.model('Task',userSchema)

module.exports=User_Schema;































