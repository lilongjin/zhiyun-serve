//引入mongoose数据库操作模块
var mongoose = require("mongoose");
//引入数据库系统设置表结构文件
var bannerSchema = require("../schema/banners.js");

//创建模型类文件
var banner_model = mongoose.model("Banner",bannerSchema);

module.exports = banner_model;
