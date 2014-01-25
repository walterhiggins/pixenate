/*
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 */
PXN8 = PXN8 || {};
/**************************************************************************

SECTION: Preview Functions
==========================
Pixenate allows you to display a "preview pane" on your page where you can see
a preview of what the currently active tool (lomo, colors, etc) will look like.
Ideally, the preview pane should only show a small section of the entire image.
The user can click and drag inside the preview pane to show obscured parts of the image.

***/

PXN8.preview = {};
PXN8.preview._div_to_intervalid = {};


/**************************************************************************
PXN8.preview.initialize()
=========================
Multiple Preview panes can be displayed at the same time so each distinct preview
pane must be associated with it's own preview state object. The preview state object
just contains information about the state of the preview pane : the relative position of
the background image and other information specific to that particular preview pane.
When you initialize a preview pane, you must provide an Element Id.

Parameters
----------
* ElementId : The ID attribute of the HTML Element (a DIV ideally) in which the preview will be displayed.

Returns
-------
An object which contains the state information for preview-related data for the supplied Element.
This object should be later passed to the PXN8.preview.show() and PXN8.preview.hide() functions.

Examples
--------
The following code will create a preview pane on the page. And will initialize the Preview pane
with a 'colors' operation...

    <div id="colors_preview" style="width: 120px; height: 120px;"></div>
    <script type="text/javascript">
       var colors_peek = PXN8.preview.initialize("colors_preview");
       PXN8.preview.show(colors_peek, {operation: "colors", brightness: 150, saturation: 150});
    </script>

<img src="pigeon300x225preview.jpg"/>

Related
-------
PXN8.preview.show() PXN8.preview.hide() OPERATIONS

***/
PXN8.preview.initialize = function(elementId,preview_method)
{
    if (!preview_method){
        preview_method = "crop";
    }
    if (preview_method == "crop" || preview_method == "resize"){

    }else{
        alert("Invalid preview method provided - use either 'crop' or 'resize'");
        return;
    }

    /**
     * It is VERY IMPORTANT that backgroundImageCache is enabled
     * in IE - otherwise there is an annoying flicker when the preview
     * pane is dragged.
     */
    try {
        document.execCommand('BackgroundImageCache', false, true);
    } catch(e) {}


    /**
     * Firstly, clear any existing event listeners and timers for the element.
     */
    PXN8.event.removeListener(elementId,"mousedown");
    PXN8.event.removeListener(elementId,"mouseup");
    PXN8.event.removeListener(elementId,"mousemove");
    var oldIntervalId = PXN8.preview._div_to_intervalid[elementId];
    if (oldIntervalId){
        clearInterval(oldIntervalId);
    }

    var result = {};

    var element = PXN8.dom.id(elementId);
    if (!element){return false;}

    // wph 20080401 preview_method can be either "resize" or "crop" - "crop" is default
    result._preview_method = preview_method;
    result._element = element;
    result._sizeX = parseInt(element.style.width);
    result._sizeY = parseInt(element.style.height);
    result._offset = {x: 0, y: 0};
    result._op = false;
    result._opQueue = [];
    result._intervalId = 0;
    result._beginDrag = {x: 0, y: 0};
    result._endDrag = {x: 0, y: 0};
    result._mouseDownCoords = {};
    result._mouseUpCoords = {};

    result._mouseDown = PXN8.event.closure(result,PXN8.preview._innerMouseDown);
    result._mouseUp = PXN8.event.closure(result,PXN8.preview._innerMouseUp);
    result._mouseMove = PXN8.event.closure(result,PXN8.preview._innerMouseMove);



    var img = PXN8.dom.id("pxn8_image");
    if (img){
        //
        // pxn8_image might not yet be present when PXN8.preview.initialize() is called
        //
        var real_image_width = img.width / PXN8.zoom.value();
        var real_image_height = img.height / PXN8.zoom.value();
        result._fullsize_ratio = Math.ceil(Math.max(real_image_height/result._sizeY, real_image_width/result._sizeX));
        /**
         * Center the preview pane on the image
         */
        PXN8.preview.centerOffset(result);

    }else{
        result._fullsize_ratio = -1;
    }

    result._intervalId = setInterval(function(){PXN8.preview._manageQueue(result);},750);

    PXN8.preview._div_to_intervalid[elementId] = result._intervalId;

    PXN8.event.addListener(elementId,"mousedown",result._mouseDown);


    return result;
};

/**
 * Show a part of the photo in the preview pane
 */
PXN8.preview.setOffset = function(object,x,y)
{
    var img = PXN8.dom.id("pxn8_image");
    var iw = img.width / PXN8.zoom.value();
    var ih = img.height / PXN8.zoom.value();

    var maxY = ih - object._sizeY;
    var maxX = iw - object._sizeX;
    if (x < 0){ x = 0; }
    if (y < 0){ y = 0; }
    if (y > maxY) { y = maxY;}
    if (x > maxX) { x = maxX;}

    object._offset.x = x;
    object._offset.y = y;
    PXN8.preview._refresh(object);
};


