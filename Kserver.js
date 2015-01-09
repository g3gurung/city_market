var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();


var databaseUrl = "localhost/kCity";
var collections = ["users", "departments"];
var db = require("mongojs").connect(databaseUrl, collections);

app.use(cookieParser("K-City Daniel's project"));
app.use('/', express.static(__dirname + '/kCity'));
app.listen(3000);

console.log("Express nodejs server listening at 3000");
//authentication
//var realm = require('express-http-auth').realm('K-City Market Employee App');

var userName, fname, lname, avatar;
/*
 var checkUser = function(req, res, next) {
 if (req.username === "signingOut" && req.password === "signingOut") {
 req.username = null;
 req.password = null;
 res.status(500);
 res.send();
 next();
 } else if (req.username === "empty" && req.password === "empty") {
 req.username = null;
 req.password = null;
 res.status(403);
 res.send();
 next();
 } else
 db.users.find({"user": req.username, "password": req.password}, function(err, data) {
 if (err) {
 res.status(403);
 res.send();
 } else if (data.length === 1) {
 userName = req.username;
 fname = data[0].fname;
 lname = data[0].lname;
 avatar = data[0].avatar;
 next();
 } else {
 res.status(403);
 res.send();
 next();
 }
 });
 };
 
 var private = [realm, checkUser];
 */
/*
 function authenticate(req, res) {
 if (req.query) {
 if (req.query.username === "empty" && req.query.password === "empty") {
 res.writeHead(403, {"Content-Type": "application/json"});
 res.end(JSON.stringify({msg: "User id and password fields can't be empty!"}));
 } else
 db.users.find({"user": req.query.username, "password": req.query.password}, function(err, data) {
 if (err) {
 res.end(403);
 } else if (data.length === 1) {
 userName = req.query.username;
 fname = data[0].fname;
 lname = data[0].lname;
 avatar = data[0].avatar;
 
 var jsonRes = {
 "theUser": {
 "userName": userName,
 "fname": fname,
 "lname": lname,
 "avatar": avatar
 }
 };
 res.cookie("user", {username: req.query.username, password: req.query.password}, {signed: true});
 res.end(JSON.stringify(jsonRes));
 } else {
 res.writeHead(403, {"Content-Type": "application/json"});
 res.end(JSON.stringify({msg: "Incorrect user id or password!"}));
 }
 });
 }else{
 res.writeHead(403, {"Content-Type": "application/json"});
 res.end(JSON.stringify({msg: "User id and password fields can't be empty!"}));
 }
 /* else if (req.cookies) {
 
 db.users.find({"user": req.cookies.user.username, "password": req.cookies.user.password}, function(err, data) {
 if (err) {
 res.clearCookie("user");
 res.end(403);
 } else if (data.length === 1) {
 userName = req.cookies.user.username;
 fname = data[0].fname;
 lname = data[0].lname;
 avatar = data[0].avatar;
 var jsonRes = {
 "theUser": {
 "userName": req.cookies.user.username,
 "fname": fname,
 "lname": lname,
 "avatar": avatar
 }
 };
 res.cookie("user", {username: req.cookies.user.username, password: req.cookies.user.username});
 res.end(JSON.stringify(jsonRes));
 } else {
 res.send(403);
 }
 });
 
 };
 }*/


function authenticate(req, next) {
    if (req.query.username || req.query.password) {
        if (req.query.username === "empty" && req.query.password === "empty") {
            next(false, "User id and password fields can't be empty!");
        } else{
            db.users.find({"user": req.query.username, "password": req.query.password}, function(err, data) {
                if (err) {
                    next(false, "INcrrect User id or password!");
                } else if (data.length === 1) {
                    userName = req.query.username;
                    fname = data[0].fname;
                    lname = data[0].lname;
                    avatar = data[0].avatar;
                    
                    var jsonRes = {
                        "theUser": {
                            "userName": userName,
                            "fname": fname,
                            "lname": lname,
                            "avatar": avatar
                        }
                    };
                    
                    next(true, jsonRes);
                    
                } else {
                    next(false, "Incorrect user id or password!");
                }
            });
        }
    } else if (req.signedCookies.user) {
        db.users.find({"user": req.signedCookies.user.username, "password": req.signedCookies.user.password}, function(err, data) {
            if (err) {
                next(false, "Login Failed!");
            } else if (data.length === 1) {
                userName = req.signedCookies.user.username;
                fname = data[0].fname;
                lname = data[0].lname;
                avatar = data[0].avatar;
                var jsonRes = {
                    "theUser": {
                        "userName": userName,
                        "fname": fname,
                        "lname": lname,
                        "avatar": avatar
                    }
                };
                next(true, jsonRes);
            } else {
                next(false, "Login Failed!");
            }
        });
    };
};

