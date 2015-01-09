enyo.kind({
   name: "shifts_expanded", style: "height: 100%; text-align: center; padding: 20px",
   components: [
        {kind: "enyo.Anchor", name: "anchorImage", href: "assets/shifts/test_file.pdf", attr: {target: "_blank"}, 
            title: "EnyoJS Framework Website", 
            components: [
                {kind: "enyo.Image", name: "anchorImageItem", src: "assets/pdf.png", 
                    alt: "PDF download", style: "vertical-align: middle"},
                {tag: "span", content: "download PDF!"}
            ]
        },
        {tag: "br"},
        {tag: "iframe", src: "http://docs.google.com/viewer?url=http://g3prataksha.ipt.oamk.fi/cyberlightning/test_file.pdf&embedded=true",
           style: "width: 90%; height: 100%; border: none"}      
   ]
});

