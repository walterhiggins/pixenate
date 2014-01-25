/**
 * (c) 2006-2008 Sxoop Technologies Ltd.
 *
 * This javascript file defines all of the image operations used by
 * pxn8_tools_ui.js
 *
 */

var PXN8 = PXN8 || {};

/*****************************************************************************

SECTION: Photo-Editing functions
================================
As well as the core selection, zoom and initialization functions, the Pixenate&trade;
javascript API is composed of a series of photo-editing functions which perform various
modifications to the photo by calling equivalent CGI functions in the Pixenate software running on
the web server.

PXN8.tools
==========
This variable defines a namespace within which all of the Pixenate photo-editing
functions are defined.
***/

PXN8.tools = {};

/*****************************************************************************

PXN8.tools.history()
====================
Go back in time 'offset' number of operations. Clients should not call this function
directly. Use the *PXN8.tools.undo()* and *PXN8.tools.redo()* functions instead.

Parameters
----------
* offset : A number (positive or negative) indicating how many operations to move forwards or backwards
in the user session stack.

Examples
--------
    PXN8.tools.history(-1);
    // same as PXN8.tools.undo();

    PXN8.tools.history(+1)
    // same sas PXN8.tools.redo();

Related
-------
PXN8.tools.undo PXN8.tools.redo

***/
PXN8.tools.history = function (offset)
{
    if (offset == 0){
        return;
    }
    if (PXN8.isUpdating()){
        alert (PXN8.strings.IMAGE_UPDATING);
        return;
    }
    var theImage = PXN8.dom.id("pxn8_image");
    if (!theImage){
        alert("Please wait for the image to load");
        return;
    }


    if (!offset) offset = -1;
    if (PXN8.opNumber == 0 && offset < 0){
        PXN8.show.alert(PXN8.strings.NO_MORE_UNDO);
        return;
    }
    if (PXN8.opNumber == PXN8.maxOpNumber && offset > 0){
        PXN8.show.alert(PXN8.strings.NO_MORE_REDO);
        return;
    }

    if (offset < 0){

        var userOp = PXN8.getUserOperation(PXN8.opNumber);

        PXN8.show.alert("- " + userOp.operation, 500);
    }else{

        var userOp = PXN8.getUserOperation(PXN8.opNumber+1);

        PXN8.show.alert("+ " + userOp.operation,500);
    }

    var index =  PXN8.opNumber + offset;

    var currentImageData = PXN8.images[index];

    if (!currentImageData){
        //
        // wph 20070223:
        // this could have potentially happenend
        // if the user clicked 'undo' before the new image loaded
        //
        alert("Error! PXN8.images[" + index + "] is undefined");
        return false;
    }

    PXN8.opNumber = index;

    PXN8.image.location = currentImageData.location;
    PXN8.image.width = currentImageData.width;
    PXN8.image.height = currentImageData.height;

    // point image at the array element was bad !
    // changes to PXN8.image were also reflected in
    // the array element leading to a long bug-tracking session
    // REMEMBER this !!!
    //PXN8.image = PXN8.images[PXN8.opNumber];

    PXN8.listener.notify(PXN8.BEFORE_IMAGE_CHANGE,null);

    /**
     * wph 20070108 : don't unselect because some ON_IMAGE_CHANGE listeners
     * might want to automatically select the image whenever it's changed.
     * Better to unselect _before_ notifying listeners
     */
    PXN8.unselect();
    PXN8.replaceImage(PXN8.image.location);
    return false;
};

/**************************************************************************

PXN8.tools.undo
===============
Undo the last operation.

Related
-------
PXN8.tools.undoall PXN8.tools.redo PXN8.tools.redoall PXN8.tools.history

***/
PXN8.tools.undo = function()
{
    PXN8.tools.history(-1);
    return false;
};

/***************************************************************************

PXN8.tools.redo()
=================
Redo the last undone operation.

Related
-------
PXN8.tools.undo PXN8.tools.redoall PXN8.tools.history

***/
PXN8.tools.redo = function()
{
    PXN8.tools.history(+1);
    return false;
};
/***************************************************************************

PXN8.tools.undoall()
====================
Undo all changes that were made to the photo

Related
-------
PXN8.tools.undo PXN8.tools.redoall PXN8.tools.history PXN8.tools.redo

***/
PXN8.tools.undoall = function()
{
    PXN8.tools.history(0 - PXN8.opNumber);
    return false;
};

/**************************************************************************

PXN8.tools.redoall()
====================
Redo all changes made to the photo.

Related
-------
PXN8.tools.undo PXN8.tools.redoall PXN8.tools.history PXN8.tools.redo
***/
PXN8.tools.redoall = function()
{
    PXN8.tools.history(PXN8.maxOpNumber-PXN8.opNumber);
    return false;
};