app.post('/authorize', function(req, res) {
    authenticate(req, function(success, resMsg) {
        if (success) {
            res.cookie("user", {username: req.query.username, password: req.query.password}, {signed: true});
            res.end(JSON.stringify(resMsg));
        } else {
            res.clearCookie("user");
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: resMsg}));
        }
    });
});

app.get('/authorize', function(req, res) {
    authenticate(req, function(success, resMsg) {
        if (success) {
            res.end(JSON.stringify(resMsg));
        } else {
            res.clearCookie("user");
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: resMsg}));
        }
    });
});

app.get('/resources/theUser', function(req, res) {
    if (req.signedCookies.user) {
        db.users.find({"user": req.signedCookies.user.username, "password": req.signedCookies.user.password}, function(err, data) {
            if (err) {
                res.end(403);
            } else if (data.length === 1) {
                db.users.find({}, {"_id": 0, "password": 0, "message": 0}, function(err, data) {
                    var jsonpRes = {
                        "theUser": {
                            "userName": userName,
                            "fname": fname,
                            "lname": lname,
                            "avatar": avatar
                        }
                    };
                    res.jsonp(jsonpRes);
                    app.set('jsonp callback name', 'cb');
                    //res.jsonp(500, {error: 'internal server error'});
                    res.end();
                });
            }
        });
    } else {
        res.end(403);
    }
});

app.get('/resources/user', function(req, res) {
    /*if (req.signedCookies.user) {
        db.users.find({"user": req.signedCookies.user.username, "password": req.signedCookies.user.password}, function(err, data) {
            if (err) {
                res.clearCookie("user");
                res.writeHead(403, {"Content-Type": "application/json"});
                res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
            } else if (data.length === 1) {
                db.users.find({}, {"_id": 0, "password": 0, "message": 0}, function(err, data) {
                    if (err) {
                        res.writeHead(403, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
                    } else {
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify(data));
                    }
                });
            }
        });
    } else {
        res.writeHead(403, {"Content-Type": "application/json"});
        res.end(JSON.stringify({msg: "Login required!"}));
    }*/
    authenticate(req, function(success, resMsg) {
        if (success) {
            db.users.find({}, {"_id": 0, "password": 0, "message": 0}, function(err, data) {
                if (err) {
                    res.writeHead(403, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({msg: "Internal Server Error!"}));
                } else {
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify(data));
                }
            });
        } else {
            res.clearCookie("user");
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: resMsg}));
        }
    });
});

app.get('/resources/department', function(req, res) {
    /*if (req.signedCookies.user) {
        db.users.find({"user": req.signedCookies.user.username, "password": req.signedCookies.user.password}, function(err, data) {
            if (err) {
                res.clearCookie("user");
                res.writeHead(403, {"Content-Type": "application/json"});
                res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
            } else if (data.length === 1) {
                db.departments.find({$query: {}, $orderby: {"d_id": 1}}, {"_id": 0, "post_next_unique_id": 0, "posts": 0}, function(err, data) {
                    var jsonRes;
                    if (err) {
                        res.writeHead(403, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
                    } else {
                        jsonRes = {
                            "departments": data
                        };
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify(jsonRes));
                    }
                });
            }
        });
    } else {
        res.writeHead(403, {"Content-Type": "application/json"});
        res.end(JSON.stringify({msg: "Login required!"}));
    }*/
    authenticate(req, function(success, resMsg) {
        if(success) {
            db.departments.find({$query: {}, $orderby: {"d_id": 1}}, {"_id": 0, "post_next_unique_id": 0, "posts": 0}, function(err, data) {
                    var jsonRes;
                    if (err) {
                        res.writeHead(403, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({msg: "Internal Server Error!"}));
                    } else {
                        jsonRes = {
                            "departments": data
                        };
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify(jsonRes));
                    }
                });
        }else {
            res.clearCookie("user");
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: resMsg}));
        }
    });
});

