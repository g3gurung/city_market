/**
 For simple applications, you might define all of your views in this file.  
 For more complex applications, you might choose to separate these kind definitions 
 into multiple files under this folder.
 */

enyo.kind({
    name: "myapp.MainView",
    kind: "FittableRows",
    fit: true,
    left_item_noti_looper: 0,
    sound_noti: new Audio("assets/sounds/noti.wav"),
    socket: null,
    push_data_comments: null,
    push_data_comments_deleted: null,
    published: {
        "users": [],
        "departments": [
          
        ],
        "currentUser": "",
        "department_noti": {},
        "blogDeleted": false,
        "token": null
    },
    components: [
        {name: "sliding_notification_container", classes:"sliding-notification-container", 
            components: [
                
            ],
            sliding_notification_hidden: function(inSender, inEvent) {
                inSender.applyStyle("right", "-1000px");
                return true;
            }
        },
        {name: "loginPopup", classes: "onyx-sample-popup", kind: "onyx.Popup",
            centered: true, modal: true, floating: true, onShow: "popupShown", autoDismiss: false,
            onHide: "popupHidden", scrim: true, style: "background: #4c66a4; text-align: center; padding: 10px",
            components: [
                {components: [
                        {content: "Login Here!", style: "color: #303030; font-weight: bold; text-align: center; padding-bottom: 10px; font-size: 1.2em"}
                    ]},
                {kind: "onyx.InputDecorator", style:"width: 90%", components: [
                        {name: "userId", kind: "onyx.Input", style:"width: 90%",
                            placeholder: "User ID"}
                    ]},
                {tag: "br"},
                {kind: "onyx.InputDecorator", style:"width: 90%; margin-top: 5px", components: [
                        {name: "password", kind: "onyx.Input", style:"width: 90%", 
                            type: "password", placeholder: "Password"}
                    ]},
                {tag: "br"},
                {name: "loginError", content: "", showing: false, fit: true,
                    style: "padding: 2px; border: 1px solid #E06666; color: #E37575; border-radius: 5px; font-size: 0.84em; margin-top: 2px"},
                {kind: "FittableColumns", style: "margin-top: 10px", components: [
                        {name: "signInBtn", kind: "onyx.Button", content: "Sign In",
                            ontap: "signIn", style: "background: rgb(13, 49, 146); color: grey; font-weight: bold; width:100%"},
                        {name: "signInSpinner", style: "background: rgb(13, 49, 146); color: grey; font-weight: bold; width:100%; text-align: center; height: 33px",
                            classes: "onyx-button", showing: false,
                            components: [{kind: "Image", src: "assets/post_spinner.gif", style: "height: 20px; opacity: 0.5"}]
                        }
                    ]}
            ]
        },
        {name: "successPopup", kind: "onyx.Popup", centered: true, scrim: true,
            floating: true, classes: "onyx-sample-popup app-popup", autoDismiss: false,
            components: [
                {kind: "onyx.Spinner"},
                {showing: false, components: [
                    {content: ""},
                    {kind: "FittableColumns", style: "text-align: center", components: [
                        {kind: "onyx.Button", content: "OK", ontap: "closePopup",
                            popup: "successPopup",
                            classes: "popup-btn"}
                        ]
                    }
                ]}
            ]
        },
        {name: "postRemover", kind: "onyx.Popup", scrim: true, centered: true, autoDismiss: false,
            floating: true, classes: "onyx-sample-popup app-popup", published: {post_id: null, dep_id: null},
            components: [
                {components: [
                {content: "Are you sure want to remove the post?"},
                    {kind: "FittableColumns", components: [
                            {kind: "onyx.Button", content: "Yes", ontap: "removePost",
                                classes: "popup-btn"},
                            {kind: "onyx.Button", content: "No", ontap: "closePopup",
                                classes: "popup-btn", popup: "postRemover"}
                        ]
                    }
                ]}
            ]
        },
        {name: "commentRemover", kind: "onyx.Popup", scrim: true, centered: true,
            floating: true, classes: "onyx-sample-popup app-popup", autoDismiss: false,
            published: {post_id: null, dep_id: null, comment_id: null},
            components: [
                {content: "Are you sure want to remove the comment?"},
                {kind: "FittableColumns", components: [
                        {kind: "onyx.Button", content: "Yes", ontap: "removeComment",
                            classes: "popup-btn"},
                        {kind: "onyx.Button", content: "No", ontap: "closePopup",
                            popup: "commentRemover",
                            classes: "popup-btn"}
                    ]}
            ]
        },
        {name: "blogRemover", kind: "onyx.Popup", scrim: true, centered: true,
            floating: true, classes: "onyx-sample-popup app-popup", autoDismiss: false,
            published: {blog_id: null, dep_id: null},
            components: [
                {content: "Are you sure want to remove the blog?"},
                {kind: "FittableColumns", components: [
                        {kind: "onyx.Button", content: "Yes", ontap: "removeBlog",
                            classes: "popup-btn"},
                        {kind: "onyx.Button", content: "No", ontap: "closePopup",
                            popup: "blogRemover",
                            classes: "popup-btn"}
                    ]}
            ]
        },
        {name: "body_seen_popup", kind: "onyx.Popup", 
            scrim: true, centered: true, published: {users: null},
            floating: true, classes: "onyx-sample-popup app-popup",
            components: [
                {name: "seen_by_scroller", kind: "Scroller", horizontal: "hidden", touch: true,
                    classes: "seen-by-scroller", components: [
                        {name: "seen_by_repeater", kind: "Repeater", count: 0,
                            onSetupItem: "setupSeenBy", components: [
                                {name: "seen_by_repeater_item", kind: "seen_by_item",
                                    classes: "panels-sample-sliding-item"}
                            ]
                        }
                    ]
                }
            ]
        },
        {name: "view_panels", kind: "Panels", fit: true, realtimeFit: true,
            classes: "panels-sample-sliding-panels",
            arrangerKind: "CollapsingArranger", wrap: false, components: [
                {name: "left", components: [
                        {name: "left_toolbar", kind: "onyx.Toolbar",
                            components: [
                                {name: "settings", kind: "onyx.MenuDecorator",
                                    style: "border-radius: 5px; background: white; margin: 0",
                                    components: [
                                        {style: "margin: 0; padding: 0; background: white; border: 1px solid white", components: [
                                                {kind: "Image", src: "assets/menu.gif"}
                                            ]
                                        },
                                        {kind: "onyx.Menu", style: "background: rgba(13, 49, 146, 0.85);",
                                            components: [
                                                {components: [
                                                        {name: "user",
                                                            components: [
                                                                {name: "userAvatar", kind: "Image", style: "height: 40px; width: 40px"},
                                                                {name: "userName",
                                                                    style: "display: inline-block; position: relative; top: -15px; margin-left: 5px"}
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {classes: "onyx-menu-divider"},
                                                {components: [
                                                        {name: "log_out",
                                                            components: [
                                                                {kind: "Image", src: "assets/logOut.png", style: "height: 40px; width: 40px"},
                                                                {content: "Log Out",
                                                                    style: "display: inline-block; position: relative; top: -15px; margin-left: 5px"}
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {content: "Departments", classes: "tooldbar-title"},
                                {kind: "onyx.Button", name: "app_renderer", ontap: "app_renderer_tapped",
                                    style: "padding: 5px; border-radius: 25px; border: 1px solid white; background: white; position: absolute; right: 10px",
                                    components: [
                                        {kind: "onyx.Icon", src: "assets/reload.png", style:"position: relative; top: -3px"}
                                    ]
                                }
                            ]
                        },
                        {name: "left_scroller", kind: "Scroller",
                            horizontal: "hidden", classes: "enyo-fit", style: "top: 60px",
                            touch: true, components: [
                                {name: "left_repeater", kind: "Repeater", classes: "enyo-fit",
                                    touch: true, count: 0,
                                    onSetupItem: "setupItemLeftPanel",
                                    components: [
                                        {name: "left_repeater_item", classes: "panels-sample-sliding-item", 
                                            style: "cursor: pointer", published: {selection: false}, ontap: "left_repeater_item_tapped",
                                            components: [
                                                {name: "left_repeater_item_image", kind: "Image", style: "width: 80px; height: 80px; vertical-align: middle"},
                                                {name: "left_repeater_item_title", classes: "left-repeater-item-title"},
                                                {name: "notification_info", showing: false, classes: "notification-info", 
                                                    components: [
                                                        {name: "total_post_notification", content: "", classes: "post-notification", showing: false},
                                                        {name: "total_comment_notification", content: "", classes: "comment-notification", showing: false},
                                                        {name: "total_blog_notification", content: "", classes: "blog-notification", showing: false}
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {name: "middle", published: {department_idx: null}, components: [
                        {name: "middle_toolbar", kind: "onyx.Toolbar",
                            components: [
                                {kind: "onyx.Button", name: "middle_back_btn", ontap: "back_btn_tapped",
                                    style: "padding-left: 5px; padding-right: 5px; border-radius: 25px; border: 1px solid white; background: white",
                                    components: [
                                        {kind: "onyx.Icon", src: "assets/back.png"}
                                    ]
                                },
                                {name: "middle_title", content: "Departments Title", classes: "tooldbar-title"},
                                {kind: "onyx.Button", name: "compose_btn", ontap: "displayComposeView", showing: false,
                                    style: "border-radius: 3px; border: 1px solid white; background: white; position: absolute; right: 10px",
                                    components: [
                                        {kind: "onyx.Icon", src: "assets/compose.png"}
                                    ]
                                }
                            ]
                        },
                        {name: "middle_scroller", kind: "Scroller",
                            horizontal: "hidden", classes: "enyo-fit", style: "top: 60px",
                            touch: true, components: [
                                {name: "middle_panel_info", classes: "middle-panel-info", 
                                    published: {selection: [false, false, false, false, false], blogs: []}, ontap: "middle_panel_info_tapped",
                                    showing: false, components: [
                                        {name: "middle_panel_info_item_image", kind: "Image", 
                                            style: "width: 80px; height: 80px; vertical-align: middle", src: "assets/departments/info.png"},
                                        {name: "middle_panel_info_item_title", classes: "left-repeater-item-title", content: "Info Blog"},
                                        {name: "blog_noti", classes:"notification-info", components:[
                                            {content: "", classes: "middle-panel-blog-total-noti", showing: false},
                                            //{kind: "Image", src: "assets/noti.png", style: "margin-left: 5px; display: inline-block; vertical-align: middle"},
                                            {name: "post_dot_notification", classes: "post-dot-notification",
                                                content: "●", showing: false},
                                            {name: "post_tick_notification", classes: "post-tick-notification",
                                                content: "✓", showing: false}
                                        ]}
                                    ]
                                },
                                {name: "middle_repeater", kind: "Repeater", classes: "enyo-fit",
                                    touch: true, count: 0, style: "top: 100px",
                                    onSetupItem: "setupItemMiddlePanel",
                                    published: {
                                        posts: [],
                                        personell_items: [],
                                        selected: [null,null,null,null,null],
                                        blogs: [],
                                        post_ids: []
                                    },
                                    components: [
                                        {name: "middle_repeater_item", classes: "panels-sample-sliding-item", 
                                            fit: true, style: "cursor: pointer", 
                                            components: [
                                                {kind: "post_item"}
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {name: "middle_item_load_more", ontap: "load_more_post_item",
                            classes: "middle-item-load-more", published: {min_post_id: [0,0,0,0,0,0], limit: 10, scrollToBottom: false},
                            showing: false,
                            components: [
                                {name: "load_more_txt", content: "Load More...", classes: "load-more-txt"},
                                {name: "load_more_gif", kind: "Image", src: "assets/post_spinner.gif", style: "height: 30px"}
                            ]
                        }
                    ]
                },
                {name: "body", fit: true, published: {post_id: null, dep_id: null, personell_idx: null, blog_id: null, postOwner: null},
                    components: [
                        {name: "body_toolbar", kind: "onyx.Toolbar",
                            components: [
                                {kind: "onyx.Button", name: "body_back_btn", ontap: "back_btn_tapped",
                                    style: "padding-left: 5px; padding-right: 5px; border-radius: 25px; border: 1px solid white; background: white",
                                    components: [
                                        {kind: "onyx.Icon", src: "assets/back.png"}
                                    ]
                                },
                                {name: "body_title", content: "Departments", classes: "tooldbar-title"},
                                {kind: "onyx.Button", name: "info_compose_btn", ontap: "displayInfoComposeView", showing: false,
                                    style: "border-radius: 3px; background: white; border: 1px solid white; position: absolute; right: 10px",
                                    components: [
                                        {kind: "onyx.Icon", src: "assets/compose.png"}
                                    ]
                                }
                            ]
                        },
                        {name: "body_panel_scroller", kind: "Scroller", horizontal: "hidden",
                            classes: "enyo-fit", style: "top: 60px",
                            touch: true, components: [
                                {name: "body_content"}
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    app_renderer_tapped: function(inSender, inEvent) {
        this.render();
        return true;
    },
    rendered: function() {
        this.inherited(arguments);
        if(this.getCurrentUser()) {
            this.fetchAppContent();
        } else {
            this.$.loginPopup.show();
        }
    },
    xhrDepartments: function() {
        var ajax = new enyo.Ajax({
            url: "resources/departments",
            method: "GET",
            headers: {"x-access-token": this.getToken()}
        });

        // send parameters the remote service using the 'go()' method
        ajax.go();
        // attach responders to the transaction object
        ajax.response(this, "processDepartmentsResponse");
        // handle error
        ajax.error(this, "processDepartmentsError");  
    },
    processDepartmentsResponse: function(inSender, inResponse) {
        var res = inResponse;
        this.setDepartments(res);
        this.$.left_repeater.count = res.length;
        this.$.left_repeater.build();
    },
    processDepartmentsError: function(inSender, inResponse) {
        console.error("Error: processDepartmentsError; "+inSender.xhrResponse.body);
    },
    xhrUsers: function() {
        var ajax = new enyo.Ajax({
            url: "resources/users",
            method: "GET",
            headers: {"x-access-token": this.getToken()}
        });

        // send parameters the remote service using the 'go()' method
        ajax.go();
        // attach responders to the transaction object
        ajax.response(this, "processUsersResponse");
        // handle error
        ajax.error(this, "processUsersError");  
    },
    processUsersResponse: function(inSender, inResponse) {
        var res = inResponse;
        this.setUsers(res);
        
        if(this.fetchUserAvatar(this.getCurrentUser())) {
            this.$.userAvatar.setSrc("assets/"+this.fetchUserAvatar(this.getCurrentUser()));
        } else {
            this.$.userAvatar.setSrc("assets/user.png");
        }
        
        this.$.userName.setContent(this.fetchUsername(this.getCurrentUser()));
        
    },
    processUsersError: function(inSender, inResponse) {
        console.error("Error: processUsersError; "+inSender.xhrResponse.body);
    },
    popupHidden: function() {
        // FIXME: needed to hide ios keyboard
        document.activeElement.blur();
        if (this.$.loginPopup.showing) {   // Refocus input on modal
            enyo.job("focus", enyo.bind(this.$.input, "focus"), 500);
        }/*
        this.showSlidingNoti("new <b>post</b> from <b>prataksha gurung</b> in <b>news feed!</b>");
        this.showSlidingNoti("new <b>post</b> from <b>prataksha gurung</b> in <b>news feed!</b>");*/
    },
    showSlidingNoti: function(txt) {
        this.$.sliding_notification_container.createComponent({
            classes: "sliding-notification",
                ontap: "sliding_notification_hidden",
                components: [
                    {kind:"Image", src: "assets/bell_noti.png", style: "vertical-align: middle; margin-right: 15px"},
                    {tag: "span", allowHtml: true,
                        classes: "sliding-notification-content",
                        content: txt}
                ]
            }
        );
        this.$.sliding_notification_container.render();
        var index = this.$.sliding_notification_container.children.length - 1;
        var ele, prev_ele_height, prev_ele_top, top = 80;
        ele = this.$.sliding_notification_container.children[index];
        if(index > 0) {
            prev_ele_height = this.$.sliding_notification_container.children[index-1].getBounds().height;
            prev_ele_top = this.$.sliding_notification_container.children[index-1].getBounds().top;
            top = prev_ele_height + prev_ele_top + 10;
        }
        ele.applyStyle("right", "-1000px");
        ele.applyStyle("top", top+"px");
        setTimeout(function(){
            ele.applyStyle("right", "0px");
        }, 2000);
        setTimeout(function(){
            ele.applyStyle("right", "-1000px");
        }, 6000);
        setTimeout(function(){
            ele.destroy();
        }, 7000);
    },
    popupShown: function() {
        // FIXME: does not focus input on android.
        this.$.userId.focus();
        enyo.job("focus", enyo.bind(this.$.userId, "focus"), 500);
    },
    signIn: function(inSender, inEvent) {
        //do authorization in here 
        var user = this.$.userId.getValue(), 
            passwd = this.$.password.getValue(),
            param;
            
        if (user && passwd) {
            this.$.signInBtn.setShowing(false);
            this.$.signInSpinner.setShowing(true);
            
            param = {user: user, passwd: passwd};
            
            var ajax = new enyo.Ajax({
                url: "login",
                method: "POST",
                postBody: param
            });

           // send parameters the remote service using the 'go()' method
           ajax.go();
           // attach responders to the transaction object
           ajax.response(this, "processSigninResponse");
           // handle error
           ajax.error(this, "processSigninError");  
        }
        
        //this.$.loginPopup.hide();
        return true;
    },
    processSigninResponse: function(inSender, inResponse) {
        this.$.signInBtn.setShowing(true);
        this.$.signInSpinner.setShowing(false);
        if(inResponse.err) {
            this.$.loginError.setContent(inResponse.err);
            this.$.loginError.setShowing(true);
        }else if(inResponse) {
            this.setCurrentUser(inSender.postBody.user.replace(/\s{2,}/g, ' '));
            this.setToken(inResponse.access_token);
            this.$.loginError.setShowing(false);
            this.$.loginPopup.hide();
            this.fetchAppContent();
        }
            
    },
    fetchAppContent: function() {
        this.socket = io.connect('pratakshavm.cloudapp.net');
        
        this.socket.on('newPostAvailable', enyo.bind(this, function(data) {
            
            var push_data = JSON.parse(data);
            var dep_idx = parseInt(push_data.dep_id) - 1;
            
            if(push_data.user_id !== this.getCurrentUser()) {
                this.showSlidingNoti("new <b>Post</b> from <b>"+this.fetchUsername(push_data.user_id)+"</b> in <b>"+this.getDepartments()[dep_idx].name+"</b>");
                this.sound_noti.play();
            }
            this.$.left_repeater.renderRow(dep_idx);
            if(this.$.middle.getDepartment_idx() === dep_idx) {
                //get request for the posts
                var ajax = new enyo.Ajax({
                    url: "resources/"+this.getDepartments()[dep_idx].name.replace(/\s/g, '').toLowerCase()+"/posts",
                    method: "GET",
                    headers: {"x-access-token": this.getToken()}
                });

                // send parameters the remote service using the 'go()' method
                ajax.go({limit: this.$.middle_repeater.getCount()+1});
                // attach responders to the transaction object
                ajax.response(this, "processPostsResponse");
                // handle error
                ajax.error(this, "processPostsError");
            }
        }));

        this.socket.on('newComment', enyo.bind(this, function(data) {
            
            this.push_data_comments = JSON.parse(data);
            this.push_data_comments.dep_id = parseInt(this.push_data_comments.dep_id);
            this.push_data_comments.post_id = parseInt(this.push_data_comments.post_id);

            var dep_idx = this.push_data_comments.dep_id - 1;
            this.$.left_repeater.renderRow(dep_idx);
            if(this.push_data_comments.user_id !== this.getCurrentUser()) {
                this.showSlidingNoti("new <b>Comment</b> from <b>"+this.fetchUsername(this.push_data_comments.user_id)+"</b> in <b>"+this.getDepartments()[dep_idx].name+"</b>");
                this.sound_noti.play();
            }
            
            if(this.$.middle.getDepartment_idx() === dep_idx) {
                //get request for the posts
                var ajax = new enyo.Ajax({
                    url: "resources/"+this.getDepartments()[dep_idx].name.replace(/\s/g, '').toLowerCase()+"/posts",
                    method: "GET",
                    headers: {"x-access-token": this.getToken()}
                });

                // send parameters the remote service using the 'go()' method
                ajax.go({limit: this.$.middle_repeater.getCount()});
                // attach responders to the transaction object
                ajax.response(this, "processPostsResponse");
                // handle error
                ajax.error(this, "processPostsError");

            }
        }));

        this.socket.on('postDeleted', enyo.bind(this, function(data) {
            var dep_idx = parseInt(JSON.parse(data).dep_id) - 1;
            this.$.left_repeater.renderRow(dep_idx);
            
            if(this.$.middle.getDepartment_idx() === dep_idx) {
                //get request for the posts
                var ajax = new enyo.Ajax({
                    url: "resources/"+this.getDepartments()[dep_idx].name.replace(/\s/g, '').toLowerCase()+"/posts",
                    method: "GET",
                    headers: {"x-access-token": this.getToken()}
                });

                // send parameters the remote service using the 'go()' method
                ajax.go({limit: this.$.middle_repeater.getCount()-1});
                // attach responders to the transaction object
                ajax.response(this, "processPostsResponse");
                // handle error
                ajax.error(this, "processPostsError");
            }
        }));

        this.socket.on('commentDeleted', enyo.bind(this, function(data) {
            this.push_data_comments_deleted = JSON.parse(data);

            this.push_data_comments_deleted.dep_id = parseInt(this.push_data_comments_deleted.dep_id);
            this.push_data_comments_deleted.post_id = parseInt(this.push_data_comments_deleted.post_id);

            var dep_idx = this.push_data_comments_deleted.dep_id - 1;
            
            this.$.left_repeater.renderRow(dep_idx);
            
            if(this.$.middle.getDepartment_idx() === dep_idx) {
                //get request for the posts
                var ajax = new enyo.Ajax({
                    url: "resources/"+this.getDepartments()[dep_idx].name.replace(/\s/g, '').toLowerCase()+"/posts",
                    method: "GET",
                    headers: {"x-access-token": this.getToken()}
                });

                // send parameters the remote service using the 'go()' method
                ajax.go({limit: this.$.middle_repeater.getCount()});
                // attach responders to the transaction object
                ajax.response(this, "processPostsResponse");
                // handle error
                ajax.error(this, "processPostsError");

            }

        }));

        this.socket.on('newBlogAvailable', enyo.bind(this, function(data) {
            
            var data = JSON.parse(data);
            
            var dep_idx = parseInt(data.dep_id) - 1;
            
            if(data.user_id !== this.getCurrentUser()) {
                this.showSlidingNoti("new <b>Blog</b> from <b>"+this.fetchUsername(data.user_id)+"</b> in <b>"+this.getDepartments()[dep_idx].name+"</b>");
                this.sound_noti.play();
            }
            
            this.$.left_repeater.renderRow(dep_idx);
            if(this.$.middle.getDepartment_idx() === dep_idx) {
                var ajax_blog = new enyo.Ajax({
                    url: "resources/"+this.getDepartments()[dep_idx].name.replace(/\s/g, '').toLowerCase()+"/blogs",
                    method: "GET",
                    headers: {"x-access-token": this.getToken()}
                });

                ajax_blog.go();
                ajax_blog.response(this, "processBlogsResponse"); //do unseen or seen here
                ajax_blog.error(this, "processBlogsError");
            }
        }));

        this.socket.on('blogDeleted', enyo.bind(this, function(data) {
            var dep_idx = parseInt(JSON.parse(data).dep_id) - 1;
            if(this.$.middle.getDepartment_idx() === dep_idx) {
                var ajax_blog = new enyo.Ajax({
                    url: "resources/"+this.getDepartments()[dep_idx].name.replace(/\s/g, '').toLowerCase()+"/blogs",
                    method: "GET",
                    headers: {"x-access-token": this.getToken()}
                });

                ajax_blog.go();
                ajax_blog.response(this, "processBlogsResponse"); //do unseen or seen here
                ajax_blog.error(this, "processBlogsError");
            }
        }));

        this.xhrDepartments();
        this.xhrUsers();  
    },
    processSigninError: function(inSender, inResponse) {
        this.$.signInBtn.setShowing(true);
        this.$.signInSpinner.setShowing(false);
        this.$.loginError.setContent("Login Failed!");
        this.$.loginError.setShowing(true);
    },
    setupItemLeftPanel: function(inSender, inEvent) {
        var i = inEvent.index;
        var item = inEvent.item;
        
        this.setupItemLeftPanelNoti(i+1);
        
        var iconSrc = "assets/departments/" + this.getDepartments()[i].icon;
        var title = this.getDepartments()[i].name;

        item.$.left_repeater_item_image.setSrc(iconSrc);
        item.$.left_repeater_item_title.setContent(title);
        
        item.$.left_repeater_item.addRemoveClass("onyx-selected", item.$.left_repeater_item.getSelection());
        
        //this.$.left_scroller.render();
    },
    setupItemLeftPanelNoti: function(dep_id) {
        if(dep_id < 7) {
            var ajax = new enyo.Ajax({
                url: "resources/"+dep_id+"/unseen",
                method: "GET",
                headers: {"x-access-token": this.getToken()}
            });

           // send parameters the remote service using the 'go()' method
           ajax.go();
           // attach responders to the transaction object
           ajax.response(this, "processILNResponse");
           // handle error
           ajax.error(this, "processILNError");  
       }
    },
    processILNResponse: function(inSender, inResponse) {
        if(inResponse.post_unseen > 0) {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.notification_info.setShowing(true);
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_post_notification.setContent(inResponse.post_unseen+" unseen Posts");
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_post_notification.setShowing(true);
        } else {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_post_notification.setShowing(false);
        }
        
        if(inResponse.comment_unseen > 0) {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.notification_info.setShowing(true);
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_comment_notification.setContent(inResponse.comment_unseen+" unseen Comments");
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_comment_notification.setShowing(true);
        } else {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_comment_notification.setShowing(false);
        }
        
        if(inResponse.blog_unseen > 0) {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.notification_info.setShowing(true);
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_blog_notification.setContent(inResponse.blog_unseen+" unseen blogs");
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_blog_notification.setShowing(true);
        } else {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_blog_notification.setShowing(false);
        }
        
        if(inResponse.post_unseen === 0 && inResponse.comment_unseen === 0 && inResponse.blog_unseen === 0) {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.notification_info.setShowing(false);
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_post_notification.setShowing(false);
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_comment_notification.setShowing(false);
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_blog_notification.setShowing(false);
        }
    },
    processILNError: function(inSender, inResponse) {
        console.error("Error: processILNError; "+inSender.xhrResponse.body);
    },
    setupItemMiddlePanel: function(inSender, inEvent) {
        var i = inEvent.index;
        var item = inEvent.item;
        
        
        
        if (this.$.middle.getDepartment_idx() !== (this.getDepartments().length - 1)) {
            
            inSender.post_ids[inEvent.index] = inSender.getPosts()[i].post_id;
            
            var day = this.dayInLetters(parseInt(inSender.getPosts()[i].post.date_stamp.day));
            var month = this.monthInLetters(parseInt(inSender.getPosts()[i].post.date_stamp.month));
            var year = parseInt(inSender.getPosts()[i].post.date_stamp.year);
            var date = parseInt(inSender.getPosts()[i].post.date_stamp.date);

            var year_today = new Date().getFullYear();
            var month_today = new Date().getMonth();
            var date_today = new Date().getDate();
            
            var post_owner_name;
            
            for (var x = 0; x < this.getUsers().length; x++) {
                if(inSender.getPosts()[i].post.owner === this.getUsers()[x].user_id) {
                    post_owner_name = this.getUsers()[x].first_name+" "+this.getUsers()[x].middle_name+" "+this.getUsers()[x].last_name;
                    post_owner_name = post_owner_name.replace(/\s{2,}/g, ' ');
                    if(this.getUsers()[x].role === "admin") {
                        //item.$.post_item.$.post_owner_name.applyStyle("color", "#4D944D");
                        //item.$.post_item.$.post_content_text.applyStyle("color", "#4D944D");
                        item.$.post_item.addRemoveClass("admin", true);
                    }
                }
            }
            
            //item.$.middle_repeater_item.addRemoveClass("unseen_item", true);
            item.$.post_item.$.post_dot_notification.setShowing(false);
            item.$.post_item.$.post_tick_notification.setShowing(true);
            item.$.middle_repeater_item.addRemoveClass("unseen_item", false);
            
            if(inSender.posts[i].post.seen_by.indexOf(this.getCurrentUser()) < 0) {
                item.$.post_item.$.post_dot_notification.setShowing(true);
                item.$.post_item.$.post_tick_notification.setShowing(false);
                item.$.middle_repeater_item.addRemoveClass("unseen_item", true);
            }
            /*
            for(var x = 0; x < inSender.posts[i].post.comments.length; x++) {
                if(inSender.posts[i].post.comments[x].comment.seen_by.indexOf(this.getCurrentUser()) < 0) {
                    //item.$.middle_repeater_item.applyStyle("background", "white");
                    item.$.post_item.$.post_dot_notification.setShowing(true);
                    item.$.post_item.$.post_tick_notification.setShowing(false);
                    item.$.middle_repeater_item.addRemoveClass("unseen_item", true);
                    break;
                }
            }*/
            
            //do ajax to check user_id instead
            //get request for the posts
            var ajax = new enyo.Ajax({
                url: "resources/"+(parseInt(this.$.middle.getDepartment_idx())+1)+"/posts/"+inSender.posts[i].post_id+"/comments/seen_by",
                method: "GET",
                headers: {"x-access-token": this.getToken()}
            });

            // send parameters the remote service using the 'go()' method
            ajax.go();
            // attach responders to the transaction object
            ajax.response(this, "processCommentSeenResponse");
            // handle error
            ajax.error(this, "processCommentSeenError");
            
            
            
            //item.$.post_item.$.post_owner_avatar.setSrc();
            if(this.fetchUserAvatar(inSender.getPosts()[i].post.owner)) {
                item.$.post_item.$.post_owner_avatar.setSrc("assets/"+this.fetchUserAvatar(inSender.getPosts()[i].post.owner));
            } else {
                item.$.post_item.$.post_owner_avatar.setSrc("assets/user.png");
            }
            
            item.$.post_item.$.post_owner_name.setContent(post_owner_name);
            item.$.post_item.$.post_content_text.setContent(inSender.getPosts()[i].post.post_content);
            
            if (year === year_today && month === this.monthInLetters(month_today) && date === date_today) {
                item.$.post_item.$.post_date.setContent("Today at " + inSender.getPosts()[i].post.date_stamp.time);
            } else {
                item.$.post_item.$.post_date.setContent(day + " " + month + " " + date + " " + year + " at " + inSender.getPosts()[i].post.date_stamp.time);
            }
            if (inSender.getSelected()[this.$.middle.getDepartment_idx()] === inSender.getPosts()[i].post_id) {
                item.$.middle_repeater_item.addRemoveClass("unseen_item", false);
                item.$.middle_repeater_item.addRemoveClass("onyx-selected", true);
            } else {
                item.$.middle_repeater_item.addRemoveClass("onyx-selected", false);
            }
            
            item.$.post_item.$.post_seen_comments.children[0].setContent("Seen by "+inSender.getPosts()[i].post.seen_by.length);
            item.$.post_item.$.post_seen_comments.children[1].setContent("Comment/s "+inSender.getPosts()[i].post.comments.length);
            
        } else {
            item.$.personell_item.$.personell_item_image.setSrc("assets/departments/"+inSender.getPersonell_items()[i].img_src);
            item.$.personell_item.$.personell_item_title.setContent(inSender.getPersonell_items()[i].title);
            if (inSender.getSelected()[this.$.middle.getDepartment_idx()] === inSender.getPersonell_items()[i].title) {
                item.$.middle_repeater_item.addRemoveClass("onyx-selected", true);
            } else {
                item.$.middle_repeater_item.addRemoveClass("onyx-selected", false);
            }
            
        }
    },
    processCommentSeenResponse: function(inSender, inResponse) {
        if(inResponse.comments.length > 0){
            for(var i=0; i<inResponse.comments.length; i++) {
                if(inResponse.comments[i].user_id.indexOf(this.getCurrentUser()) < 0) {
                    var middle_repeater_index = this.$.middle_repeater.getPost_ids().indexOf(inResponse.post_id);
                    this.$.middle_repeater.children[middle_repeater_index].$.post_item.$.post_dot_notification.setShowing(true);
                    this.$.middle_repeater.children[middle_repeater_index].$.post_item.$.post_tick_notification.setShowing(false);
                    this.$.middle_repeater.children[middle_repeater_index].$.middle_repeater_item.addRemoveClass("unseen_item", true);
                }
            }
        }
    },
    processCommentSeenError: function(inSender, inResponse) {
        
    },
    left_repeater_item_tapped: function(inSender, inEvent) {
        
        //for load more testing
        this.$.middle_scroller.applyStyle("bottom", "40px");
        this.$.middle_item_load_more.setShowing(true);
        this.$.middle_item_load_more.setMin_post_id([0,0,0,0,0,0]);
        
        //reset all 
        for (var i = 0; i < inSender.children.length; i++) {
            inSender.children[i].$.left_repeater_item.addRemoveClass("onyx-selected", false);
            //inSender.renderRow(i);
        };
        //select only one
        inSender.children[inEvent.index].$.left_repeater_item.addRemoveClass("onyx-selected", true);
        inSender.children[inEvent.index].$.left_repeater_item.setSelection(true);
        //render the repeater row
        //inSender.renderRow(inEvent.index);
        
        //set the dep_id to middle panel
        this.$.middle.setDepartment_idx(inEvent.index);
        
        this.$.middle_title.setContent(this.getDepartments()[inEvent.index].name);

        if (inEvent.index !== 0 && inEvent.index !== (this.getDepartments().length - 1)) {
            this.$.compose_btn.setShowing(true);
            this.$.middle_panel_info_item_title.setContent(this.getDepartments()[inEvent.index].name + " Info Blog");
            this.$.middle_panel_info.setShowing(true);
            
            this.$.middle_repeater.applyStyle("top", "100px");
            //if (this.$.middle_repeater.getComponents().length > 0) {
            this.$.middle_repeater.destroyComponents();
            this.$.middle_repeater.itemComponents[0].components[0].kind = "post_item";
            //}
            //load more spinner for posts
            this.$.load_more_txt.setShowing(false);
            this.$.load_more_gif.setShowing(true);
            //get request for the posts
            var ajax = new enyo.Ajax({
                url: "resources/"+this.getDepartments()[inEvent.index].name.replace(/\s/g, '').toLowerCase()+"/posts",
                method: "GET",
                headers: {"x-access-token": this.getToken()}
            });

            // send parameters the remote service using the 'go()' method
            ajax.go();
            // attach responders to the transaction object
            ajax.response(this, "processPostsResponse");
            // handle error
            ajax.error(this, "processPostsError");
            
            var ajax_blog = new enyo.Ajax({
                url: "resources/"+this.getDepartments()[inEvent.index].name.replace(/\s/g, '').toLowerCase()+"/blogs",
                method: "GET",
                headers: {"x-access-token": this.getToken()}
            });
            
            ajax_blog.go();
            ajax_blog.response(this, "processBlogsResponse"); //do unseen or seen here
            ajax_blog.error(this, "processBlogsError");
            
        } else if (inEvent.index === (this.getDepartments().length - 1)) {
            this.$.compose_btn.setShowing(false);
            this.$.middle_panel_info.setShowing(false);
            this.$.middle_repeater.applyStyle("top", "0px");
            //if (this.$.middle_repeater.getComponents().length > 0) {
            this.$.middle_repeater.destroyComponents();
            this.$.middle_repeater.itemComponents[0].components[0].kind = "personell_item";
            //}
            this.$.middle_scroller.applyStyle("bottom", "0px");
            this.$.middle_item_load_more.setShowing(false);
            
            //get request for the personell items
            var ajax = new enyo.Ajax({
                url: "resources/personell",
                method: "GET",
                headers: {"x-access-token": this.getToken()}
            });

            // send parameters the remote service using the 'go()' method
            ajax.go();
            // attach responders to the transaction object
            ajax.response(this, "processPersonellResponse");
            // handle error
            ajax.error(this, "processPersonellError");
        } else if (inEvent.index === 0) {
            if(this.fetchUserRole(this.getCurrentUser()) === "admin")
                this.$.compose_btn.setShowing(true); //only if manager
            else
                this.$.compose_btn.setShowing(false);
            
            this.$.info_compose_btn.setShowing(false);
            this.$.middle_panel_info.setShowing(false);
            this.$.middle_repeater.applyStyle("top", "0px");
            //if (this.$.middle_repeater.getComponents().length > 0) {
            this.$.middle_repeater.destroyComponents();
            this.$.middle_repeater.itemComponents[0].components[0].kind = "post_item";
            //}
            //load more spinner for posts
            this.$.middle_item_load_more.setShowing(true);
            this.$.load_more_txt.setShowing(false);
            this.$.load_more_gif.setShowing(true);
            //get request for the posts
            var ajax = new enyo.Ajax({
                url: "resources/"+this.getDepartments()[inEvent.index].name.replace(/\s/g, '').toLowerCase()+"/posts",
                method: "GET",
                headers: {"x-access-token": this.getToken()}
            });

            // send parameters the remote service using the 'go()' method
            ajax.go();
            // attach responders to the transaction object
            ajax.response(this, "processPostsResponse");
            // handle error
            ajax.error(this, "processPostsError");
        }
        //slide to next view
        if (enyo.Panels.isScreenNarrow()) {
            this.$.view_panels.next();
        }
        this.$.info_compose_btn.setShowing(false);
        //emptying the body content
        this.$.body_title.setContent("");
        
        var count = this.$.body_content.children.length;
        for(var i = 0; i < count; i++) {
             this.$.body_content.children[i].destroy();
        }
        return true;
    },
    processPostsResponse: function(inSender, inResponse) {
        this.$.middle_repeater.setPosts(inResponse);
        
        this.$.middle_repeater.count = inResponse.length;
        this.$.middle_repeater.build();
        
        if(this.$.middle_item_load_more.getScrollToBottom()) {
            this.$.middle_scroller.scrollToBottom();
            this.$.middle_item_load_more.setScrollToBottom(false);
        }
        
        if(this.$.middle_panel_info.getSelection()[this.$.middle.getDepartment_idx()]) {
            this.$.middle_panel_info.addRemoveClass("onyx-selected", true);
        } else {
            this.$.middle_panel_info.addRemoveClass("onyx-selected", false);
        }
        var min_post_id = [0,0,0,0,0,0];
        if(inResponse.length > 0){
            min_post_id[this.$.middle.getDepartment_idx()] = inResponse[inResponse.length-1].post_id;
            this.$.middle_item_load_more.setMin_post_id(min_post_id);


            var ajax = new enyo.Ajax({
                url: "resources/" + (this.$.middle.getDepartment_idx() + 1) + "/remaining_posts",
                method: "GET",
                headers: {"x-access-token": this.getToken()}
            });

            // send parameters the remote service using the 'go()' method
            ajax.go({min_post_id: inResponse[inResponse.length-1].post_id});
            // attach responders to the transaction object
            ajax.response(this, "processRemainingPostsResponse");
            // handle error
            ajax.error(this, "processRemainingPostsError");
        } else {
            this.$.middle_item_load_more.setShowing(false);
        }
        
        
        var comments;
        if (this.push_data_comments) {
            if (this.$.body.getPost_id() === this.push_data_comments.post_id && this.$.body.getDep_id() === this.push_data_comments.dep_id && this.$.body_content.children.length > 0) {
                
                for (var i = 0; i < this.$.middle_repeater.getPosts().length; i++) {
                    if (this.push_data_comments.post_id === this.$.middle_repeater.getPosts()[i].post_id) {
                        comments = this.$.middle_repeater.getPosts()[i].post.comments;
                    }
                }

                //get request for the posts
                var ajax = new enyo.Ajax({
                    url: "resources/"+this.$.body.getDep_id()+"/posts/"+this.$.body.getPost_id()+"/seen",
                    method: "POST",
                    headers: {"x-access-token": this.getToken()}
                });

                // send parameters the remote service using the 'go()' method
                ajax.go();
                // attach responders to the transaction object
                ajax.response(this, "processSeenResponse");
                // handle error
                ajax.error(this, "processSeenError");
                    
                this.$.body_content.children[0].$.body_Comment_Repeater.setComments(comments);
                this.$.body_content.children[0].$.body_Comment_Repeater.count = comments.length;
                this.$.body_content.children[0].$.body_Comment_Repeater.build();
                
            } else {
                //this.$.left_repeater.renderRow(parseInt(this.$.body.getDep_id())-1);
            }
        } else if(this.push_data_comments_deleted) {
            if (this.$.body.getPost_id() === this.push_data_comments_deleted.post_id && this.$.body.getDep_id() === this.push_data_comments_deleted.dep_id && this.$.body_content.children.length > 0) {
                for (var i = 0; i < this.$.middle_repeater.getPosts().length; i++) {
                    if (this.push_data_comments_deleted.post_id === this.$.middle_repeater.getPosts()[i].post_id) {
                        comments = this.$.middle_repeater.getPosts()[i].post.comments;
                    }
                }
                
                this.$.body_content.children[0].$.body_Comment_Repeater.setComments(comments);
                this.$.body_content.children[0].$.body_Comment_Repeater.count = comments.length;
                this.$.body_content.children[0].$.body_Comment_Repeater.build();
            }
        } else {
            var count = this.$.body_content.children.length;
            for(var i = 0; i < count; i++) {
                 this.$.body_content.children[i].destroy();
            }
            this.$.body_title.setContent("");
        }
        
        this.push_data_comments = null;
        this.push_data_comments_deleted = null;
    },
    processPostsError: function(inSender, inResponse) {
        console.error("Error: processPostsError; "+inSender.xhrResponse.body);
    },
    processBlogsResponse: function(inSender, inResponse) {
        var blogs = inResponse.blogs;
        this.$.middle_panel_info.setBlogs(blogs);
        var unseen = 0;
        for (var i = 0; i < blogs.length; i++) {
            if(blogs[i].blog.seen_by.indexOf(this.getCurrentUser()) < 0) {
                unseen ++;
            }
        }
        if(unseen > 0) {
            this.$.blog_noti.children[0].setContent(unseen);
            this.$.blog_noti.children[0].setShowing(true); //content noti
            this.$.blog_noti.children[1].setShowing(true); // dot noti 
            this.$.blog_noti.children[2].setShowing(false); // tick noti
            this.$.middle_panel_info.addRemoveClass("unseen_item", true);
        } else {
            this.$.blog_noti.children[0].setShowing(false); //content noti
            this.$.blog_noti.children[1].setShowing(false); //dot noti
            this.$.blog_noti.children[2].setShowing(true); //tick noti
            this.$.middle_panel_info.addRemoveClass("unseen_item", false); 
        }
        if(this.getBlogDeleted()) {
            for (var i = 0; i < this.$.body_content.children.length; i++) {
                this.$.body_content.children[i].destroy();
            }

            this.$.body_content.createComponent({kind: "info_blogs"});
            this.$.body_content.render();

            this.$.body_title.setContent(this.getDepartments()[this.$.middle.getDepartment_idx()].name + " Info Blog");

            this.$.info_compose_btn.setShowing(true);
            if (this.fetchUserRole(this.getCurrentUser()) === "admin") {
                this.$.info_compose_btn.setShowing(true);
            } else {
                this.$.info_compose_btn.setShowing(false);
            }

            this.$.body_content.children[0].$.info_blog_repeater.setCount(this.$.middle_panel_info.getBlogs().length);
            
            this.getBlogDeleted(false);
        }
        /*
        if (this.$.body_content.children.length > 0 && this.$.body.getDep_id() === inResponse.dep_id) {
            if ((this.$.body_title.getContent()).toLowerCase().search("blog") >= 0) {
                for (var i = 0; i < this.$.body_content.children.length; i++) {
                    this.$.body_content.children[i].destroy();
                }

                this.$.body_content.createComponent({kind: "info_blogs"});
                this.$.body_content.render();

                this.$.body_title.setContent(this.getDepartments()[this.$.middle.getDepartment_idx()].name + " Info Blog");

                this.$.info_compose_btn.setShowing(true);
                if (this.fetchUserRole(this.getCurrentUser()) === "admin") {
                    this.$.info_compose_btn.setShowing(true);
                } else {
                    this.$.info_compose_btn.setShowing(false);
                }
                
                this.$.body_content.children[0].$.info_blog_repeater.setCount(this.$.middle_panel_info.getBlogs().length);
            }
        }*/
    },
    processBlogsError: function(inSender, inResponse) {
        console.error("Error: processBlogsError; "+inSender.xhrResponse.body);
    },
    processPersonellResponse: function(inSender, inResponse) {
        this.$.middle_repeater.setPersonell_items(inResponse);
        
        this.$.middle_repeater.count = inResponse.length
        this.$.middle_repeater.build();
    },
    processPersonellError: function(inSender, inResponse) {
        console.error("Error: processPersonellError; "+inSender.xhrResponse.body);
    },
    processRemainingPostsResponse: function(inSender, inResponse) {
        if(inResponse.remaining_posts > 0){
            this.$.middle_item_load_more.setShowing(true);
            this.$.load_more_txt.setShowing(true);
            this.$.load_more_gif.setShowing(false);
            this.$.middle_scroller.applyStyle("bottom", "40px");
        } else {
            this.$.middle_item_load_more.setShowing(false);
            this.$.middle_scroller.applyStyle("bottom", "0px");
        }
    },
    processRemainingPostsError: function(inSender, inResponse) {
        console.error("Error: processRemainingPostsError; "+inSender.xhrResponse.body);
    },
    middle_repeater_item_tapped: function(inSender, inEvent) {
        
        //reset all 
        this.$.middle_panel_info.addRemoveClass("onyx-selected", false);
        
        //hide blog compose btn
        this.$.info_compose_btn.setShowing(false);
        
//        var selection = this.$.middle_panel_info.getSelection();
//        selection[this.$.middle.getDepartment_id()] = false;
        var selection = [null, null, null, null, null, null, null];
        this.$.middle_panel_info.setSelection(selection);
        
        for (var i = 0; i < inSender.children.length; i++) {
            inSender.children[i].$.middle_repeater_item.addRemoveClass("onyx-selected", false);
        };
        
        //var selected = inSender.getSelected();
        var selected = [null, null, null, null, null, null, null];
        if(this.$.middle.getDepartment_idx() === this.getDepartments().length - 1){
            selected[this.$.middle.getDepartment_idx()] = this.$.middle_repeater.getPersonell_items()[inEvent.index].title;
        }else {
            selected[this.$.middle.getDepartment_idx()] = this.$.middle_repeater.getPosts()[inEvent.index].post_id;
        }
        
        inSender.setSelected(selected);
        inSender.children[inEvent.index].$.middle_repeater_item.addRemoveClass("onyx-selected", true);
        //render the repeater row
        var count = this.$.body_content.children.length;
        for(var i = 0; i < count; i++) {
             this.$.body_content.children[i].destroy();
        }
        if (this.$.middle.getDepartment_idx() === this.getDepartments().length - 1) {
            if (inEvent.index === 0) {//this is staff
                this.$.body_content.createComponent({kind: "staffs_expanded"});
                
                this.$.body_content.children[0].$.staff_repeater.count = this.getUsers().length;
                this.$.body_content.children[0].$.staff_repeater.build();

            } else if (inEvent.index === 1) { //this is shift
                this.$.body_content.createComponent({kind: "shifts_expanded"});
                
            }
            this.$.body.setPersonell_idx(inEvent.index);
            this.$.body_title.setContent(inSender.getPersonell_items()[inEvent.index].title);
        } else {
            this.$.body_content.createComponent({kind: "post_expanded"});
            this.$.body.setPost_id(this.$.middle_repeater.getPosts()[inEvent.index].post_id);
            this.$.body.setPostOwner(this.$.middle_repeater.getPosts()[inEvent.index].post.owner);
            this.$.body_title.setContent(this.fetchUsername(this.$.middle_repeater.getPosts()[inEvent.index].post.owner) + "'s post");
            
            //this.$.body.setDep_id(this.$.middle.getDepartment_idx()+1);
            //this.$.body.setDep_id(this.$.middle_repeater.getPosts()[inEvent.index].dep_id); // ortake department_idx and add one 
            if(parseInt(this.$.middle.getDepartment_idx()+1) === parseInt(this.$.middle_repeater.getPosts()[inEvent.index].dep_id)) {
                this.$.body.setDep_id(parseInt(this.$.middle.getDepartment_idx()+1));
            } else {
                throw new Error('Fatal App Error! Note: Check Dep_id! In middle_repeater_item_tapped');
            }
            this.$.body.setPost_id(this.$.middle_repeater.getPosts()[inEvent.index].post_id);
            //also set post id to body
            
            if(inSender.children[inEvent.index].$.post_item.$.post_dot_notification.getShowing()){
                //get request for the posts
                var ajax = new enyo.Ajax({
                    url: "resources/"+this.$.body.getDep_id()+"/posts/"+this.$.body.getPost_id()+"/seen",
                    method: "POST",
                    headers: {"x-access-token": this.getToken()}
                });

                // send parameters the remote service using the 'go()' method
                ajax.go();
                // attach responders to the transaction object
                ajax.response(this, "processSeenResponse");
                // handle error
                ajax.error(this, "processSeenError");
            }

            inSender.children[inEvent.index].$.post_item.$.post_dot_notification.setShowing(false);
            inSender.children[inEvent.index].$.post_item.$.post_tick_notification.setShowing(true);
            inSender.children[inEvent.index].$.middle_repeater_item.addRemoveClass("unseen_item", false);

            var body_post_owner = this.$.body_content.children[0].$.body_Header.$.body_Post_Owner;
            var owner_avatar = this.fetchUserAvatar(inSender.getPosts()[inEvent.index].post.owner);
            if(owner_avatar) {
                body_post_owner.children[0].setSrc("assets/"+owner_avatar);
            }else {
                body_post_owner.children[0].setSrc("assets/user.png");
            }
            body_post_owner.children[1].setContent(this.fetchUsername(inSender.getPosts()[inEvent.index].post.owner));
            body_post_owner.children[2].setContent(this.fetchUserPosition(inSender.getPosts()[inEvent.index].post.owner));
            
            if(inSender.getPosts()[inEvent.index].post.owner === this.getCurrentUser()) {
                this.$.body_content.children[0].$.body_Header.$.body_Post_Remover.setShowing(true);
            } else {
                this.$.body_content.children[0].$.body_Header.$.body_Post_Remover.setShowing(false);
            }
            
            var day = this.dayInLetters(parseInt(inSender.getPosts()[inEvent.index].post.date_stamp.day));
            var month = this.monthInLetters(parseInt(inSender.getPosts()[inEvent.index].post.date_stamp.month));
            var year = parseInt(inSender.getPosts()[inEvent.index].post.date_stamp.year);
            var date = parseInt(inSender.getPosts()[inEvent.index].post.date_stamp.date);

            var year_today = new Date().getFullYear();
            var month_today = new Date().getMonth();
            var date_today = new Date().getDate();
            
            if (year === year_today && month === this.monthInLetters(month_today) && date === date_today) {
                body_post_owner.children[3].setContent("Today at " + inSender.getPosts()[i].post.date_stamp.time);
            } else {
                body_post_owner.children[3].setContent(day + " " + month + " " + date + " " + year + " at " + inSender.getPosts()[i].post.date_stamp.time);
            }
            
            if(this.fetchUserRole(inSender.getPosts()[inEvent.index].post.owner) === "admin") {
                body_post_owner.children[1].applyStyle("color","#4D944D");
                body_post_owner.children[2].applyStyle("color","#4D944D");
            }
            
            this.$.body_content.children[0].$.body_post_content.setContent(inSender.getPosts()[inEvent.index].post.post_content);
            
            this.$.body_content.children[0].$.body_seen_by.setContent("seen by "+inSender.getPosts()[inEvent.index].post.seen_by.length+" people");
            this.$.body_content.children[0].$.body_seen_by.setUsers(inSender.getPosts()[inEvent.index].post.seen_by);
            var current_user_avatar = this.fetchUserAvatar(this.getCurrentUser());
            if(current_user_avatar) {
                this.$.body_content.children[0].$.theUser_Avatar.setSrc("assets/"+current_user_avatar);
            }else {
                this.$.body_content.children[0].$.theUser_Avatar.setSrc("assets/user.png");
            }
            
            this.$.body_content.children[0].$.body_Comment_Repeater.setComments(inSender.getPosts()[inEvent.index].post.comments);
            this.$.body_content.children[0].$.body_Comment_Repeater.setCount(inSender.getPosts()[inEvent.index].post.comments.length);
               
        }
        //slide to next view
        if (enyo.Panels.isScreenNarrow()) {
            this.$.view_panels.next();
        }
        this.$.body_content.render();
       
        this.$.info_compose_btn.setShowing(false);
        
        
        
        return true;
    },
    processSeenResponse: function(inSender, inResponse) {/*
        var total_noti = this.$.left_repeater.children[inResponse.dep_id - 1].$.notification_info.getTotal_notification();
        total_noti --;
        this.$.left_repeater.children[inResponse.dep_id - 1].$.notification_info.setTotal_notification(total_noti);
        if(total_noti < 1) {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_notification.setContent("new ("+total_noti+")");
            this.$.left_repeater.children[inResponse.dep_id - 1].$.notification_info.setShowing(false);
        } else {
            this.$.left_repeater.children[inResponse.dep_id - 1].$.total_notification.setContent("new ("+total_noti+")");
        }   */
        this.setupItemLeftPanelNoti(this.$.body.getDep_id());
    },
    processSeenError: function(inSender, inResponse) {
        console.error("Error: processSeenError; "+inSender.xhrResponse.body);
    },
    middle_panel_info_tapped: function(inSender, inEvent) {
        for(var i = 0; i < this.$.middle_repeater.children.length; i++) {
            this.$.middle_repeater.children[i].$.middle_repeater_item.addRemoveClass("onyx-selected", false);
            //this.$.middle_repeater.renderRow(i);
        }
        //var selected = this.$.middle_repeater.getSelected();
        //selected[this.$.middle.getDepartment_id()] = null;
        var selected = [null, null, null, null, null, null, null];
        this.$.middle_repeater.setSelected(selected);
        
        inSender.addRemoveClass("unseen_item", false);
        inSender.addRemoveClass("onyx-selected", true);
        
        //var selection = inSender.getSelection();
        var selection = [null, null, null, null, null, null, null];
        selection[this.$.middle.getDepartment_idx()] = true;
        inSender.setSelection(selection);
        
        var count = this.$.body_content.children.length;
        for(var i = 0; i < count; i++) {
             this.$.body_content.children[i].destroy();
        }
            
        this.$.body_content.createComponent({kind: "info_blogs"});
        this.$.body_content.render();
        
        this.$.body_title.setContent(this.getDepartments()[this.$.middle.getDepartment_idx()].name+" Info Blog");
        
        this.$.info_compose_btn.setShowing(true);
        if(this.fetchUserRole(this.getCurrentUser()) === "admin") {
            this.$.info_compose_btn.setShowing(true);
        } else {
            this.$.info_compose_btn.setShowing(false);
        }
        
        //set dep_id and blog_id of blog to body
        //this.$.body.setDep_id(this.$.middle_repeater.getPosts()[inEvent.index].dep_id);
        //this.$.body.setBlog_id(this.$.middle_repeater.getPosts()[inEvent.index].blog_id);
        this.$.body.setDep_id(this.$.middle.getDepartment_idx()+1);
        
        this.$.body_content.children[0].$.info_blog_repeater.setCount(this.$.middle_panel_info.getBlogs().length);
        
        //slide to next view
        if (enyo.Panels.isScreenNarrow()) {
            this.$.view_panels.next();
        }
        return true;
    },
    load_more_post_item: function(inSender, inEvent) {
        inSender.setScrollToBottom(true);
        var ajax = new enyo.Ajax({
            url: "resources/"+this.getDepartments()[this.$.middle.getDepartment_idx()].name.replace(/\s/g, '').toLowerCase()+"/posts/",
            method: "GET",
            headers: {"x-access-token": this.getToken()}
        });
        //"resources/"+this.getDepartments()[this.$.middle.getDepartment_idx()].name.replace(/\s/g, '').toLowerCase()+"/posts/"
        // send parameters the remote service using the 'go()' method
        ajax.go({limit: parseInt(this.$.middle_item_load_more.getLimit())+5});
        
        this.$.load_more_gif.setShowing(true);
        this.$.load_more_txt.setShowing(false);
        
        this.$.middle_item_load_more.setLimit(parseInt(this.$.middle_item_load_more.getLimit())+5);
        // attach responders to the transaction object
        ajax.response(this, "processPostsResponse");
        // handle error
        ajax.error(this, "processPostsError");
    },
    displayComposeView: function(inSender, inEvent) {
        var count = this.$.body_content.children.length;
        for(var i = 0; i < count; i++) {
             this.$.body_content.children[i].destroy();
        }
//        if(this.$.middle.getDepartment_id() !== 0 && this.$.middle.getDepartment_id() !== (this.getDepartments().length-1)){
            this.$.body_content.createComponent({kind: "compose_post"});
            this.$.body.render();
            this.$.body.setDep_id();
            this.$.body_title.setContent("Write in "+this.getDepartments()[this.$.middle.getDepartment_idx()].name+" department");
//        } else if (this.$.middle.getDepartment_id() === 0) {
//            this.$.body.createComponent({kind: "compose_info"});
//            this.$.body.render();
//            this.$.body_title.setContent("Compose Info Blog in "+this.getDepartments()[this.$.middle.getDepartment_id()].name+" department");
//        }
            var current_user_avatar = this.fetchUserAvatar(this.getCurrentUser());
            var current_user_name = this.fetchUsername(this.getCurrentUser());
            if(current_user_avatar) {
                this.$.body_content.children[0].$.compose_owner_avatar.setSrc("assets/"+current_user_avatar);
            } else {
                this.$.body_content.children[0].$.compose_owner_avatar.setSrc("assets/user.png");
            }
            this.$.body_content.children[0].$.compose_owner_name.setContent(current_user_name);
        //slide to next view
        if (enyo.Panels.isScreenNarrow()) {
            this.$.view_panels.next();
        }
        return true;
    },
    displayInfoComposeView: function(inSender, inEvent) {
        var count = this.$.body_content.children.length;
        for(var i = 0; i < count; i++) {
            this.$.body_content.children[i].destroy();
        }
        
        this.$.body_content.createComponent({kind: "compose_info"});
        this.$.body.render(this.$.middle.getDepartment_idx());
        this.$.body_title.setContent("Compose Blog in "+this.getDepartments()[this.$.middle.getDepartment_idx()].name+" department");
    },
    dayInLetters: function(inValue) {
        var days = [
            "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"
        ];
        return days[inValue];
    },
    monthInLetters: function(inValue) {
        var months = [
            "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];
        return months[inValue];
    },
    fetchUsername: function(userId) {
        var user_name;
        for (var x = 0; x < this.getUsers().length; x++) {
            if (userId === this.getUsers()[x].user_id) {
                user_name = this.getUsers()[x].first_name + " " + this.getUsers()[x].middle_name + " " + this.getUsers()[x].last_name;
                user_name = user_name.replace(/\s{2,}/g, ' ');
            }
        };
        return user_name;
    },
    fetchUserPosition: function(userId) {
        var pos;
        for (var x = 0; x < this.getUsers().length; x++) {
            if (userId === this.getUsers()[x].user_id) {
                pos = this.getUsers()[x].position;
            }
        };
        return pos;
    },
    fetchUserRole: function(userId) {
        var role;
        for (var x = 0; x < this.getUsers().length; x++) {
            if (userId === this.getUsers()[x].user_id) {
                role = this.getUsers()[x].role;
            }
        };
        return role;
    },
    fetchUserAvatar: function(userId) {
        var avatar;
        for (var x = 0; x < this.getUsers().length; x++) {
            if (userId === this.getUsers()[x].user_id) {
                avatar = this.getUsers()[x].avatar;
            }
        };
        return avatar;
    },
    back_btn_tapped: function(inSender, inEvent){
        if (enyo.Panels.isScreenNarrow()) {
            this.$.view_panels.previous();
        }
    },
    setupSeenBy: function(inSender, inEvent) {
        var i = inEvent.index;
        var item = inEvent.item;
        
        if(this.fetchUserAvatar(this.$.body_seen_popup.getUsers()[i])){
            item.$.seen_by_repeater_item.$.seen_by_item_image.setSrc("assets/"+this.fetchUserAvatar(this.$.body_seen_popup.getUsers()[i]));
        } else {
            item.$.seen_by_repeater_item.$.seen_by_item_image.setSrc("assets/user.png");
        }
        
        item.$.seen_by_repeater_item.$.seen_by_item_name.setContent(this.fetchUsername(this.$.body_seen_popup.getUsers()[i]));
        item.$.seen_by_repeater_item.$.seen_by_item_position.setContent(this.fetchUserPosition(this.$.body_seen_popup.getUsers()[i]));
        
        if(this.fetchUserRole(this.$.body_seen_popup.getUsers()[i]) === "admin") {
            item.$.seen_by_repeater_item.addRemoveClass("seen-by-item-admin", true);
        } else {
            item.$.seen_by_repeater_item.addRemoveClass("seen-by-item-admin", false);
        }
    },
    removePost: function(inSender) {
        //alert(this.$.postRemover.getDep_id() + " "+this.$.postRemover.getPost_id());
        this.$.postRemover.hide();
        this.$.successPopup.show();
        
        var ajax = new enyo.Ajax({
            url: "resources/"+this.$.postRemover.getDep_id()+"/posts/"+this.$.postRemover.getPost_id(),
            method: "DELETE",
            headers: {"x-access-token": this.getToken()}
        });

        // send parameters the remote service using the 'go()' method
        ajax.go();
        // attach responders to the transaction object
        ajax.response(this, "processDeleteResponse");
        // handle error
        ajax.error(this, "processDeleteError");
    },
    removeComment: function(inSender) {
        //alert(this.$.commentRemover.getDep_id() + " "+ this.$.commentRemover.getPost_id() + " " + this.$.commentRemover.getComment_id());
        this.$.commentRemover.hide();
        this.$.successPopup.show();
        
        var ajax = new enyo.Ajax({
            url: "resources/"+this.$.commentRemover.getDep_id()+"/posts/"+this.$.commentRemover.getPost_id()+"/comments/"+this.$.commentRemover.getComment_id(),
            method: "DELETE",
            headers: {"x-access-token": this.getToken()}
        });

        // send parameters the remote service using the 'go()' method
        ajax.go();
        // attach responders to the transaction object
        ajax.response(this, "processDeleteResponse");
        // handle error
        ajax.error(this, "processDeleteError");
    },
    closePopup: function(inSender) {
        this.$[inSender.popup].hide();
        return true;
    },
    processDeleteResponse: function(inSender, inResponse) {
        this.$.successPopup.children[0].setShowing(false);
        this.$.successPopup.children[1].children[0].setContent(inResponse.msg);
        this.$.successPopup.children[1].setShowing(true);
        
        if(inResponse.blog_id && parseInt(inResponse.blog_id) > 0) {
            var dep_idx = parseInt(inResponse.dep_id) - 1;
            this.setBlogDeleted(true);
            if(this.$.middle.getDepartment_idx() === dep_idx) {
                var ajax_blog = new enyo.Ajax({
                    url: "resources/"+this.getDepartments()[dep_idx].name.replace(/\s/g, '').toLowerCase()+"/blogs",
                    method: "GET",
                    headers: {"x-access-token": this.getToken()}
                });

                ajax_blog.go();
                ajax_blog.response(this, "processBlogsResponse"); //do unseen or seen here
                ajax_blog.error(this, "processBlogsError");
            }
        }
        //this.$.successPopup.setAutoDismiss(true);
        
    },
    processDeleteError: function(inSender, inResponse) {
        this.$.successPopup.children[0].setShowing(false);
        this.$.successPopup.children[1].children[0].setContent(inSender.xhrResponse.body);
        this.$.successPopup.children[1].setShowing(true);
        //this.$.successPopup.setAutoDismiss(true);
    },
    removeBlog: function(inSender, inEvent) {
        this.$.blogRemover.hide();
        this.$.successPopup.show();
        
        var ajax = new enyo.Ajax({
            url: "resources/"+this.$.blogRemover.getDep_id()+"/blogs/"+this.$.blogRemover.getBlog_id(),
            method: "DELETE",
            headers: {"x-access-token": this.getToken()}
        });

        // send parameters the remote service using the 'go()' method
        ajax.go();
        // attach responders to the transaction object
        ajax.response(this, "processDeleteResponse");
        // handle error
        ajax.error(this, "processDeleteError");
    }
});


//enyo post item
enyo.kind({
    name: "post_item", ontap: "middle_repeater_item_tapped",
    components: [
        {name: "middle_post_owner", style: "position: relative; height: 30px",
            components: [
                {name: "post_owner_avatar", kind: "Image", style: "width: 30px; height: 30px"},
                {name: "post_owner_name", content: "Prataksha Gurung",
                    classes: "middle-panel-repeater-item-post-owner-name"},
                {name: "post_date", content: "Today at 1230",
                    classes: "middle-panel-repeater-item-post-owner-date"}
            ]
        },
        {name: "post_content", components: [
                {name: "post_content_text", classes: "middle-panel-repeater-item-post-content"}
            ]
        },
        {name: "post_seen_comments", kind: "FittableColumns",
            style: "line-height: 10px", components: [
                {content: "Seen by 10",
                    style: "font-size: 0.7em; color: rgba(0,0,0,0.8)"},
                {content: "Comment/s ( 5 )",
                    style: "font-size: 0.7em; color: rgba(0,0,0,0.8); position: absolute; right: 5px;"}
            ]
        },
        {name: "post_dot_notification", classes: "post-dot-notification",
            content: "●", showing: false},
        {name: "post_tick_notification", classes: "post-tick-notification",
            content: "✓", showing: true}
    ]
});


//enyo kind for personell item
enyo.kind({
    name: "personell_item", ontap: "middle_repeater_item_tapped",
    components: [
        {name: "personell_item_image", kind: "Image",
            style: "width: 80px; height: 80px; vertical-align: middle", src: "assets/departments/info.png"},
        {name: "personell_item_title", classes: "left-repeater-item-title", content: "Info Blog"},
        {name: "post_dot_notification", classes: "post-dot-notification",
            content: "●", showing: true},
        {name: "post_tick_notification", classes: "post-tick-notification",
            content: "✓", showing: false}
    ]
});

//seen by repeater item
enyo.kind({
    name: "seen_by_item", classes: "seen-by-item",
    components: [
        {name: "seen_by_item_image", kind: "Image", style: "width: 100px; height: 100px; vertical-align: middle; float: left"},
        {name: "seen_by_item_info", components: [
            {name: "seen_by_item_name", tag: "p", classes: "seen-by-item-name", content: ""},
            {name: "seen_by_item_position", tag: "p", classes: "seen-by-item-position", content: ""}
        ]}
    ]
});

