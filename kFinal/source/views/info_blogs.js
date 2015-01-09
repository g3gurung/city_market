enyo.kind({
    name: "info_blogs",
    components: [
                {name: "info_blog_repeater", classes: "info-blog-repeater",
                    kind: "Repeater", item: "info_blog_item",
                    onSetupItem: "setupInfoBlogs",
                    components: [
                        {name: "info_blog_item", classes: "info-blog-item",
                            ontap: "info_blog_item_tapped", published: {
                                selection: false, unseen: true , 
                                blog_id: null, dep_id: null
                            },
                            components: [
                                {name: "info_blog_btns", showing: false, classes:"info_blog_btns", 
                                    components: [
                                        {name: "info_blog_minimize_btn", tag: "span", content: "-", 
                                            ontap: "minimizeBtnTapped"},
                                        {name: "info_blog_delete_btn", tag: "span", content: "x",
                                            ontap: "deleteBlog", showing: false}
                                    ]
                                },
                                {name: "info_blog_title", classes: "info-blog-title"},
                                {name: "info_blog_date", classes: "info-blog-date"},
                                {name: "info_blog_container", classes: "info-blog-container", components: [
                                        {name: "info_blog_img", kind: "ImageView", style:"height: 100%; width: 100%",
                                            scale: "auto"},
                                        {name: "info_blog_content", style: "position: relative", allowHtml: true}
                                    ]
                                }
                            ]
                        }
                    ]
                }
    ],
    setupInfoBlogs: function(inSender, inEvent) {
        var index = inEvent.index;
        var item = inEvent.item;
        var main_app = inSender.owner.owner.owner;
        var blogs = main_app.$.middle_panel_info.getBlogs();
        
        item.$.info_blog_title.setContent(blogs[index].blog.blog_title);
        item.$.info_blog_content.setContent(blogs[index].blog.blog_content);
        item.$.info_blog_img.setSrc("files/"+blogs[index].blog.image_src);
        
        var day = main_app.dayInLetters(parseInt(blogs[index].blog.date_stamp.day));
        var month = main_app.monthInLetters(parseInt(blogs[index].blog.date_stamp.month));
        var year = parseInt(blogs[index].blog.date_stamp.year);
        var date = parseInt(blogs[index].blog.date_stamp.date);

        var year_today = new Date().getFullYear();
        var month_today = new Date().getMonth();
        var date_today = new Date().getDate();
        
        if (year === year_today && month === month_today && date === date_today) {
            item.$.info_blog_date.setContent("Today");
        } else {
            item.$.info_blog_date.setContent(day + " " + month + " " + date + " " + year );
        }
        
        if(item.$.info_blog_item.getUnseen()){
            if(blogs[index].blog.seen_by.indexOf(main_app.getCurrentUser()) < 0) {
                item.$.info_blog_item.addRemoveClass("blog_item_unseen", true);
                item.$.info_blog_item.setUnseen(true);
            } else {
                item.$.info_blog_item.addRemoveClass("blog_item_unseen", false);
                item.$.info_blog_item.setUnseen(false);
            }
        } else {
            item.$.info_blog_item.addRemoveClass("blog_item_unseen", false);
            item.$.info_blog_item.setUnseen(false);
        }
        
        if (item.$[inSender.item].getSelection() === true) {
            item.$[inSender.item].addRemoveClass("info-blog-item-selected", true);
            item.$.info_blog_container.addRemoveClass("info-blog-container-expanded", true);
            item.$.info_blog_title.applyStyle("font-size", "2em");
            item.$.info_blog_date.applyStyle("font-size", "1em");
            item.$.info_blog_content.applyStyle("font-size", "1.5em");
            item.$.info_blog_img.applyStyle("margin", "auto");
            item.$.info_blog_img.applyStyle("height", "400px");
            item.$.info_blog_img.applyStyle("width", "90%");
            item.$.info_blog_content.applyStyle("margin-top", "10px");
            item.$.info_blog_btns.setShowing(true);
            item.$.info_blog_minimize_btn.applyStyle("font-size", "2em");
            
            if(main_app.fetchUserRole(main_app.getCurrentUser()) === "admin") {
                item.$.info_blog_delete_btn.setShowing(true);
            } else {
                item.$.info_blog_delete_btn.setShowing(false);
            }
            
            item.$[inSender.item].setBlog_id(blogs[index].blog_id);
            item.$[inSender.item].setDep_id(blogs[index].dep_id);
            
        } else {
            item.$[inSender.item].addRemoveClass("info-blog-item-selected", false);
            item.$.info_blog_container.addRemoveClass("info-blog-container-expanded", false);
            item.$.info_blog_title.applyStyle("font-size", "1em");
            item.$.info_blog_date.applyStyle("font-size", "0.7em");
            item.$.info_blog_content.applyStyle("font-size", "0.8em");
            item.$.info_blog_img.applyStyle("margin", "auto");
            item.$.info_blog_img.applyStyle("height", "100px");
            item.$.info_blog_img.applyStyle("width", "100px");
            item.$.info_blog_content.applyStyle("margin-top", "0px");
            item.$.info_blog_btns.setShowing(false);
            item.$.info_blog_delete_btn.setShowing(false);
            item.$.info_blog_minimize_btn.applyStyle("font-size", "1em");
        }
        setTimeout(function(){item.render();}, 1000);
    },
    info_blog_item_tapped: function(inSender, inEvent) {
        var main_app = inSender.owner.owner.owner;
        for (var i = 0; i < inSender.children.length; i++) {
            inSender.children[i].$[inSender.item].setSelection(false);
            inSender.renderRow(i);
        };

        inSender.children[inEvent.index].$[inSender.item].setSelection(true);
        
        
        if(inSender.children[inEvent.index].$[inSender.item].getUnseen()) {
            inSender.children[inEvent.index].$[inSender.item].setUnseen(false);
            var ajax_seen = new enyo.Ajax({
                url: "resources/"+main_app.$.body.getDep_id()+"/blogs/"+main_app.$.middle_panel_info.getBlogs()[inEvent.index].blog_id+"/seen",
                method: "POST",
                headers: {"x-access-token": main_app.getToken()}
            });
            
            ajax_seen.go();
            ajax_seen.response(this, "processBlogSeenResponse"); //do unseen or seen here
            ajax_seen.error(this, "processBlogSeenError");
        }
        inSender.renderRow(inEvent.index);
        return true;
    },
    processBlogSeenResponse: function(inSender, inResponse) {
        var main_app =this.owner.owner;
        main_app.$.left_repeater.renderRow(main_app.$.middle.getDepartment_idx());
        if(inResponse === "ok") {
            var ajax_blog = new enyo.Ajax({
                url: "resources/"+main_app.getDepartments()[main_app.$.middle.getDepartment_idx()].name.replace(/\s/g, '').toLowerCase()+"/blogs",
                method: "GET",
                headers: {"x-access-token": main_app.getToken()}
            });
            
            ajax_blog.go();
            ajax_blog.response(this, "processBResponse"); //do unseen or seen here
            ajax_blog.error(this, "processBError");
        }
    },
    processBlogSeenError: function(inSender, inResponse) {
        console.log("Error: processBlogSeenError in info_blogs; "+inResponse);
    },
    processBResponse: function(inSender, inResponse) {
        var main_app =this.owner.owner;
        main_app.$.middle_panel_info.setBlogs(inResponse.blogs);
        var unseen = 0;
        for (var i = 0; i < inResponse.length; i++) {
            if(inResponse[i].blog.seen_by.indexOf(main_app.getCurrentUser()) < 0) {
                unseen ++;
            }
        }
        if(unseen > 0) {
            main_app.$.blog_noti.children[0].setContent("new ( "+unseen+" )");
            main_app.$.blog_noti.children[1].setShowing(true); // noti flag
            main_app.$.middle_panel_info.addRemoveClass("unseen_item", true);
        } else {
            main_app.$.blog_noti.children[0].setShowing(false); //dot noti
            main_app.$.blog_noti.children[1].setShowing(false); //tick noti
            main_app.$.middle_panel_info.addRemoveClass("unseen_item", false); 
        }
    },
    processBError: function(inSender, inResponse) {
        
    },
    deleteBlog: function(inSender, inEvent) {
        var main = this.owner.owner;
        main.$.blogRemover.setBlog_id(inSender.children[inEvent.index].$.info_blog_item.getBlog_id());
        main.$.blogRemover.setDep_id(inSender.children[inEvent.index].$.info_blog_item.getDep_id());
        main.$.blogRemover.show();
        return true;
    },
    minimizeBtnTapped: function(inSender, inEvent) {
        var i = inEvent.index;
        inSender.children[i].$[inSender.item].setSelection(false);
        inSender.renderRow(i);
        return true;
    }
});