app.get('/resources/department/:dep_id/post', function(req, res) {
    /*if (req.signedCookies.user) {
        db.users.find({"user": req.signedCookies.user.username, "password": req.signedCookies.user.password}, function(err, data) {
            if (err) {
                res.clearCookie("user");
                res.writeHead(403, {"Content-Type": "application/json"});
                res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
            } else if (data.length === 1) {
                if (!isNaN(req.params.dep_id)) {
                    db.departments.find({d_id: parseInt(req.params.dep_id)}, {"d_id": 1, "posts": 1, "type": 1, "name": 1, "_id": 0}, function(err, data) {
                        if (err) {
                            res.writeHead(403, {"Content-Type": "application/json"});
                            res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
                        } else {
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify(data[0]));
                        }
                    });
                } else {
                    res.writeHead(403, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({msg: "Invalid department id parameter!"}));
                }
            }
        });
    } else {
        res.writeHead(403, {"Content-Type": "application/json"});
        res.end(JSON.stringify({msg: "Login required!"}));
    }*/
    authenticate(req, function(success, resMsg) {
        if(success) {
            if (!isNaN(req.params.dep_id)) {
                    db.departments.find({d_id: parseInt(req.params.dep_id)}, {"d_id": 1, "posts": 1, "type": 1, "name": 1, "_id": 0}, function(err, data) {
                        if (err) {
                            res.writeHead(403, {"Content-Type": "application/json"});
                            res.end(JSON.stringify({msg: "Internal Server Error!"}));
                        } else {
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify(data[0]));
                        }
                    });
                }else {
                    res.writeHead(403, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({msg: "Invalid department id parameter!"}));
                }
        }else {
            res.clearCookie("user");
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: resMsg}));
        };
    });
});

function Date_stamp(year, month, date, day){
    this.year = year;
    this.month = month;
    this.date = date;
    this.day = day;
};

function Post(post_id, post, owner, date_stamp, time){
    this.post_id = post_id;
    this.post = post;
    this.owner = owner;
    this.seenBy = [];
    this.date_stamp = date_stamp;
    this.time = time;
    this.comment_next_unique_id = -1;
    this.comments = [];
};

function Comment(comment_id, comment, owner, date_stamp, time){
    this.comment_id = comment_id;
    this.comment = comment;
    this.owner = owner;
    this.seenBy = [];
    this.date_stamp = date_stamp;
    this.time = time;
};

app.post('/resources/department/:dep_id/post', function(req, res) {
    authenticate(req, function(success, resMsg) {
        if (success) {
            if (!isNaN(req.params.dep_id)) {
                db.departments.find({d_id: parseInt(req.params.dep_id)}, {post_next_unique_id: 1, _id: 0}, function(err, data) {
                    if (err) {
                        res.writeHead(403, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({msg: "Internal Server Error!"}));
                    } else {
                        var post_next_unique_id = data.post_next_unique_id;
                        var date_StampObj =
                                new Date_stamp(req.query.year, req.query.month, req.query.date, req.query.day);
                        var postObj =
                                new Post(req.query.post_id, req.query.post, req.query.owner, date_StampObj, req.query.time);
                        db.testcollection.update({d_id: parseInt(req.params.dep_id)}, {$push: {posts: postObj}}, function(err) {
                            if (err) {
                                res.writeHead(403, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({msg: "Internal Server Error!"}));
                            } else {
                                res.writeHead(200, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({msg: "Post successfully saved!"}));
                            }
                        });
                    }
                });
            }else {
                res.writeHead(403, {"Content-Type": "application/json"});
                res.end(JSON.stringify({msg: "Invalid department id parameter!"}));
            }
        } else {
            res.clearCookie("user");
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: resMsg}));
        }
        ;
    });
});

