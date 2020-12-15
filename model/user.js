//引入mongoose数据库操作模块
var mongoose = require("mongoose");
//引入数据库用户信息表结构文件
var userSchema = require("../schema/users.js");

//创建模型类文件
var user_model = mongoose.model("User",userSchema);

module.exports = user_model;
