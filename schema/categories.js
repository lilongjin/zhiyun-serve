//引入mongoose数据库操作模块
var mongoose = require("mongoose");

//分类的表结构
module.exports = new mongoose.Schema({
    // 分类名称
    name:String,
    //用户是否可选择发布
    user_edit:{
        type:Boolean,
        default:false
    }
});