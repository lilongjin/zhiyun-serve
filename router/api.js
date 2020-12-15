/*
* 项目依赖的模块文件
* */
//express框架
var express = require("express");

/*
* 数据库模型文件
* */
//用户信息模型
var User = require("../model/user.js");
//分类模型
var Category = require("../model/category.js");
//文章模型
var Content = require("../model/content.js");
//评论模型
var Comment = require("../model/comment.js");

//使用路由模块
var router = express.Router();

//定义返回给前端数据
var responseData = null;
//初始化返回前端数据
router.use(function (req,res,next) {
    responseData = {
        code: 0,//状态码，默认为0
        message: "",//提示信息，默认为空
    };
    next();
});
/*
* 用户端注册
* */
router.post("/user/register", function (req,res,next) {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({
        username: username
    }).then(function (usernames) {
        if (usernames){
            responseData.code = 4;
            responseData.message = "该用户名已被注册";
            res.json(responseData);
        }else{
            function sj(a) {
                var dd= new Date();
                dd.setDate(dd.getDate()+a);//获取AddDayCount天后的日期
                var y = dd.getFullYear();
                var m = dd.getMonth()+1;//获取当前月份的日期
                var d = dd.getDate();
                return y+"年"+m+"月"+d+"日";
            }
            var user = new User({
                username: username,
                password: password,
                userimg:"http://zhiyun.lilongjin.cn/upload/logo.jpg",
                time:sj(0),
                sex:"暂无",
                age:"暂无",
                address:"暂无",
                hangye:"暂无",
                job:"暂无",
                git:"暂无",
                sign:"这个人很懒，什么都没留下......",
            });
            user.save();
            responseData.message = "注册成功";
            res.json(responseData);
        };
    });
});
/*
* 用户端登录
* */
router.post("/user/login", function (req,res,next) {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({
        username: username,
    }).then(function (userInfo) {
        if (userInfo){
            if(userInfo.password != password){
                responseData.code = 3;
                responseData.message = "密码错误";
                res.json(responseData);
            }else{
                responseData.userid = userInfo._id;
                responseData.username= userInfo.username;
                responseData.userimg= userInfo.userimg;
                responseData.sex = userInfo.sex;
                responseData.age= userInfo.age;
                responseData.address = userInfo.address;
                responseData.hangye= userInfo.hangye;
                responseData.job= userInfo.job;
                responseData.git = userInfo.git;
                responseData.sign= userInfo.sign;
                res.json(responseData);
            };
        }else{
            responseData.code = 4;
            responseData.message = "该用户不存在，请先注册";
            res.json(responseData);
        };
    });
});
/*
* 获取用户信息
* */
router.post("/user/userInfo", function (req,res,next) {
    var userid = req.body.userid;
    //用户提交的登录信息通过验证则去查询数据库中是否有该用户注册信息
    User.findOne({
        _id: userid,
    }).then(function (userInfo){
        if (userInfo){
            responseData.userid = userInfo._id;
            responseData.username= userInfo.username;
            responseData.userimg= userInfo.userimg;
            responseData.SuperAdmin= userInfo.SuperAdmin;
            responseData.isAdmin= userInfo.isAdmin;
            responseData.sex = userInfo.sex;
            responseData.age= userInfo.age;
            responseData.address = userInfo.address;
            responseData.hangye= userInfo.hangye;
            responseData.job= userInfo.job;
            responseData.git = userInfo.git;
            responseData.sign= userInfo.sign;
            res.json(responseData);
        }else{
            responseData.code = 4;
            responseData.message = "获取用户信息失败";
            res.json(responseData);
        };
    });
});
/*
* 修改用户信息
* */
router.post("/user/user_edit", function (req,res,next) {
    var userform = req.body.userform;
    User.findOne({
        _id: userform.userid,
    }).then(function (userInfo){
        if (userInfo){
            User.findOne({
                //查询id不等于自己id的其他用户是否已占用该用户名
                _id:{$ne:userform.userid},
                username:userform.username
            }).then(function (username) {
                if(username){
                    responseData.code = 4;
                    responseData.message = "修改失败，已有重复用户名";
                    res.json(responseData);
                }else{
                    User.updateOne(
                        {_id: userform.userid},
                        {
                            username: userform.username,
                            sex: userform.sex,
                            age: userform.age,
                            address: userform.address,
                            hangye: userform.hangye,
                            job: userform.job,
                            git: userform.git,
                            sign: userform.sign
                        }
                    ).then(function (NewUserInfo) {
                        if(NewUserInfo){
                            console.log(NewUserInfo)
                            responseData.userid = userform.userid;
                            responseData.username= userform.username;
                            responseData.sex = userform.sex;
                            responseData.age= userform.age;
                            responseData.address = userform.address;
                            responseData.hangye= userform.hangye;
                            responseData.job= userform.job;
                            responseData.git = userform.git;
                            responseData.sign= userform.sign;
                            res.json(responseData);
                        }else{
                            responseData.code = 4;
                            responseData.message = "修改失败";
                            res.json(responseData);
                        }
                    });
                }
            });
        }else{
            responseData.code = 4;
            responseData.message = "修改失败,该用户不存在";
            res.json(responseData);
        };
    });
});

