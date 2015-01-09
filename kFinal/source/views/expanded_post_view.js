

//enyo kind for body content
enyo.kind({
    name: "post_expanded",
    classes: "post-expanded",
    components: [
        {kind: "Scroller", horizontal: "hidden", 
            touch: true, components: [
                {kind: "body_Header"},
                {name: "body_post_content", content: "Sir Alex Ferguson will be asked to take a prominent role in deciding Manchester United's next manager despite an acknowledgement within the club that he was responsible for choosing the wrong man last time.",
                    classes: "body-post-content"
                },
                {name: "body_seen", style:"position: relative; height: 20px", components: [
                        {name: "body_seen_by", classes: "body-seen",
                            content: "seen by 0 people", ontap: "showPopup",
                            popup: "body_seen_popup", published: {users: null}
                        }
                    ]
                },
                {name: "body_Comment_Box", kind: "FittableColumns",
                    style: "position: relative; margin-top: 10px", components: [
                        {name: "theUser_Avatar", kind: "Image", src: "assets/maleUser.png",
                            style: "width: 60px; height: 60px; margin: 4px; vertical-align: top"},
                        {name: "theUser_comment", kind: "comment_textarea",
                            fit: true
                        }
                    ]
                },/*
                {name: "comment_submit_btn_wrapper",
                    classes: "body-comment-btn-wrapper", components: [
                        {name: "comment_submit_btn", kind: "onyx.Button", content: "SEND",
                            disabled: true,
                            classes: "onyx-blue body-comment-btn",
                            ontap: "submitComment"
                        }
                    ]
                },*/
                {name: "body_Comment_Repeater", published: {comments: [], post_id: null},
                    style: "margin-top: 10px", kind: "Repeater",
                    onSetupItem: "setupItemComments", count: 0,
                    components: [
                        {kind: "comment_item", published: {comment_id: null}}
                    ]
                }
            ]
        }
    ],
    showPopup: function(inSender) {
        var p = this.owner.owner.$[inSender.popup];
        if (p) {
            p.setUsers(inSender.getUsers());
            this.owner.owner.$.seen_by_repeater.setCount(inSender.getUsers().length);
            p.show();
        }
    },
    setupItemComments: function(inSender, inEvent) {
       var main_app = inSender.owner.owner.owner;
       var comment_owner_avatar = main_app.fetchUserAvatar(inSender.getComments()[inEvent.index].comment.owner);
       if(comment_owner_avatar) {
           inEvent.item.$.comment_item.$.comment_owner_avatar.setSrc("assets/"+comment_owner_avatar);
       } else {
           inEvent.item.$.comment_item.$.comment_owner_avatar.setSrc("assets/user.png");
       }
       
       inEvent.item.$.comment_item.$.comment_owner_name.setContent(main_app.fetchUsername(inSender.getComments()[inEvent.index].comment.owner));
       if(main_app.fetchUserRole(inSender.getComments()[inEvent.index].comment.owner) === "admin") {
           inEvent.item.$.comment_item.$.comment_owner_name.applyStyle("color", "#4D944D");
       }
       
       if(main_app.getCurrentUser() === inSender.getComments()[inEvent.index].comment.owner) {
           inEvent.item.$.comment_item.$.body_Comment_Remover.setShowing(true);
       } else if (main_app.getCurrentUser() === main_app.$.body.getPostOwner()) {
           inEvent.item.$.comment_item.$.body_Comment_Remover.setShowing(true);
       } else {
           inEvent.item.$.comment_item.$.body_Comment_Remover.setShowing(false);
       }
       
       inEvent.item.$.comment_item.$.comment_content.setContent(inSender.getComments()[inEvent.index].comment.comment_content);
       inEvent.item.$.comment_item.$.body_Comment_Remover.setComment_id(inSender.getComments()[inEvent.index].comment_id);
    }
});

//body header
enyo.kind({
    name: "body_Header",
    comments: [],
    postOwner: "",
    components: [
        {name: "body_Post_Owner", style: "position: relative; height: 80px",
            components: [
                {name: "body_Post_Owner_Avatar", kind: "Image",
                    classes: "body-post-owner-avatar"},
                {name: "body_Post_Owner_Name", content: "",
                    classes: "body-post-owner-name"},
                {name: "body_Post_Owner_position", content: "",
                    classes: "body-post-owner-position"},
                {name: "body_Post_Date", content: "",
                    classes: "body-post-date"}
            ]
        },
        {name: "body_Post_Remover", kind: "onyx.IconButton",
            style: "position: absolute; top: 0; right: 5px",
            src: "lib/onyx/images/progress-button-cancel.png",
            ontap: "showPostRemoverPopup", popup: "postRemover"
        }
    ],
    showPostRemoverPopup: function(inSender) {
        var p = this.owner.owner.owner.$[inSender.popup];
        p.setPost_id(this.owner.owner.owner.$.body.getPost_id());
        p.setDep_id(this.owner.owner.owner.$.body.getDep_id());
        if (p) {
            p.show();
        }
        return true;
    }
});

