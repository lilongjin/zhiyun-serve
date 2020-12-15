//引入mongoose数据库操作模块
var mongoose = require("mongoose");
//引入数据库用户信息表结构文件
var commentsSchema = require("../schema/comments.js");

//创建模型类文件
var comments_model = mongoose.model("Comments",commentsSchema);

module.exports = comments_model;