/**
 * Make the preview pane show the center of the photo
 */
PXN8.preview.centerOffset = function(object)
{
    var _ = PXN8.dom;
    var image = _.id("pxn8_image");
    var iw = image.width / PXN8.zoom.value();
    var ih = image.height / PXN8.zoom.value();
    var halfW = object._sizeX / 2;
    var halfH = object._sizeY / 2;
    PXN8.preview.setOffset(object,Math.round((iw/2) - halfW), Math.round((ih/2) - halfH));
};




/**************************************************************************

PXN8.preview.show()
===================
Shows the preview pane.

Parameters
----------
* previewStateObject : The object which was returned from PXN8.preview.initialize()
* operation : An operation state object. This parameter is *optional* .

The operation parameter can be a single *operation* object (as described in <a href="#OPERATIONS">OPERATIONS</a>
or an array of operation objects.

Example
-------
The following code creates two buttons to increase and decrease the saturation of the photo
and show the change in a preview pane...


    <div id="colors_preview" style="width: 120px; height: 120px;"></div>
    <script type="text/javascript">
       //
       // declare a global variable 'colors_peek' to be used by buttons too.
       //
       colors_peek = PXN8.preview.initialize("colors_preview");
       saturation = 100;

       PXN8.preview.show(colors_peek);

       function increase_saturation(){
          saturation += 20;
          //
          // Update the preview pane.
          //
          PXN8.preview.show(colors_peek,{"operation": "colors", "saturation": saturation});
       }

       function decrease_saturation(){
          saturation -= 20;
          //
          // Update the preview pane.
          //
          PXN8.preview.show(colors_peek,{"operation": "colors", "saturation": saturation});
       }
    </script>

    <button onclick="increase_saturation()">+</button>
    <button onclick="decrease_saturation()">-</button>

<img src="pigeon300x225previewshow.jpg"/>

The following code demonstrates previewing a combined operation (Saturation and Interlace combined)...

    PXN8.preview.show(colors_peek,
		                [{"operation": "colors", "saturation": saturation},
                       {"operation": "interlace", opacity: 50,color: '#ffffff'}
 		                ]);

Related
-------
PXN8.preview.initialize() PXN8.preview.show() OPERATIONS

***/
PXN8.preview.show = function(object,op)
{
    var _ = PXN8.dom;

    if (!object._element){
        return;
    }
    if (object._element.style.display == "none"){
        object._element.style.display = "block";
    }
    if (op){ object._op = op; }

    if (op){
        PXN8.preview._enqueue(object);
    }
};

/**************************************************************************

PXN8.preview.hide()
===================
Hide (and clear) the preview pane. When you're finished with Preview Pane,
you should call this method to clean up.

Parameters
----------
* previewStateObject : The object which was returned from the call to PXN8.preview.initialize()

Examples
--------
Please refer to the <a href="example-preview.html">Preview Example</a>.

Related
-------
PXN8.preview.show() PXN8.preview.initialize() OPERATIONS

***/
PXN8.preview.hide = function(object)
{
    if (object._element){
        object._element.innerHTML = "";
        object._element.style.display = "none";
    }
    object._op = false;
    clearInterval(object._intervalId);

    PXN8.event.removeListener(object._element,"mousedown",object._mouseDown);
    PXN8.event.removeListener(object._element,"mousemove",object._mouseMove);
    PXN8.event.removeListener(object._element,"mouseup",object._mouseUp);
};


PXN8.preview._enqueue = function(object)
{
    object._opQueue.push(object._op);
};
/**
 * A global used by all preview panes.
 * don't throttle the server with too many spurious previews
 * If the last preview op hasn't completed then wait until it's complete before
 * submitting the next preview op.
 */
PXN8.preview._complete = true;

/**
 * description: Which part of the photo is the preview pane showing ?
 */
PXN8.preview._getOffset = function(object)
{
    return {x: object._offset.x, y: object._offset.y};
};