/**************************************************************************

PXN8.tools.updateImage()
========================
This function takes an array of operations as a parameter and submits the
operations to the server to update the image. This function is called by all other PXN8.tools.*
functions (except PXN8.tools.undo(), PXN8.tools.redo(),  PXN8.tools.undoall(), PXN8.tools.redoall() ).


Parameters
----------
* operations : An array of 'operations' which will be performed on the image.

Example
-------
The following code will crop the photo and rotate it by 90&deg; ...

    PXN8.tools.updateImage([
                            {operation: "crop", top: 40, left: 40, width: 200, height: 200},
                            {operation: "rotate", angle: 90}
                           ]);

PXN8.tools.updateImage() can be used to combine multiple image-editing operations into a single
user operation (to the user it appears to be one operation even though the image goes through
two transformations, being first normalized and then enhanced).
When the user clicks *Undo*, both the *crop* and *rotate* operations will be undone.
PXN8.tools.updateImage() is really useful if you would like to create your own custom 'quick-fix'
operations which are combinations of existing operations.
Please see <a href="#OPERATIONS">API Operations</a> for a full list of operations

***/
PXN8.tools.updateImage = function(ops)
{
    var theImage = PXN8.dom.id("pxn8_image");
    if (!PXN8.ready){
        alert("Please wait for the image to load");
        return;
    }

    /**
     * wph 20060909 : Don't increment PXN8.opNumber unless the
     * last operation has completed.
     */
    if (PXN8.isUpdating()){
        alert (PXN8.strings.IMAGE_UPDATING);
        return;
    }

    PXN8.listener.notify(PXN8.BEFORE_IMAGE_CHANGE,ops);

    /**
     * increment PXN8.opNumber & add op to the history
     */
    PXN8.addOperations(ops);

};

/**************************************************************************

PXN8.tools.startTransaction()
====================
If you want to combine multiple image-editing operations into a single atomic user operation, you can do so
by bracketing the operations with PXN8.tools.startTransaction() and PXN8.tools.endTransaction().

Examples
--------

    PXN8.tools.startTransaction();

    PXN8.tools.snow();
    PXN8.tools.rotate({angle: 90});
    PXN8.tools.resize(40,40);

    // commit changes to the server
    PXN8.tools.endTransaction();


In the above example, the PXN8.tools.snow(), PXN8.tools.rotate() and PXN8.tools.resize() set of statements will be treated as a single user operation. If the user clicks 'Undo' all 3 operations will be undone. Please see <a href="example-transaction.html">Combining many operations in a single click.</a>

Related
-------
PXN8.tools.endTransaction()

***/

PXN8.tools.startTransaction = function()
{
    PXN8.tools.transactionCache = new Array();
    PXN8.tools.commit = PXN8.tools.updateImage;
    PXN8.tools.updateImage = PXN8.tools.cacheUpdates;
};

PXN8.tools.cacheUpdates = function(ops)
{
    for (var i =0; i < ops.length; i++){
        PXN8.tools.transactionCache.push(ops[i]);
    }

};
/**************************************************************************

PXN8.tools.endTransaction()
====================
If you want to combine multiple image-editing operations into a single atomic user operation, you can do so
by bracketing the operations with PXN8.tools.startTransaction() and PXN8.tools.endTransaction().
PXN8.tools.endTransaction() commits changes to the server.

Examples
--------

    PXN8.tools.startTransaction();

    PXN8.tools.snow();
    PXN8.tools.rotate({angle: 90});
    PXN8.tools.resize(40,40);

    // commit changes to the server
    PXN8.tools.endTransaction();


In the above example, the PXN8.tools.snow(), PXN8.tools.rotate() and PXN8.tools.resize() set of statements will be treated as a single user operation. If the user clicks 'Undo' all 3 operations will be undone.

Related
-------
PXN8.tools.startTransaction()

***/
PXN8.tools.endTransaction = function()
{
    PXN8.tools.updateImage = PXN8.tools.commit;
    PXN8.tools.updateImage(PXN8.tools.transactionCache);
};

/**************************************************************************

PXN8.tools.enhance()
====================
Apply a digital filter to enhance a noisy photo. This is useful for smoothing facial lines.

***/
PXN8.tools.enhance = function()
{
    PXN8.tools.updateImage([{operation: "enhance"}]);
};

/**************************************************************************

PXN8.tools.normalize()
======================
Transform photo to span the full range of color values. This results in a more
colorful, better balanced image.

***/
PXN8.tools.normalize = function()
{
    PXN8.tools.updateImage([{operation: "normalize"}]);
};

/**************************************************************************

PXN8.tools.instantFix()
=======================
instant_fix performs both 'enhance' and 'normalize'

Related
-------
PXN8.tools.enhance PXN8.tools.normalize

***/
PXN8.tools.instantFix = function()
{
    PXN8.tools.updateImage([ {operation: "normalize"},
                             {operation: "enhance"}
                           ]);
};

