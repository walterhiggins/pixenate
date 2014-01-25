/*
 * (c) Copyright SXOOP Technologies Ltd. 2005-2010
 * All rights reserved.
 *
 * If you have purchased PXN8 for use on your own servers and want to change the
 * core functionality we strongly recommend that
 * You make a copy of this file and rename it to $YOURCOMPANY_pxn8core.js and use that
 * as a working copy.
 */

window.onerror = function(message,url,line)
{
    prompt("A Javascript error occurred!\n " + message + "\n at line " + line, url);
    return false;
};

/**************************************************************************

SECTION: VARIABLES
==================
Pixenate uses a number of javascript variables...

PXN8
====
PXN8 is the name of the global variable used by Pixenate to store variables and
functions used by the Pixenate javascript API. PXN8 acts as a global namespace for all such
variables and functions.

***/
var PXN8 = PXN8 || {};

PXN8.server = document.location.protocol + "/" + "/" + document.location.host;

/**************************************************************************

PXN8.root
=========
Specifies where Pixenate&trade; is located relative to the Web
Root. If you install Pixenate in a directory other than one named
'pixenate' in the webroot folder, *You must change this value
accordingly*. For example if your webroot is /var/www/html and you have installed PXN8
in /var/www/html/pixenate, then you should set PXN8.root = "/pixenate/".

Type
----
String

Default Value
-------------
    "/pixenate/"

***/
PXN8.root = "/pixenate/";

/**************************************************************************

PXN8.basename
=========
Specifies the basename Pixenate&trade; CGI script

Type
----
String

Default Value
-------------
    "pxn8.pl"

***/
PXN8.basename = "pxn8.pl";

/**************************************************************************

PXN8.replaceOnSave
==================
replaceOnSave specifies how PXN8 handles image URLs.
If set to true then PXN8 always assumes that the photo at the supplied URL has changed.
If set to false then PXN8 will assume that the photo at the supplied url hasn't changed since it was last retrieved.
If the photo URL maps to a filepath on the webserver and your photo-editing application
overwrites the original file when saved then you should set this to true.
By default, it's set to true to avoid potential caching problems when save operation overwrites the original image.

Type
----
boolean

Default Value
-------------
    true


***/
PXN8.replaceOnSave = true;

/***************************************************************************

PXN8.aspectRatio
================
The currently enforced aspect-ratio which is enforced when the user
selects an area of the photo. If the value is anything other than...

    {width: 0, height: 0}

...then that aspect ratio is enforced. E.g. to
enforce a 2x3 aspect ratio on selections...

    PXN8.selectByRatio("2x3");

Type
----
Object (with *width* and *height* properties). *READ ONLY*

Default Value
-------------
    {width: 0, height: 0}

***/
PXN8.aspectRatio =  {width:0 , height:0};

/**************************************************************************

PXN8.position
=============

The current mouse position on the photo. The PXN8.position property
takes into account the current magnification level so it is always the
position of the mouse relative to the top-left corner of the un-magnified photo.

Type
----
Object (with *x* and *y* properties). *READ ONLY*

Default Value
-------------
    {x: "-", y: "-"}

***/

PXN8.position = {x: "-", y: "-"};


/***************************************************************************

PXN8.style
==========
PXN8.style is a namespace used to define style-related variables used by Pixenate.

***/
PXN8.style = {};

/**************************************************************************

PXN8.style.notSelected
======================
This variable defines the opacity and color of the non-selected areas of the photo.

Type
----
Object (with *opacity* and *color* properties).

Default Value
-------------
    {opacity: 0.33,
     color:   "black"}

***/
PXN8.style.notSelected = {opacity: 0.33,color: "black"};

/***************************************************************************

PXN8.style.resizeHandles
========================
Defines the color, and size (in pixels) of the resize handles which appear at
the corners and sides of the selected area of the image.

Type
----
Object (with *color* and *size* properties).

Default Value
-------------
    {color: "white",
     size:  6};
***/
PXN8.style.resizeHandles ={color: "white",size: 6,smallsize: 4,oldsize: -1};

/***************************************************************************

PXN8.select.constrainToImageBounds
==================================
Controls the selection behaviour. By default users cannot select an area which clips the
bounds of the image. However, there are cases where the user might want to do this - for example when adding
clip-art to an image , part of the clip-art may be off-image (e.g. adding santa hats to photos - constraining
the overlay tool so that all of the overlay image must appear on top of the photo does not make sense).

Type
----
boolean

Default Value
-------------
true

***/

/***************************************************************************

PXN8.convertToJPEG
==================
By default Pixenate assumes it is working with photographic images which don't have an alpha channel.
If you would like to edit .GIF or .PNG images while keeping the alpha channel information then set this variable to false.

Type
----
boolean

Default Value
-------------
true

***/

/***************************************************************************

SECTION: CALLBACKS and Related Functions
========================================
Hooks can be added to Pixenate using the following pre-defined Pixenate event types.
For more information on adding hooks to Pixenate please refer to the *PXN8.listener* set
of functions.
***/

/**************************************************************************

PXN8.ON_IMAGE_LOAD
==================
This event fires whenever *a new photo* is loaded into the
web page as a result of an editing operation. It does not fire when
the user *Undoes* or *Redoes* an operation - to catch those events use *PXN8.ON_IMAGE_CHANGE*.

Examples
--------
    function myOnImageLoad(eventType){
        alert("A new image has been loaded");
    }
    PXN8.listener.add(PXN8.ON_IMAGE_LOAD,myOnImageLoad);

***/
PXN8.ON_IMAGE_LOAD = "ON_IMAGE_LOAD";

/***************************************************************************

PXN8.ON_IMAGE_CHANGE
====================
This event fires whenever the photo is changed as a result of an
editing operation (including the undo and redo family of operations).

Examples
--------
    function myOnImageChange(eventType){
        alert("The image has been modified");
    }
    PXN8.listener.add(PXN8.ON_IMAGE_CHANGE,myOnImageChange);
***/
PXN8.ON_IMAGE_CHANGE =  "ON_IMAGE_CHANGE";

/***************************************************************************

PXN8.BEFORE_IMAGE_CHANGE
====================
This event fires before the photo is changed as a result of an
editing operation (including the undo and redo family of operations).

Examples
--------
    function myBeforeImageChange(eventType){
        alert("The image is about to be modified");
    }
    PXN8.listener.add(PXN8.BEFORE_IMAGE_CHANGE,myBeforeImageChange);
***/
PXN8.BEFORE_IMAGE_CHANGE =  "BEFORE_IMAGE_CHANGE";

/****************************************************************************

PXN8.ON_ZOOM_CHANGE
===================
This event is fired whenever the magnification level of the photo has been changed
(when the user zooms in and out).

Examples
--------

    function myOnImageZoom(eventType){
        alert("You have zoomed the image to " + (PXN8.zoom.value() * 100) + "%");
    };
    PXN8.listener.add(PXN8.ON_IMAGE_ZOOM, myOnImageZoom);

***/
PXN8.ON_ZOOM_CHANGE =  "ON_ZOOM_CHANGE";

/*****************************************************************************

PXN8.ON_SELECTION_CHANGE
========================
This event fires whenever the selection area is modified. *Do
not do anything which requires User interaction (such as alert,
confirm, prompt etc) in your listener as this event can fire quite frequently* while
the user is resizing, moving or initializing the selection area using the mouse. If you
want your hook to be called after the user has finished selecting the area, then use
*PXN8.ON_SELECTION_COMPLETE* instead.

Examples
--------

Please see the <a href="example-selection-limit.html">Limiting Selection Size</a> example, which demonstrates how to modify the selection behaviour so that a minimum area of 400x200 pixels must be selected.
***/
PXN8.ON_SELECTION_CHANGE =  "ON_SELECTION_CHANGE";

/*****************************************************************************

PXN8.ON_SELECTION_COMPLETE
==========================
This event fires when the user mouseups after making a selection or when a selection
has been made programmatically.

Examples
--------

    function myOnSelectionComplete(eventType){
        var log = document.getElementById("my_log");
        var sel = PXN8.getSelection();
        alert("You selected: " + sel.top + "," + sel.left + "," +
              sel.width + "," + sel.height);
    }
    PXN8.listener.add(PXN8.ON_SELECTION_COMPLETE,myOnSelectionComplete);

***/
PXN8.ON_SELECTION_COMPLETE =  "ON_SELECTION_COMPLETE";

/*****************************************************************************

PXN8.ON_IMAGE_ERROR
===================
This event is fired when an image update fails or an image fails to load.

***/
PXN8.ON_IMAGE_ERROR =  "ON_IMAGE_ERROR";

/* ============================================================================
 *
 * Functions related to PXN8 listeners
 */
PXN8.listener = {
    /**
     * A map of listeners by event type
     */
    listenersByType : {}
};
PXN8.listener.listenersByType[PXN8.ON_ZOOM_CHANGE] = [];
PXN8.listener.listenersByType[PXN8.ON_SELECTION_CHANGE] = [];
PXN8.listener.listenersByType[PXN8.ON_IMAGE_CHANGE] = [];
PXN8.listener.listenersByType[PXN8.ON_IMAGE_ERROR] = [];

