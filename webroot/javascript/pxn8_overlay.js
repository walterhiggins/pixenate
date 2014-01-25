/**
 * (c) Copyright Sxoop Technologies Ltd. 2005 - 2009
 * For handling overlay image movement and resizing
 */

var PXN8 = PXN8 || {};
/***************************************************************************

SECTION: Overlay Helper Functions
=================================
Pixenate provides 2 functions to simplify UI programming for overlaying photos.
PXN8.overlay.start() puts the editor in *overlay* mode. In this mode, every time
the user makes or changes a selected area of the image, an overlay image will
be placed on top of the selected area. The overlay image will be resized to fit the selected
area. This function provides a handy way for users to *preview* what the the overlay will
look like when it is applied.
PXN8.overlay.stop() makes the editor exit *overlay* mode.

***/
PXN8.overlay = {};
/**************************************************************************

PXN8.overlay.start()
====================
PXN8.overlay.start() puts the editor into *overlay* mode. In this mode, an overlay image
appears superimposed on top of the photo whenever the selection is changed. This function
is provided as a convenience function to let users preview  the effects of the
<a href="#pxn8_tools_overlay">PXN8.tools.overlay()</a> function before applying it.
Please note that PXN8.overlay.start() does not change the photo. You still need to call PXN8.tools.overlay()
to *apply* the overlay.

Parameters
----------
* overlayURL : A url to the image to use as an overlay. This URL will be used to construct a new image so it should be an Image URL.
* dimensions : An object with *top*, *left*, *width* and *height* properties used to position the overlay image. The dimensions are relative to the top left corner of the <a href="#pxn8_canvas">pxn8_canvas</a> div.

Examples
--------
Please see the <a href="example-speech-bubbles.html">Speech bubbles</a> Example.

Related
-------
PXN8.overlay.stop()

***/
PXN8.overlay.start = function(overlayURL,dimensions)
{
    PXN8.overlay.stop();

    if (dimensions == undefined){
        dimensions = PXN8.getSelection();
    }


    var rects = ["top","bottom","left","right","topright","topleft","bottomleft","bottomright"];

    for (var i = 0;i < rects.length; i++){
        PXN8.dom.opacity("pxn8_" + rects[i] + "_rect",0);
    }

    var img = document.getElementById("pxn8_image");
    var iw = img.width / PXN8.zoom.value();
    var ih = img.height / PXN8.zoom.value();

    if (dimensions.top == undefined && dimensions.left == undefined){
        dimensions.top = (ih/2) - (dimensions.height / 2);
        dimensions.left = (iw/2) - (dimensions.width / 2);
    }

    PXN8.select(dimensions);

    /**
     * create the overlay div if it's not already present
     */
    var canvas = PXN8.dom.id("pxn8_canvas");
    var overlayEl = PXN8.dom.id("pxn8_overlay");

    // work with PNGs in IE
    if (overlayURL.indexOf(".png") > -1 && PXN8.browser.isIE6())
    {
        canvas.removeChild(overlayEl);
        overlayEl = null;
    }

    if (overlayEl == null)
    {
        overlayEl = PXN8.dom.ce("img", {id: "pxn8_overlay"});
        overlayEl.style.position = "absolute";
        canvas.appendChild(overlayEl);

    }

	 if (overlayURL.indexOf(".png") > -1 && PXN8.browser.isIE6())
	 {
        overlayEl.onload = function(){PXN8.overlay.fixPNG(overlayEl);};
	 }
    overlayEl.src = overlayURL;

    PXN8.overlay.show();

    PXN8.listener.add(PXN8.ON_SELECTION_CHANGE,PXN8.overlay.show);
	 //
	 // wph 20080831 : Change overlay position when the image is zoomed too.
	 //
	 PXN8.listener.add(PXN8.ON_ZOOM_CHANGE, PXN8.overlay.show);

    PXN8.crosshairs.setEnabled(false);

};





/**************************************************************************

PXN8.overlay.stop()
===================
Makes the editor exit *overlay* mode. You should call this function when the user applies or cancels
an overlay operation.

Examples
--------
Please see the <a href="example-speech-bubbles.html">Speech bubbles</a> Example.

Related
-------
PXN8.overlay.start()

***/
PXN8.overlay.stop = function()
{

    var rects = ["top","bottom","left","right","topright","topleft","bottomleft","bottomright"];

    for (var i = 0;i < rects.length; i++){
        PXN8.dom.opacity("pxn8_" + rects[i]+ "_rect",PXN8.style.notSelected.opacity);
    }
    PXN8.listener.remove(PXN8.ON_SELECTION_CHANGE,PXN8.overlay.show);

	 PXN8.listener.remove(PXN8.ON_ZOOM_CHANGE, PXN8.overlay.show);

    var overlay = document.getElementById("pxn8_overlay");
    /* it's possible the overlay element doesn't exist yet - if called from PXN8.overlay.start */
    if (overlay){
        overlay.style.display = "none";
    }
    PXN8.selectByRatio("free");

    PXN8.crosshairs.setEnabled(true);
    /*
     * don't unselect
    PXN8.unselect();
     */

};

PXN8.overlay.show = function (){

    var overlay = document.getElementById("pxn8_overlay");

    var sel = PXN8.getSelection();
    var zoom = PXN8.zoom.value();

    overlay.style.display = "block";

    overlay.style.top = (sel.top * zoom) + "px";
    overlay.style.left = (sel.left * zoom) + "px";

    overlay.width = sel.width * zoom;
    overlay.height = sel.height * zoom;
    //
    // if the image is no longer an <IMG/> tag but a <SPAN/> tag
    // (a PNG fixed for IE6) then set the style width and height attributes
    //
    overlay.style.width = sel.width * zoom + "px";
    overlay.style.height = sel.height * zoom + "px";

};
/**
 * Fix it so that PNGs display correctly in IE 6
 */
PXN8.overlay.fixPNG = function(img)
{
    if (!PXN8.browser.isIE6()){
        return;
    }
    if (img.src.indexOf(".png") == -1){
        return;
    }

    var imgID = (img.id) ? "id='" + img.id + "' " : "";

    var imgClass = (img.className) ? "class='" + img.className + "' " : "";

    var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' ";

    var imgStyle = "display:inline-block;" + img.style.cssText ;

    if (img.align == "left") imgStyle = "float:left;" + imgStyle;

    if (img.align == "right") imgStyle = "float:right;" + imgStyle;

    if (img.parentElement.href) imgStyle = "cursor:hand;" + imgStyle;

    var strNewHTML = "<span " + imgID + imgClass + imgTitle + " style=\"" + "width:" + img.width + "px; height:" + img.height + "px;" + imgStyle + ";";

    strNewHTML = strNewHTML + "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader";

    strNewHTML = strNewHTML + "(src=\'" + img.src + "\', sizingMethod='scale');\"></span>" ;
    img.outerHTML = strNewHTML;

};