/**************************************************************************

PXN8.tools.spiritlevel()
========================
Fix the horizon on a photo: Uses two points (left and right) to ascertain
what the correct angle of the photo should be.
This function is a wrapper for PXN8.tools.rotate().

Parameters
----------
* x1 : the X coordinate of the first point
* y1 : The Y coordinate of the first point
* x2 : The X coordinate of the second point
* y2 : The Y coordinate of the second point

Related
-------
PXN8.tools.rotate

***/
PXN8.tools.spiritlevel = function(x1,y1,x2,y2)
{

    var opposite = y1 > y2 ? y1 - y2 : y2 - y1;
    var adjacent = x1 > x2 ? x1 - x2 : x2 - x1;
    var hypotenuse = Math.sqrt((opposite * opposite) + (adjacent * adjacent));
    var sineratio = opposite / hypotenuse;
    var RAD2DEG = 57.2957795;
    var rads = Math.atan2(sineratio,Math.sqrt(1 - (sineratio * sineratio)));
    var degrees = rads * RAD2DEG;
    if (y1 < y2){
        degrees = 360 - degrees;
    }
    PXN8.tools.rotate ({angle: degrees});
    return degrees;

};
/**
 * -- TODO: document PXN8.tools.spiritlevel_mode for API reference
 * wph 20070426 : A new mode which simplifies the UI interaction for using the spirit-level tool.
 */

PXN8.tools.spiritlevel_mode = {};
PXN8.tools.spiritlevel_mode.clicks = [];
PXN8.tools.spiritlevel_mode.callback = null;
PXN8.tools.spiritlevel_mode.start = function(callback)
{
    var _ = PXN8.dom;
    var img = _.id("pxn8_image");
    var iw = img.width / PXN8.zoom.value();
    var ih = img.height / PXN8.zoom.value();
    var sel = _.id("pxn8_select_rect");

    sel.style.cursor = "pointer";
    PXN8.crosshairs.setEnabled(false);
    PXN8.resize.enable(["n","s","e","w","ne","se","nw","sw"],false);

    PXN8.select({top:0,left:0,width: iw/2,height: ih});
    PXN8.event.addListener(sel,"click",this.onclick);

    this.callback = callback;
};

PXN8.tools.spiritlevel_mode.end = function()
{
    var _ = PXN8.dom;

    var pin1 = _.id('pxn8_flag_0');
    if (pin1){
        document.body.removeChild(pin1);
    }
    var pin2 = _.id('pxn8_flag_1');
    if (pin2){
        document.body.removeChild(pin2);
    }
    PXN8.unselect();
    var sel = _.id("pxn8_select_rect");
    sel.style.cursor = "move";
    PXN8.crosshairs.setEnabled(true);

    PXN8.resize.enable(["n","s","e","w","ne","se","nw","sw"],true);

    PXN8.event.removeListener(sel,"click",this.onclick);
    this.clicks = [];
};


PXN8.tools.spiritlevel_mode.onclick = function(event)
{
    var _ = PXN8.dom;
    var self = PXN8.tools.spiritlevel_mode;

    var img = _.id("pxn8_image");
    var iw = img.width / PXN8.zoom.value();
    var ih = img.height / PXN8.zoom.value();
    var sel = _.id("pxn8_select_rect");
    var pos = _.cursorPos(event);

    var flag = PXN8.dom.createFlag(pos.x,pos.y,"pxn8_flag_" + self.clicks.length);

    self.clicks.push(pos);

    PXN8.select({top:0,left:iw/2,width: iw/2,height: ih});

    if (self.clicks.length == 2){
        PXN8.event.removeListener(sel,"click",self.onclick);
        PXN8.tools.spiritlevel(self.clicks[0].x,self.clicks[0].y,self.clicks[1].x,self.clicks[1].y);

        var oldSize = PXN8.dom.eb("pxn8_image");

        PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
                self.end();
                var newSize = PXN8.dom.id("pxn8_image");
                var hdiff = newSize.height - oldSize.height;
                var wdiff = newSize.width - oldSize.width;
                PXN8.select(wdiff,hdiff,oldSize.width-wdiff,oldSize.height-hdiff);

                self.callback();
            });

    }
};

/**************************************************************************

PXN8.tools.rotate()
===================
Rotate a photo or flip it.

Parameters
----------
* params : An object which must have at least one of the following properties...
  * angle : A number specifing the degrees through which the photo should be rotated.
  * flipvt : A boolean indicating whether or not the photo should be flipped vertically.
  * fliphz : A boolean indicating whether or not the photo should be flipped horizontally.

If no parameters are supplied, the default is to rotate the photo through 90 degrees clockwise.

Examples
--------
To rotate a photo 90 degrees clockwise...

    PXN8.tools.rotate({angle: 90});

To flip a photo along the horizontal pane (mirror photo)...

    PXN8.tools.rotate({fliphz: true});

***/
PXN8.tools.rotate = function(params)
{
    var operation = {"operation" : "rotate", angle: 0, "fliphz": false, "flipvt": false };
    if (params){
        for (var i in params){
            operation[i] = params[i];
        }
    }
    if (!params){
        operation.angle = 90;
    }

    if (operation.angle > 0 || operation.flipvt || operation.fliphz){
        PXN8.tools.updateImage([operation]);
    }
};