/****************************************************************************

PXN8.listener.add()
===================
Adds a new callback function to the list of functions to be called when a PXN8 event occurs.
Listeners can be added for the following event types...
* PXN8.ON_ZOOM_CHANGE : Fired when the image is zoomed in or out.
* PXN8.ON_SELECTION_CHANGE : Fired when the selection has changed (and during a manual selection operation).
* PXN8.ON_SELECTION_COMPLETE : Fired when the user has completed making a selection or when the selection has changed programattically.
* PXN8.ON_IMAGE_CHANGE : Fired when the image has been modified. This is fired *after* the changed image has been loaded into the browser.

Parameters
----------
* eventType : See above event types.
* callback : A function which will be called when an event of eventType fires. This should be a
javascript function reference or literal. The callback should take a single parameter called eventType which will be
one of the above defined event types.

Returns
-------
The supplied callback parameter.

Example
-------
The following snippet of code displays an alert message every time the image is modified.

    // add an anonymous function as a listener
    //
    var myListener = PXN8.listener.add(PXN8.ON_IMAGE_CHANGE, function(eventType){
        if (eventType == PXN8.ON_IMAGE_CHANGE){
           alert("The image has changed");
        }
    });

The code above is equivalent to...

    // define and name the function
    function myListener(eventType){
        if (eventType == PXN8.ON_IMAGE_CHANGE){
           alert("The image has changed");
        }
    }

    // add the named function
    PXN8.listener.add(PXN8.ON_IMAGE_CHANGE,myListener);

Related
-------
PXN8.listener.remove PXN8.listener.onceOnly

***/
PXN8.listener.add = function (eventType,callback)
{
    var self = PXN8.listener;

    var callbacks = self.listenersByType[eventType];
    var found = false;
    if (!callbacks){
        callbacks = [];
        self.listenersByType[eventType] = callbacks;
    }
    for (var i = 0;i < callbacks.length; i++){
        if (callbacks[i] == callback){
            found = true;
            break;
        }
    }
    if (!found){
        callbacks.push (callback);
    }
    return callback;

};
/***************************************************************************

PXN8.listener.remove()
======================
Removes a callback function from the list of functions to be called when a PXN8 event occurs.


Parameters
----------

* eventType : The type of event for which you want to remove the listener (A listener
can potentially listen for different types of events).
* callback : a function reference which will be removed from Pixenate's list of listeners
for that particular event type.

Example
-------

    PXN8.listener.remove(PXN8.ON_IMAGE_CHANGE,myListener);

Related
-------
PXN8.listener.add PXN8.listener.onceOnly

***/
PXN8.listener.remove = function (eventType, callback)
{
    var self = PXN8.listener;

    var callbacks = self.listenersByType[eventType];
    if (!callbacks) return;
    for (var i = 0;i < callbacks.length; i++){
        if (callbacks[i] == callback){
            callbacks.splice(i,1);
            i--;
        }
    }
};
/****************************************************************************

PXN8.listener.onceOnly()
========================
Add a special-case of listener that *will only be invoked once and once only*.

Parameters
----------
* eventType : The type of event for which you want to listen (once only).
* callback : The function to be called when the event occurs (only called once then removed from list).

Returns
-------
The newly added Listener.

Related
-------
PXN8.listener.add PXN8.listener.remove

***/
PXN8.listener.onceOnly = function (eventType,callback)
{
    var self = PXN8.listener;
    callback.onceOnly = true;
    return self.add(eventType, callback);
};


/*
 * What is the current operation number ?
 */
PXN8.opNumber =  0;

/**
 * what is the total number of operations performed ?
 */
PXN8.maxOpNumber =  0;


/**
 * The JSON response from the last image operation
 */
PXN8.response =  {
    status: "",
    image: "",
    errorCode: 0,
    errorMessage: ""
};

/**
 * If an operation is performed on an image then this is set to true
 * until the image update has completed
 */
PXN8.updating =  false;

/**
 * The upper bounds on image sizes
 */
PXN8.resizelimit = {
    width: 1600,
    height: 1200
};





/*
 * A hashtable of images with the image.src url as the key (value is 'true')
 * Need this for IE to force onload handler for images which
 * have already been loaded.
 */
PXN8.imagesBySrc =  {};

// the start of the selection along the X axis (from left)
PXN8.sx =  0;

// the start of the selection along the Y axis (from top)
PXN8.sy =  0;

// the end of the selection along the X axis
PXN8.ex =  0;

// the end of the selection along the Y axis
PXN8.ey =  0;

/***************************************************************************

SECTION: Core Pixenate Functions
================================
Pixenate's core javascript API relies on the following functions...

***/

/***************************************************************************

PXN8.initialize()
=================
Call this function to initialize the PXN8 editor.

Parameters
----------
* image_url : A string value which is an Image URL of any of the forms specified below.

The image_url parameter can be any of the following.

* full URL : E.g. "http://pixenate.com/pixenate/images/samples/hongkong.jpg"
* absolute path (relative to domain) : E.g. "/pixenate/images/samples/hongkong.jpg"
* relative path (relative to page) : E.g. "../../images/samples/hongkong.jpg"


Alternatively it can be an object with 2 attributes *url* (see above) and *filepath*.
The filepath should be a path relative to where Pixenate is installed and
which can be used by the Pixenate server CGI to access the image from the server's filesystem.

PXN8.initialize() can also be used to load images from a database or other custom source.
For example, if you keep your images as BLOBs in a database you can create a custom image loader by specifying a *source* parameter.
For more information please see <a href="http://sxoop.wordpress.com/2009/03/24/pixenate-virtual-directories-and-secure-websites/">http://sxoop.wordpress.com/2009/03/24/pixenate-virtual-directories-and-secure-websites/</a> .

Example
-------
Pixenate can be initialized anywhere on the page *as long as the PXN8.initialize() function is called after
the 'pxn8_canvas' div has been parsed by the browser*. For example the following code won't work on many browsers...

*WRONG*

    <script type="text/javascript">PXN8.initialize("http://pixenate.com/pixenate/images/samples/hongkong.jpg");</script>
    <div id="pxn8_canvas"></div>

The correct approach is as follows...

    <div id="pxn8_canvas"></div>
    <!-- declare the pxn8_canvas BEFORE calling initialize -->
    <script type="text/javascript">PXN8.initialize("http://pixenate.com/pixenate/images/samples/hongkong.jpg");</script>

Another approach is to call PXN8.initialize() when the *window.onload* event fires...

    <!-- the following javascript block can appear anywhere on the page -->
    <script type="text/javascript">
      PXN8.dom.addLoadEvent(function(){
          // pxn8_canvas will have been parsed by the time this javascript is executed.
          PXN8.initialize("http://pixenate.com/pixenate/images/samples/hongkong.jpg");
      });
    </script>

Related
-------
PXN8.dom.addLoadEvent

***/
PXN8.initialize = function( param )
{

    PXN8.ready = false;

    var _ = PXN8.dom;

    var image_src;

    var paramType = typeof param;

    if (paramType == 'string'){
        image_src = param;
    }else{
        image_src = param.url;
    }

    PXN8.priv.createSelectionRect();

    var canvas = PXN8.initializeCanvas();

    //
    // create the pxn8_image_container element if not already present
    //
    var imgContainer = _.id("pxn8_image_container");
    if (!imgContainer){
        imgContainer = _.ac(canvas,_.ce("div",{id: "pxn8_image_container"}));
        //
        // FIX for IE's broken handling of Faded JPEGS (introduction of white-noise)...
        // IE interprets a completely black pixel in a JPEG as being transparent.
        // Because of this, in some dark areas there will be white pixels. This is
        // the background color showing through.
        // the solution is to change the background color of the pxn8_image_container
        // to black or change the #00000 pixels to #000001
        // see http://www.alexjudd.com/?p=5
        //
        if (document.all){
            //
            // wph 20080515 Only do this for IE. Firefox doesn't resize the pxn8_image_container
            // so a black area appears when the image is rotated 90 degrees.
            //
            imgContainer.style.backgroundColor = "black";
        }


    }

    if(navigator.userAgent.indexOf("Opera")!=-1){
        // opera (as of version 9.01) doesn't support opacity
        PXN8.style.notSelected.color = "transparent";
    }

    /**
     * It is VERY IMPORTANT that backgroundImageCache is enabled
     * in IE - otherwise there is an annoying flicker when the preview
     * pane is dragged.
     */
    try {
        document.execCommand('BackgroundImageCache', false, true);
    } catch(e) {}

    //
    // create and style the divs that will bound the selection area
    //
    var rects = ["pxn8_top_rect",
                 "pxn8_bottom_rect",
                 "pxn8_left_rect",
                 "pxn8_right_rect",
                 "pxn8_topleft_rect",
                 "pxn8_topright_rect",
                 "pxn8_bottomleft_rect",
                 "pxn8_bottomright_rect"];
    for (var i = 0;i < rects.length; i++)
	 {
        var rect = _.id(rects[i]);
        if (!rect){
            rect = _.ac(canvas,_.ce("div",{id: rects[i]}));
        }

        rect.style.fontSize = "0px";
        if (!rect.style.backgroundColor){
            rect.style.backgroundColor = PXN8.style.notSelected.color;
        }
        rect.style.position = "absolute";
        if (!rect.style.opacity){
            _.opacity(rect,PXN8.style.notSelected.opacity);
        }

        rect.style.top = "0px";
        rect.style.left = "0px";
        rect.style.width = "0px";
        rect.style.height = "0px";
        rect.style.display = "none";
        rect.style.zIndex = 1;

        var antshz = "url(" + PXN8.server + PXN8.root + "/images/ants_hr.gif)";
        var antsvt = "url(" + PXN8.server + PXN8.root + "/images/ants_vt.gif)";
        if (rects[i] == "pxn8_top_rect"){
            rect.style.backgroundImage = antshz;
            rect.style.backgroundPosition = "bottom left";
            rect.style.backgroundRepeat = "repeat-x";
        }
        if (rects[i] == "pxn8_bottom_rect"){
            rect.style.backgroundImage = antshz;
            rect.style.backgroundPosition = "top left";
            rect.style.backgroundRepeat = "repeat-x";
        }
        if (rects[i] == "pxn8_left_rect"){
            rect.style.backgroundImage = antsvt;
            rect.style.backgroundPosition = "top right";
            rect.style.backgroundRepeat = "repeat-y";
        }
        if (rects[i] == "pxn8_right_rect"){
            rect.style.backgroundImage = antsvt;
            rect.style.backgroundPosition = "top left";
            rect.style.backgroundRepeat = "repeat-y";
        }
    }


    PXN8.image.location = image_src;

    PXN8.opNumber = 0;
    PXN8.maxOpNumber = 0;

    PXN8.history = new Array();
    //
    // initialize offsets (for undo and redo of composite operations)
    //
    PXN8.offsets = [1];

    //
    // wph 20070123 : If the image URL passed to PXN8.initialize() is of the form...
    //
    // ../path/to/images/x.jpg
    // ../../gallery/x.jpg
    //
    // then

    var fetchOp = {
        operation: "fetch",
        url: PXN8.image.location
    };
    fetchOp.pxn8root = PXN8.root;
    if (paramType == 'object'){
        for (var i in param){
            fetchOp[i] = param[i];
        }
    }

    PXN8.history.push(fetchOp);


    if (PXN8.replaceOnSave){
        fetchOp.random = PXN8.randomHex();
    }


	 /**
	  * The following function insert's the photo's absolute URL into the
	  * 'fetch' operator. This is so that pxn8.pl always has the absolute URL
	  * (Pixenate can work as a CGI or via mod_perl so relative URLs are meaningless
	  *  to the server process)
	  */
    var gotAbsoluteImageSrc = false;

    var getAbsoluteImageSrc = function(){

        if (gotAbsoluteImageSrc){
            getAbsoluteImageSrc = function(){};
            return;
        }
        gotAbsoluteImageSrc = true;
        // wph 20070124
        // update the fetch.url attribute to reflect the canonical image location
        // e.g. ../../images/samples/greenleaves.jpg becomes...
        // http://mydomain/pixenate/images/samples/greenleaves.jpg
        // This is important when the image passed in is a relative path to the current page.

        var fetchOp = PXN8.getOperation(0);
        var theImage = document.getElementById("pxn8_image");

        //
        // wph 20070227 : must escape the URL to avoid the case where an image url contains an '&' character
        // in which case the 'script' parameter passed to pxn8.pl was being truncated at first '&' character
        //
        // wph 20070903 : Entire script is now escaped so no need to escape individual parts of script
        //fetchOp.url = escape(theImage.src);
        fetchOp.url = theImage.src;
        //
        // wph 20070201
        // Set the global PXN8.ready flag to true so that operations can be performed
        // on the image.
        //
        PXN8.ready = true;
    };

    var pxn8image = _.id("pxn8_image");

    /**
     * Safari doesn't load the image immediately
     * so setting the PXN8.image.width & height variables
     * makes no sense until the image has loaded.
     * the following function gets called directly from within
     * this function but also from within the img.onload function
     * if no <img id="pxn8_image".../> element appears in the body
     * (if pxn8_image is created dynamically as is the case with a
     * toolbar theme.
     *
     */

    var onImageLoad = function()
    {
        var _ = PXN8.dom;
        var pxn8image = _.id("pxn8_image");

        PXN8.image.width =  pxn8image.width;
        PXN8.image.height = pxn8image.height;

        PXN8.priv.addImageToHistory(pxn8image.src);
        PXN8.show.size();
        getAbsoluteImageSrc();
    };

    /**
     *  Initialize the image
     */
    if (!pxn8image)
	 {
        //
        // this won't work for Safari.
        // it is recommended that the <img> tag always appears
        // inside the pxn8_image_container tag.
        //

        // wph 20070117 : Use of innerHTML instead of DOM forces IE to load the image at the correct dimensions
        // Upload -> Crop -> save as same name -> upload same file : Image appears stretched to old dimensions
        //pxn8image = dom.ac(imgContainer,dom.ce("img",{id: "pxn8_image", src: PXN8.image.location}));

        var innerHTML = '<img id="pxn8_image" border="0" src="' + PXN8.image.location + '"/>';

        try {
            imgContainer.innerHTML = innerHTML;
        }catch (e){
            alert("An error occurred while adding the <img> tag to the page.\n" +
                  "This is most likely because the pxn8_canvas DIV has been added to an incorrect element (<table> or <p>).\n"  +
                  "The error message reported was: " + e.message);
            PXN8.dom.ac(imgContainer,PXN8.dom.ce("img",{id: "pxn8_image", src: PXN8.image.location}));
        }

        pxn8image = _.id("pxn8_image");

    }
	 else
	 {

        //
        //  The image is already present - re-add it to the DOM to ensure the
        //  correct dimensions are applied.
        //
        var imgContainer = _.cl("pxn8_image_container");
        //
        // wph 20060905 : Must change the image src attribute whenever PXN8.initialize is called
        // e.g. if there is a web-page with thumbnail images which change the current image for
        // editing, the .src attribute *MUST* be updated !


        // wph 20070117 : Use of innerHTML instead of DOM forces IE to load the image at the correct dimensions
        // Upload -> Crop -> save as same name -> upload same file : Image appears stretched to old dimensions
        //pxn8image = dom.ac(imgContainer,dom.ce("img",{id: "pxn8_image", src: PXN8.image.location}));

        var innerHTML = '<img id="pxn8_image" border="0" src="' + PXN8.image.location + '"/>';
        try {
            imgContainer.innerHTML = innerHTML;
        }catch(e){
            alert("An error occurred while adding the <img> tag to the page.\n" +
                  "This is most likely because the pxn8_canvas DIV has been added to an incorrect element (<table> or <p>).\n"  +
                  "The error message reported was: " + e.message);
            PXN8.dom.ac(imgContainer,PXN8.dom.ce("img",{id: "pxn8_image", src: PXN8.image.location}));
        }

        pxn8image = _.id("pxn8_image");
    }

    pxn8image.onload = onImageLoad;
    //
    // wph 20060714 notify ON_IMAGE_LOAD listeners
    //
    PXN8.event.removeListener(pxn8image,"load",PXN8.imageLoadNotifier);
    PXN8.event.addListener(pxn8image,"load",PXN8.imageLoadNotifier);

};


