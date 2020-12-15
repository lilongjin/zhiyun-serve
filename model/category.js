//引入mongoose数据库操作模块
var mongoose = require("mongoose");
//引入数据库文章分类表结构文件
var categorySchema = require("../schema/categories.js");

//创建模型类文件
var category_model = mongoose.model("Category",categorySchema);

module.exports = category_model;
