//引入mongoose数据库操作模块
var mongoose = require("mongoose");

//用户的表结构
module.exports = new mongoose.Schema({
    username:String,
    password:String,
    userimg:String,
    time:String,
    sex:String,
    age:String,
    address:String,
    hangye:String,
    job:String,
    git:String,
    sign:String,
    SuperAdmin:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
});