/***************************************************************************

PXN8.select()
=============
Selects an area of the image. Use this function to programmatically select
an area of the image.

Parameters
----------
* left : The start position of the selected area along the X axis (starts at left).
* top : The start position of the selected area along the Y axis (starts at top).
* width : The width of the selected area.
* height : The height of the selected area.

Alternatively you can provide a single object as a parameter (with the following properties)...

* left : The start position of the selected area along the X axis (starts at left).
* top : The start position of the selected area along the Y axis (starts at top).
* width : The width of the selected area.
* height : The height of the selected area.

Example
-------
The following example code will select the top half of the photo...

    var theImage = document.getElementById("pxn8_image");
    var zoomValue = PXN8.zoom.value();
    //
    // the image's width and height might not reflect the true width and height if the image
    // has been zoomed in or out.
    //
    var realWidth = theImage.width / zoomValue;
    var realHeight = theImage.height / zoomValue;

    PXN8.select(0, 0, realWidth, realHeight / 2);

For an example of limiting the selection area by size please <a href="example-selection-limit.html">click here</a>

Related
-------
PXN8.getSelection PXN8.selectByRatio

***/
PXN8.select = function (startX, startY, width, height)
{
    var self = PXN8;

    if (typeof startX == "object"){
        var sel = startX;
        startY = sel.top;
        width = sel.width;
        height = sel.height;
        startX = sel.left;
    }

    self.sx = startX;
    self.sy = startY;
    self.ex = self.sx + width;
    self.ey = self.sy + height;

	 if (PXN8.select.constrainToImageBounds == true)
	 {
		  if (self.sx < 0) self.sx = 0;

		  if (self.sy < 0) self.sy = 0;

		  if (self.ex > PXN8.image.width){
				self.ex = PXN8.image.width;
				self.sx = self.ex - width;
		  }

		  if (self.ey > PXN8.image.height){
				self.ey = PXN8.image.height;
				self.sy = self.ey - height;
		  }
	 }

    /*
     * update the field values
     */
    self.position.x = startX;
    self.position.y = startY;

    var selection = self.getSelection();
    self.listener.notify(PXN8.ON_SELECTION_CHANGE,selection);
};
PXN8.select.constrainToImageBounds = true;

PXN8.select.disabler = function(eventType,selection)
{
    if (selection.width > 0 || selection.height > 0){
        PXN8.unselect();
        return;
    }
};
/****************************************************************************

PXN8.select.enable()
===================
Enable selection of parts of the photo. No need to call this at startup because
Selection will be enabled by default.

Parameters
----------
* enabled : A boolean value, true to enable the selection. false to disable it.
* unselect (optional) : A boolean value indicating whether or not to discard the current selection.

Example
-------

Please see the <a href="example-selection-disable.html">Disabling Selection</a> example, which demonstrates how to disable and enable selection.

Returns
-------
null

Related
-------

***/
PXN8.select.enable = function(enabled,unselect)
{
	 var canvas = document.getElementById("pxn8_canvas");
    if (enabled){
        PXN8.listener.remove(PXN8.ON_SELECTION_CHANGE,PXN8.select.disabler);
    }
    else{
        if (unselect){
            PXN8.unselect();
        }
        PXN8.listener.add(PXN8.ON_SELECTION_CHANGE,PXN8.select.disabler);
    }

};

/**
 * listen to both ON_SELECTION_CHANGE and ON_ZOOM_CHANGE
 */
PXN8.select.defaultListener = function(eventType,selection)
{
    var _ = PXN8.dom;
    var self = PXN8;

    var theImg = _.id("pxn8_image");
    var selectRect = _.id("pxn8_select_rect");
    var leftRect = _.id("pxn8_left_rect");
    var rightRect = _.id("pxn8_right_rect");
    var topRect = _.id("pxn8_top_rect");
    var bottomRect = _.id("pxn8_bottom_rect");
    var topleftRect = _.id("pxn8_topleft_rect");
    var toprightRect = _.id("pxn8_topright_rect");
    var bottomleftRect = _.id("pxn8_bottomleft_rect");
    var bottomrightRect = _.id("pxn8_bottomright_rect");

    PXN8.show.position();
    PXN8.show.selection();

    if ((eventType == PXN8.ON_SELECTION_CHANGE && selection == null) ||
        eventType == PXN8.ON_ZOOM_CHANGE){
        selection = self.getSelection();
    }

    /*
     * has any selection been made yet ?
     */
    if (selection.width <=0 && selection.height <= 0 ){
        selectRect.style.display = "none";

        leftRect.style.display = "none";
        rightRect.style.display = "none";
        topRect.style.display = "none";
        bottomRect.style.display = "none";

        topleftRect.style.display = "none";
        toprightRect.style.display = "none";
        bottomleftRect.style.display = "none";
        bottomrightRect.style.display = "none";
        return;
    }

    var zoom = PXN8.zoom.value();

    var sel = {};
    for (var i in selection){
        // watch out for prototype !
        if (typeof selection[i] != "function"){
            sel[i] = Math.floor(selection[i] * zoom);
        }
    }

/*
 *  wph 20081121 - constraints take care of this
 *	 (commented out because when a selection area clips the right or bottom, the resize handles
 *  can be out of place.
 *
 if (sel.left + sel.width > theImg.width || sel.top + sel.height > theImg.height){
  return;
 }
*/


    var bh = theImg.height - (sel.top + sel.height);
	 if (bh < 0){
		  bh = 0;
	 }
	 bh = bh + "px";
    var bt = sel.top + sel.height + "px";
    var th = sel.top + "px";
    var ll = "0px";
    var lw = sel.left + "px";
    var rw = (theImg.width - (sel.left + sel.width));
	 if (rw < 0){
		  rw = 0;
	 }
	 rw = rw + "px";

    var rl = sel.left + sel.width + "px";

    topleftRect.style.display = "block";
    topleftRect.style.top = "0px";
    topleftRect.style.left = ll;
    topleftRect.style.width = lw;
    topleftRect.style.height = th;

    leftRect.style.display = "block";
    leftRect.style.top = sel.top + "px";
    leftRect.style.left = ll;
    leftRect.style.width =  lw;
    leftRect.style.height = sel.height + "px";

    bottomleftRect.style.display = "block";
    bottomleftRect.style.top = bt;
    bottomleftRect.style.left = ll;
    bottomleftRect.style.width =  lw;
    bottomleftRect.style.height = bh;

    topRect.style.display = "block";
    topRect.style.top = "0px";
    topRect.style.left = sel.left + "px";
    topRect.style.width = sel.width + "px";
    topRect.style.height = th;

    selectRect.style.top  = sel.top + "px";
    selectRect.style.left = sel.left + "px";
    selectRect.style.width = sel.width + "px";
    selectRect.style.height = sel.height + "px";
    selectRect.style.display = "block";
    selectRect.style.zIndex = 100;

    bottomRect.style.display = "block";
    bottomRect.style.top = bt;
    bottomRect.style.left = sel.left + "px";
    bottomRect.style.width = sel.width + "px";
    bottomRect.style.height = bh;

    toprightRect.style.display = "block";
    toprightRect.style.top = "0px";
    toprightRect.style.left = rl;
    toprightRect.style.width = rw;
    toprightRect.style.height = th;

    rightRect.style.display = "block";
    rightRect.style.top = sel.top + "px";
    rightRect.style.left = rl;
    rightRect.style.width = rw;
    rightRect.style.height = sel.height + "px";

    bottomrightRect.style.display = "block";
    bottomrightRect.style.top = bt;
    bottomrightRect.style.left = rl;
    bottomrightRect.style.width = rw;
    bottomrightRect.style.height = bh;


    /**
     * to enable marching ants in CSS
     *

#pxn8_top_rect { background: url(/ants.gif) bottom left repeat-x; }
#pxn8_bottom_rect { background: url(/ants.gif) top left repeat-x; }
#pxn8_left_rect { background: url(/antsvertical.gif) top right repeat-y; }
#pxn8_right_rect { background: url(/antsvertical.gif) top left repeat-y; }

    */
};
/**
 * PXN8.select.defaultListener must be the first listener added !
 */
