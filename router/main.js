/*
* 项目依赖的模块文件
* */
//express框架
var express = require("express");

/*
* 数据库模型文件
* */
//文章分类模型
var Category = require("../model/category.js");
//文章内容模型
var Content = require("../model/content.js");
//文章评论模型
var Comment = require("../model/comment.js");
//用户信息模型
var User = require("../model/user.js");
//轮播图模型
var Banner = require("../model/banner.js");

//使用路由模块
var router = express.Router();

//设置通用数据
var data;
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,//用户信息
        category_list: [],//文章分类信息
    };
    //根据筛选条件从数据库所有分类信息
    Category.find().sort({_id: 1}).then(function (category_list) {
        data.category_list = category_list;
    });
    //获取超级管理员信息
    User.findOne({
        SuperAdmin: true
    }).then(function (SuperAdmin) {
        data.SuperAdmin = SuperAdmin;
    });
    //查询轮播图信息
    Banner.find().sort({_id: -1}).limit(1).then(function (banner_list) {
        data.banner_list = banner_list;
    });
    next();
});
//搜索全部文章
router.post("/content_all_search", function (req, res, next) {
    Content.find().populate(["category", "author"]).then(function (content) {
        res.json(content);
    });
});
//分次获取文章
router.post("/content_all", function (req, res, next) {
    //当前加载次数
    var page = req.body.page || 1;
    //每次加载数据量
    var limit = 5;
    //每次获取数据的下标起始位置
    var skip = (page - 1) * limit;
    Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(["category", "author"]).then(function (content) {
        if (content) {
            res.json(content);
        }
    });
});
//获取热门推荐
router.post("/content_all_hot", function (req, res, next) {
    //当前加载次数
    var page = req.body.page || 1;
    //每次加载数据量
    var limit = 5;
    //每次获取数据的下标起始位置
    var skip = (page - 1) * limit;
    Content.find().sort({look: -1}).limit(limit).skip(skip).populate(["category", "author"]).then(function (content) {
        if (content) {
            res.json(content);
        }
    });
});
//用户最新动态
router.post("/content", function (req, res, next) {
    //获取用户的文章总数量
    Content.find({
        author: req.body.userid,
    }).populate(["category"]).then(function (all_content) {
        //当前加载次数
        var page = req.body.page || 1;
        //每次加载数据量
        var limit = 10;
        //每次获取数据的下标起始位置
        var skip = (page - 1) * limit;
        //返回当前页数的数据量
        Content.find({
            author: req.body.userid,
        }).sort({_id: -1}).limit(limit).skip(skip).then(function (content_page) {
            var content_data = {
                all_content: all_content,
                more_content: content_page
            }
            res.json(content_data);
        });
    });
});
//文章详情
router.post("/content_detail", function (req, res, next) {
    //根据id在数据库中查询读取该文章
    Content.findOne({
        _id: req.body.contentid
    }).populate(["author"]).then(function (content) {
        //浏览量加1
        content.look++;
        content.save();
        //查找当前文章所属评论
        Comment.find({
            contentId: req.body.contentid
        }).then(function (comment) {
            var detail_data = {
                content_detail: content,
                comment_list: comment
            };
            res.json(detail_data)
        });
    });
});
//文章评论列表
router.get("/comment_list", function (req, res, next) {
    //获取文章id
    var commentId = req.query.commentId || "";
    //根据id在数据库中查询读取该文章
    Content.findOne({
        _id: commentId
    }).then(function (comment_list) {
        //将查询到的文章对应的评论列表转以json格式返回给前端
        res.json(comment_list);
    })
});
//热帖排行
router.post("/hot_ranking", function (req, res, next) {
    var limit = 5;
    Content.find({
        author: req.body.userid,
    }).sort({look: -1}).limit(limit).then(function (content_list) {
        res.json(content_list);
    });
});

//导出路由模块，供全局访问
module.exports = router;