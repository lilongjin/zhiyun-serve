/*
* 项目依赖的模块文件
* */
//express框架
var express = require("express");
//mongoose数据库操作模块
var mongoose = require("mongoose");
//body-Parser模块，处理post提交过来的数据
var bodyParser = require("body-parser");
//实例化app应用
var app = express();

//设置允许跨域
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

//bodyParser设置，解析用户post请求携带的数据参数
app.use(bodyParser.urlencoded({extended: true}));

/*
* 模块路由跳转,
* */
//用户端
app.use("/main", require("./router/main.js"));

//管理员后台
app.use("/admin", require("./router/admin.js"));

//功能模块
app.use("/api", require("./router/api.js"));

/*
* 数据库操作使用
* mongoose.connect("数据库类型://ip地址:端口/数据库名称",{配置参数:value});
* */
//连接数据库
mongoose.connect("mongodb://127.0.0.1:27017/zhiyun", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
//监听数据库连接状态
mongoose.connection.on("error", function () {
    console.log("数据库连接失败,无法启动项目");
});
//数据库已连接
mongoose.connection.on("open", function () {
    console.log("数据库连接成功");
    //数据库连接成功后开启服务器，监听客户端http请求
    app.listen(3000, "127.0.0.1", function (err) {
        if (err) {
            console.log("服务器开启失败");
        } else {
            console.log("服务器开启成功，端口为3000......");
        }
    });
});
//数据库已断开
mongoose.connection.on("disconnected", function () {
    console.log("数据库断开，项目进程结束");
    //关闭服务器进程
    process.exit()
})

//捕捉项目全局进程中的错误和异常，统一处理
process.on('unhandledRejection', function (error) {
    if (error) {
        return false;
    }
});