PXN8.listener.add(PXN8.ON_SELECTION_CHANGE,PXN8.select.defaultListener);
PXN8.listener.add(PXN8.ON_ZOOM_CHANGE,PXN8.select.defaultListener);


/****************************************************************************

PXN8.getSelection()
===================
Return a Rect that represents the current selection.

Returns
-------
An object with the following properties...
* top : The topmost coordinate on the Y axis of the selected area.
* left: The leftmost coordinate on the X axis of the selected area.
* width: The width of the selected area.
* height: The height of the selected area.

Example
-------
    var selectedArea = PXN8.getSelection();
    alert ("You have selected an area " + selectedArea.width + "x" + selectedArea.height );
Related
-------
PXN8.select PXN8.selectByRatio

***/
PXN8.getSelection = function()
{
    var rect = {};
    var self = PXN8;

    rect.width = self.ex>self.sx?self.ex-self.sx:self.sx-self.ex;
    rect.height = self.ey>self.sy?self.ey-self.sy:self.sy-self.ey;
    rect.left = self.ex>self.sx?self.sx:self.ex;
    rect.top = self.ey>self.sy?self.sy:self.ey;
/*
 * wph 20081121 - why constrain here ?
 *
    rect.left = rect.left<0?0:rect.left;
    rect.top = rect.top<0?0:rect.top;
*/
    return rect;
};

/****************************************************************************

PXN8.selectByRatio()
====================
Selects an area using an aspect ratio of the form "WxH" where W is width and H is height.

Parameters
----------
* ratio : The ratio is expressed as a string e.g. "4x6".
* override (optional) : A boolean value indicating whether or not to ignore the images's dimensions (don't optimize selection size).
The default value if none is specified is *false*.

Example
-------

Assuming the user is working with a photo which is 300x225, calling
PXN8.selectByRatio("2x3") will result in the following selection...
    {width: 300, height: 200, left: 0, top: 12}
<table>
  <tr><td>Original</td><td>PXN8.selectByRatio("2x3")</td></tr>
  <tr>
     <td valign="top"><img src="pigeon300x225.jpg"/></td>
     <td valign="top"><img src="pigeon300x225sbr2x3.jpg"/></td>
  </tr>
  <tr><td>Original</td><td>PXN8.selectByRatio("2x3",true)</td></tr>
  <tr>
     <td valign="top"><img src="pigeon300x225.jpg"/></td>
     <td valign="top"><img src="pigeon300x225sbr2x3true.jpg"/></td>
  </tr>
</table>

Related
-------
PXN8.select PXN8.selectAll PXN8.unselect PXN8.getSelection

***/
PXN8.selectByRatio = function(ratio,override)
{
    var _ = PXN8.dom;
    var self = PXN8;

    if (typeof ratio != "string"){
        alert("Ratio must be expressed as a string e.g. '4x6'");
        return;
    }

	 if (!PXN8.ready)
	 {
		  // image hasn't loaded yet.
		  // put self on queue for execution when image has loaded.
		  //
        PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.selectByRatio(ratio,override);
		  });
		  return;
	 }

    var ih = PXN8.image.height;
    var iw = PXN8.image.width;


	 var sepIndex = ratio.indexOf("x");

	 if (sepIndex != -1)
	 {
		  var rw = parseFloat(ratio.substring(0,sepIndex));
		  var rh = parseFloat(ratio.substring(sepIndex+1));

        if (override){
            PXN8.aspectRatio.width = rw;
            PXN8.aspectRatio.height = rh;
        }else{
            if (iw > ih){
                if (rw > rh){
                    PXN8.aspectRatio.width = rw;
                    PXN8.aspectRatio.height = rh;
                }else{
                    PXN8.aspectRatio.width = rh;
                    PXN8.aspectRatio.height = rw;
                }
            }else{
                if (rw > rh){
                    PXN8.aspectRatio.width = rh;
                    PXN8.aspectRatio.height = rw;
                }else{
                    PXN8.aspectRatio.width = rw;
                    PXN8.aspectRatio.height = rh;
                }
            }
        }
        rw = PXN8.aspectRatio.width;
        rh = PXN8.aspectRatio.height;

    }else{
        PXN8.aspectRatio.width = 0;
        PXN8.aspectRatio.height = 0;

        PXN8.resize.enable(["n","s","e","w"],true);

        return;
    }
    PXN8.resize.enable(["n","s","e","w"],false);

    var left = 0;
    var top = 0;
    var width = 0;
    var height = 0;

    var fitWidth = function(){
        width = iw;
        height = Math.round(width / rw * rh);
        top = Math.round( (ih /2 ) - (height / 2));
    };
    var fitHeight = function(){
        height = ih;
        width = Math.round(height / rh * rw);
        left = Math.round((iw / 2) - (width /2));
    };

    if (iw > ih){
        if ((iw / ih) > (rw / rh)){
            fitHeight();
        }else{
            fitWidth();
        }
    }else{
        if ((ih / iw) > (rh / rw)){
            fitWidth();
        }else{
            fitHeight();
        }
    }
    self.select(left,top,width,height);
};



/****************************************************************************

PXN8.rotateSelection()
======================
Rotates the selection area by 90 degrees.

Example
-------
<table>
  <tr><td>Before</td><td>After PXN8.rotateSelection()</td></tr>
  <tr>
     <td valign="top"><img src="pigeon300x225b4rotatesel.jpg"/></td>
     <td valign="top"><img src="pigeon300x225afterrotatesel.jpg"/></td>
  </tr>
</table>

Related
-------
PXN8.select PXN8.selectByRatio PXN8.selectAll PXN8.unselect PXN8.getSelection

***/
PXN8.rotateSelection = function()
{

	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.rotateSelection();
		  });
		  return;
	 }
    var sel = PXN8.getSelection();
	 var imgSize = PXN8.getImageSize();

    var cx = sel.left + (sel.width / 2);
    var cy = sel.top + (sel.height / 2);
	 //
	 // wph 20080624 Constrain selection to image size
	 //
    if (sel.width > imgSize.height){
        sel.height = sel.height * (imgSize.height / sel.width);
        sel.width = imgSize.height;
    }
    if (sel.height > imgSize.width){
        sel.width = sel.width * (imgSize.width / sel.height);
        sel.height = imgSize.width;
    }

    PXN8.select (cx - sel.height/2, cy - sel.width /2, sel.height, sel.width);

    //
    // swap width and height of aspectRatio
    //
    var temp = PXN8.aspectRatio.width;

    PXN8.aspectRatio.width = PXN8.aspectRatio.height;
    PXN8.aspectRatio.height = temp;
    //
    // snap to the current enforced aspect ratio
    //
    PXN8.snapToAspectRatio();

};

/****************************************************************************

PXN8.selectAll()
================
Selects the entire photo area.

Example
-------
<table>
  <tr><td>Before</td><td>After *PXN8.selectAll()*</td></tr>
  <tr>
     <td valign="top"><img src="pigeon300x225.jpg"/></td>
     <td valign="top"><img src="pigeon300x225selectall.jpg"/></td>
  </tr>
</table>

Related
-------
PXN8.select PXN8.selectByRatio PXN8.rotateSelection PXN8.unselect PXN8.getSelection

***/
PXN8.selectAll = function()
{
	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.selectAll();
		  });
		  return;
	 }
    PXN8.select( 0, 0, PXN8.image.width, PXN8.image.height);
};
/****************************************************************************

PXN8.unselect()
===============
Unselect the entire photo. The selection will be discarded.

***/
PXN8.unselect = function ()
{
    PXN8.select( 0, 0, 0,0);
};

/* ============================================================================
 *
 * Miscellaneous top-level functions
 *
 */

/***************************************************************************

PXN8.getUncompressedImage()
===========================
Returns the relative URL to the uncompressed 100% full quality image.
This version of the image is not normally downloaded and displayed in the browser
during an editing session because it is typically much larger than the more bandwidth-friendly
lower resolution image (typically using 85% quality). Normally this
function be called from pxn8_save_image or some other function which
will save the image to the server.

Returns
-------
A path (relative the PXN8.root) to the uncompressed image if the image has changed or <em>false</em> if no changes have been made.

Examples
--------

    var uncompressed = PXN8.getUncompressedImage();

	 if (uncompressed != false)
	 {
		  // the image has been modified
		  // uncompressed = "cache/01_feabcdd1d0workingjpg.jpg";
        // view the image
        document.location = PXN8.server + PXN8.root + "/" +	 uncompressed;
    }

Related
-------
PXN8.save.toServer pxn8_save_image

***/
PXN8.getUncompressedImage = function()
{
    if (PXN8.responses[PXN8.opNumber]){
        return PXN8.responses[PXN8.opNumber].uncompressed;
    } else {
        return false;
    }
};


/**
 * -- function:    PXN8.listener.notify
 * -- description: Called by various methods to notify listeners
 * -- param eventType (ON_ZOOM_CHANGE, ON_IMAGE_CHANGE, ON_SELECTION_CHANGE etc)
 */
PXN8.listener.notify = function(eventType,source)
{
    var self = PXN8.listener;
    var listeners = self.listenersByType[eventType];
    if (listeners){
        for (var i = 0; i < listeners.length; i++){
            var listener = listeners[i];
            if (listener != null){
                listener(eventType,source);
                if (listener.onceOnly){
                    PXN8.listener.remove(eventType,listener);
                    i--;
                }

            }
        }
    }
};