//comment textarea
enyo.kind({
    name: "comment_textarea", kind: "onyx.InputDecorator",
    alwaysLooksFocused: true,
    components: [
        {name:"comment_textarea_control", kind: "onyx.TextArea", style: "width: 100%",
            placeholder: "Comment here...",
            oninput: "inputChanged"
        },
        {name: "comment_submit_btn_wrapper",
            classes: "body-comment-btn-wrapper", components: [
                {name: "comment_submit_btn", kind: "onyx.Button", content: "SEND",
                    showing: false,
                    classes: "onyx-blue body-comment-btn",
                    ontap: "submitComment"
                }
            ]
        }
    ],
    inputChanged: function(inSender, inEvent) {
        if(inSender.getValue() !== "" && inSender.getValue() !== null && inSender.getValue() !== undefined) {
            this.$.comment_submit_btn.setShowing(true);
        } else {
            this.$.comment_submit_btn.setShowing(false);
        }
        return true;
    },
    submitComment: function(inSender, inEvent) {
        var param = this.$.comment_textarea_control.getValue();
        
        if (param) {
            //this.owner.$.theUser_comment.$.comment_textarea_control.setValue("Department id: "+(parseInt(this.owner.owner.owner.$.body.getDep_id())) + ", post id: " + this.owner.owner.owner.$.body.getPost_id());
            this.owner.$.theUser_comment.$.comment_textarea_control.setValue("");
            var ajax = new enyo.Ajax({
                url: "resources/"+(parseInt(this.owner.owner.owner.$.body.getDep_id()))+"/posts/"+(parseInt(this.owner.owner.owner.$.body.getPost_id())+"/comments"),
                method: "POST",
                postBody: {comment_content: param},
                headers: {"x-access-token": this.owner.owner.owner.getToken()}
            });
            // send parameters the remote service using the 'go()' method
            ajax.go();
            // attach responders to the transaction object
            ajax.response(this, "commentResponse");
            // handle error
            ajax.error(this, "commentError");
        }
        this.owner.owner.owner.$.successPopup.children[0].setShowing(true);
        this.owner.owner.owner.$.successPopup.children[1].setShowing(false);
        this.owner.owner.owner.$.successPopup.show();
        
    },
    commentResponse: function(inValue, inResponse) {
        this.owner.owner.owner.$.successPopup.children[0].setShowing(false);
        this.owner.owner.owner.$.successPopup.children[1].children[0].setContent(inResponse);
        this.owner.owner.owner.$.successPopup.children[1].setShowing(true);
    },
    commentError: function(inValue, inResponse) {
        
    }
});

//comment repeater item
enyo.kind({
    name: "comment_item",
    fit: true,
    style: "position: relative; margin: 10px; background-color: #D5DDEB; border-radius: 5px; margin-bottom: 0; margin-top: 2px;",
    components: [
        {kind: "FittableColumns", style: "padding: 10px", components: [
                {name: "comment_owner_avatar", kind: "Image", src: "assets/maleUser.png",
                    style: "width: 50px; height: 50px;"},
                {style: "margin-left: 5px; margin-right: 10px", fit: true, components: [
                        {name: "comment_owner_name", tag: "span", content: "User",
                            classes: "body-comment-repeater-item-user-name"},
                        {name: "comment_content", tag: "span", content: "This is the content part of comment",
                            classes: "body-comment-repeater-item-user-comment"}
                    ]}

            ]
        },
        {name: "body_Comment_Remover", kind: "onyx.IconButton",
            classes: "body-comment-remover",
            src: "lib/onyx/images/progress-button-cancel.png",
            showing: true, published: {comment_id: null},
            ontap: "showCommentRemoverPopup", popup: "commentRemover"
        }
    ],
    showCommentRemoverPopup: function(inSender) {
        //inSender.owner.owner.owner.owner.owner.owner.$.body.getPost_id()
        //inSender.getComment_id()
        var p = this.owner.owner.owner.owner.owner.$[inSender.popup];
        p.setPost_id(this.owner.owner.owner.owner.owner.$.body.getPost_id());
        p.setDep_id(this.owner.owner.owner.owner.owner.$.body.getDep_id());
        p.setComment_id(inSender.getComment_id());
        if (p) {
            p.show();
        }
        return true;
    },
    closePopup: function(inSender, inEvent) {
        this.$.commentRemover.hide();
        return true;
    }
});