/**************************************************************************

PXN8.tools.blur()
=================
Blur an area of the photo (or the entire photo).

Examples
--------
To blur the entire photo with a radius of 2x2...

    PXN8.tools.blur({radius: 2});

To blur an area of the photo...

    PXN8.tools.blur({radius: 2, top: 4, left: 40, width: 400, height: 200});

***/
PXN8.tools.blur = function (params)
{
    params.operation = "blur";
    PXN8.tools.updateImage([params]);
};

/**************************************************************************

PXN8.tools.colors()
===================
Change the brightness, saturation ,hue and contrast of a photo.

Examples
--------
To increase saturation by 20%...

    PXN8.tools.colors({saturation: 120});

To increase contrast & reduce brightness by 20 %

    PXN8.tools.colors({contrast: 1, brightness: 80});

To increase saturation, brightness, hue and contrast...

    PXN8.tools.colors ({brightness: 110, saturation: 110, hue: 180, contrast: 2});

Contrast must be in the range -5 to +5.
All other parameters must be in the range 0 - 200

***/
PXN8.tools.colors = function(param)
{
    if (!param.saturation) param.saturation = 100;
    if (!param.brightness) param.brightness = 100;
    if (!param.hue) param.hue = 100;
    if (!param.contrast) param.contrast = 0;
    param.operation = "colors";
    PXN8.tools.updateImage([param]);
};

/**************************************************************************

PXN8.tools.crop()
=================
Crop a photo to the dimensions provided. The most common way to call this is
as follows...

    PXN8.tools.crop();

... which will simply crop the photo to the currently selected area. This is
equivalent to ...
    PXN8.tools.crop(PXN8.getSelection());

Parameters
----------
* geometry : An object with *width*, *height*, *top* and *left* properties.

Examples
--------
Crop the photo begining at 10 pixels from left, 200 pixels from the top and
extending 40 pixels to the right and 80 pixels to the bottom...

    PXN8.tools.crop({top: 10, left: 200, width: 40, height: 80});

***/
PXN8.tools.crop = function (params)
{
    if (!params){
        params = PXN8.getSelection();
    }

    var operation = {operation: "crop"};

    for (var i in params){
        operation[i] = params[i];
    }
    /**
     * wph 20070526 - use current selection if no params provided
     */

    if (operation.width <= 0 || operation.height <= 0){
        PXN8.show.alert(PXN8.strings.CROP_SELECT_AREA);
        return;
    }
    PXN8.tools.updateImage([operation]);
};

/**************************************************************************

PXN8.tools.previewCrop()
========================
A utility function to allow the user to preview what a crop based on the current
selection would look like.

Parameters
----------
* timeoutMillis : Exit the preview mode after the timeoutMillis milliseconds.

***/
PXN8.tools.previewCrop = function (timeout)
{
    timeout = timeout || 3500;

    var preview = function(borderColor,borderOpacity,handleOpacity){
        var _ = PXN8.dom;
        var rects = ["left","right","top","bottom","topleft","topright","bottomleft","bottomright"];
        for (var i  = 0;i < rects.length; i++){
            var rect = _.id("pxn8_" + rects[i] + "_rect");
            rect.style.backgroundColor = borderColor;
            _.opacity(rect,borderOpacity);
        }
        for (var i in PXN8.resize.handles){
            if (typeof PXN8.resize.handles[i] != "function"){
                var handle = _.id( i + "_handle");
                _.opacity(handle,handleOpacity);
            }
        }
    };
    preview("white",1.00,0);

    setTimeout(function(){
            var _ = PXN8.style.notSelected;
            preview(_.color,_.opacity,1.00);
        },timeout);
};
// for backward compatibility with older non-camelized naming scheme
PXN8.tools.preview_crop = PXN8.tools.previewCrop;

/**************************************************************************

PXN8.tools.filter()
===================
Apply a 'lens-filter' effect to the photo.This mimics the effect
of using those tinted lens filters on SLR to create more dramatic
skies.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* params : An object with *top*, *color* and *opacity* properties. (see below).

Examples
--------
The following javascript code will produce the image on the right...

    PXN8.tools.filter({top: 125, color: '#ffa500', opacity: 80});

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225filter.jpg"/></td></tr>
</table>

The *top* property specifies where the filter should trail off completely. The filter
is always applied starting at the top of the photo. If you would like the filter to begin
at the bottom of the photo you should use the following code instead...

    PXN8.tools.updateImage([
                           {operation: "rotate", flipvt: true},
                           {operation: "filter", top: 125, color: '#ffa500', opacity: 80},
                           {operation: "rotate", flipvt: true},
                           ]);

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225filterflip.jpg"/></td></tr>
</table>

***/
PXN8.tools.filter = function (params)
{
    params.color = params.color;
    params.operation = "filter";
    PXN8.tools.updateImage([params]);
};