/**
 * This function should be the first ON_IMAGE_LOAD function called.
 * It does all of the housekeeping necessary for PXN8.
 * All other ON_IMAGE_LOAD callbacks should be called after this !!!
 */
PXN8.imageLoadHousekeeping = function(eventType,theImage)
{
    var _ = PXN8.dom;

    theImage = _.id("pxn8_buffered_image");

    if (theImage == null){
        theImage = _.id("pxn8_image");
    }

    if (PXN8.log){PXN8.log.trace("image " + theImage.src + " has loaded");}

    PXN8.image.width = theImage.width;
    PXN8.image.height = theImage.height;

    var iw = PXN8.image.width;
    var ih = PXN8.image.height;

    /**
     * wph 20070630 : now we have the original size of the buffered image,
     * change it's width & height attributes to match the zoomed size before
     * copying the buffer to the display.
     */

    var zoomFactor = PXN8.zoom.value();

    theImage.width = iw * zoomFactor;
    theImage.height = ih * zoomFactor;

    //
    // now display the buffer contents
    //
    _.ac(_.cl("pxn8_image_container"),theImage);
    theImage.id = "pxn8_image";

    PXN8.show.size();

    PXN8.priv.addImageToHistory(theImage.src);

    var selection = PXN8.getSelection();
    if (selection.width > iw ||
        selection.left > iw ||
        selection.height > ih ||
        selection.top > ih)
    {
        PXN8.unselect();
    }else{
        //
        // might need to move the selection
        //
        var moved = false;

        if (selection.left + selection.width > iw){
            selection.left = iw - selection.width;
            moved = true;
        }
        if (selection.top + selection.height > ih){
            selection.top = ih - selection.height;
            moved = true;
        }
        if (moved){
            PXN8.select(selection);
        }
    }
    //
    // may need to reposition the bounding non-selected areas regardless
    // of whether the selection has changed or not
    //
    PXN8.listener.notify(PXN8.ON_SELECTION_CHANGE,selection);

    PXN8.imagesBySrc[theImage.src] = true;
    PXN8.listener.notify(PXN8.ON_IMAGE_CHANGE);

    var timer = _.id("pxn8_timer");
    if (timer){
        timer.style.display = "none";
    }

    return theImage;

};
/**
 * N.B. This should be the first call to PXN8.listener.add(PXN8.ON_IMAGE_LOAD,...)
 * Housekeeping should be done _BEFORE_ all other ON_IMAGE_LOAD handlers are called
 */
PXN8.listener.add(PXN8.ON_IMAGE_LOAD,PXN8.imageLoadHousekeeping);

/* ============================================================================
 * logging now uses log4javascript if present
 */
if (typeof log4javascript != "undefined"){
	 PXN8.log = log4javascript.getDefaultLogger();
}else{
	 PXN8.log = false;
}

/* ============================================================================ */



/**
 * wph 20070124
 * Return an operation based on the operation number.
 * Unlike PXN8.getScript() this returns a reference to the operation object - not a copy.
 * Changes to the returned object will be reflected the next time a server-call is made.
 */
PXN8.getOperation = function(i)
{
    if (i > PXN8.opNumber){
        return null;
    }
    return PXN8.history[i];
};
/**
 * Return an image operation where index is the user-op number
 *
 */
PXN8.getUserOperation = function(index)
{
    var self = PXN8;
    var result = null;
    var lastIndex = 0;
    for (var i = 0;i < index; i++){
        lastIndex += self.offsets[i];
    }
    return self.history[lastIndex];
};


/***************************************************************************

PXN8.getScript()
================
Return a list (a copy) of all the operations which have been performed (doesn't include undone operations).

Returns
-------
A array of objects each of which is a distinct operation which was performed on the image.

Examples
--------
The following code retrieves all of the operations performed in the current editing session and displays a series
of alerts telling the user what they have done.

    var whatYouDid = PXN8.getScript();
    for (var i = 0; i < whatYouDid.length; i++){
        alert("you performed a '" + whatYouDid[i].operation + "' operation");
    }

***/
PXN8.getScript = function()
{
    var self = PXN8;

    var result = new Array();

    //
    // WPH first get the real index of the last operation (this will not
    // necessarily be opNumber . E.g. if the user performs the following operations...
    //
    // [1] Rotate
    // [2] Enhance + Normalize (2 operations combined into one single user operation)
    // [3] Redeye
    // ... then the history, offsets and opNumber values will be as follows
    //
    // history  [fetch,rotate,enhance,normalize,redeye]
    // offsets  [1,1,2,1]
    // opNumber 3

    var lastIndex = 0;
    for (var i = 0;i <= self.opNumber; i++){
        lastIndex += self.offsets[i];
    }

    //for (var i = 0;i <= self.opNumber; i++){
    for (var i = 0;i < lastIndex; i++){

        var original = self.history[i];
        //
        // make a copy of the object
        //
        var duplicate = {};
        for (var j in original){
            duplicate[j] = original[j];
        }
        result.push(duplicate);
    }

    return result;
};
/***************************************************************************

PXN8.isUpdating()
=================
Is pixenate currently updating the photo ?

Returns
-------
*true* or *false* depending on whether the photo is currently being updated.

***/
PXN8.isUpdating = function()
{
    return PXN8.updating;
};

/**
 * -- function curry
 * -- description Currying is a way of 'baking-in' an object to a function
 * Its a way of permanently binding an object and a function together
 * in effect create a new distinct function with the object embedded in it.
 * It's one of the cool higher-order programming features of dynamic languages
 * like Javascript and Perl.
 * PXN8.curry is a functor - a function which returns a function
 * -- param object The object to be baked in to the function
 * -- param func The function into which the object will be baked.
 */
PXN8.curry = function(func,object)
{
    return function(){
        return func(object);
    };
};

/*
 * Update the UI to inform the user that the image is being updated
 * The msg param is optional - it contains text that will be displayed in
 * the *pxn8_timer* DIV. In most cases this is simply 'Updating image. Please wait...'
 * but it can be different - e.g. 'Saving image. Please wait...'
 */
PXN8.prepareForSubmit = function(msg)
{
    var _ = PXN8.dom;

    if (!msg){
        msg = PXN8.strings["UPDATING"];
    }

    var timer = _.id("pxn8_timer");
    if (!timer){
        timer = _.ce("div",{id: "pxn8_timer"});
        _.ac(timer,_.tx(msg));
	     var canvas = _.id("pxn8_canvas");
        _.ac(canvas,timer);
    }
    if (timer){
        _.ac(_.cl(timer),_.tx(msg));
        timer.style.display = 'block';
        var theImage = _.id("pxn8_image");
        var imagePos = _.ep(theImage);
        timer.style.width  = Math.max(200,theImage.width) + "px";
    }
    PXN8.updating = true;
};

/**
 * For a given point calculate it's real location when
 * the scroll area is taken into account.
 */
PXN8.scrolledPoint = function (x,y)
{
    var result = {"x":x,"y":y};

    var canvas = document.getElementById("pxn8_canvas");
    if (canvas.parentNode.id == "pxn8_scroller"){
        var scroller = document.getElementById("pxn8_scroller");
        result.x += scroller.scrollLeft;
        result.y += scroller.scrollTop;
    }
    return result;
};
/**
 *  Get the point to which the window is scrolled (useful for freehand drawing).
 */
PXN8.getWindowScrollPoint = function()
{
	 var scrOfX = 0, scrOfY = 0;
	 if( typeof( window.pageYOffset ) == 'number' ) {
		  //Netscape compliant
		  scrOfY = window.pageYOffset;
		  scrOfX = window.pageXOffset;
	 } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
		  //DOM compliant
		  scrOfY = document.body.scrollTop;
		  scrOfX = document.body.scrollLeft;
	 } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
		  //IE6 standards compliant mode
		  scrOfY = document.documentElement.scrollTop;
		  scrOfX = document.documentElement.scrollLeft;
	 }
	 return {"x": scrOfX, "y": scrOfY };
};
/**
 * -- function PXN8.createPin
 * -- description Create a pin for placing on top of an image
 * -- param pinId The unique Id to be given to the created pin image
 * -- param imgSrc The image src attribute
 */
PXN8.createPin = function (pinId,imgSrc)
{
    var pinElement = document.createElement("img");
    pinElement.id = pinId;
    pinElement.className = "pin";
    pinElement.src = imgSrc;
    pinElement.style.position = "absolute";
    return pinElement;
};

/**
 * -- function mousePointToElementPoint
 * -- description Convert a mouse event point to a relative point for a given element
 * -- param mx The x value for the mouse event
 * -- param my The y value for the mouse event
 */
PXN8.mousePointToElementPoint = function(mx,my)
{
    var _ = PXN8.dom;
    var result = {};
    var canvas = _.id("pxn8_canvas");
    var imageBounds = _.eb(canvas);
    var scrolledPoint = PXN8.scrolledPoint(mx,my);
    var zoom = PXN8.zoom.value();

    result.x = Math.round((scrolledPoint.x - imageBounds.x)/zoom);
    result.y = Math.round((scrolledPoint.y - imageBounds.y)/zoom);

    if (canvas.style.borderWidth){

        var borderWidth = parseInt(canvas.style.borderWidth);
        result.x -= borderWidth;
        result.y -= borderWidth;
        if (result.x < 0){
            result.x = 0;
        }
        if (result.y < 0){
            result.y = 0;
        }
    }
    return result;
};

/***************************************************************************

PXN8.getImageSize()
=====================
Returns the real width and height of the image.

Returns
-------
Returns an object with <em>width</em> and <em>height</em> attributes - the real width and height of the image.

***/
PXN8.getImageSize = function()
{
    var imgElement = document.getElementById("pxn8_image");
    var zoomValue = PXN8.zoom.value();
    var realWidth = imgElement.width / zoomValue;
    var realHeight = imgElement.height / zoomValue;

    return {width: realWidth, height: realHeight};

};