//文章添加
router.post("/content/add", function (req, res, next) {
    //根据筛选条件从所有数据库中读取所有分类信息
    Category.find({user_edit: true}).sort({_id: 1}).then(function (categorylist) {
        //如果分类信息列表存在,且不为空
        if (categorylist && categorylist != "") {
            res.json(categorylist);
        };
    });
});
//文章添加保存
router.post("/content/add_save", function (req, res, next) {
    var content = new Content({
        author: req.body.author,
        category: req.body.categoryType,
        title:req.body.title,
        content: req.body.editorContent,
        num:req.body.num
    });
    //保存文章信息
    content.save().then(function () {
       res.json("发帖成功")
    });
});
//文章修改
router.post("/content/edit", function (req, res, next) {
    var contentid= req.body.contentid;
    var userid= req.body.userid;
    //id数据库查找该文章是否存在
    Content.findOne({
        _id: contentid
    }).then(function (content) {
        if (content) {
            //如果文章存在，判断当前用户是否有修改权限
            if(content.author != userid){
                res.json("对不起，您不是作者，没有修改权限");
            }else{
                res.json(content)
            }
        };
    });
});
//文章修改保存
router.post("/content/edit_save", function (req, res, next) {
    Content.findOne({
        _id:req.body.contentid
    }).then(function (content) {
        if (content) {
            Content.updateOne(
                {_id: req.body.contentid},
                {
                    category: req.body.categoryType,
                    title: req.body.title,
                    content: req.body.editorContent,
                    num:req.body.num,

                }).then(function () {
                    res.json("修改成功");
            })
        }
    })
});
//文章删除
router.post("/content/delete", function (req, res, next) {
    Content.findOne({
        _id: req.body.contentid
    }).then(function (content) {
        if (content) {
            Content.deleteOne({
                _id: req.body.contentid
            }).then(function () {
                //查找属于该文章的所有评论，并一起删除
                Comment.find({
                    contentId: req.body.contentid
                }).then(function (comment) {
                    if(comment){
                        Comment.deleteMany({
                            contentId: req.body.contentid
                        }).then(function () {
                            res.json("删除成功");
                        });
                    }
                });

            });
        }
    });
});
//提交点赞
router.post("/content_zan",function (req,res,next){
    //根据id在数据库中查询读取该文章
    Content.findOne({
        _id:req.body.contentid
    }).then(function (content) {
        content.zan++;
        content.save();
        res.json("点赞成功")
    });
});
//用户提交新评论
router.post("/comment_add",function (req,res,next) {
    //获取用户所评论文章的id
    var contentid = req.body.contentid;
    //根据当前提交文章的id在数据库中查询该文章是否存在
    Content.findOne({
        _id:contentid
    }).then(function (content) {
        //如果该文章存在则并添加保存提交的评论数据
        if(content){
            var comment = new Comment({
                username: req.body.username,
                contentId: req.body.contentid,
                commentTime: new Date(),
                commentContent: req.body.comment,
            });
            //保存文章信息
            comment.save().then(function () {
                //给文章评论数加1
                content.comments_num++;
                content.save();
                res.json("评论成功")
            });
        }
    });
});
//评论回复
router.post("/comment_answer",function (req,res,next) {
    //获取用户所评论文章的id
    var contentid = req.body.contentid;
    //回复所属评论的id
    var commentid = req.body.commentid;
    //根据当前提交文章的id在数据库中查询该文章是否存在
    Content.findOne({
        _id:contentid
    }).then(function (content) {
        //如果该文章存在则继续查询该条评论是否存在
        if(content){
            Comment.findOne({
                _id:commentid
            }).then(function (comment) {
                //如果该条评论存在，则保存当前评论回复
                if(comment){
                    var answer_data = {
                        comment_username:req.body.comment_username,
                        answer_username: req.body.answer_username,
                        answerTime: new Date(),
                        content: req.body.answer_content,
                    };
                    comment.answerContent.push(answer_data)
                    //保存文章信息
                    comment.save().then(function () {
                        res.json("回复成功")
                    });
                }
            })
        }
    });
});
//导出路由模块，供全局访问
module.exports = router;