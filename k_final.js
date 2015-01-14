var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var multer = require('multer');
app.use(multer({
    dest: 'kFinal/files',
    limits: {
        files: 1
    }
}));

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

var sanitizeHtml = require('sanitize-html');

var authenticate = require("authenticate");
app.use(authenticate.middleware({
    encrypt_key: "pratakshakoapp", // Add any key for encrypting data
    validate_key: "gurungkoapp" // Add any key for signing data
}));

var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'g3prataksha.ipt.oamk.fi',
    user: 'user',
    password: 'pass',
    database: 'K_City_Final',
    connectionTimeout: 300000,
    connectionLimit: 100 //but 10 is default
});

//page for web
app.use('/', express.static(__dirname + '/kFinal'));


server.listen(3000);

console.log("Express nodejs server listening at 3000");

app.post('/login', function(req, res) {
    if(req.body.user && req.body.passwd) {
        var user = req.body.user;
        var passwd = req.body.passwd;
        
        pool.getConnection(function(err, connection) {
            if(err) {
                throw err;
            } else {
                connection.query('SELECT passwd, salt FROM users WHERE user_id = '+pool.escape(user), function(err, rows) {
                    if(err) {
                        throw err;
                    } else if(rows.length === 1) {
                        if(passwd === rows[0].passwd) {
                            res.writeHead(200, {
                                "Content-Type": "application/json"
                            });
                            res.write(JSON.stringify({
                                "access_token": authenticate.serializeToken(user, user), // extra data is optional
                            }));
                            res.end();
                        }
                    } else {
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });
                        res.write(JSON.stringify({"err": "Incorrect userId/password!"}));
                        res.end();
                    }
                });
            }
        });
    } else {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify({"err": "UserId/password empty!"}));
        res.end();
    }
});