PXN8.preview._manageQueue = function(object)
{
    //
    // a last-in first-out queue.
    // all but the last op are ignored.
    // (this is to avoid excessive calls to the server).
    //
    var lastIndex = object._opQueue.length -1;
    if (lastIndex < 0){
        // nothing on the queue
        return;
    }

    if (!PXN8.preview._complete){
        return;
    }
    //
    // The pxn8_preview div uses the current image's src as it's backgroundImage anyway
    // so no need to go to the server unless there's an op to perform
    //
    var _ = PXN8.dom;
    var script = PXN8.getScript();
    var image = _.id("pxn8_image");
    if (!image){
        return;
    }

    //
    // set the _complete flag now
    //
    PXN8.preview._complete = false;

    var op = object._opQueue[lastIndex];

    object._opQueue.length = 0;


    var width = image.width / PXN8.zoom.value();
    var height = image.height / PXN8.zoom.value();

    var top = object._offset.y;
    var left = object._offset.x;
    //
    // round the x & y offsets to the nearest 100 pixels
    // to avoid too much server interaction
    // (snap-to-grid for less granular calls to server )
    //
    var gridSize = 100;

    var offsetTop = top % gridSize;
    var offsetLeft = left % gridSize;

    top = top - offsetTop;
    left = left - offsetLeft;

    var right = Math.min(width,left + (object._sizeX + gridSize));
    var bottom = Math.min(height, top + (object._sizeY + gridSize));

    var addedOps = [];

    var prepareOp = null;

    if (object._preview_method == "crop"){
        prepareOp = {"operation":"crop", "top":top, "left":left, "width":right-left, "height":bottom-top, "__quality":100, "__uncompressed":0};
    }else{
        prepareOp = {"operation":"resize", "width":right-left, "height":bottom-top};
    }


    if (width > object._sizeX && height > object._sizeY){
        addedOps.push(prepareOp);
    }
    var opsFromQueue = [];
    if (PXN8.isArray(op)){
        opsFromQueue = op;
    }else{
        opsFromQueue.push(op);
    }

    for (var i = 0;i < opsFromQueue.length; i++){
        var opFromQueue = opsFromQueue[i];

        /**
         * For the unsharpmask operation, the quality is very important
         * Only set the quality to 65 if a __quality attribute is not already present
         */
        if (opFromQueue["__quality"] == null){
            opFromQueue.__quality = 65;
        }
        opFromQueue.__uncompressed = 0;

        addedOps.push(opFromQueue);
    }


    object._element.innerHTML = '<span class="pxn8_preview_update">Please wait...</span>';


    var cachedImage = PXN8.getUncompressedImage();
    if (cachedImage){
        //
        // truncate script so it can be used for GET requests
        //
        script = [{"operation": "cache", "image":cachedImage}];
    }
    for (var i = 0;i < addedOps.length; i++){
        script.push(addedOps[i]);
    }

    PXN8.ajax.submitScript(script, function(jsonResponse){

        PXN8.preview._complete = true;
        _.cl(object._element);

        //
        // wph 20080218: Did the server return an error?
        //
        if (jsonResponse.status == "ERROR")
        {
            alert(jsonResponse.errorMessage);
            return;
        }
        if (!jsonResponse){
            return;
        }
        var prevImgURL = PXN8.server + PXN8.root + "/" + jsonResponse.image;
        object._element.style.backgroundImage = "url(" + prevImgURL + ")";
        var position = (offsetLeft * -1) + "px " + (offsetTop * -1) + "px";
        object._element.style.backgroundPosition = position;
    });
};

/**
 * Update the preview pane to reflect the current part of the photo showing.
 */
PXN8.preview._refresh = function(object)
{
    var _ = PXN8.dom;

    if (!object._element){
        return;
    }

    var position = (object._offset.x * -1) + "px " + (object._offset.y * -1) + "px";

    var image = _.id("pxn8_image");
    object._element.style.backgroundPosition = position;
    object._element.style.backgroundImage = "url(" + image.src + ")";
    object._element.style.cursor = "move";
    object._element.style.backgroundRepeat = "no-repeat";
};

PXN8.preview._innerMouseMove = function(event,object,source)
{
    var _ = PXN8.dom;

    object._endDrag = _.cursorPos(event);
    var offset = PXN8.preview._getOffset(object);
    var xdiff = object._beginDrag.x - object._endDrag.x;
    var ydiff = object._beginDrag.y - object._endDrag.y;

    if (object._fullsize_ratio == -1){
        var img = PXN8.dom.id("pxn8_image");
        if (img){
            var real_image_width = img.width / PXN8.zoom.value();
            var real_image_height = img.height / PXN8.zoom.value();
            object._fullsize_ratio = Math.ceil(Math.max(real_image_height/object._sizeY, real_image_width/object._sizeX));
        }
    }

    offset.x += xdiff * object._fullsize_ratio;
    offset.y += ydiff * object._fullsize_ratio;

    PXN8.preview.setOffset(object,offset.x,offset.y);
    object._beginDrag = object._endDrag;

};


PXN8.preview._innerMouseUp = function(event,object,source)
{
    PXN8.event.removeListener(object._element,"mouseup",object._mouseUp);
    PXN8.event.removeListener(object._element,"mouseout",object._mouseUp);
    PXN8.event.removeListener(object._element,"mousemove",object._mouseMove);
    PXN8.preview.show(object,object._op);
};


PXN8.preview._innerMouseDown = function(event,object,source)
{
    var _ = PXN8.dom;

    var img = _.id("pxn8_image");
    object._element.style.backgroundImage = "url(" + img.src + ")";


    PXN8.preview._refresh(object);

    object._beginDrag = _.cursorPos(event);
    object._mouseDownCoords = _.cursorPos(event);


    PXN8.event.addListener(object._element,"mouseup",object._mouseUp);
    PXN8.event.addListener(object._element,"mouseout",object._mouseUp);
    PXN8.event.addListener(object._element,"mousemove",object._mouseMove);
};


