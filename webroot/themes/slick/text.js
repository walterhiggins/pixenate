/**
 * Preview the text as it will appear when the AddText operation is performed.
 */
function previewText()
{
    var dom = PXN8.dom;
    var color= showConfigText.color;
    var fontEl = dom.id("font");
    var font = fontEl.options[fontEl.selectedIndex].value;
    var size = parseInt(dom.id("pointsize").value);
    var gravEl = dom.id("gravity");
    var gravity = gravEl.options[gravEl.selectedIndex].value;
    var text = dom.id("text").value;

    var imgBounds = dom.eb(dom.id("pxn8_image"));

	 var zoom = PXN8.zoom.value();

    var preview = dom.ce("div",{id: "pxn8_text_preview"});
    preview.style.position = "absolute";
    preview.style.width = imgBounds.width + "px";
    preview.style.left = imgBounds.x + "px";
    preview.style.color = color;
    preview.style.fontSize = (size * zoom) + "px";
    preview.style.textAlign = "center";
    preview.style.top = imgBounds.y + ((imgBounds.height/2) - (size*zoom)/2) + "px";

    dom.ac(preview,dom.tx(text));
    dom.ac(document.body,preview);

    if (gravity.match("South")){
        preview.style.top = imgBounds.y  + (imgBounds.height - ((size * zoom) + 5)) + "px";
    }
    if (gravity.match("North")){
        preview.style.top = imgBounds.y + "px";
    }
    if (gravity.match("West")){
        preview.style.textAlign = "left";
    }
    if (gravity.match("East")){
        preview.style.textAlign = "right";
    }
    setTimeout(function(){
        document.body.removeChild(preview);
    },3000);
}

/**
 * Show the Text Configuration Tool Panel
 */
function showConfigText()
{
    var dom = PXN8.dom;
	 var defaultColor = "#FFFFFF";
	 showConfigText.color = defaultColor;

    var applyBtn = dom.id("pxn8_apply");
    applyBtn.style.display = "inline";

    var configTitle = dom.cl(dom.id("pxn8_config_title"));
    configTitle.appendChild(dom.tx("Add Text to image"));

    var cfgContent = dom.cl(dom.id("pxn8_config_content"));

	 // wph 20070220 : The pxn8_tool_prompt div must be cleared or
	 // the last tool prompt will appear there.
	 //
	 dom.cl("pxn8_tool_prompt");

    var picker = PXN8.colors.picker(defaultColor,function(v){
		  showConfigText.color = v;
    });

    dom.ac(cfgContent,picker);

    var ih = dom.id("configure_text").innerHTML;
    ih = ih.replace(/&lt;/g,"<");
    ih = ih.replace(/&gt;/g,">");
    /**
     * wph 20060821: Can't just append to cfgContent.innerHTML
     * because doing so wipes out the onclick handler for the color picker.
     * Strangely, creating a div, setting it's innerHTML and appending the div
     * using DOM works.
     */
    var div = dom.ce("div");
    div.innerHTML = ih;
    dom.ac(cfgContent,div);

    applyBtn.onclick = function(){
        var fontEl = dom.id("font");
        var font = fontEl.options[fontEl.selectedIndex].value;
        var size = dom.id("pointsize").value;
        var gravEl = dom.id("gravity");
        var gravity = gravEl.options[gravEl.selectedIndex].value;
        var text = dom.id("text").value;
        PXN8.tools.add_text({
            "gravity": gravity,
            "fill": showConfigText.color,
            "font": font,
            "pointsize": size,
            "text": text});
        return false;
    };

    var text = document.getElementById("text");

    text.focus();
    text.select();

	 var font = document.getElementById("font");
    var _ = PXN8.dom;
	 for (var i in PXN8.fonts){
        var option = _.ce("option",{value: i});

		  _.ac(option,_.ce("img",{src: PXN8.server + PXN8.root + "/" + PXN8.fonts[i]}));
		  _.ac(option,_.tx(i));
        _.ac(font,option);
    }
}
// ========================================================================
//
// SPEECH BUBBLES
//
// ========================================================================

    //
    // where is the speech bubble coming from ?
    //
    var bubble_direction = "left";
	 var bubble_type = "speech";

    function change_bubble(t,d)
    {
        bubble_type = t;
        bubble_direction = d;
        var selection = PXN8.getSelection();
        //
        // enter 'overlay' mode
        // in this mode, every time the user selects an area of the photo,
        // the overlay image is super-imposed on top so the user knows  where the
        // overlay will appear once the overlay operation is applied.
        //
        var zoom = PXN8.zoom.value();

        PXN8.overlay.start(PXN8.server + PXN8.root + "/images/overlays/" + bubble_direction + "_" + bubble_type + "_bubble.gif",
                           {width:150 /zoom,height:100 / zoom, top:selection.top, left: selection.left });
    }

    function show_bubble_config()
    {
	     document.getElementById("all_tools").style.display="none";
        document.getElementById("bubble_config").style.display = "block";
        var selection = PXN8.getSelection();
        //
        // enter 'overlay' mode
        // in this mode, every time the user selects an area of the photo,
        // the overlay image is super-imposed on top so the user knows  where the
        // overlay will appear once the overlay operation is applied.
        //
        var zoom = PXN8.zoom.value();
        PXN8.overlay.start(PXN8.server + PXN8.root + "/images/overlays/" + bubble_direction + "_" + bubble_type + "_bubble.gif",
                           {width:150 / zoom,height:100 /zoom, top: selection.top, left: selection.left});
    }

    function hide_bubble_config()
    {
	     document.getElementById("all_tools").style.display="block";
        document.getElementById("bubble_config").style.display = "none";
        PXN8.overlay.stop();
        PXN8.unselect();

    }

    function add_bubble_to_photo()
    {
        //
        // construct an overlay operation object
        //
        var overlayOp = PXN8.getSelection();
        overlayOp.filepath = "images/overlays/" + bubble_direction + "_" + bubble_type + "_bubble.gif";
        overlayOp.tile = "false";
        overlayOp.operation = "overlay";

        //
        // construct a text operation object
        //
        var zoom = PXN8.zoom.value();
        var theImage = PXN8.dom.id("pxn8_image");

        var iw = theImage.width / zoom;
        var ih = theImage.height / zoom;

        var cix = iw / 2;
        var ciy = ih / 2;

        var sel = PXN8.getSelection();

        var csx = sel.left + (sel.width /2);
        var csy = sel.top + (sel.height /2 );

        var ox = csx - cix;
		  var oy = csy - ciy;

        var textOp = {};
        textOp.top = oy;
        textOp.left = ox;
        textOp.gravity = "Center";
        textOp.operation = "add_text";
        textOp.font = PXN8.fonts["ComicBook"]?"ComicBook":"Arial";

		  var pointSize = document.getElementById("bubble_text_size").value;
        textOp.pointsize = pointSize / zoom;

        textOp.text = document.getElementById("bubble_text").value;

        //
        // Overlay the speech bubble then add text on top
        //
        PXN8.tools.updateImage([overlayOp,textOp]);

        //
        // exit overlay mode after the image has changed
        //
        PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
                PXN8.overlay.stop();
                PXN8.unselect();
        });
    }

function _bubbles()
{
    show_bubble_config();
    return false;
}