/**************************************************************************

PXN8.tools.interlace()
======================
Adds TV-like scan-lines overlaying the photo to make it appear like it is a
screen-grab from broadcast TV.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* params : An object with *color* and *opacity* properties.

Examples
--------

    PXN8.tools.interlace({color: '#ffffff', opacity: 66 });

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225interlace.jpg"/></td></tr>
</table>

***/
PXN8.tools.interlace = function(params)
{
    params.color = params.color;
    params.operation = "interlace";
    PXN8.tools.updateImage([params]);
};

/**************************************************************************

PXN8.tools.lomo()
=================
This function adds a 'lomo' effect to the photo. This is an atmospheric and artistic
effect that darkens the corners and (optionally) saturates the colors so that the photo
appears to have been taken using a Russian LOMO&trade; camera.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* params : An object with *opacity* (numeric) and *saturate* (boolean) properties.

Examples
--------

    PXN8.tools.lomo({opacity: 30, saturate: true});

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225lomo.jpg"/></td></tr>
</table>

***/
PXN8.tools.lomo = function(params)
{
    params.operation = "lomo";
    PXN8.tools.updateImage([params]);
};

/**************************************************************************

PXN8.tools.fillFlash()
=======================
Adds a fill-flash effect to the photo to brighten it. This is more
subtle than using the PXN8.tools.colors() function as it composites a
duplicate layer on top of the existing image using the 'SCREEN'
compositing operation.

Parameters
----------
* luminosity : A value between 1 and 100 (default value is 50 if parameter not passed).

Examples
--------

    PXN8.tools.fillFlash();

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225fillflash.jpg"/></td></tr>
</table>

***/
PXN8.tools.fillFlash = function(opacity)
{
    var operation = {operation: "fill_flash"};
    if (opacity){
        operation.opacity = Math.max(0,Math.min(100,opacity));
    }else{
        operation.opacity = 50;
    }

    PXN8.tools.updateImage([operation]);
};
// for compatibility with older non-camelized naming scheme
PXN8.tools.fill_flash = PXN8.tools.fillFlash;

/**************************************************************************

PXN8.tools.snow()
=================
Adds snowflakes to the photo. This is basically a wrapper around PXN8.tools.overlay().
<em>This tool is only available in Pixenate Premium edition.</em>

Examples
--------

    PXN8.tools.snow();

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225snow.jpg"/></td></tr>
</table>

Related
-------
PXN8.tools.overlay()

***/
PXN8.tools.snow = function ()
{
    PXN8.tools.overlay({filepath: "images/overlays/snowflakes.png", tile: "true"});
};

/**************************************************************************

PXN8.tools.overlay()
==================
Overlays an image on top of the photo.
The overlay tool is useful for superimposing clip-art and borders on top of photos.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------

* params : An object with the following properties...
  * filepath : The image property should be a relative path to the overlay image (relative to where pixenate is installed *not* the webroot). This is the image which will be overlaid in front of (or behind) the user's photo. You can provide either a <em>filepath</em> or <em>url</em> property. filepath will always be used if both url and filepath are provided. You must provide either the <em>filepath</em> or <em>url</em> parameter!
  * url : A url to the image to use as the overlay. You can use this instead of the filepath parameter.
  * image : (deprecated - use 'filepath' or 'url' instead) The image property should be a relative path to the overlay image (relative to where pixenate is installed *not* the webroot). This is the image which will be overlaid in front of (or behind) the user's photo.
  * tile  : (optional) A boolean indicating whether the image should be tiled (repeated in the x and y direction).
  * left : (optional) The X coordinate where the left-most side of the overlay will appear (ignored if *tile* is true).
  * top : (optional) The Y coordinate where the top-most side of the overlay will appear (ignored if *tile* is true).
  * width: (optional) The width to which the overlay will be resized. If the width property is not present then the overlay will not be resized.
  * height: (optional) The height to which the overlay will be resized.
  * position: (optional) The position to place the overlay relative to the photo. Possible values are *"front"* and *"back"* (default value is *"front"*).
  * extend: (optional) A boolean indicating whether or not the photo canvas should be extended (not scaled) to match the size of the overlay image (used for Overlays which have an Alpha Channel).
  * opacity: (optional) A value between 1 and 100 specifying the opacity of the overlay (default is 100).
Examples
--------

Let's say your users have been working on a photo and would now like to stick it on to a background image to give it a border.

<img align="center" src="border1.jpg"/>

The border is 300 x 225 pixels in size and is a plain JPEG image (no transparency). What we are going to do is position the above image at the *back* of the photo.

<img align="center" src="pigeon200x150.jpg"/>

(a 200 x 150 photo) which will result in the following completed image

<img align="center" src="overlay1.jpg"/>

This can be achieved with the following code...

    PXN8.initialize("/pixenate/docs/pigeon200x150.jpg");
    // more code..
    PXN8.tools.overlay({image: "docs/border1.jpg", position: "back", left: 50, top: 37});

Please see <a href="example-borders.html">Adding Borders</a> and <a href="example-speech-bubbles.html">Speech bubbles</a> for more Examples.

Related
-------
PXN8.tools.snow() PXN8.tools.addText()

***/
PXN8.tools.overlay = function(params)
{
    params.operation="overlay";
    PXN8.tools.updateImage([params]);
};