/***************************************************************************

PXN8.objectToString()
=====================
Converts a given javascript object to a string which can be evaluated as a JSON
expression.

Parameters
----------
* object : The object to be converted into a string.

Returns
-------
A string which can later be evaluated as a JSON expression.
Boolean literals (*true* and *false*) are converted to strings.

Examples
--------

    var myObject = {
                    name: "Walter Higgins",
                    contacts: ["John Doe", "K DeLong"],
                    available: false
                    };

    var myObjectAsString = PXN8.objectToString(myObject);

    // myObjectAsString = '{"name":"Walter Higgins", "contacts":["John Doe","K DeLong"],"available":"false"}';


***/
PXN8.objectToString = function(obj)
{
    var s = "";

    var propToString = function(prop){return "\"" + prop + "\":";};

    var operationAlwaysFirst = function(a,b){
        if (a == "operation"){ return -1;}
        if (b == "operation"){ return 1;}
        return a > b ? 1 : b > a ? -1: 0;
    };

    var types = {array : {s:"[",e:"]",
                          indexer: function(o){ var result = new Array(); for (var i =0;i < o.length;i++){result.push(i);}return result;},
                          pusher: function(array,o,i){array.push(o);}},
                 object: {s:"{",e:"}",
                          indexer: function(o){ var result = new Array(); for (var i in o){ if (typeof o[i] != "function"){ result.push(i);}}return result.sort(operationAlwaysFirst);},
                          pusher: function(array,o,i){array.push(propToString(i) + o);}}
    };

    var type = "object";

    if (PXN8.isArray(obj)){
        type = "array";
    }

    s = types[type].s;

    var props = new Array();

    var pusher = types[type].pusher;

    var indexes = types[type].indexer(obj);

    for (var j = 0;j < indexes.length; j++){
        var i = indexes[j];
        if (typeof obj[i] == "function"){
            continue;
        }
        if (typeof obj[i] == "string"){
            pusher(props,"\"" +  obj[i] + "\"",i);
        }else if (typeof obj[i] == "object"){
            pusher(props, PXN8.objectToString(obj[i]),i);
        }else if (typeof obj[i] == "boolean"){
            pusher(props, "\"" + obj[i] + "\"",i);
        }else{
            pusher(props, obj[i],i);
        }
    }

    for (var i = 0;i < props.length; i++){
        s = s + props[i];
        if (i < props.length-1){
            s += ",";
        }
    }
    s += types[type].e;

    return s;
};

/**
 * Is an object an Array ?
 */
PXN8.isArray = function(o)
{
	return (o && typeof o == 'object') && o.constructor == Array;
};

/**
 * Return a random hexadecimal value in the range 0 - 65535 (0000 - FFFF)
 */
PXN8.randomHex = function()
{
    return (Math.round(Math.random()*65535)).toString(16)
};

PXN8.getImageBuffer = function()
{
    var _ = PXN8.dom;

    var buffer = _.id("pxn8_buffer");
    if (!buffer){
        buffer = _.ce("div",{id: "pxn8_buffer"});
        _.ac(document.body,buffer);
        buffer.style.width = "1px";
        buffer.style.height = "1px";
        buffer.style.overflow = "hidden";
    }
    return buffer;
};

/**
 * Replaces the current editing image with a new one
 */
PXN8.replaceImage = function(imageurl)
{
    var _ = PXN8.dom;

    var buffer = PXN8.getImageBuffer();

    // clear the buffer
    _.cl(buffer);

    //
    // create a new image element with an id of 'pxn8_buffered_image'
    //
    var theImage = _.ce("img",{id: "pxn8_buffered_image"});

    //
    // add the image to the buffer
    //
    _.ac(buffer,theImage);

    //
    // wph 20070630 : tell the user that the photo is loading
    // there is no visual clue now because the photo is first loaded into a
    // non-visible buffer.
    //
    var timer = _.id("pxn8_timer");
    if (timer){
        timer.style.display = "block";
        _.ac(_.cl(timer),_.tx("Loading photo. Please wait..."));
    }

    //
    // add the onload listener *BEFORE* setting the source
    // so that the listener will get notified in IE.
    //

    var notified = false;
    var closure = {
        onload: function(){
            if (!notified){
                PXN8.imageLoadNotifier();
                notified = true;
            }
        }
    };
    //
    // ensure that either the .onload handler or the preferred onload event
    // handler gets called but don't want them stepping on each other's toes
    //
    PXN8.event.addListener(theImage,"load",closure.onload);
    theImage.onload = closure.onload;

    //
    // set the image's src attribute
    //
    theImage.src = imageurl;

    PXN8.show.size();


};

/*
 * Called when the AJAX request has returned
 */
PXN8.imageUpdateDone = function (jsonResponse)
{
	 var errorMsg = null;
    var _ = PXN8.dom;
	 var status = null;

	 if (PXN8.log){PXN8.log.trace("PXN8.imageUpdateDone(" + jsonResponse + ")"); }

    var targetDiv = _.id("pxn8_image_container");
    PXN8.response = jsonResponse;

    if (jsonResponse && jsonResponse.status == "OK"){
        //
        // store the entire response object in the list of responses
        //
        PXN8.responses[PXN8.opNumber] = jsonResponse;
        //
        // wph 20060513: Workaround for IE's over-aggressive
        // image caching.
        // see IE bugs # 4
        // http://www.sourcelabs.com/blogs/ajb/2006/04/rocky_shoals_of_ajax_developme.html
	     //
        if (document.all){
            //
            // wph 20070226 : The passed in JSON response may have been
            // cached. If it was then don't force the image to reload.
            //
            /*
             * wph 20070226 : I can no longer see a need for this
             * as the PXN8.replaceOnSave flag should be set to true
             * if the image is to be replaced with a new one.
             * This workaround may have been needed during development
             * but should not be required for production as the server-side
             * Pixenate code ensures each image has a unique ID.
             * (the case of between session changes is covered by the use
             *  of the PXN8.replaceOnSave flage - see PXN8.initialize()'s use of the
             *  'random' attribute in the first 'fetch' operation).
             *
             if (typeof jsonResponse["cached"] == "undefined"){
             jsonResponse.image += "?rnd=" + PXN8.randomHex();
             jsonResponse["cached"] = true;
             }
            */
        }
        //
        // prepend the PXN8 root path to the returned path
        //
        var newImageSrc = PXN8.server + PXN8.root + "/" + jsonResponse.image;
        //
        // delete the old pxn8_image element and add a new pxn8_image element
        //
        PXN8.replaceImage(newImageSrc);
    }else{
        status = PXN8.response;
        if (PXN8.response && typeof PXN8.response == "object")
		  {
            status = PXN8.response.status;

				errorMsg = "An error occurred while updating the image.\n" +
                "status: " + status + "\n" +
                "errorMessage: " + PXN8.response.errorMessage;
				if (PXN8.log){ PXN8.log.error(errorMsg); }

            alert(errorMsg);
        }else{
				errorMsg = "An error occurred while updating the image.\nstatus:" + status ;

				if (PXN8.log){ PXN8.log.error(errorMsg); }
            alert(errorMsg);
        }

        PXN8.listener.notify(PXN8.ON_IMAGE_ERROR);
        /**
         * wph 20070530 : Set PXN8.updating = false so that other tasks can be performed
         */
        PXN8.updating = false;
        // decrement the PXN8.opNumber variable !!!
        PXN8.opNumber--;

        //
        // hide the timer !!!
        //
        var timer = _.id("pxn8_timer");
        if (timer){
            timer.style.display = "none";
        }
    }

    //
    // mark as done
    //
    // wph 20070223: What if the image is large, takes a while to load but the user clicks
    // undo while the new image is loading ?
    //  Imagine the following scenario...
    //  user uploads a large image - PXN8.opNumber is 0
    //  user rotates the image - PXN8.opNumber is 1
    //  the server completes the rotate op and returns a JSON response pointing to the new image
    //  pixenate starts loading the new image
    //  image is large so loads slowly - user clicks 'undo' - PXN8.opNumber is 0
    //  ...but unknown to the user, the new images' onload method will still get called !
    //     the onload method replaces PXN8.images[PXN8.opNumber] with the new image data
    //     (pxn8.opNumber has been reset to 0) so the image that the user sees and the image
    //     which the pixenate UNDO/REDO model sees are different. Since the undo/redo mechanism
    //     relies on the user NOT clicking 'undo' / 'redo' until after the new image is loaded.
    //     In order for the current undo/redo mechanism to work, the operation must be
    //     LOCKED between firing the initial AJAX request and the image loading
    //     so instead of setting PXN8.updating to false when the AJAX request returns
    //     ( as I do here ), PXN8.updating should be set to false ONLY WHEN THE NEW IMAGE
    //     HAS LOADED !
    // PXN8.updating = false;

    //
    // everything from here on used to be in PXN8.priv.postImageLoad()
    //
    var theImage = _.id("pxn8_image");
    theImage.onerror = function(){
        alert(PXN8.strings.IMAGE_ON_ERROR1 + theImage.src + PXN8.strings.IMAGE_ON_ERROR2);
        PXN8.listener.notify(PXN8.ON_IMAGE_ERROR);
    };

    //
    // IE Bug: If an image with the same URL has already been loaded
    // then the onload method is never called - need to explicitly call the
    // onloadFunc method so that listeners get notified etc.
    //
    /*
     * wph 20070508 : see PXN8.imageLoadHousekeeping !
     *
     *
    if (PXN8.imagesBySrc[theImage.src]){
        onloadFunc();
    }else{
        theImage.onload = onloadFunc;
    }

    PXN8.show.zoom();
    */
};

/* ============================================================================
 *
 * FUNCTIONS TO DISPLAY IMAGE INFORMATION
 */
PXN8.show = {};

/**
 * display selection info
 */
PXN8.show.selection = function()
{
    var _ = PXN8.dom;

    var selectionField = _.id("pxn8_selection_size");
    if (selectionField){
        var text = "N/A";
        if (PXN8.ex - PXN8.sx > 0){
            text = (PXN8.ex-PXN8.sx) + "," + (PXN8.ey-PXN8.sy);
        }
        _.ac(_.cl(selectionField),_.tx(text));
    }
};

/**
 * display position info
 */
PXN8.show.position = function()
{
    var _ = PXN8.dom;

    var posInfo = _.id("pxn8_mouse_pos");
    if (posInfo){
        var text = PXN8.position.x + "," + PXN8.position.y;
        _.ac(_.cl(posInfo),_.tx(text));
    }
};

/**
 * display position info
 */
PXN8.show.zoom = function(t,v)
{
    var _ = PXN8.dom;

    var zoomInfo = _.id("pxn8_zoom");
    if (zoomInfo){
        var text = Math.round((PXN8.zoom.value() * 100)) + "%";
        _.ac(_.cl(zoomInfo),_.tx(text));
    }
};

/**
 * display size info
 */
PXN8.show.size = function ()
{
    var _ = PXN8.dom;
    var sizeInfo = _.id("pxn8_image_size");
    if (sizeInfo){
        var text = PXN8.image.width + "x" + PXN8.image.height;
        _.ac(_.cl(sizeInfo),_.tx(text));
    }
};

/**
 * Display a soft alert that disappears after a short time
 */
