enyo.kind({
    name: "compose_info",
    classes: "compose-info",
    form_image_data: null,
    components: [
        {name: "compose_info_scroller",
            kind: "Scroller", horizontal: "hidden",
            touch: true,
            components: [
                {name: "compose_owner", style: "position: relative; height: 80px",
                    components: [
                        {name: "compose_owner_avatar", kind: "Image",
                            ontap: "viewUser", classes: "body-post-owner-avatar"},
                        {name: "compose_owner_name", content: "Prataksha Gurung",
                            classes: "body-post-owner-name"}
                    ]
                },
                {name: "info_blog_title", classes: "info-compose-blog-title", components: [
                        {kind: "onyx.InputDecorator", style: "width: 300px", alwaysLooksFocused: true, components: [
                        {name: "info_blog_title_content", kind: "onyx.Input", placeholder: "Blog Title Here!", 
                            style:"width: 100%", oninput:"inputChanged"}
                    ]}
                ]},
                {name: "image_uploader", style: "text-align: center; padding: 5px", components: [
                        {tag: "span", content: "Image: "},
                        {kind: "onyx.Input", type: "file", style: "font-size: 1em; line-height: 0px; width: 200px",
                            value: "Choose Image", onchange: "setupImage"
                        }
                ]},
                {name: "compose_info_rich_text",
                    classes: "compose-info-rich-text",
                    components: [
                        {kind: "onyx.Button", ontap: "buttonFormatTapped", action: "bold", activeState: false,
                            components: [
                                {tag: "strong", content: "b"}
                            ]
                        },
                        {kind: "onyx.Button", ontap: "buttonFormatTapped", action: "italic", activeState: false,
                            components: [
                                {tag: "em", content: "i"}
                            ]
                        },
                        {kind: "onyx.Button", ontap: "buttonFormatTapped", action: "underline", activeState: false,
                            components: [
                                {tag: "u", content: "u"}
                            ]
                        },
                        {kind: "onyx.Button", content: "Select All", ontap: "buttonSelectAllTapped"},
                        {kind: "onyx.Button", content: "Deselect All", ontap: "buttonDeselectAllTapped"},
                        {kind: "onyx.Button", content: "Top", ontap: "buttonTopTapped"},
                        {kind: "onyx.Button", content: "End", ontap: "buttonEndTapped"},
                        {kind: "enyo.RichText", value: "Type Here!",
                            oninput: "richTextChanging", clicked: false, ontap: "blog_content_tapped"
                        }
                    ]
                },
                {name: "compose_info_btn_wrapper", classes: "compose-info-btn-wrapper",
                    components: [
                        {name: "compose_info_btn", kind: "onyx.Button", content: "SUBMIT",
                            disabled: true,
                            classes: "onyx-blue compose-info-btn",
                            ontap: "submitBlog"
                        }
                    ]
                }
            ]
        }
    ],
    richTextChanging: function(inSender, inEvent) {
        if (inSender.node.innerHTML && this.$.info_blog_title_content.getValue() && this.form_image_data) {
            this.$.compose_info_btn.setDisabled(false);
        } else {
            this.$.compose_info_btn.setDisabled(true);
        }
        return true;
    },
    inputChanged: function(inSender, inEvent) {
        if (inSender.getValue() && this.$.richText.getValue() && this.form_image_data && this.$.richText.getValue() !== "Type Here!") {
            this.$.compose_info_btn.setDisabled(false);
        } else {
            this.$.compose_info_btn.setDisabled(true);
        }
    },
    buttonSelectAllTapped: function(inSender, inEvent) {
        this.$.richText.focus();
        this.$.richText.selectAll();
    },
    buttonDeselectAllTapped: function(inSender, inEvent) {
        this.$.richText.focus();
        this.$.richText.removeSelection();
    },
    buttonTopTapped: function(inSender, inEvent) {
        this.$.richText.focus();
        this.$.richText.moveCursorToStart();
    },
    buttonEndTapped: function(inSender, inEvent) {
        this.$.richText.focus();
        this.$.richText.moveCursorToEnd();
    },
    buttonFormatTapped: function(inSender, inEvent) {
        if(inSender.action === "bold" || inSender.action === "italic" || inSender.action === "underline") {
            if(inSender.activeState){
                inSender.addRemoveClass("active", !inSender.activeState);
                inSender.activeState = !inSender.activeState;
            }else {
                inSender.addRemoveClass("active", !inSender.activeState);
                inSender.activeState = !inSender.activeState;
            }
        }
        this.$.richText.focus();
        document.execCommand(inSender.action, false, this.$.richText.getSelection());
        this.$.richText.updateValue();
    },
    buttonValueTapped: function(inSender, inEvent) {
        this.$.results.setContent(this.$.richText.getValue());
    },
    setupImage: function(inSender) {
        this.form_image_data = inSender.getNodeProperty("files")[0];
        
        if (this.$.info_blog_title_content.getValue() && this.$.richText.getValue() && this.form_image_data && this.$.richText.getValue() !== "Type Here!") {
            this.$.compose_info_btn.setDisabled(false);
        } else {
            this.$.compose_info_btn.setDisabled(true);
        }
    },
    submitBlog: function(inSender, inEvent) {
        if (this.$.richText.getValue() && this.form_image_data && this.$.info_blog_title_content.getValue()) {
//            var param = {
//                title: this.$.info_blog_title_content.getValue(),
//                form_image_data: this.form_image_data,
//                blog_content: this.$.richText.getValue()
//            };
            var fd = new FormData();

            fd.append("form_image_data", this.form_image_data);
            fd.append("title", this.$.info_blog_title_content.getValue());
            fd.append("blog_content", this.$.richText.getValue());
            
            var ajax_blog = new enyo.Ajax({
                url: "resources/"+this.owner.owner.$.body.getDep_id()+"/blogs",
                method: "POST",
                postBody: fd,
                headers: {"x-access-token": this.owner.owner.getToken()}
            });
            
            ajax_blog.go();
            ajax_blog.response(this, "processBlogPostResponse"); //do unseen or seen here
            ajax_blog.error(this, "processBlogError");
            
            this.owner.owner.$.successPopup.children[0].setShowing(true);
            this.owner.owner.$.successPopup.children[1].setShowing(false);
            this.owner.owner.$.successPopup.show();
        } 
        return true;
    },
    processBlogPostResponse: function(inSender, inResponse) {
        this.owner.owner.$.successPopup.children[0].setShowing(false);
        this.owner.owner.$.successPopup.children[1].children[0].setContent(inResponse);
        this.owner.owner.$.successPopup.children[1].setShowing(true);
        
        var ajax_blog = new enyo.Ajax({
            url: "resources/"+this.owner.owner.getDepartments()[this.owner.owner.$.middle.getDepartment_idx()].name.replace(/\s/g, '').toLowerCase()+"/blogs",
            method: "GET",
            headers: {"x-access-token": this.owner.owner.getToken()}
        });

        ajax_blog.go();
        ajax_blog.response(this, "processBlogGetResponse"); //do unseen or seen here
        ajax_blog.error(this, "processBlogError");
        
    },
    processBlogError: function(inSender, inResponse) {
        
    },
    processBlogGetResponse: function(inSender, inResponse) {
        var blogs = inResponse.blogs;
        
        var main = this.owner.owner;
        
        main.$.middle_panel_info.setBlogs(blogs);
        
        var unseen = 0;
        
        for (var i = 0; i < blogs.length; i++) {
            if(blogs[i].blog.seen_by.indexOf(main.getCurrentUser()) < 0) {
                unseen ++;
            }
        }
        if(unseen > 0) {
            main.$.blog_noti.children[0].setContent(unseen);
            main.$.blog_noti.children[1].setShowing(true); // noti flag
            main.$.middle_panel_info.addRemoveClass("unseen_item", true);
        } else {
            main.$.blog_noti.children[0].setShowing(false); //dot noti
            main.$.blog_noti.children[1].setShowing(false); //tick noti
            main.$.middle_panel_info.addRemoveClass("unseen_item", false); 
        }
        
        var count = main.$.body_content.children.length;
        
        for (var i = 0; i < count; i++) {
            main.$.body_content.children[i].destroy();
        }

        main.$.body_content.createComponent({kind: "info_blogs"});
        main.$.body_content.render();

        main.$.body_title.setContent(main.getDepartments()[main.$.middle.getDepartment_idx()].name + " Info Blog");

        main.$.info_compose_btn.setShowing(true);
        if (main.fetchUserRole(main.getCurrentUser()) === "admin") {
            main.$.info_compose_btn.setShowing(true);
        } else {
            main.$.info_compose_btn.setShowing(false);
        }

        main.$.body_content.children[0].$.info_blog_repeater.count = main.$.middle_panel_info.getBlogs().length;
        main.$.body_content.children[0].$.info_blog_repeater.build();
    },
    blog_content_tapped: function(inSender, inEvent) {
        if(!inSender.clicked) {
            this.$.richText.focus();
            this.$.richText.selectAll();
            inSender.clicked = true;
        }
        return true;
    }
});


