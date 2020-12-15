//引入mongoose数据库操作模块
var mongoose = require("mongoose");
//引入数据库用户信息表结构文件
var contentSchema = require("../schema/contents.js");

//创建模型类文件
var content_model = mongoose.model("Content",contentSchema);

module.exports = content_model;