/**************************************************************************

PXN8.tools.addText()
=====================
Adds text to a photo.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------

* params : An object with the following properties...
  * text : (this is the only compulsory property) The text to add.
  * gravity : A string specifying where the text will appear. Possible values are "North", "South", "East", "West", "NorthWest", "SouthWest", "NorhtEast", "SouthEast", "Center".
  * y : The Y coordinate where the text will appear (this is an offset from the default position specified by gravity)
  * x : The X coordinate where the text will appear (this is an offset from the default position specified by gravity)
  * font : The font family to use when adding text (default is Arial or Courier depending on what fonts are installed on the server).
  * fill : The font color (expressed as a &hash; prefixed hexadecimal string).
  * pointsize: The size of the font.
  * style: (optional) Values can be "Normal", "Italic", "Oblique", "Any".
  * stretch: (optional) Values can be "Normal", "UltraCondensed", "ExtraCondensed","Condensed","SemiCondensed", "SemiExpanded","Expanded","ExtraExpanded","UltraExpanded".
  * stroke: (optional) The stroke color (expressed as a &hash; prefixed hexadecimal string).
  * strokewidth: (optional) The stroke width (for outlining text).
  * antialias: (optional) values can be <em>true</em> or <em>false</em>.
  * rotate: (optional) The number of degrees to rotate the text.

Examples
--------
To position text on the photo using the *gravity* property...

    PXN8.tools.addText({fill : '#ffffff', font: 'Arial', pointsize: 20, text: 'Hello World', gravity: 'NorthEast'});

<img src="pigeon300x225textgravity.jpg"/>

The following table illustrates how the *gravity* and *x* and *y* parameters are used in conjunction with each other.
The red arrow in each diagram points to the adjusted position used for *gravity*...

<table>
  <tr>
    <td><img src="pigeonNorthWest.jpg"/></td>
    <td><img src="pigeonNorth.jpg"/></td>
    <td><img src="pigeonNorthEast.jpg"/></td>
  </tr>
  <tr>
    <td><img src="pigeonWest.jpg"/></td>
    <td><img src="pigeonCenter.jpg"/></td>
    <td><img src="pigeonEast.jpg"/></td>
  </tr>
  <tr>
    <td><img src="pigeonSouthWest.jpg"/></td>
    <td><img src="pigeonSouth.jpg"/></td>
    <td><img src="pigeonSouthEast.jpg"/></td>
  </tr>
</table>
Please see <a href="example-text.html">Text Example</a> for an example of how to position text on the photo.

Related
-------
PXN8.tools.overlay()

***/
PXN8.tools.addText = function(params)
{
   params.operation = "add_text";
   params.fill = params.fill;

   //
   // wph 20070309 : allow doublequotes inside text string
   //
   params.text = params.text.replace(/\"/g,"\\\"");

   PXN8.tools.updateImage([params]);
};
// for backward compatibility with older non-camelized naming scheme
PXN8.tools.add_text = PXN8.tools.addText;

/**************************************************************************

PXN8.tools.whiten()
===================
Whitens off-color teeth.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* geometry : An object containing *top*, *left*, *width* and *height* coordinates. (usually obtained from the current user selection). If no parameter is supplied, then the current selected area will be used.

Related
-------
PXN8.tools.fixredeye()

***/
PXN8.tools.whiten = function (params)
{
    if (!params){
        params = PXN8.getSelection();
    }
    if (params.width == 0 || params.height == 0){
        return;
    }
    params.operation = "whiten";
    PXN8.tools.updateImage([params]);
};

/**************************************************************************

PXN8.tools.fixredeye()
======================
Removes 'red-eye' from the specified area.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* geometry : An object containing *top*, *left*, *width* and *height* coordinates. (usually obtained from the current user selection)


Examples
--------

    PXN8.tools.fixredeye({top: 40, left: 60, width: 75, height: 75});

Alternatively the *geometry* parameter can instead be an Array of geometry objects.

    PXN8.tools.fixredeye([{top: 40, left: 60, width: 75, height: 75},
                         {top: 50, left: 200, width: 80, height: 94}]);

You must supply one or more rectangles to which the redeye fix will be applied.
The rectangles should be approximately centered on the eye.

Related
-------
PXN8.tools.whiten()

***/
PXN8.tools.fixredeye = function(params)
{
    if (!params){
        params = PXN8.getSelection();
    }
    if (PXN8.isArray(params)){
        for (var i = 0;i < params.length; i++){
            params[i].operation = "fixredeye";
        }
        PXN8.tools.updateImage(params);
    }else{
        params.operation = "fixredeye";
        PXN8.tools.updateImage([params]);
    }
};

/**************************************************************************

PXN8.tools.resize()
===================
Resize an image to the specified width and height.

Parameters
----------
* width : The new desired width of the image.
* height: The new desired height of the image.

***/
PXN8.tools.resize = function(width, height)
{
    PXN8.tools.updateImage([{"operation": "resize", "width": width, "height": height}]);
};

