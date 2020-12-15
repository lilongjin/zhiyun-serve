//引入mongoose数据库操作模块
var mongoose = require("mongoose");

//轮播图的表结构
module.exports = new mongoose.Schema({
    //轮播图片url
    url:{
        type:String,
        default:""
    },
    //添加时间
    addTime:{
        type:String,
        default:""
    },
});