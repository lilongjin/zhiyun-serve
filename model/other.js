//引入mongoose数据库操作模块
var mongoose = require("mongoose");
//引入数据库系统设置表结构文件
var otherSchema = require("../schema/others.js");

//创建模型类文件
var other_model = mongoose.model("Other",otherSchema);

module.exports = other_model;
