//引入mongoose数据库操作模块
var mongoose = require("mongoose");

//文章的表结构
module.exports = new mongoose.Schema({
    // 关联字段,所属分类的id
    category:{
      //类型
        type:mongoose.Schema.Types.ObjectID,
      // 引用
        ref:"Category"
    },
    // 关联字段,文章作者id
    author:{
        //类型
        type:mongoose.Schema.Types.ObjectID,
        // 引用
        ref:"User"
    },
    //文章标题
    title:{
        type:String,
        default:""
    },
    //文章内容
    content:{
        type:String,
        default:""
    },
    //发布时间
    addtime:{
        type:String,
        default:new Date()
    },
    //文章阅读数量
    look:{
        type:Number,
        default:0
    },
    //文章阅读数量
    comments_num:{
        type:Number,
        default:0
    },
    //文章分类编号
    num:{
        type:Number,
        default:null
    },
    //文章点赞数量
    zan:{
        type:Number,
        default:0
    },
});