PXN8.show.alert = function (message,duration)
{
    var _ = PXN8.dom;

    duration = duration || 1000;

    var warning = _.id("pxn8_warning");
    if (!warning){
        warning = _.ce("div",{id: "pxn8_warning",className: "warning"});

		  // looks better if appended to end of canvas - photo isn't bumped down
		  //_.id("pxn8_canvas").insertBefore(warning,_.id("pxn8_image_container"));

		  _.ac(_.id("pxn8_canvas"),warning);
    }else{
		  //
		  // make sure it's visible - it might have been made invisible by a previous fadeout()
		  //
        warning.style.display = "block";
	 }
	 _.ac(_.cl(warning),_.tx(message));
	 // wph 20081205 - reset opacity to 100% - (might have been set to 0 by last fadeout() )
    _.opacity(warning,90);

    warning.style.width  = (PXN8.image.width>200?PXN8.image.width:200) + "px";

    setTimeout("PXN8.fade.init();PXN8.fade.fadeout('pxn8_warning',false);",duration);
};



/* ============================================================================
 *
 * Fade functions - make a HTML element fade in and out
 */

PXN8.fade = {
	values: [0.99,0.85, 0.70, 0.55, 0.40, 0.25, 0.10, 0],
	times:      [75, 75,  75,  75,  75,  75,  75,  75],
	i: 0,
	stopfadeout: false
};

PXN8.fade.init = function(){ var self = PXN8.fade; self.i =0; self.stopfadeout = false;};

PXN8.fade.cancel = function(){ var self = PXN8.fade; self.stopfadeout = true; };

PXN8.fade.fadeout = function(eltid,destroyOnFade)
{
    var _ = PXN8.dom;
    var self = PXN8.fade;

    if (self.stopfadeout){
        return;
    }
    _.opacity(eltid,self.values[self.i]);
    if (self.i < self.values.length -1 ){
        self.i++;
        setTimeout("PXN8.fade.fadeout('" + eltid + "'," + destroyOnFade + ");",self.times[self.i]);
    }else{
        if (destroyOnFade){
            var node = _.id(eltid);
            // it's quite possible that the element has already been destroyed !
            if (!node){
                return;
            }else{
                var parent = node.parentNode;
                parent.removeChild(node);
            }
        }else{
				//
				// wph 20081205 - just make it invisible
				//
				_.id(eltid).style.display = "none";
		  }
    }
};

PXN8.fade.fadein = function(eltid)
{
    var _ = PXN8.dom;
    var self = PXN8.fade;
    try{
        if (self.i >= self.values.length){
            self.i = self.values.length - 1;
        }
        _.opacity(eltid,self.values[self.i]);
        if (self.i > 0){
            self.i--;
            setTimeout("PXN8.fade.fadein('" + eltid + "');",self.times[self.i]);
        }
    }catch(e){
        alert(e.message);
    }
};

/**
 *
 */
PXN8.offsets = [];


/**
 * Add a new operation to the PXN8.history !
 * (called via PXN8.tools.updateImage() - do not call directly !).
 */
PXN8.addOperations = function(operations)
{
    var self = PXN8;

    //
    // must call getUncompressedImage() _BEFORE_ opNumber is incremented !
    // to get the corrected cachedImage value.
    //
    var cachedImage = self.getUncompressedImage();

    // increment opNumber just once
    self.opNumber++;

    self.offsets[self.opNumber] = operations.length;

    var lastIndex = 0;
    for (var i = 0;i < self.opNumber; i++){
        lastIndex += self.offsets[i];
    }

    // add each operation to the history member
    for (var i = 0;i < operations.length; i++){
        self.history[lastIndex + i] = operations[i];
    }

    self.maxOpNumber = self.opNumber;

    var script = PXN8.getScript();

    self.prepareForSubmit();

    self.ajax.submitScript(script,self.imageUpdateDone);

};
/**
 * wph 20070105
 * Adjust the current selection to snap to the aspect ratio if one is enforced.
 */
PXN8.snapToAspectRatio = function()
{
    var sel = PXN8.getSelection();
    //
    // say ratio is 5x3 and current selection is 400x280
    // the selection should be shrunk to 400x240
    // new height = (400/5) * 3;
    //
    // say ratio is 5x3 and current selection is 280x500
    // the selection should be shrunk to 280x168
    // new height = (280/5) * 3;
    //
    // say ratio is 3x5 and current selectin is 400x280
    // the selection should be shrunk to 168x280
    // new width = (280/5) * 3;
    //
    // etc...
    //
    if (PXN8.aspectRatio.width != 0){
        //
        // an aspect ratio is enforced
        //
        if (PXN8.aspectRatio.width > PXN8.aspectRatio.height){
            sel.height = Math.round((sel.width / PXN8.aspectRatio.width ) * PXN8.aspectRatio.height);
        }else{
            sel.width = Math.round((sel.height / PXN8.aspectRatio.height) * PXN8.aspectRatio.width);
        }
        PXN8.select(sel);
    }
};

/***************************************************************************

SECTION: Zooming : Variables and Related Functions
==================================================
The following variables and functions are used for zooming in and out.
Zooming (or magnification) only changes the appearance of the photo in the
browser and does not change the photo's real size.

***/


/**************************************************************************

PXN8.zoom
=========
PXN8.zoom is a namespace used by all of the zoom-related variables and functions.

***/
PXN8.zoom = {};


/***************************************************************************

PXN8.zoom.values
================
Users can zoom in and out of a photo by cycling through an array of predefined zoom values.
PXN8.zoom.values specifies the levels of magnification a user can cycle through.

Type
----
Array

Default Value
-------------
    [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2, 3, 4 ];

Related
-------
PXN8.zoom.index
***/

PXN8.zoom.values = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2, 3, 4 ];

/****************************************************************************

PXN8.zoom.index
===============
PXN8.zoom.index is an index into the (zero-based) array of PXN8.zoom.values.

Type
----
number

Default Value
-------------
    3
***/
PXN8.zoom.index = 3;

PXN8.zoom.zoomedBy = PXN8.zoom.values[PXN8.zoom.index];

/***************************************************************************

PXN8.zoom.value()
=================
Get the current magnification value in use. This is expressed as a float. e.g. 200% magnification
returns a value of 2.0

Returns
-------
A float value - the current magnification factor.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.zoomByIndex PXN8.zoom.toSize PXN8.zoom.zoomByValue

***/
PXN8.zoom.value = function()
{
    return PXN8.zoom.zoomedBy;
};
/***************************************************************************

PXN8.zoom.canZoomIn()
=====================
Indicates whether or not the image magnification can be increased any further.

Returns
-------
true or false.

Related
-------
PXN8.zoom.canZoomOut PXN8.zoom.zoomByIndex PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue

***/
PXN8.zoom.canZoomIn = function(){
    var self = PXN8.zoom;
    return self.zoomedBy < self.values[self.values.length-1];
};

/***************************************************************************

PXN8.zoom.canZoomOut()
======================
Indicates whether or not the image magnification can be decreased any further.

Returns
-------
true or false.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.zoomByIndex PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize

***/
PXN8.zoom.canZoomOut = function(){
    var self = PXN8.zoom;
    return self.zoomedBy > self.values[0];
};

/***************************************************************************

PXN8.zoom.zoomByIndex()
=======================
Zoom the photo to a magnification level at the specified index (see the
PXN8.zoom.values array for a list of magnification levels.

Parameters
----------

* index : The index into the PXN8.zoom.values array. E.g. PXN8.zoom.values has this value

     [0.25, 0.5, 0.75, 1.0, 1.5, 2]

The PXN8.zoom.zoomByIndex(2) will zoom the image to 75% (0.75 is the value a PXN8.zoom.values[2]).

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue

***/
PXN8.zoom.zoomByIndex = function(index)
{
    return PXN8.zoom.setIndex(index);
};

/***************************************************************************

PXN8.zoom.shrinkToWidth()
=======================
Zoom the photo to a magnification level such that the photo's width does not exceed the specified width.
The height will be adjusted accordingly. Note: This operation does not resize the photo permanently.
<b>If the photo's width is already less than the specified width then no action is taken.</b>

Parameters
----------

* width : The width to shrink the image to.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue PXN8.zoom.toWidth PXN8.zoom.expandToWidth PXN8.zoom.toHeight PXN8.zoom.shrinkToHeight PXN8.zoom.expandToHeight

***/
PXN8.zoom.shrinkToWidth = function(width)
{
	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.zoom.shrinkToWidth(width);
		  });
		  return;
	 }
	 var imgSize = PXN8.getImageSize();
	 if (imgSize.width > width){
		  PXN8.zoom.toWidth(width);
	 }
};
/***************************************************************************

PXN8.zoom.expandToWidth()
=======================
Zoom the photo to a magnification level such that the photo's width matches the specified width.
The height will be adjusted accordingly. Note: This operation does not resize the photo permanently.
<b>If the photo's width is already greater than the specified width then no action is taken.</b>

Parameters
----------

* width : The width to expand the image to.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue PXN8.zoom.toWidth PXN8.zoom.expandToWidth PXN8.zoom.toHeight PXN8.zoom.shrinkToHeight PXN8.zoom.expandToHeight

***/
PXN8.zoom.expandToWidth = function(width)
{
	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.zoom.expandToWidth(width);
		  });
		  return;
	 }
	 var imgSize = PXN8.getImageSize();
	 if (imgSize.width < width){
		  PXN8.zoom.toWidth(width);
	 }
};

/***************************************************************************

PXN8.zoom.expandToHeight()
=======================
Zoom the photo to a magnification level such that the photo's height matches the specified height.
The height will be adjusted accordingly. Note: This operation does not resize the photo permanently.
<b>If the photo's height is already greater than the specified height then no action is taken.</b>

Parameters
----------

* height : The height to expand the image to.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue PXN8.zoom.toWidth PXN8.zoom.expandToWidth PXN8.zoom.toHeight PXN8.zoom.shrinkToHeight PXN8.zoom.expandToHeight

***/
PXN8.zoom.expandToHeight = function(height)
{
	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.zoom.expandToHeight(height);
		  });
		  return;
	 }
	 var imgSize = PXN8.getImageSize();
	 if (imgSize.height < height){
		  PXN8.zoom.toHeight(height);
	 }
};