/**************************************************************************

PXN8.tools.roundedCorners()
===========================
Add rounded corners to the image.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* color : The color of the corners.
* radius : The radius of the rounded corners.

Examples
--------

    PXN8.tools.roundedCorners('#ffffff',32);

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225rounded.jpg"/></td></tr>
</table>

***/
PXN8.tools.roundedCorners = function(color, radius)
{
    PXN8.tools.updateImage([{"operation":"roundcorners",
                             "color": color,
                             "radius":radius}]);
};
// for compatibility with older non-camelized naming scheme
PXN8.tools.roundedcorners = PXN8.tools.roundedCorners;
/**************************************************************************

PXN8.tools.sepia()
==================
Add a sepia-tone effect to the image.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* color : the color of the 'tint' to use when applying the effect. ('#a28a65' seems to be a good sepia color).

Examples
--------

    PXN8.tools.sepia('#a28a65');

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225sepia.jpg"/></td></tr>
</table>

Related
-------
PXN8.tools.grayscale()

***/
PXN8.tools.sepia = function(color)
{
    PXN8.tools.updateImage([{"operation":"sepia",
                             "color": color}]);
};

/**************************************************************************

PXN8.tools.grayscale()
======================
Make the image grayscale (black & white).
<em>This tool is only available in Pixenate Premium edition.</em>

Examples
--------
    PXN8.tools.grayscale();

<table>
<tr><td>Before</td><td>After</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225grayscale.jpg"/></td></tr>
</table>

Related
-------
PXN8.tools.sepia()

***/
PXN8.tools.grayscale = function()
{
    PXN8.tools.updateImage([{"operation":"grayscale"}]);
};

/**************************************************************************

PXN8.tools.charcoal()
=====================
Create a charcoal drawing from an image.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* radius : (A value between 1 and 8). Defines how acute the effect will be.

Examples
--------

<table>
<tr><td>Before</td><td>radius = 2</td><td>radius = 5</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225ch2.jpg"/></td><td><img src="pigeon300x225ch5.jpg"/></td></tr>
</table>

Related
-------
PXN8.tools.oilpaint()
***/
PXN8.tools.charcoal = function(radius)
{
    PXN8.tools.updateImage([{"operation" : "charcoal", "radius" : radius}]);
};

/**************************************************************************

PXN8.tools.oilpaint()
=====================
Create an oil-painting from a photo.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* radius : (A value between 1 and 8). Defines how acute the effect will be.

Examples
--------

<table>
<tr><td>Before</td><td>radius = 2</td><td>radius = 5</td></tr>
<tr><td><img src="pigeon300x225.jpg"/></td><td><img src="pigeon300x225oil2.jpg"/></td><td><img src="pigeon300x225oil5.jpg"/></td></tr>
</table>

Related
-------
PXN8.tools.charcoal()

***/
PXN8.tools.oilpaint = function(radius)
{
    PXN8.tools.updateImage([{"operation" : "oilpaint", "radius" : radius}]);
};

/*========================================================================

PXN8.tools.unsharpmask()
========================
Uses the unsharpmask algorithm to sharpen an image.

*/
PXN8.tools.unsharpmask = function(params)
{
    var operation = {"operation": "unsharpmask"};
    if (params){
        for (var i in params){
            operation[i] = params[i];
        }
    }
    PXN8.tools.updateImage([operation]);
};

/**************************************************************************

PXN8.tools.fetch()
==================
Fetches an image either from a remote server or the server's own filesystem.
This is not normally called directly by client code.

***/
PXN8.tools.fetch = function(params)
{
    var operation = {"operation" : "fetch"};
    if (params){
        for (var i in params){
            operation[i] = params[i];
        }
    }
    PXN8.tools.updateImage([operation]);
};


/**************************************************************************

PXN8.tools.hi_res()
=====================
Apply all changes to the photo which were performed in the current editing session
to a high-resolution version of the image. Please note that as with all editing operations, this does not overwrite the original hi-res photo.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* hires_image_details : An object which must have at least one of the following attributes...
  * filepath : The path (relative to the pixenate directory) to the hi-res image. filepath will always be used if both url and filepath are provided. You must provide either the <em>filepath</em> or <em>url</em> parameter!
  * url : A url to the hi-res image. You can use this instead of the filepath parameter.
* callback : A function which will be called when changes to the hi-res image have been complete. The callback takes a single parameter <b>jsonResponse</b>. <b>jsonResponse.image</b> contains the url (relative to the pixenate directory) where the hi-res edited photo resides.

Examples
--------
To save a hi-res version of your changes to the local client storage...

    // A url for the hi-res version of the photo (this will never be displayed in the browser)
    var hires_image = "http://pixenate.com/images/samples/hires/garinish.jpg";

    //
    // this function will be called instead of the default PXN8.save.toDisk() function
    //
    function hires_save(){
        PXN8.tools.hi_res({url: hires_image}, on_hires_edit_complete);
    }
    //
    // the following function will be called when all changes have been
    // applied to the high-resolution photo
    //
    function on_hires_edit_complete(jsonResponse)
    {

        // grab the location of the hi-res photo
        var hires_edited_image = jsonResponse.image;

        // change the location to the new image
        var newURL = PXN8.root + "/save.pl?image=" + hires_edited_image;

        // open URL
        document.location = newURL;
    }

    // change PXN8.save.toDisk to point at our new function
    PXN8.save.toDisk = hires_save;

***/

