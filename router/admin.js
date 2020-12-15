/*
* 项目依赖的模块文件
* */
//express框架
var express = require("express");
//文件路径path模块
var path = require("path");
//文件模块
var fs = require("fs");
//处理上传文件formidable模块
var formidable = require('formidable');
//系统信息模块
var os = require("os");

/*
* 数据库模型文件
* */
//用户信息模型
var User = require("../model/user.js");
//文章分类模型
var Category = require("../model/category.js");
//文章列表模型
var Content = require("../model/content.js");
//轮播图设置模型
var Banner = require("../model/banner.js");

//使用路由模块
var router = express.Router();
//设置文件上传保存路径
express().use(express.static(__dirname + "/../upload"));

//定义返回给前端数据
var responseData;
//初始化返回前端数据
router.use(function (req, res, next) {
    responseData = {
        code: 0,//状态码，默认为0
        message: "",//提示信息，默认为空
    };
    next();
});

/*
* 后台登录
* */
router.post("/login", function (req,res,next) {
    var login_name = req.body.login_name ;
    var login_password = req.body.login_password ;
    User.findOne({
        username: login_name,
    }).then(function (userInfo) {
        if (userInfo){
            if(userInfo.password != login_password){
                responseData.code = 3;
                responseData.message = "密码错误";
                res.json(responseData);
            }else{
                if(userInfo.isAdmin){
                    responseData.admin_msg = userInfo;
                    res.json(responseData);
                }else{
                    responseData.code = 3;
                    responseData.message = "对不起，该账号没有管理员权限";
                    res.json(responseData);
                }
            };
        }else{
            responseData.code = 4;
            responseData.message = "对不起，该用户不存在，请先注册";
            res.json(responseData);
        };
    });
});

/*在数据库中查找数据时参数设定
    * limit(Number):限制每次获取的数据条数
    * skip(Number):每次获取数据时忽略的条数，与limit方法配合使用实现分页获取数据
    * sort(_id:Number)数据取值排序
    * 1：升序
    * -1：降序
    * */

