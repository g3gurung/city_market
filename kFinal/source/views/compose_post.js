enyo.kind({
    name: "compose_post",
    classes: "compose-post",
    components: [
        {name: "compose_post_scroller",
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
                {name: "compose_post_textarea", kind: "onyx.InputDecorator", classes: "compose-post-textarea",
                    alwaysLooksFocused: true, components: [
                        {name:"compose_textarea_control", kind: "onyx.TextArea", style: "width: 100%",
                            placeholder: "Type Here!",
                            oninput: "composePostInputChanged"
                        }
                    ]
                },
                {name: "compose_post_btn_wrapper", classes: "compose-post-btn-wrapper",
                    components: [
                        {name: "compose_post_btn", kind: "onyx.Button", content: "POST",
                            disabled: true,
                            classes: "onyx-blue compose-post-btn",
                            ontap: "submitPost"
                        }
                    ]
                }
            ]
        }
    ],
    composePostInputChanged: function(inSender, inEvent) {
        if(inSender.getValue() !== "" && inSender.getValue() !== null && inSender.getValue() !== undefined) {
            this.$.compose_post_btn.setDisabled(false);
        } else {
            this.$.compose_post_btn.setDisabled(true);
        }
        return true;
    },
    submitPost: function(inSender, inEvent) {
        var department = this.owner.owner.getDepartments()[this.owner.owner.$.middle.getDepartment_idx()].name;
        var param = this.$.compose_textarea_control.getValue();
        if (param){
            var ajax = new enyo.Ajax({
                url: "resources/"+department.replace(/\s/g, '').toLowerCase()+"/posts",
                method: "POST",
                postBody: {post_content: param},
                headers: {"x-access-token": this.owner.owner.getToken()}
            });
            // send parameters the remote service using the 'go()' method
            ajax.go();
            // attach responders to the transaction object
            ajax.response(this, "composePostsResponse");
            // handle error
            ajax.error(this, "composePostsError");
            
            this.owner.owner.$.successPopup.children[0].setShowing(true);
            this.owner.owner.$.successPopup.children[1].setShowing(false);
            this.owner.owner.$.successPopup.show();
        }
    },
    composePostsResponse: function (inSender, inResponse) {
        this.owner.owner.$.successPopup.children[0].setShowing(false);
        this.owner.owner.$.successPopup.children[1].children[0].setContent(inResponse);
        this.owner.owner.$.successPopup.children[1].setShowing(true);
        //slide to next view
        if (enyo.Panels.isScreenNarrow()) {
            this.owner.owner.$.view_panels.previous();
        };
    },
    composePostsError: function (inSender, inResponse) {
        
    }
});