/***************************************************************************

PXN8.zoom.toWidth()
=======================
Zoom the photo to a magnification level such that the photo's width matches the specified width.
The height will be adjusted accordingly. Note: This operation does not resize the photo permanently.

Parameters
----------

* width : The width to set the image to.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue PXN8.zoom.toWidth PXN8.zoom.expandToWidth PXN8.zoom.toHeight PXN8.zoom.shrinkToHeight PXN8.zoom.expandToHeight

***/
PXN8.zoom.toWidth = function(width){
	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.zoom.toWidth(width);
		  });
		  return;
	 }
	 var imgSize = PXN8.getImageSize();
	 PXN8.zoom.setValue(width / imgSize.width);
};
/***************************************************************************

PXN8.zoom.toHeight()
=======================
Zoom the photo to a magnification level such that the photo's height matches the specified width.
The width will be adjusted accordingly. Note: This operation does not resize the photo permanently.

Parameters
----------

* height : The height to set the image to.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue PXN8.zoom.toWidth PXN8.zoom.toWidth PXN8.zoom.expandToWidth PXN8.zoom.shrinkToHeight PXN8.zoom.expandToHeight

***/
PXN8.zoom.toHeight = function(height){
	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.zoom.toHeight(height);
		  });
		  return;
	 }
	 var imgSize = PXN8.getImageSize();
	 PXN8.zoom.setValue(height / imgSize.height);

};
PXN8.zoom.setIndex = function(i)
{
    var self = PXN8.zoom;
    self.index = i;
    return self.setValue(self.values[i]);
};

PXN8.zoom.setValue = function(magnification)
{
    /**
     * wph 20070516 - zoom on a large image which hasn't yet fully loaded
     * will make the image disappear.
     */
	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.zoom.setValue(magnification);
		  });
		  return;
	 }
    var self = PXN8.zoom;
    self.zoomedBy = magnification;

    //
    // update the width and height of the image
    //
    var theImg = document.getElementById("pxn8_image");
    theImg.width = PXN8.image.width * magnification;
    theImg.height = PXN8.image.height * magnification;
    PXN8.listener.notify(PXN8.ON_ZOOM_CHANGE,magnification);
    return magnification;
};




/***************************************************************************

PXN8.zoom.zoomIn()
==================
Zoom in (Increase the magnification level) so the photo appears bigger.
The amount by which the magnification level increases depends on the values in the
*PXN8.zoom.values* array.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomByIndex PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue

***/
PXN8.zoom.zoomIn = function()
{
    var self = PXN8.zoom;
    if (self.canZoomIn())
    {
        for (var i = 0; i < self.values.length;i++){
            if (self.values[i] > self.zoomedBy){
                self.setIndex(i);
                break;
            }
        }

    }else{
        PXN8.show.alert(PXN8.strings.NO_MORE_ZOOMIN,500);
    }
    // return false in case this is called from a link
    return false;
};

/***************************************************************************

PXN8.zoom.zoomOut()
===================
Zoom out (Decrease the magnification level) so the photo appears smaller.
The amount by which the magnification level decreases depends on the values in the
*PXN8.zoom.values* array.

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomByIndex PXN8.zoom.zoomIn PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue

***/
PXN8.zoom.zoomOut = function()
{
    var self = PXN8.zoom;
    if (self.canZoomOut()){
        for (var i = self.values.length-1; i >= 0; i--){
            if (self.values[i] < self.zoomedBy){
                self.setIndex(i);
                break;
            }
        }
    }else{
        PXN8.show.alert(PXN8.strings.NO_MORE_ZOOMOUT,500);
    }
    return false;
};

/***************************************************************************

PXN8.zoom.toSize()
==================
Zoom the image to a fixed width and height.

Parameters
----------

* width : The width to zoom to.
* height: The height to zoom to.

Example
-------

To adjust the visible area of the photo (when it's first loaded) so that it's height is 500 Pixels high (and the width is also adjusted accordingly)

    PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD, function(){
       var img = document.getElementById("pxn8_image");
       var oh  = img.height;
       var ow = img.width;
       var nh = 800; // new height
       var ratio = oh / nh;
       var nw = ow / ratio;
       PXN8.zoom.toSize(nw,nh);
    });

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomByIndex PXN8.zoom.zoomIn PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByValue

***/
PXN8.zoom.toSize = function(width, height)
{
	 if (!PXN8.ready){
		  PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
				PXN8.zoom.toSize(width,height);
		  });
		  return;
	 }
    var hr = width / PXN8.image.width ;
    var vr = height / PXN8.image.height ;

    PXN8.zoom.setValue(Math.min(vr,hr));

    return false;
};

/***************************************************************************

PXN8.zoom.zoomByValue()
=======================
Zoom the photo to a magnification level.

Parameters
----------

* value : The magnification value

The PXN8.zoom.zoomByValue(2) will zoom the image to 200% .

Related
-------
PXN8.zoom.canZoomIn PXN8.zoom.canZoomOut PXN8.zoom.zoomIn PXN8.zoom.zoomOut PXN8.zoom.value PXN8.zoom.toSize PXN8.zoom.zoomByIndex

***/
PXN8.zoom.zoomByValue = function(magnification)
{
    PXN8.zoom.setValue(magnification);
};




/* ============================================================================
 *
 * PRIVATE FUNCTIONS and members internal to PXN8 only - do not call from client code
 */


PXN8.browser = {};
PXN8.browser.isIE6 = function()
{
    return window.navigator.userAgent.indexOf("MSIE 6") > -1;
};

/**
 * history stores all session operations
 */
PXN8.history =  [];

/**
 * An array of the response images returned from the server
 * This array contains relative file paths.
 * It is updated in the  imageUpdateDone() function.
 */
PXN8.responses =  [];

/**
 * images stores a list of all images indexed by opNumber
 * (used by PXN8.tools.history)
 */
PXN8.images =  [];

/**
 * A flag which is set when the image has fully loaded
 */
PXN8.ready = false;

/*
 * The current image - it's width; height and location (URL)
 */
PXN8.image =   {
    width: 0,
    height: 0,
    location: ""
};

PXN8.priv = {
};

PXN8.priv.addImageToHistory = function(imageLocation)
{
    var item = {"location": imageLocation,
                "width": PXN8.image.width,
                "height": PXN8.image.height
    };

    PXN8.images[PXN8.opNumber] = item;

    //
    // wph 20070223 : see comments in imageUpdateDone()
    //
    PXN8.updating = false;

};

/**
 * Create the selection area if it's not already defined.
 */
PXN8.priv.createSelectionRect = function()
{
    var _ = PXN8.dom;
    var selectRect = _.id("pxn8_select_rect");
    if (!selectRect){
        var canvas = _.id("pxn8_canvas");
        selectRect = _.ac(canvas, _.ce("div", {id: "pxn8_select_rect"}));
        selectRect.style.backgroundColor = "white";
        _.opacity(selectRect,0);
        selectRect.style.cursor = "move";
        selectRect.style.borderWidth  = "1px";
        selectRect.style.borderColor = "red";
        selectRect.style.borderStyle = "dotted";
        selectRect.style.position = "absolute";
        selectRect.style.zIndex = 1;
        selectRect.style.fontSize = "0px";
        selectRect.style.display = "block";
        selectRect.style.width = "0px";
        selectRect.style.height = "0px";
    }
    selectRect.onmousedown = function(event){
        if (!event) event = window.event;
        PXN8.drag.begin(selectRect,event,
                        PXN8.drag.moveSelectionBoxHandler,
                        PXN8.drag.upSelectionBoxHandler);
    };
    return selectRect;
};
/**
 * check every interval milliseconds for a condition
 * if it's true execute the callback, otherwise put itself back on the queue.
 */
PXN8.when = function (condition, callback, interval)
{
    if (!condition()){
        setTimeout(function(){PXN8.when(condition,callback,interval);},interval);
    }else{
        callback();
    }
};

PXN8.whenReady = function(callback)
{
	 var condition = function(){
		  return PXN8.ready;
	 };
	 PXN8.when(condition,callback,50);
};
/**
 * A private function called when the image has loaded.
 * This function in turn calls all of the PXN8.ON_IMAGE_LOAD listeners
 */
PXN8.imageLoadNotifier = function()
{
	 //
	 // wph 20080828 Don't notify listeners until PXN8.ready is true
	 //
    PXN8.when(

		  // when this condition is true...
		  function(){ return PXN8.ready; },

		  // .. do the following...
		  function(){ PXN8.listener.notify(PXN8.ON_IMAGE_LOAD); },

		  50
	 );
};

PXN8.onCanvasMouseDown = function(event){
    if (!event) event = window.event;
	 PXN8.drag.begin(document.getElementById("pxn8_canvas"),
		  event,
        PXN8.drag.moveCanvasHandler,
        PXN8.drag.upCanvasHandler);
};
/*
 * Sets up the mouse handlers for the canvas area
 * Some tools/operations might modify the canvas mouse behaviour
 * If they do so then they should call this method when the tool's
 * work is done or cancelled.
 */
PXN8.initializeCanvas = function()
{
    var _ = PXN8.dom;

    var canvas = _.id("pxn8_canvas");

    canvas.onmousemove = function (event){
        if (!event) event = window.event;
	     var cursorPos = _.cursorPos(event);
        var imagePoint = PXN8.mousePointToElementPoint(cursorPos.x, cursorPos.y);
        PXN8.position.x = imagePoint.x;
        PXN8.position.y = imagePoint.y;
        PXN8.show.position();
        return true;
    };

    canvas.onmouseout = function (event){
        if (!event) event = window.event;
        PXN8.position.x = "-";
        PXN8.position.y = "-";
        PXN8.show.position();
    };
    canvas.onmousedown = PXN8.onCanvasMouseDown;

    canvas.ondrag = function(){
        return false;
    };

    var computedCanvasStyle = _.computedStyle("pxn8_canvas");

    var canvasPosition = null;

    if (computedCanvasStyle.getPropertyValue){
        canvasPosition = computedCanvasStyle.getPropertyValue("position");
    }else{
        if (!computedCanvasStyle.position){
            // position may not be available if
            // computedStyle returns the inline style (on safari).
            //
            canvasPosition = "static";
        }else{
            canvasPosition = computedCanvasStyle.position;
        }
    }

    if (!canvasPosition || canvasPosition == "static"){
        // default the canvas position to relative
        canvas.style.position = "relative";
        canvas.style.top = "0px";
        canvas.style.left  = "0px";
    }
    //
    // the canvas should wrap tightly around the image
    // so that the canvas doesn't extend beyond the image,
    // set it's float css property if it hasn't already been set.
    //
    var floatProperty = "cssFloat";
    if (document.all){
        floatProperty = "styleFloat";
    }
    var floatValue = computedCanvasStyle[floatProperty];

    if (!floatValue || floatValue == "none"){
        canvas.style[floatProperty] = "left";
    }

    return canvas;
};

/*
 * END OF DECLARATIONS SECTION
 * ============================================================================
 */

PXN8.listener.add(PXN8.ON_IMAGE_CHANGE, PXN8.show.zoom);
PXN8.listener.add(PXN8.ON_ZOOM_CHANGE, PXN8.show.zoom);