//用户列表
router.post("/user_list", function (req, res, next) {
    //当前页码
    var page = Number(req.body.page || 1);
    //每页数据量
    var limit = 10;
    //初始化数据总页数
    var pages = 0;
    //根据筛选条件读取用户列表总数量
    User.countDocuments().then(function (count) {
        //通过数据总条数计算数据总页数,并取整数(向上取整)
        pages = Math.ceil(count / limit);
        //控当前页数制取值范围，当前页数不能超过总页数
        page = Math.min(page, pages);
        //当前页数不能小于1
        page = Math.max(page, 1);
        //动态计算每次获取数据时忽略的条数（每次获取数据的起始位置下标）
        var skip = (page - 1) * limit;
        //根据筛选条件读取用户列表信息
        User.find().sort({_id: 1}).limit(limit).skip(skip).then(function (user_list) {
            //将从数据库查询获取到的用户列表信息数据渲染至页面
            var user_list_data = {
                //用户列表
                user_list: user_list,
                //当前页码
                page: page,
                //当前总页数
                pages: pages,
                //总数据条数
                count: count,
                //每页展示数据条数
                limit: limit,
            }
            res.json(user_list_data);
        });
    });
});
// 文章列表
router.post("/content_list", function (req, res, next) {
    //当前页码
    var page = Number(req.body.page || 1);
    //每页数据量
    var limit = 10;
    //初始化数据总页数
    var pages = 0;
    //根据筛选条件读取用户列表总数量
    Content.countDocuments({
        num:req.body.num
    }).then(function (count) {
        //通过数据总条数计算数据总页数,并取整数(向上取整)
        pages = Math.ceil(count / limit);
        //控当前页数制取值范围，当前页数不能超过总页数
        page = Math.min(page, pages);
        //当前页数不能小于1
        page = Math.max(page, 1);
        //动态计算每次获取数据时忽略的条数（每次获取数据的起始位置下标）
        var skip = (page - 1) * limit;
        //根据筛选条件读取用户列表信息
        Content.find({
            num:req.body.num
        }).sort({_id: -1}).limit(limit).skip(skip).populate(["category", "author"]).then(function (content_list) {
            //将从数据库查询获取到的用户列表信息数据渲染至页面
            var content_list_data = {
                //用户列表
                content_list: content_list,
                //当前页码
                page: page,
                //当前总页数
                pages: pages,
                //总数据条数
                count: count,
                //每页展示数据条数
                limit: limit,
            }
            res.json(content_list_data);
        });
    });
});
//删除用户
router.post("/user_remove", function (req, res, next) {
    //获取要删除的用户id
    var userid = req.body.user_msg._id || "";
    //判断是否有超级管理员权限
    if (req.body.admin_msg.SuperAdmin) {
        //如果userid存在，并且不为空
        if (userid && userid != "") {
            //根据id在数据库查找该用户
            User.findOne({
                _id: userid
            }).then(function (user) {
                //如果该用户存在
                if (user) {
                    User.deleteOne(
                        {_id: userid},
                    ).then(function () {
                        res.json("删除用户成功")
                    });
                }
                ;
            });
        };
    }
});
//设置管理员
router.post("/admin_add", function (req, res, next) {
    //获取要设置的用户id
    var userid = req.body.user_msg._id || "";
    //判断是否有超级管理员权限
    if (req.body.admin_msg.SuperAdmin) {
        //如果userid存在，并且不为空
        if (userid && userid != "") {
            //根据id在数据库查找该用户
            User.findOne({
                _id: userid
            }).then(function (user) {
                //如果该用户存在
                if (user) {
                    User.updateOne(
                        {_id: userid},
                        {isAdmin: true}
                    ).then(function () {
                        res.json("设置管理员成功");
                    })
                };
            });
        };
    };
});
//取消管理员
router.post("/admin_remove", function (req, res, next) {
    //获取要设置的用户id
    var userid = req.body.user_msg._id || "";
    //判断是否有超级管理员权限
    if (req.body.admin_msg.SuperAdmin) {
        //如果userid存在，并且不为空
        if (userid && userid != "") {
            //根据id在数据库查找该用户
            User.findOne({
                _id: userid
            }).then(function (user) {
                //如果该用户存在
                if (user) {
                    User.updateOne(
                        {_id: userid},
                        {isAdmin: false}
                    ).then(function () {
                        res.json("取消管理员成功");
                    });
                }
                ;
            });
        };
    }
});
//分类列表
router.get("/category", function (req, res, next) {
    //当前页码
    var page = Number(req.query.page || 1);
    //每页数据量
    var limit = 5;
    //初始化数据总页数
    var pages = 0;
    //根据筛选条件读取分类列表总数量
    Category.countDocuments().then(function (count) {
        //通过数据总条数计算数据总页数,并取整数(向上取整)
        pages = Math.ceil(count / limit);
        //控当前页数制取值范围，当前页数不能超过总页数
        page = Math.min(page, pages);
        //当前页数不能小于1
        page = Math.max(page, 1);
        //动态计算每次获取数据时忽略的条数（每次获取数据的起始位置下标）
        var skip = (page - 1) * limit;
        //根据筛选条件读取分类列表信息
        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function (category_list) {
            //将从数据库查询获取到的分类列表信息数据渲染至页面
            res.render("admin/category_index.html", {
                //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
                userInfo: req.userInfo,
                //动态跳转路径
                flag: "category",
                //分类列表
                category_list: category_list,
                //当前页码
                page: page,
                //当前总页数
                pages: pages,
                //总数据条数
                count: count,
                //当前每页数据条数
                limit: limit,
            });
        });
    });
});
//分类添加页
router.get("/category/add", function (req, res, next) {
    //渲染分类添加页面
    res.render("admin/category_add.html", {
        //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
        userInfo: req.userInfo
    });
});
//分类的添加保存
router.post("/category/add", function (req, res, next) {
    // 获取新增分类名称
    var name = req.body.name || "";
    // 如果新增分类名为空
    if (name == "") {
        //渲染错误页面，并返回错误信息
        res.render("admin/error.html", {
            //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
            userInfo: req.userInfo,
            message: "添加失败，分类名称不能为空",
            url: "/admin/category/add"
        });
    } else {
        //查询数据库中是否已有重复的分类名
        Category.findOne({
            name: name
        }).then(function (category) {
            //如果数据库中已经有该分类名
            if (category) {
                //渲染错误页面，并返回错误信息
                res.render("admin/error.html", {
                    //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
                    userInfo: req.userInfo,
                    message: "添加失败，该分类名已存在",
                    url: "/admin/category/add"
                });
            } else {
                //若果数据库中没有该分类名,则将新的分类名保存到数据库中
                var category = new Category({
                    name: name
                });
                //保存新增分类名数据信息
                category.save().then(function () {
                    //渲染成功页面
                    res.render("admin/success.html", {
                        //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
                        userInfo: req.userInfo,
                        message: "分类添加成功",
                        url: "/admin/category/add"
                    });
                });
            }
            ;
        })
    }
    ;
});
//分类修改页
router.get("/category/edit", function (req, res, next) {
    //获取要修改的分类信息id
    var id = req.query.id || "";
    //根据分类id在数据库中查询要修改的分类是否存在
    Category.findOne({
        _id: id
    }).then(function (category) {
        //如果数据库中有该分类
        if (category) {
            ////将从数据库查询获取到的分类信息数据渲染至页面
            res.render("admin/category_edit.html", {
                //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
                userInfo: req.userInfo,
                //分类信息
                category: category
            });
        } else {
            //渲染错误页面，并返回错误信息
            res.render("admin/error.html", {
                //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
                userInfo: req.userInfo,
                message: "修改失败，分类信息不存在"
            });
        }
        ;
    });
});
//分类修改保存
router.post("/category/edit", function (req, res, next) {
    //获取要修改的分类信息id和名称
    var id = req.query.id || "";
    var name = req.body.name || "";
    //如果新添加的分类名为空
    if (name == "") {
        //渲染错误页面，并返回错误信息
        res.render("admin/error.html", {
            //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
            userInfo: req.userInfo,
            message: "修改失败，修改分类名称不能为空",
        });
    } else {
        //查询数据库中是否有该分类
        Category.findOne({
            _id: id
        }).then(function (category) {
            //如果数据库中有该分类
            if (category) {
                //如果新提交的分类名是否与原分类名相同
                if (name == category.name) {
                    res.render("admin/error.html", {
                        userInfo: req.userInfo,
                        message: "修改失败，新分类名与原分类名相同",
                    });
                } else {
                    //判断新修改提交的分类名是否与数据库中其他id对应的分类名重复
                    Category.findOne({
                        _id: {$ne: id}, //要查询分类的id
                        name: name //要查询的分类名称
                    }).then(function (sameCategory) {
                        //数据库中已有同名分类，说明新提交的分类名与数据库中重复
                        if (sameCategory) {
                            //渲染错误页面，并返回错误信息
                            res.render("admin/error.html", {
                                userInfo: req.userInfo,
                                message: "修改失败，数据库中已有同名分类",
                            });
                        } else {
                            //数据库中没有同名分类，则更新保存当前提交的分类名称
                            Category.updateOne(
                                {_id: id},//要更新分类的id
                                {name: name}//更新的新分类名称
                            ).then(function () {
                                //渲染成功页面
                                res.render("admin/success.html", {
                                    userInfo: req.userInfo,
                                    message: "分类修改成功",
                                });
                            });
                        }
                        ;
                    });
                }
                ;
            } else {
                //渲染错误页面，并返回错误信息
                res.render("admin/error.html", {
                    userInfo: req.userInfo,
                    message: "修改失败，该分类名不存在",
                });
            }
            ;
        })
    }
    ;
});
//分类删除
router.get("/category/delete", function (req, res, next) {
    //获取要删除分类的id
    var id = req.query.id || '';
    //根据id在数据库中查找是否有该分类
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (category) {
            //如果数据库中有该分类名，则执行移除方法
            Category.deleteOne({
                _id: id
            }).then(function () {
                //渲染成功页面
                res.render("admin/success.html", {
                    //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
                    userInfo: req.userInfo,
                    message: "删除成功",
                });
            });
        } else {
            //渲染错误页面，并返回错误信息
            res.render("admin/error.html", {
                //将客户端请求的cookie信息中用户信息返回给前端，用于判断是否有管理员权限
                userInfo: req.userInfo,
                message: "删除失败，数据库中没有该分类或者已被删除",
            });
        }
        ;
    });
});
//系统信息
router.post("/system",function (req,res,next) {
    var dealMem = (mem)=>{
        var G = 0,
            M = 0,
            KB = 0;
        (mem>(1<<30))&&(G=(mem/(1<<30)).toFixed(2));
        (mem>(1<<20))&&(mem<(1<<30))&&(M=(mem/(1<<20)).toFixed(2));
        (mem>(1<<10))&&(mem>(1<<20))&&(KB=(mem/(1<<10)).toFixed(2));
        return G>0?G+'G':M>0?M+'M':KB>0?KB+'KB':mem+'B';
    };
    //主机名
    const hn = os.hostname();
    //系统类型
    const kernel = os.type();
    //系统平台
    const pf = os.platform();
    //cpu架构
    const arch = os.arch();
    //内存
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    var system_msg = {
        hn:hn,
        os_type:`${kernel} ${pf}位`,
        os_arch:arch+"位架构",
        cpu_model:`${os.cpus()[0].model} ${os.cpus()[0].speed}MHz ${os.cpus().length}核`,
        os_total:`(全部)${dealMem(totalMem)} / (空闲)${dealMem(freeMem)}`,
    };
    res.json(system_msg);
});
//轮播图列表
router.post("/banner_list",function (req,res,next) {
    Banner.find().sort({_id: 1}).then(function (banner_list) {
        res.json(banner_list);
    });
});
//轮播图添加保存
router.post("/banner_add",function (req,res,next) {
    Banner.countDocuments().then(function (count) {
        // 限制轮播图最大数量
        if(count<6){
            //创建接收数据的数据方法
            var form = new formidable.IncomingForm();
            //设置文件编码
            form.encoding = 'utf-8';
            //设置上传文件保存路径
            form.uploadDir = path.join(`${__dirname}/upload`);
            //保留文件后缀
            form.keepExtensions = true;
            //限制文件最大size
            form.maxFieldsSize = 2 * 1024 * 1024;
            //处理图片信息
            form.parse(req,function (err,fields,files){
                //console.log(files);//打印文件信息
                //读取设置文件信息
                var filename = files.file.name;
                var nameArray = filename.split('.');
                var file_type = nameArray[nameArray.length - 1];
                var name = '';
                for (var i = 0; i < nameArray.length - 1; i++) {
                    name = name + nameArray[i];
                };
                //创建时间戳
                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth()+1;
                var day = date.getDate();
                var hour = date.getHours();
                var minute = date.getMinutes();
                var second = date.getSeconds();
                //获取具体时间信息
                var time = `${year}${month}${day}${hour}${minute}${second}`;
                //产生一万以内的四位随机数
                var num =  parseInt(Math.random()*10000);
                //设置新文件名称
                var newName = `${time}_${num}.${file_type}`;
                //新文件路径以及名称
                var newFile = `${form.uploadDir}/${newName}`;
                /*
                * formidable模块renameSync重命名方法参数说明
                * fs.renameSync(需要重命名的原文件路径和文件名，新文件路径以及文件名);
                * */
                fs.renameSync(files.file.path,newFile);
                //创建新轮播图对象
                var banner_obj = new Banner({
                    url:`http://zhiyun_server.lilongjin.cn/upload/${newName}`,
                    addTime:new Date(),
                });
                banner_obj.save().then(function () {
                    res.json("0")
                });
            });
        }else{
            res.json("1")
        }
    });
});
//轮播图删除
router.post("/banner_delete",function (req,res,next) {
    var banner_id = req.body.bannerid;
    Banner.findOne({
        _id:banner_id
    }).then(function (banner) {
        if(banner){
            Banner.deleteOne({
                _id:banner_id
            }).then(function () {
                res.json("删除成功");
            });
        }else {
            res.json("删除失败，该文件不存在或者已被删除")
        };
    });
});

//导出路由模块，以供外部访问
module.exports = router;