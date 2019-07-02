let express = require("express");
let app = new express();
let mysql = require("mysql");
let path =require("path");
let connection = mysql.createConnection({
    host: 'localhost',
    port: '3308',
    user: 'root',
    password: '123456',
    database: 'hotel',
    multipleStatements:true
});
app.use(express.static("public"))
connection.connect();
//登录
app.get('/login', function (req, res) {
    let sql="";
    if(req.query.type=="admin")
        sql = "select name from user where username=? and password=?";
    else if(req.query.type=="customer")
        sql = "select name,ID from customer where username=? and password=?";
    let params = [req.query.username, req.query.password];
    connection.query(sql, params, function (error, result) {
        let json;
        if (error) {
            console.log(error.message);
            json = {"error": 1, "msg": "系统错误", "data": []};
        } else if (result.length == 0) {
            console.log("用户名密码错误");
            json = {"error": 2, "msg": "用户名密码错误", "data": []};
        } else {
            json = {"error": 0, "msg": "", "data": result};
        }
        res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
        res.end();
    })

})
//房间信息
app.get("/room", function (req, res) {
    let method = req.query.method;
    let json;
    if (method == "get") {
        let sql = "select * from room";
        connection.query(sql, function (error, result) {
            if (error) {
                console.log(error.message);
                json = {"error": 1, "msg": "系统错误", "data": []};
            } else {
                json = {"error": 0, "msg": "", "data": result};
            }
            console.log(json);
            res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
            res.end();
        })
    } else if (method == "add") {
        let sql = "insert into room (name,type,price,rent) values(?,?,?,?)";
        let params = [req.query.name, req.query.type, req.query.price, "否"];
        connection.query(sql, params, function (error, result) {
            if (error) {
                console.log(error.message);
                json = {"error": 1, "msg": "系统错误", "data": []};
            } else {
                json = {"error": 0, "msg": "添加成功", "data": result};
            }
            console.log(result);
            res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
            res.end();
        })
    } else if (method == "update") {
        let sql = "update room set name=?,type=?,price=? where ID=?";
        let params = [req.query.name, req.query.type, req.query.price, req.query.ID];
        connection.query(sql, params, function (error, result) {
            if (error) {
                console.log(error.message);
                json = {"error": 1, "msg": "系统错误", "data": []};
            } else {
                json = {"error": 0, "msg": "添加成功", "data": result};
            }
            console.log(result);
            res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
            res.end();
        })
    }
})
//办理入住
app.get('/checkin', function (req, res) {
    let method = req.query.method;
    let json;
    if (method == "get") {
        let sql = "select * from room where rent='否'";
        connection.query(sql, function (error, result) {
            if (error) {
                console.log(error.message);
                json = {"error": 1, "msg": "系统错误", "data": []};
            } else {
                json = {"error": 0, "msg": "", "data": result};
            }
            console.log(json);
            res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
            res.end();
        })
    } else if (method == "checkin") {
        let sql = "insert into orders (RID,Cname,CID,fromDate,toDate,CustomerID) values(?,?,?,?,?,?)";
        let params = [req.query.ID, req.query.Cname,req.query.CID, req.query.fromDate, req.query.toDate,req.query.CustomerID];
        console.log(params)
        connection.query(sql, params, function (error, result) {
            if (error) {
                console.log(error.message);
                json = {"error": 1, "msg": "系统错误", "data": []};
            } else {
                json = {"error": 0, "msg": "添加成功", "data": result};
            }
            console.log(result);
            res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
            res.end();
        })
    }
})
// 退房 续住
app.get('/checkout', function (req, res) {
    let method = req.query.method;
    let json;
    if (method == "get") {
        let sql = "select * from room where rent='是'";
        connection.query(sql, function (error, result) {
            if (error) {
                console.log(error.message);
                json = {"error": 1, "msg": "系统错误", "data": []};
            } else {
                json = {"error": 0, "msg": "", "data": result};
            }
            console.log(json);
            res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
            res.end();
        })
    } else if (method == "continue") {
        let sql = "update room set toDate=? where ID=?;update orders set toDate=? where ID=(select * from (select ID from orders where `status`='已完成' and RID=? " +
            "order by ID desc limit 1)t)";
        let params = [req.query.toDate, req.query.ID,req.query.toDate,req.query.ID];
        console.log(params)
        connection.query(sql, params, function (error, result) {
            if (error) {
                console.log(error.message);
                json = {"error": 1, "msg": "系统错误", "data": []};
            } else {
                json = {"error": 0, "msg": "续住成功", "data": result};
            }
            console.log(result);
            res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
            res.end();
        })
    } else if (method == "checkout") {
        let sql = "update room set rent='否',Cname=null,CID=null,fromDate=null,toDate=null where ID=?";
        let params = [req.query.ID];
        console.log(params)
        connection.query(sql, params, function (error, result) {
            if (error) {
                console.log(error.message);
                json = {"error": 1, "msg": "系统错误", "data": []};
            } else {
                json = {"error": 0, "msg": "退房成功", "data": result};
            }
            console.log(result);
            res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
            res.end();
        })
    }
})
// 订单
app.get('/order', function (req, res) {
    let sql = "";
    let params;
    let json;
    if (req.query.method == "unfinished")
        sql = "SELECT a.ID,DATE_FORMAT(a.time, '%Y-%m-%d %H:%i:%S') AS time,a.RID,b.name,b.type,b.price,b.rent,a.CID,a.Cname,a.fromDate,a.toDate,a.`status` from orders a LEFT JOIN room b on a.RID=b.ID " +
            " where `status`='未完成'"
    else if(req.query.method=="finished")
        sql = "SELECT a.ID,DATE_FORMAT(a.time, '%Y-%m-%d %H:%i:%S') AS time,a.RID,b.name,b.type,b.price,b.rent,a.CID,a.Cname,a.fromDate,a.toDate,a.`status` from orders a LEFT JOIN room b on a.RID=b.ID " +
        " where `status` in ('已完成','拒绝')"
    else if(req.query.method=="accept"){
        sql = "update room set rent='是',Cname=?,CID=?,fromDate=?,toDate=? where ID=?;update orders set `status` ='已完成' where ID=?";
        params = [req.query.data.Cname, req.query.data.CID, req.query.data.fromDate, req.query.data.toDate, req.query.data.RID,req.query.data.ID];
        console.log(params)
    }
    else if(req.query.method=="denied"){
        sql="update orders set `status`='拒绝' where ID=?";
        params=[req.query.ID];
    }
    else if(req.query.method=="del"){
        sql="delete from orders  where ID=?";
        params=[req.query.ID];
    }
    connection.query(sql, params, function (error, result) {
        if (error) {
            console.log(error.message);
            json = {"error": 1, "msg": "系统错误", "data": []};
        } else {
            json = {"error": 0, "msg": "操作成功", "data": result};
        }
        console.log(result);
        res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
        res.end();
    })
})
// 用户订单
app.get("/myOrder",function (req,res) {
    let sql = "";
    let params;
    let json;
    if(req.query.method=="get"){
        sql = "SELECT a.ID,DATE_FORMAT(a.time, '%Y-%m-%d %H:%i:%S') AS time,a.RID,b.name,b.type,b.price,b.rent,a.CID,a.Cname,a.fromDate,a.toDate,a.`status` from orders a LEFT JOIN room b on a.RID=b.ID " +
            " where CustomerID=?"
        params=[req.query.CustomerID]
    }
    else if(req.query.method=="del"){
        sql="delete from orders  where ID=?";
        params=[req.query.ID];
    }
    connection.query(sql, params, function (error, result) {
        if (error) {
            console.log(error.message);
            json = {"error": 1, "msg": "系统错误", "data": []};
        } else {
            json = {"error": 0, "msg": "操作成功", "data": result};
        }
        console.log(result);
        res.write(req.query.callback + '(' + JSON.stringify(json) + ')');
        res.end();
    })
})
let server = app.listen(8888, function () {
    console.log(server.address().address, +server.address().port);
})