app.get('/resources/departments', function(req, res) {
    var departments = [];
    if(req.user) {
        pool.getConnection(function(err, connection) {
            if (err) {
                throw err;
            } else {
                connection.query('SELECT department_id, name, image_name, image_type FROM departments NATURAL JOIN department_icons', function(err, rows) {
                    if (err) {
                        throw err;
                    } else {
                        rows.forEach(function(row) {
                            departments.push({"dep_id": row.department_id, "name": row.name, "icon": row.image_name + "." + row.image_type});
                        });
                    }
                    connection.release();
                    res.end(JSON.stringify(departments));
                });
            }
        });
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

app.get('/resources/users', function(req, res) {
    var users = [];
    if(req.user) {
        pool.getConnection(function(err, connection) {
            if (err) {
                throw err;
            } else {
                connection.query('SELECT user_id, first_name, middle_name, last_name, avatar, address, email, phone, position, role FROM users',
                        function(err, rows) {
                            if (err) {
                                throw err;
                            } else {
                                rows.forEach(function(row) {
                                    var user = {
                                        "user_id": row.user_id,
                                        "first_name": row.first_name,
                                        "middle_name": "",
                                        "last_name": row.last_name,
                                        "role": row.role,
                                        "position": row.position,
                                        "avatar": row.avatar,
                                        "contact": {
                                            "phone": row.phone,
                                            "address": row.address,
                                            "email": row.email
                                        }
                                    };
                                    if (!!row.middle_name) {
                                        user.middle_name = row.middle_name;
                                    }
                                    users.push(user);
                                });
                            }
                            connection.release();
                            res.end(JSON.stringify(users));
                        }
                );
            }
        });
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});


//owner userid is taken from token after authorization
//var owner = "user2";

app.get('/resources/:dep_id/unseen', function(req, res) {
    if(req.user) {
        var post_unseen = 0;
        var comment_unseen = 0;
        var blog_unseen = 0;
        var dep_id = parseInt(req.params.dep_id);
        if (dep_id >= 1 && dep_id <= 6) {
            pool.getConnection(function(err, connection){
               if(err) {
                   throw err;
               } else {
                   connection.query("SELECT COUNT(DISTINCT post_id) AS post_seen FROM post_seen_by WHERE user_id = "+pool.escape(req.user.user_id)+" AND post_id IN (SELECT post_id FROM posts WHERE department_id = "+dep_id+")",
                   function(err, posts_seen){
                       if(err) {
                           throw err;
                       } else {
                           connection.query("SELECT post_id FROM posts WHERE department_id = "+dep_id, function(err, total_posts){
                              if(err) {
                                  throw err;
                              } else {
                                  if(total_posts.length > 0) {
                                  post_unseen =  total_posts.length - parseInt(posts_seen[0].post_seen);
                                  total_posts.forEach(function(post, p) {
                                      connection.query("SELECT COUNT(DISTINCT comment_id) AS comments_seen FROM comment_seen_by WHERE user_id = "+pool.escape(req.user.user_id)+" AND comment_id IN (SELECT comment_id FROM comments WHERE post_id = "+post.post_id+")",
                                      function(err, comments_seen) {
                                          if(err) {
                                              throw err;
                                          } else {
                                              connection.query("SELECT COUNT(comment_id) AS total_comments FROM comments WHERE post_id = "+post.post_id, function(err, total_comments) {
                                                  if(err) {
                                                      throw err;
                                                  } else {
                                                      comment_unseen += parseInt(total_comments[0].total_comments) - parseInt(comments_seen[0].comments_seen);
                                                      if(p >= total_posts.length - 1) {
                                                            connection.query('SELECT COUNT(DISTINCT info_blog_id) AS total_blogs FROM info_blog WHERE department_id = '+dep_id, function(err, total_blogs) {
                                                                if(err) {
                                                                    throw err;
                                                                } else if(parseInt(total_blogs[0].total_blogs) > 0) {
                                                                    connection.query('SELECT COUNT(DISTINCT info_blog_id) AS info_blog_seen FROM info_blog_seen_by WHERE user_id = '+pool.escape(req.user.user_id)+' AND info_blog_id IN (SELECT info_blog_id FROM info_blog WHERE department_id =' + dep_id + ')',
                                                                    function(err, info_blog_seen) {
                                                                       if(err) {
                                                                           throw err;
                                                                       } else {
                                                                            blog_unseen = parseInt(total_blogs[0].total_blogs) - parseInt(info_blog_seen[0].info_blog_seen);
                                                                            connection.release();
                                                                            res.end(JSON.stringify({post_unseen: post_unseen, comment_unseen: comment_unseen, blog_unseen: blog_unseen, dep_id: dep_id}));
                                                                       }
                                                                    });
                                                                } else {
                                                                    connection.release();
                                                                    res.end(JSON.stringify({post_unseen: post_unseen, comment_unseen: comment_unseen, blog_unseen: blog_unseen, dep_id: dep_id}));
                                                                }
                                                            });
                                                          /*
                                                          connection.release();
                                                          res.end(JSON.stringify({post_unseen: post_unseen, comment_unseen: comment_unseen, dep_id: dep_id}));*/
                                                      }
                                                  }
                                              });
                                          }
                                      });
                                  });
                                } else {
                                    connection.query('SELECT COUNT(DISTINCT info_blog_id) AS total_blogs FROM info_blog WHERE department_id = '+dep_id, function(err, total_blogs) {
                                        if(err) {
                                            throw err;
                                        } else if(parseInt(total_blogs[0].total_blogs) > 0) {
                                            connection.query('SELECT COUNT(DISTINCT info_blog_id) AS info_blog_seen FROM info_blog_seen_by WHERE user_id = '+pool.escape(req.user.user_id)+' AND info_blog_id IN (SELECT info_blog_id FROM info_blog WHERE department_id =' + dep_id + ')',
                                            function(err, info_blog_seen) {
                                               if(err) {
                                                   throw err;
                                               } else {
                                                    blog_unseen = parseInt(total_blogs[0].total_blogs) - parseInt(info_blog_seen[0].info_blog_seen);
                                                    connection.release();
                                                    res.end(JSON.stringify({post_unseen: post_unseen, comment_unseen: comment_unseen, blog_unseen: blog_unseen, dep_id: dep_id}));
                                               }
                                            });
                                        } else {
                                            connection.release();
                                            res.end(JSON.stringify({post_unseen: post_unseen, comment_unseen: comment_unseen, blog_unseen: blog_unseen, dep_id: dep_id}));
                                        }
                                    });
                                    //connection.release();
                                    //res.end(JSON.stringify({post_unseen: 0, comment_unseen: 0,  dep_id: dep_id}));
                                }
                              }
                           });
                       }
                   });
               }
            });
        } else {
            res.status(400);
            res.end("Bad request!");
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});
/*
app.get('/resources/:dep_id/posts/unseen', function(req, res) {
    var dep_id = parseInt(req.params.dep_id);
    if (dep_id >= 1 && dep_id <= 6) {
        fetchPostUnSeen_bydb("SELECT post_id FROM posts where department_id = " + pool.escape(dep_id), function(unseen) {
            var noti = {
                unseen: unseen,
                dep_id: dep_id
            };
            res.end(JSON.stringify(noti));
        });
    } else {
        //bad request
        res.status(400);
        res.end("Bad request!");
    }
});

app.get('/resources/:dep_id/posts/:post_id/unseen', function(req, res) {
    var dep_id = pool.escape(parseInt(req.params.dep_id));
    var post_id = pool.escape(parseInt(req.params.post_id));
    if(dep_id >= 1 && dep_id <= 6 && /^[1-9][0-9]*$/.test(post_id)){
        fetchCommentUnSeen_bydb("SELECT comment_id FROM comments WHERE post_id IN (SELECT post_id FROM posts WHERE post_id = "+post_id+" AND department_id = "+dep_id+")", 
        function(unseen) {
            var noti = {
                unseen: unseen,
                post_id: post_id
            };
            res.end(JSON.stringify(noti));
        });
    } else {
        res.status(400);
        res.end("Bad reqquest!");
    }
});
*/
//for get req of sub departments of personell
app.get('/resources/personell', function(req, res) {
    if(req.user) {
        var personell = [
            {"title": "Staffs", "img_src": "staffs.png"},
            {"title": "Shifts", "img_src": "shifts.png"}
        ];
        res.end(JSON.stringify(personell));
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

app.get('/resources/:dep_id/remaining_posts', function(req, res) {
    if(req.user) {
        var min_post_id = parseInt(req.query.min_post_id);
        var dep_id = parseInt(req.params.dep_id);
        if (dep_id >= 1 && dep_id <= 6 && /^[1-9][0-9]*$/.test(min_post_id)) {
            var query = "SELECT COUNT(post_id) as length FROM posts WHERE post_id < " + min_post_id + " AND department_id = " + dep_id;
            pool.getConnection(function(err, connection) {
                if (err) {
                    throw err;
                } else {
                    connection.query(query, function(err, rows) {
                        if (err) {
                            throw err;
                        } else {
                            res.end(JSON.stringify({remaining_posts: rows[0].length}));
                        }
                    });
                }
            });
        } else {
            res.status(400);
            res.end("Bad request!");
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

app.get('/resources/:dep_name/posts', function(req, res) {
    if(req.user) {
        var post_id_query = "";
        var limit = 10;
        if(req.query.limit) {
            limit =  parseInt(req.query.limit);
        }
        console.log("Entered switch");
        switch (req.params.dep_name) {
            case "newsfeed":
                fetchPostsdb("SELECT * FROM posts WHERE department_id = 1 ORDER BY post_id DESC LIMIT "+limit, function(posts) {
                    res.end(JSON.stringify(posts));
                });
                break;
            case "service":
                fetchPostsdb("SELECT * FROM posts WHERE department_id = 2 ORDER BY post_id DESC LIMIT "+limit, function(posts) {
                    res.end(JSON.stringify(posts));
                });
                break;
            case "bakery":
                fetchPostsdb("SELECT * FROM posts WHERE department_id = 3 ORDER BY post_id DESC LIMIT "+limit, function(posts) {
                    res.end(JSON.stringify(posts));
                });
                break;
            case "beverage":
                fetchPostsdb("SELECT * FROM posts WHERE department_id = 4 ORDER BY post_id DESC LIMIT "+limit, function(posts) {
                    res.end(JSON.stringify(posts));
                });
                break;
            case "industrial":
                fetchPostsdb("SELECT * FROM posts WHERE department_id = 5 ORDER BY post_id DESC LIMIT "+limit, function(posts) {
                    res.end(JSON.stringify(posts));
                });
                break;
            case "vegetables":
                fetchPostsdb("SELECT * FROM posts WHERE department_id = 6 ORDER BY post_id DESC LIMIT "+limit, function(posts) {
                    res.end(JSON.stringify(posts));
                });
                break;
            
            default:
                //bad request
                res.status(400);
                res.end("Bad Request!");
                break;
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

app.get('/resources/:dep_id/posts/:post_id/comments/seen_by', function(req, res) {
    if(req.user) {
        var dep_id = parseInt(req.params.dep_id);
        var post_id = parseInt(req.params.post_id);

        var comments = new Array();
        if (/^[1-9][0-9]*$/.test(post_id) && dep_id >= 1 && dep_id <= 6) {
            pool.getConnection(function(err, connection) {
                if (err) {
                    throw err;
                } else {
                    connection.query("SELECT comment_id FROM comments WHERE post_id IN (SELECT post_id FROM posts WHERE department_id = "+pool.escape(dep_id)+" AND post_id = "+pool.escape(post_id)+")"
                    , function(err, rows) {
                        if (err) {
                            throw err;
                        } else if(rows.length > 0) {
                            rows.forEach(function(row, i) {
                                connection.query("SELECT user_id FROM comment_seen_by WHERE comment_id = "+row.comment_id, function(err, rs) {
                                    if (err) {
                                        throw err;
                                    } else{
                                        var comment = {
                                            comment_id: row.comment_id,
                                            user_id: []
                                        };
                                        rs.forEach(function(row) {
                                            comment.user_id.push(row.user_id);
                                        });
                                        comments.push(comment);
                                        if(i >= (rows.length - 1)) {
                                            connection.release();
                                            res.end(JSON.stringify({comments: comments, post_id: post_id}));
                                        }
                                    }
                                });
                            });
                        } else {
                            connection.release();
                            res.end(JSON.stringify({comments: comments, post_id: post_id}));
                        }
                    });
                }
            });
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

    //SELECT * FROM `info_blog_seen_by` WHERE info_blog_seen_by_id = 1
    app.get('/resources/:dep_name/blogs', function(req, res) {
        if(req.user) {
            switch (req.params.dep_name) {
                case "service":
                    fetchBlogsdb("SELECT * FROM info_blog WHERE department_id = 2", function(blogs) {
                        res.end(JSON.stringify({blogs: blogs, dep_id: 2}));
                    });
                    break;
                case "bakery":
                    fetchBlogsdb("SELECT * FROM info_blog WHERE department_id = 3", function(blogs) {
                        res.end(JSON.stringify({blogs: blogs, dep_id: 3}));
                    });
                    break;
                case "beverage":
                    fetchBlogsdb("SELECT * FROM info_blog WHERE department_id = 4", function(blogs) {
                        res.end(JSON.stringify({blogs: blogs, dep_id: 4}));
                    });
                    break;
                case "industrial":
                    fetchBlogsdb("SELECT * FROM info_blog WHERE department_id = 5", function(blogs) {
                        res.end(JSON.stringify({blogs: blogs, dep_id: 5}));
                    });
                    break;
                case "vegetables":
                    fetchBlogsdb("SELECT * FROM info_blog WHERE department_id = 6", function(blogs) {
                        res.end(JSON.stringify({blogs: blogs, dep_id: 6}));
                    });
                    break;
                
                default:
                    //bad request
                    res.status(400);
                    res.end("Bad Request!");
                    return;
            }
        } else {
            res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
        }
    });

    app.post('/resources/:dep_id/posts/:post_id/seen', function(req, res) {
        if(req.user) {
            var dep_id = parseInt(req.params.dep_id);
            var post_id = parseInt(req.params.post_id);
            if (/^[1-9][0-9]*$/.test(post_id) && dep_id >= 1 && dep_id <= 6) {
                pool.getConnection(function(err, connection) {
                    if (err) {
                        throw err;
                    } else {
                        connection.query("SELECT user_id FROM post_seen_by WHERE post_id = " + pool.escape(post_id) + " AND user_id = "+pool.escape(req.user.user_id), function(err, rows) {
                            if (err) {
                                throw err;
                            } else if (rows.length <= 0) {
                                connection.query("INSERT INTO post_seen_by (user_id, post_id) VALUES ("+pool.escape(req.user.user_id)+", '" + pool.escape(post_id) + "')",
                                        function(err, rows) {
                                            if (err) {
                                                throw err;
                                            } else {
                                                connection.query("SELECT comment_id FROM comments WHERE post_id = " + pool.escape(post_id), function(err, Rows) {
                                                    if (err) {
                                                        throw err;
                                                    } else if (Rows.length > 0) {
                                                        Rows.forEach(function(r, i) {
                                                            connection.query("SELECT user_id FROM comment_seen_by WHERE comment_id = " + r.comment_id + " AND user_id = "+pool.escape(req.user.user_id),
                                                                    function(err, rows) {
                                                                        if (err) {
                                                                            throw err;
                                                                        } else if (rows.length <= 0) {
                                                                            connection.query("INSERT INTO comment_seen_by (user_id, comment_id) VALUES ("+pool.escape(req.user.user_id)+", " + r.comment_id + ")", function() {
                                                                                if (err) {
                                                                                    throw err;
                                                                                } else {
                                                                                    if (i >= (Rows.length - 1)) {
                                                                                        connection.release();
                                                                                        res.end("ok");
                                                                                    }
                                                                                }
                                                                            });
                                                                        } else {
                                                                            if (i >= (Rows.length - 1)) {
                                                                                connection.release();
                                                                                res.end("ok");
                                                                            }
                                                                        }
                                                                    });
                                                        });
                                                    } else {
                                                        connection.release();
                                                        res.end("ok");
                                                    }
                                                });
                                            }
                                        });
                            } else {
                                connection.query("SELECT comment_id FROM comments WHERE post_id = " + pool.escape(post_id), function(err, Rows) {
                                    if (err) {
                                        throw err;
                                    } else if (Rows.length > 0) {
                                        Rows.forEach(function(r, i) {
                                            connection.query("SELECT user_id FROM comment_seen_by WHERE comment_id = " + r.comment_id + " AND user_id = "+pool.escape(req.user.user_id),
                                                    function(err, rows) {
                                                        if (err) {
                                                            throw err;
                                                        } else if (rows.length <= 0) {
                                                            connection.query("INSERT INTO comment_seen_by (user_id, comment_id) VALUES ("+pool.escape(req.user.user_id)+", " + r.comment_id + ")",
                                                                    function(err, result) {
                                                                        if (err) {
                                                                            throw err;
                                                                        } else {
                                                                            if (i >= (Rows.length - 1)) {
                                                                                connection.release();
                                                                                res.end("ok");
                                                                            }
                                                                        }
                                                                    });
                                                        } else {
                                                            if (i >= (Rows.length - 1)) {
                                                                connection.release();
                                                                res.end("ok");
                                                            }
                                                        }
                                                    });
                                        });
                                    } else {
                                        connection.release();
                                        res.end("ok");
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.status(400);
                res.end("Bad Request!");
            }
        } else {
            res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
        }
});

app.post('/resources/:dep_id/blogs/:blog_id/seen', function(req, res) {
    if(req.user) {
        var dep_id = parseInt(req.params.dep_id);
        var blog_id = parseInt(req.params.blog_id);
        if (/^[1-9][0-9]*$/.test(blog_id) && dep_id >= 1 && dep_id <= 6) {
            pool.getConnection(function(err, connection) {
                if (err) {
                    throw err;
                } else { //Select * from info_blog_seen_by where info_blog_id = 1 and info_blog_id in (select info_blog_id from info_blog where department_id = 2) and user_id = 'user1'
                    connection.query("SELECT user_id FROM info_blog_seen_by WHERE info_blog_id = " + pool.escape(blog_id) + " AND info_blog_id IN (SELECT info_blog_id FROM info_blog where department_id = " + pool.escape(dep_id) + ")" + " AND user_id = " + pool.escape(req.user.user_id), function(err, rows) {
                        if (err) {
                            throw err;
                        } else if (rows.length > 0) {
                            connection.release();
                            res.end("duplicate value!");
                        } else {
                            connection.query("INSERT INTO info_blog_seen_by (info_blog_id, user_id) VALUES (" + pool.escape(blog_id) + ", "+pool.escape(req.user.user_id)+")", function(err, result) {
                                if (err) {
                                    throw err;
                                } else {
                                    connection.release();
                                    res.end("ok");
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.status(400);
            res.end("Bad Request!");
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});
/*
 app.post('/resources/:dep_id/posts', function(req, res) {
 var dep_id = parseInt(req.params.dep_id),
 content = pool.escape(req.body.content),
 date_year = pool.escape(req.body.date_year),
 date_month = pool.escape(req.body.date_month),
 date_date = pool.escape(req.body.date_date),
 date_day = pool.escape(req.body.day),
 date_time = pool.escape(req.body.date_time);
 
 if(dep_id >= 1 && dep_id <= 6) {
 pool.getConnection(function(err, connection) {
 if (err) {
 throw err;
 } else {
 connection.query("INSERT INTO posts (content, user_id, department_id, date_year, date_month, date_date, date_day, date_time) VALUES ('"+
 content+"', "+owner+"', '"+dep_id+"', '"+date_year+"', '"+date_month+"', '"+date_date+"', '"+date_day+"', '"+date_time+"')", 
 function (err, result) {
 if (err) {
 throw err;
 } else {
 console.log(result.insertId);
 res.end(result.insertId);
 connection.query("INSERT INTO post_seen_by (post_id, user_id) VALUES ('"+result.insertId+"', '"+owner+"')", function(err, results) {
 if(err) {
 throw err;
 } else {
 connection.release();
 res.end("ok");
 }
 });
 }
 });
 }
 });
 }else {
 res.status(200);
 res.end("Bad Request!");
 }
 });
 */
app.post('/resources/:dep_name/posts', function(req, res) {
    if(req.user) {
        var new_post = req.body.post_content;
        var year = new Date().getFullYear();
        var month = new Date().getMonth();
        var date = new Date().getDate();
        var day = new Date().getDay();
        var time;
        var hours = new Date().getHours();
        var minutes = new Date().getMinutes();

        if (hours < 10)
            time = "0" + hours + ":";
        else
            time = hours + ":";

        if (minutes < 10)
            time += "0" + minutes;
        else
            time += minutes;

        switch (req.params.dep_name) {
            case "newsfeed":
                insertPostdb("INSERT INTO posts (content, department_id, user_id, date_year, date_month, date_day, date_date, date_time) VALUES (" + pool.escape(new_post) + ", 1, "
                        + pool.escape(req.user.user_id) + ", '" + year + "', '" + month + "', '" + day + "', '" + date + "', '" + time + "')", pool.escape(req.user.user_id),
                        function(res_val) {
                            res.end(JSON.stringify(res_val));
                            io.sockets.emit('newPostAvailable', JSON.stringify({dep_id: 1, user_id: req.user.user_id}));
                        });
                break;
            case "service":
                insertPostdb("INSERT INTO posts (content, department_id, user_id, date_year, date_month, date_day, date_date, date_time) VALUES (" + pool.escape(new_post) + ", 2, "
                        + pool.escape(req.user.user_id) + ", '" + year + "', '" + month + "', '" + day + "', '" + date + "', '" + time + "')", pool.escape(req.user.user_id),
                        function(res_val) {
                            res.end(JSON.stringify(res_val));
                            io.sockets.emit('newPostAvailable', JSON.stringify({dep_id: 2, user_id: req.user.user_id}));
                        });
                break;
            case "bakery":
                insertPostdb("INSERT INTO posts (content, department_id, user_id, date_year, date_month, date_day, date_date, date_time) VALUES (" + pool.escape(new_post) + ", 3, "
                        + pool.escape(req.user.user_id) + ", '" + year + "', '" + month + "', '" + day + "', '" + date + "', '" + time + "')", pool.escape(req.user.user_id),
                        function(res_val) {
                            res.end(JSON.stringify(res_val));
                            io.sockets.emit('newPostAvailable', JSON.stringify({dep_id: 3, user_id: req.user.user_id}));
                        });
                break;
            case "beverage":
                insertPostdb("INSERT INTO posts (content, department_id, user_id, date_year, date_month, date_day, date_date, date_time) VALUES (" + pool.escape(new_post) + ", 4, "
                        + pool.escape(req.user.user_id) + ", '" + year + "', '" + month + "', '" + day + "', '" + date + "', '" + time + "')",
                        function(res_val) {
                            res.end(JSON.stringify(res_val));
                            io.sockets.emit('newPostAvailable', JSON.stringify({dep_id: 4, user_id: req.user.user_id}));
                        });
                break;
            case "industrial":
                insertPostdb("INSERT INTO posts (content, department_id, user_id, date_year, date_month, date_day, date_date, date_time) VALUES (" + pool.escape(new_post) + ", 5, "
                        + pool.escape(req.user.user_id) + ", '" + year + "', '" + month + "', '" + day + "', '" + date + "', '" + time + "')", pool.escape(req.user.user_id),
                        function(res_val) {
                            res.end(JSON.stringify(res_val));
                            io.sockets.emit('newPostAvailable', JSON.stringify({dep_id: 5, user_id: req.user.user_id}));
                        });
                break;
            case "vegetables":
                insertPostdb("INSERT INTO posts (content, department_id, user_id, date_year, date_month, date_day, date_date, date_time) VALUES (" + pool.escape(new_post) + ", 6, "
                        + pool.escape(req.user.user_id) + ", '" + year + "', '" + month + "', '" + day + "', '" + date + "', '" + time + "')", pool.escape(req.user.user_id),
                        function(res_val) {
                            res.end(JSON.stringify(res_val));
                            io.sockets.emit('newPostAvailable', JSON.stringify({dep_id: 6, user_id: req.user.user_id}));
                        });
                break;
            
            default:
                //bad request
                res.status(400);
                res.end("Bad Request!");
                return;
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

//post comment to the post
app.post('/resources/:dep_id/posts/:post_id/comments', function(req, res) {
    if(req.user) {
        var post_id = parseInt(req.params.post_id);
        var dep_id = parseInt(req.params.dep_id);
        if (/^[1-9][0-9]*$/.test(post_id) && dep_id >= 1 && dep_id <= 6) {
            var new_comment = req.body.comment_content;

            var year = new Date().getFullYear();
            var month = new Date().getMonth();
            var date = new Date().getDate();
            var day = new Date().getDay();
            var time;
            var hours = new Date().getHours();
            var minutes = new Date().getMinutes();

            if (hours < 10)
                time = "0" + hours + ":";
            else
                time = hours + ":";

            if (minutes < 10)
                time += "0" + minutes;
            else
                time += minutes;
        
/*
        insertCommentdb("INSERT INTO comments (post_id, user_id, content, date_year, date_month, date_day, date_date, date_time) VALUES (" +
                pool.escape(post_id) + ", '" + owner + "', " + pool.escape(new_comment) + ", '" + year + "', '" + month + "', '" + day + "', '" + date + "', '" + time + "')", function(res_val) {
            res.end(JSON.stringify(res_val));
            io.sockets.emit('newComment', JSON.stringify({dep_id: pool.escape(dep_id), post_id: pool.escape(post_id)}));
        });*/
       
            insertCommentdb(pool.escape(dep_id), pool.escape(post_id), pool.escape(new_comment), year, month, day, date, time, pool.escape(req.user.user_id), function(res_val, status){
                if(status) {
                    res.status(status);
                }
                res.end(JSON.stringify(res_val));
                io.sockets.emit('newComment', JSON.stringify({dep_id: pool.escape(dep_id), post_id: pool.escape(post_id), user_id: req.user.user_id}));
            });

        } else {
            res.status(400);
            res.end("Bad request!");
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

app.post('/resources/:dep_id/blogs', function(req, res) {
    if(req.user) {
        var dep_id = parseInt(req.params.dep_id);
        var blog_content = (req.body.blog_content);
        blog_content = sanitizeHtml(blog_content, {
            allowedTags: [ 'b', 'i', 'em', 'strong', 'u' ]
        });
        blog_content = pool.escape(blog_content);
        var blog_title = pool.escape(req.body.title);
    
    
        if(dep_id >= 2 && dep_id <= 6 && blog_content && blog_title && req.files.form_image_data) {

            var year = new Date().getFullYear();
            var month = new Date().getMonth();
            var date = new Date().getDate();
            var day = new Date().getDay();
            var time;
            var hours = new Date().getHours();
            var minutes = new Date().getMinutes();

            if (hours < 10)
                time = "0" + hours + ":";
            else
                time = hours + ":";

            if (minutes < 10)
                time += "0" + minutes;
            else
                time += minutes;

            pool.getConnection(function (err, connection) {
                if(err) {
                    throw err;
                } else {
                    var query = 'INSERT INTO info_blog (title, content, date_year, date_month, date_day, date_date, user_id, blog_image_name, department_id) VALUES ('+
                            blog_title+', '+blog_content+', "'+year+'", "'+month+'", "'+day+'", "'+date+'", '+pool.escape(req.user.user_id)+', "'+req.files.form_image_data.name+'", '+dep_id+')';
                    connection.query(query, function(err, result) {
                        if(err) {
                            throw err;
                        } else {
                            if(result.insertId) {
                                connection.query("INSERT INTO info_blog_seen_by (info_blog_id, user_id) VALUES ("+result.insertId+", "+pool.escape(req.user.user_id)+")", 
                                function(err, result) {
                                    if(err) {
                                        throw err;
                                    } else if(result.insertId) {
                                        connection.release();
                                        res.end("Blog successfully posted!");
                                        io.sockets.emit('newBlogAvailable', JSON.stringify({dep_id: dep_id, user_id: req.user.user_id}));
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

//delete post
app.delete('/resources/:dep_id/posts/:post_id', function(req, res) {
    if(req.user) {
        var post_id = parseInt(req.params.post_id);
        var dep_id = parseInt(req.params.dep_id);
        if (/^[1-9][0-9]*$/.test(post_id) && dep_id >= 1 && dep_id <= 6) {
            pool.getConnection(function(err, connection) {
                if (err) {
                    throw err;
                } else {
                    connection.query('SELECT user_id FROM posts WHERE post_id = ' + pool.escape(post_id) + ' AND department_id = ' + pool.escape(dep_id),
                            function(err, rows) {
                                if (err) {
                                    throw err;
                                } else if (rows.length === 1) {
                                    //delete progress
                                    if (rows[0].user_id === req.user.user_id) {
                                        connection.query('DELETE FROM posts WHERE post_id = ' + pool.escape(post_id) + ' AND department_id = ' + pool.escape(dep_id),
                                                function(err, result) {
                                                    if (err) {
                                                        throw err;
                                                    } else {
                                                        connection.release();
                                                        res.end(JSON.stringify({msg: "Post successfully deleted."}));
                                                        io.sockets.emit('postDeleted', JSON.stringify({dep_id: dep_id}));
                                                    }
                                                });
                                    } else {
                                        connection.release();
                                        res.status(400);
                                        res.end("Only the owner can delete their post!");
                                    }
                                } else {
                                    connection.release();
                                    res.status(400);
                                    res.end("The post no longer exists!");
                                }
                            });
                }
            });
        } else {
            res.status(400);
            res.end("Bad request!");
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

//delete blog id
app.delete('/resources/:dep_id/blogs/:blog_id', function(req, res) {
    if(req.user) {
        var blog_id = parseInt(req.params.blog_id);
        var dep_id = parseInt(req.params.dep_id);
        var blog_image;
        if (/^[1-9][0-9]*$/.test(blog_id) && dep_id >= 1 && dep_id <= 6) {
            pool.getConnection(function(err, connection) {
                if (err) {
                    throw err;
                } else {
                    connection.query('SELECT info_blog_id, blog_image_name FROM info_blog WHERE info_blog_id = ' + blog_id + ' AND department_id = ' + dep_id,
                    function(err, rows) {
                        if (err) {
                            throw err;
                        } else if (rows.length === 1) {
                            blog_image = rows[0].blog_image_name;
                            connection.query('SELECT role FROM users WHERE user_id = ' + pool.escape(req.user.user_id),
                            function(err, rows) {
                                if (err) {
                                    throw err;
                                } else if (rows.length === 1) {
                                    if (rows[0].role === "admin") {
                                        connection.query('DELETE FROM info_blog WHERE department_id = ' + dep_id + ' AND info_blog_id = ' + blog_id,
                                        function(err, rows) {
                                            if (err) {
                                                throw err;
                                            } else {
                                                connection.release();
                                                res.end(JSON.stringify({dep_id: dep_id, msg: "Blog Successfully Deleted!", blog_id: blog_id}));
                                                io.sockets.emit('blogDeleted', JSON.stringify({dep_id: dep_id}));
                                                fs.unlink("kFinal/files/"+blog_image, function(err) {
                                                    if (err) {
                                                        console.log('Image delete fail!');
                                                    } else {
                                                        console.log('Image delete success!');
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        connection.release();
                                        res.status(400);
                                        res.send("Only the admin can delete Blogs!");
                                    }
                                } else {
                                    connection.release();
                                    res.status(400);
                                    res.send("The Blog no longer exist!");
                                }
                            });
                        }
                    });

                }
            });
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});

//delete comment
app.delete('/resources/:dep_id/posts/:post_id/comments/:comment_id', function(req, res) {
    if(req.user) {
        var post_id = parseInt(req.params.post_id);
        var dep_id = parseInt(req.params.dep_id);
        var comment_id = parseInt(req.params.comment_id);
        if (/^[1-9][0-9]*$/.test(post_id) && dep_id >= 1 && dep_id <= 6 && /^[1-9][0-9]*$/.test(comment_id)) {
            // SELECT * FROM `comments` WHERE post_id in (select post_id from  posts where post_id = 22 and department_id = 2) and comment_id = 1
            pool.getConnection(function(err, connection) {
                if (err) {
                    throw err;
                } else {
                    var query = 'SELECT user_id FROM `comments` WHERE post_id in (select post_id from  posts where post_id = '+ post_id +' and department_id = ' + dep_id + ') and comment_id = '+comment_id;
                    connection.query(query, function(err, rows) {
                        if (err) {
                            throw err;
                        } else if (rows.length === 1) {
                            connection.query('SELECT user_id FROM posts WHERE post_id = '+post_id, function(err, post_rows) {
                               if(err) {
                                   throw err;
                               } else if (post_rows.length === 1) {
                                   //delete in progress
                                    if (rows[0].user_id === req.user.user_id || post_rows[0].user_id === req.user.user_id) {
                                        connection.query("DELETE FROM comments where comment_id = " + comment_id + " AND post_id in (select post_id from  posts where post_id = " + post_id + " and department_id = " + dep_id + ")",
                                        function(err, result) {
                                            if (err) {
                                                throw err;
                                            } else {
                                                connection.release();
                                                res.end(JSON.stringify({msg: "Comment successfully deleted."}));
                                                io.sockets.emit('commentDeleted', JSON.stringify({dep_id: dep_id, post_id: post_id}));
                                            }
                                        });
                                    } else {
                                        connection.release();
                                        res.status(400);
                                        res.send("Only the owner can delete their comments!");
                                    }
                                } else {
                                    connection.release();
                                    res.status(400);
                                    res.send("The comment no longer exists!");
                               }
                            });
                        } else {
                            connection.release();
                            res.status(400);
                            res.send("The post no longer exists!");
                        }
                    });
                }
            });
        } else {
            res.status(400);
            res.end("Bad request!");
        }
    } else {
        res.send(JSON.stringify({"auth_err": "Authorization Required!"}));
    }
});


var fetchPostUnSeen_bydb = function(query, nxt) {
    var post_unseen = 0;
    var comment_unseen = 0;
    var post_id_w_comments = [];
    pool.getConnection(function(err, connection) {
        if (err) {
            throw err;
        } else {
            connection.query(query, dep_id, function(err, post_rows) {
                if (err) {
                    throw err;
                } else if (post_rows.length > 0) {
                    post_rows.forEach(function(row, p) {
                        var post_row_length = post_rows.length;
                        connection.query("SELECT user_id FROM post_seen_by WHERE  post_id = " + row.post_id + " and user_id = " + pool.escape(req.user.user_id) + " LIMIT 1", 
                        function(err, rows) {
                            if (err) {
                                throw err;
                            } else if (rows.length <= 0) {
                                post_unseen++;
                            }
                            connection.query("SELECT DISTINCT post_id FROM comments WHERE post_id IN (SELECT post_id FROM posts WHERE ddpartment_id = 1) ", function(err, comment_rows){
                                if(err) {
                                    throw err;
                                } else if (comment_rows > 0) {
                                    comment_rows.forEach(function(row) {
                                        post_id_w_comments.push(row.post_id);
                                    });
                                }
                                post_id_w_comments.forEach(function(row){
                                   connection.query("SELECT user_id FROM comment_seen_by WHERE comment_id = " + row.comment_id + " and user_id = " + pool.escape(req.user.user_id), function(err, rows) {
                                    if (err) {
                                        throw err;
                                    } else if (comment_rows.length <= 0) {
                                        comment_unseen++;
                                    }
                                    if (c >= (comment_rows.length-1) && p >= (post_rows.length-1)) {
                                        connection.release();
                                        nxt({post: post_unseen, comment: comment_unseen});
                                    }
                                }); 
                                });
                            });
                        });
                    });
                } else {
                    connection.release();
                    nxt(unseen);
                }
            });
        }
    });
};

var fetchCommentUnSeen_bydb = function(query, nxt) {
    var unseen = 0;
    pool.getConnection(function(err, connection) {
        connection.query(query, function(err, rows) {
            if (err) {
                throw err;
            } else if (rows.length <= 0) {
                connection.release();
                nxt(unseen);
            } else {
                var comment_id_increment_checker = true;
                rows.forEach(function(row, i) {
                    connection.query("SELECT user_id FROM comment_seen_by WHERE comment_id = " + row.comment_id + " and user_id = " + pool.escape(req.user.user_id), function(err, rows) {
                        if (err) {
                            throw err;
                        } else if (rows.length <= 0) {
                            unseen++;
                        }
                        if (i >= (rows.length - 1)) {
                            connection.release();
                            nxt(unseen);
                        }
                    });
                });
            }
        });
    });
};

var fetchPostsdb = function(query, nxt) {
    var Posts = new Array();
    console.log("I am fetch postdb!");
    pool.getConnection(function(err, connection) {
        console.log("I am into pool!");
        if (err) {
            throw err;
        } else {
            connection.query(query, function(err, rows) {
                console.log("I am into first query!");
                if (err) {
                    throw err;
                } else if (rows.length > 0) {
                    rows.forEach(function(row, i) {
                        var post = {
                            "dep_id": row.department_id,
                            "post_id": row.post_id,
                            "post": {
                                "owner": row.user_id,
                                "date_stamp": {"year": row.date_year, "month": row.date_month, "date": row.date_date, "day": row.date_day, "time": row.date_time},
                                "seen_by": [],
                                "post_content": row.content,
                                "comments": []
                            }
                        };
                        Posts.push(post);
                        connection.query('SELECT user_id FROM post_seen_by WHERE post_id = ' + Posts[i].post_id,
                                function(err, rows) {
                                    console.log("Now, I am into 2nd query!");
                                    if (err) {
                                        throw err;
                                    } else {
                                        var seen_by = new Array();
                                        rows.forEach(function(row) {
                                            seen_by.push(row.user_id);
                                        });
                                        Posts[i].post.seen_by = seen_by;
                                    }
                                    connection.query('SELECT comment_id, content, user_id FROM comments WHERE post_id = ' + Posts[i].post_id,
                                            function(err, rows) {
                                                console.log(i);
                                                if (err) {
                                                    throw err;
                                                } else {
                                                    //var comments = new Array();
                                                    //var comment_ids = new Array();
                                                    rows.forEach(function(row, x) {
                                                        var comment = {
                                                            "comment_id": row.comment_id,
                                                            "comment": {
                                                                "owner": row.user_id,
                                                                "comment_content": row.content,
                                                                "seen_by": []
                                                            }
                                                        };
                                                        Posts[i].post.comments.push(comment);
                                                    });
                                                    if (i >= (Posts.length - 1)) {
                                                        connection.release();
                                                        console.log("conxn rleased---no comments---------------------");
                                                        nxt(Posts);
                                                    }
                                                }
                                            }
                                    );
                                }
                        );

                    });
                } else {
                    connection.release();
                    nxt(Posts);
                }
            }
            );
        }
    });

};

var fetchBlogsdb = function(query, nxt) {
    var Blogs = new Array();

    pool.getConnection(function(err, connection) {
        if (err) {
            throw err;
        } else {
            connection.query(query, function(err, rows) {
                if (err) {
                    throw err;
                } else if (rows.length > 0) {
                    rows.forEach(function(row, i) {
                        var blog = {
                            "blog_id": row.info_blog_id,
                            "dep_id": row.department_id,
                            "blog": {
                                "owner": row.user_id,
                                "blog_title": row.title,
                                "date_stamp": {"year": row.date_year, "month": row.date_month, "date": row.date_date, "day": row.date_day, "time": row.date_time},
                                "seen_by": [],
                                "blog_content": row.content,
                                "image_src": row.blog_image_name
                            }
                        };
                        Blogs.push(blog);
                        connection.query('SELECT user_id FROM info_blog_seen_by WHERE info_blog_id = ' + Blogs[i].blog_id,
                                function(err, rows) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        var seen_by = new Array();
                                        rows.forEach(function(row) {
                                            seen_by.push(row.user_id);
                                        });
                                        Blogs[i].blog.seen_by = seen_by;
                                        if (i >= Blogs.length - 1) {
                                            connection.release();
                                            nxt(Blogs);
                                        }
                                    }
                                });
                    });
                } else {
                    connection.release();
                    nxt(Blogs);
                }
            });
        }
    });
};

var insertPostdb = function(query, owner, nxt) {
    pool.getConnection(function(err, connection) {
        if (err) {
            throw err;
        } else {
            connection.query(query, function(err, result) {
                if (err) {
                    throw err;
                } else {
                    if (result.insertId) {
                        connection.query("INSERT INTO post_seen_by (user_id, post_id) VALUES (" + owner + ", " + result.insertId + ")", function(err, result) {
                            if (err) {
                                throw err;
                            } else {
                                connection.release();
                                nxt("Post successfully posted!");
                            }
                        });
                    }
                }
            });
        }
    });
};

var insertCommentdb = function(dep_id, post_id, new_comment, year, month, day, date, time, owner, nxt) {
    
    pool.getConnection(function(err, connection) {
        if (err) {
            throw err;
        } else {
            connection.query("SELECT post_id FROM posts WHERE  department_id = " + dep_id + " AND post_id = " + post_id, function(err, rows) {
                if (err) {
                    throw err;
                } else if (rows.length === 1) {
                    //add new comment to this post
                    var query = "INSERT INTO comments (post_id, user_id, content, date_year, date_month, date_day, date_date, date_time) VALUES (" +
                            post_id + ", " + owner + ", " + new_comment + ", '" + year + "', '" + month + "', '" + day + "', '" + date + "', '" + time + "')";
                    connection.query(query, function(err, result) {
                        if (err) {
                            throw err;
                        } else {
                            if (result.insertId) {
                                connection.query("INSERT INTO comment_seen_by (user_id, comment_id) VALUES (" + owner + ", " + result.insertId + ")", function(err, result) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        connection.release();
                                        nxt("Comment successfully written!", null);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    connection.release();
                    nxt("The Post no longer exists!", 500);
                }
            });
        }
    });
};
