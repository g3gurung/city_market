enyo.kind({
   name: "staffs_expanded",
   components: [
       {name: "staff_repeater", kind: "Repeater", classes: "enyo-fit",
            touch: true, count: 0,
            onSetupItem: "setupItemStaffItems",
            components: [
                {kind: "staff_repeater_item", classes: "panels-sample-sliding-item", fit: true}
            ]
        }
    ],
    setupItemStaffItems: function(inSender, inEvent) {
        var item = inEvent.item.$.staff_repeater_item;
        var i = inEvent.index;
        
        item.$.personell_name.setContent(this.owner.owner.getUsers()[i].first_name+" "+this.owner.owner.getUsers()[i].middle_name+" "+this.owner.owner.getUsers()[i].last_name);
        item.$.personell_position.setContent(this.owner.owner.getUsers()[i].position);
        if(this.owner.owner.getUsers()[i].role === "admin") {
            item.$.personell_position.applyStyle("color", "#4D944D");
        }
        item.$.personell_phone.setContent(this.owner.owner.getUsers()[i].contact.phone);
        item.$.personell_email.setContent(this.owner.owner.getUsers()[i].contact.email);
        var user_avatar = this.owner.owner.fetchUserAvatar(this.owner.owner.getUsers()[i].user_id);
        if(user_avatar) {
            item.$.personell_avatar.setSrc("assets/"+user_avatar);
        } else {
            item.$.personell_avatar.setSrc("assets/user.png");
        }
    }
});

//enyo kind for user repeater item
enyo.kind({
   name: "staff_repeater_item", style: "position: relative",
   components: [
       {kind: "Image", name: "personell_avatar", style: "height: 80px; width: 80px; vertical-align: top"},
       {style: "position: relative; display: inline-block; margin-left: 10px; width: 70%", components: [
               {name: "personell_name", style: "font-size: 20px; color: #3b5998; font-weight: bold"},
               {name: "personell_position", style: "font-size: 1em; font-weight: bold; color: grey"},
               {name: "personell_phone", style: "font-size: 0.8em; color: grey"},
               {name: "personell_email", style: "font-size: 0.8em; color: grey"}
       ]}
   ]
});


