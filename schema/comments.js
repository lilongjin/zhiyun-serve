//引入mongoose数据库操作模块
var mongoose = require("mongoose");

//文章的评论
module.exports = new mongoose.Schema({
    // 关联字段,所属文章的id
    contentId:{
        //类型
        type:mongoose.Schema.Types.ObjectID,
        // 引用
        ref:"contents"
    },
    //评论内容
    commentContent:{
        type:String,
        default:""
    },
    // 评论人用户名
    username:{
        type:String,
        default:""
    },
    //回复内容
    answerContent:{
        type:Array,
        default:[]
    },
    //评论时间
    commentTime:{
        type:String,
        default:new Date()
    }
});