PXN8.tools.hi_res = function(hires_params,callback)
{
    var script = PXN8.getScript();
    var fetchOp = script[0];
    var hires_script = [fetchOp];
    var proxyOp = {operation: "proxy"};
    for (var i in fetchOp){
        if (i != "operation"){
            proxyOp[i] = fetchOp[i];
        }
    }
    //
    // wph 20080417 : Ensure that each new call to hi_res will force the
    // server to reevaluate the entire script.
    //
    proxyOp.timestamp = new Date().getTime();

    hires_script.push(proxyOp);

    for (var i in hires_params){
        fetchOp[i] = hires_params[i];
    }
    for (var i = 1; i < script.length; i++){
        hires_script.push(script[i]);
    }

    // inform user while hi-res operation happens.
    PXN8.prepareForSubmit(PXN8.strings.SAVING_HI_RES);

        // submit the script to the server for processing
    PXN8.ajax.submitScript(hires_script,function(jsonResponse){

        // hide the timer
        var timer = document.getElementById("pxn8_timer");
        if (timer){
            timer.style.display = "none";
        }
        //
        // wph 20070403 - must reset PXN8.updating or the user
        // won't be able to do any further operations after they've saved the
        // photo to their disk.
        //
        PXN8.updating = false;

        callback(jsonResponse);

    });
};

/**************************************************************************

PXN8.tools.mask()
=====================
The 'mask' tool lets you apply a alpha-channel Mask to a photo. A mask is a grayscale image
composed solely of colors, black, white and shades of gray. Dark areas of the mask will
result in equvalent transparent areas in the photo, while white areas of the mask will result
in opaque areas of the photo.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* filepath : The path (relative to the pixenate directory) to the mask image.
* background_color : The background color to apply where the mask is not fully opaque. The default value is #00000000 (transparent).

Examples
--------
Please see <a href="example-mask-1.html">example-mask-1</a> for a simple example of using the Mask tool.
Refer to <a href="example-crop-face.html">Face copy-and-paste</a> for an example of how the <b>mask</b> tool can
be used to copy and paste parts of a photo on top of itself.

Related
-------
PXN8.tools.crop PXN8.overlay.start PXN8.overlay.stop PXN8.ajax.submitScript

***/

PXN8.tools.mask = function(params)
{
    var operation = {"operation" : "mask"};
    if (params){
        for (var i in params){
            operation[i] = params[i];
        }
    }
    PXN8.tools.updateImage([operation]);
};

/**************************************************************************

PXN8.tools.rearrange()
=====================
The Rearrange tool lets you move many parts of a photo around.
<em>This tool is only available in Pixenate Premium edition.</em>

Parameters
----------
* pieces: An array of objects. Each object specifies coordinates for the part of the photo and the displacement.
          Each object must have the following properties...
  * x : The leftmost point of the area to be moved
  * y : The topmost point of the area to be moved
  * width: The width of the area to be moved
  * height: The height of the area to be moved
  * dx: The difference along the X axis by which the area should be moved (- values are to the left, + values are to the right)
  * dy: The difference along the Y axis by which teh area should be moved (- values are to the top, + values are to the bottom)

Examples
--------
Please see <a href="example-rearrange.html">example-rearrange</a> for a simple example of using the Rearrange tool.

Related
-------
PXN8.tools.crop PXN8.tools.mask

***/
PXN8.tools.rearrange = function(params)
{
    var operation = {"operation" : "rearrange"};
    if (!params)
    {
        alert(PXN8.strings.INVALID_PARAMETER + " (null) ");
        return;
    }
    operation.pieces = params;
    PXN8.tools.updateImage([operation]);

};
/**************************************************************************

PXN8.tools.transparent()
=====================
Make a color within a photo transparent. PXN8.tools.transparent() can be called in 2 ways.
You can provide x and y coordinates in which case the color at that point will be chosen and
all pixels in the photo with the same color will be set to transparent.
Or you can provide a color parameter.

Parameters
----------
* o: An object with one or more of the following attributes...
  * x : The x coordinate of the point at which the color will be chosen (optional)
  * y : The y coordinate of the point at which the color will be chosen (optional)
  * color: The color to set as transparent (optional)
  * reduce: If this attribute is present, the image will be reduced to 256 colors

Examples
--------
Please see <a href="example-transparent.html">example-transparent</a> for a simple example of using the Transparent tool.

***/
PXN8.tools.transparent = function (params){
    params.__extension = ".png";
    params.operation = "transparent";
    PXN8.tools.updateImage([params]);
};