app.get('/resources/department/:dep_id/post/:post_id', function(req, res) {
      /*  if (req.signedCookies.user) {
            db.users.find({"user": req.signedCookies.user.username, "password": req.signedCookies.user.password}, function(err, data) {
                if (err) {
                    res.clearCookie("user");
                    res.writeHead(403, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
                } else if (data.length === 1) {
                    if (!isNaN(req.params.dep_id)) {
                        db.departments.find({d_id: parseInt(req.params.dep_id)}, {"d_id": 1, "posts": 1, "type": 1, "name": 1, "_id": 0}, function(err, data) {
                            if (err) {
                                res.writeHead(403, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
                            } else {
                                if (!isNaN(req.params.post_id)) {
                                    var jsonRes = {
                                        dep_id: -1,
                                        post: {}
                                    };
                                    for (var i = 0; i < data[0].posts.length; i++) {
                                        if (data[0].posts[i].post_id === parseInt(req.params.post_id)) {
                                            jsonRes.post = data[0].posts[i];
                                            break;
                                        }
                                    }
                                    ;
                                    jsonRes.dep_id = data[0].d_id;
                                    res.writeHead(200, {"Content-Type": "application/json"});
                                    res.end(JSON.stringify(jsonRes));
                                } else {
                                    res.writeHead(200, {"Content-Type": "application/json"});
                                    res.end(JSON.stringify(data));
                                }
                            }
                        });
                    } else {
                        res.writeHead(403, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({msg: "Invalid department id parameter!"}));
                    }
                }
            });
        } else {
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: "Login required!"}));
        }*/
    authenticate(req, function(success, resMsg) {
        if (success) {
            if (!isNaN(req.params.dep_id)) {
                        db.departments.find({d_id: parseInt(req.params.dep_id)}, {"d_id": 1, "posts": 1, "type": 1, "name": 1, "_id": 0}, function(err, data) {
                            if (err) {
                                res.writeHead(403, {"Content-Type": "application/json"});
                                res.end(JSON.stringify({msg: "Incorrect user id and/or password!"}));
                            } else {
                                if (!isNaN(req.params.post_id)) {
                                    var jsonRes = {
                                        dep_id: -1,
                                        post: {}
                                    };
                                    for (var i = 0; i < data[0].posts.length; i++) {
                                        if (data[0].posts[i].post_id === parseInt(req.params.post_id)) {
                                            jsonRes.post = data[0].posts[i];
                                            break;
                                        }
                                    }
                                    ;
                                    jsonRes.dep_id = data[0].d_id;
                                    res.writeHead(200, {"Content-Type": "application/json"});
                                    res.end(JSON.stringify(jsonRes));
                                } else {
                                    res.writeHead(200, {"Content-Type": "application/json"});
                                    res.end(JSON.stringify(data));
                                }
                            }
                        });
                    } else {
                        res.writeHead(403, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({msg: "Invalid department id parameter!"}));
                    }
        } else {
            res.clearCookie("user");
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: resMsg}));
        }
    });
});

app.post('/resources/department/:dep_id/post/:post_id/comment', function(req, res) {
    authenticate(req, function(success, resMsg) {
        if (success) {
            if (!isNaN(req.params.dep_id) && !isNaN(req.params.dep_id)) {
                //find comment_next_unique_id and then increase by 1 note: -1 at the moment
                var commentObj = new Comment();
                db.departments
                        .update({"d_id": parseInt(req.params.dep_id), "posts.post_id": parseInt(req.params.post_id)}, {$push: {"posts.$.comments": commentObj } }, function(){
                    //asdf,,,
                });
            }else {
                res.writeHead(403, {"Content-Type": "application/json"});
                res.end(JSON.stringify({msg: "Invalid department and/or post id parameter!"}));
            }
        }else {
            res.clearCookie("user");
            res.writeHead(403, {"Content-Type": "application/json"});
            res.end(JSON.stringify({msg: resMsg}));
        }
    });
});