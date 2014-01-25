/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 * This file contains code to draw and manage the resize handles that
 * appear on the selection box.
 *
 */
var PXN8 = PXN8 || {};

/**************************************************************************

SECTION: Selection Area Resizing
================================
The behaviour of the selection area can be modified using a single function
which turns on or off the resize handles which appear at the sides and corners of
the selected area.

***/

/* ============================================================================
 *
 * Resizing code makes extensive use of 'currying' (functions that return
 * functions with variables 'baked in'. If not for currying, this code would
 * be way too long and repetitive.
 * walter higgins
 * 3 February 2006
 *
 */
PXN8.resize = {
    dx: 0,
    dy: 0,
    start_width: 0,
    start_height: 0
};

PXN8.resize.canResizeNorth = function(yOffset){
    return (PXN8.sy + yOffset < (PXN8.ey-PXN8.style.resizeHandles.size)) && (PXN8.sy + yOffset > 0);
};

PXN8.resize.canResizeWest = function(xOffset){
    return (PXN8.sx + xOffset < (PXN8.ex-PXN8.style.resizeHandles.size)) && (PXN8.sx + xOffset > 0);
};


PXN8.resize.canResizeSouth = function(yOffset){
    return (PXN8.ey + yOffset > (PXN8.sy+PXN8.style.resizeHandles.size)) && (PXN8.ey + yOffset < PXN8.image.height);
};


PXN8.resize.canResizeEast = function(xOffset){
    return (PXN8.ex + xOffset > (PXN8.sx+PXN8.style.resizeHandles.size)) && (PXN8.ex + xOffset < PXN8.image.width);
};


PXN8.resize.nTest = function(xOffset,yOffset,event){

    //if (PXN8.resize.canResizeNorth(yOffset) && PXN8.aspectRatio.width == 0)        // PXN8.sy > 0
    if (PXN8.resize.canResizeNorth(yOffset) )        // PXN8.sy > 0
    {
        PXN8.resize.dy = event.clientY;
        PXN8.sy = Math.round(PXN8.sy + yOffset);
        return true;

    }
    return false;
};


PXN8.resize.sTest = function(xOffset,yOffset,event){

    //if (PXN8.resize.canResizeSouth(yOffset)  && PXN8.aspectRatio.width == 0)
    if (PXN8.resize.canResizeSouth(yOffset))
    {
        PXN8.resize.dy = event.clientY;
        PXN8.ey = Math.round(PXN8.ey + yOffset);
        return true;
    }
    return false;
};


PXN8.resize.wTest = function(xOffset,yOffset,event){

    //if (PXN8.resize.canResizeWest(xOffset)  && PXN8.aspectRatio.width == 0)        // PXN8.sx > 0
    if (PXN8.resize.canResizeWest(xOffset))        // PXN8.sx > 0
    {
        PXN8.resize.dx = event.clientX;
        PXN8.sx = Math.round(PXN8.sx + xOffset);
        return true;
    }
    return false;
};


PXN8.resize.eTest = function(xOffset,yOffset,event){

    //if (PXN8.resize.canResizeEast(xOffset) && PXN8.aspectRatio.width == 0)
    if (PXN8.resize.canResizeEast(xOffset))
    {
        PXN8.resize.dx = event.clientX;
        PXN8.ex = Math.round(PXN8.ex + xOffset);
        return true;
    }
    return false;
};


PXN8.resize.nwTest = function(xOffset,yOffset,event){
    if (xOffset == 0 || yOffset == 0){
        return false;
    }
    var hr = PXN8.resize.start_height/PXN8.resize.start_width;
    var wr = 1 / hr;

    if (wr > hr){
        xOffset = yOffset * wr;
    }else if (wr < hr){
        yOffset = xOffset * hr;
    }else{
        yOffset = xOffset;
    }
    //
    // for NW corner
    // ensure both offsets are either negative or positive
    //
    if (xOffset > 0){
        // make Y positive if not already
        yOffset = Math.abs(yOffset);
    }else{
        // make y negative if not already
        yOffset = 0 - Math.abs(yOffset);
    }
    if (PXN8.resize.canResizeWest(xOffset) && PXN8.resize.canResizeNorth(yOffset))
    {
        PXN8.resize.dx = event.clientX;
        PXN8.resize.dy = event.clientY;
        PXN8.sx = Math.round(PXN8.sx + xOffset);
        PXN8.sy = Math.round(PXN8.sy + yOffset);
        return true;
    }
    return false;
};


PXN8.resize.swTest = function(xOffset,yOffset,event) {
    if (xOffset == 0 || yOffset == 0){
        return false;
    }
    var hr = PXN8.resize.start_height/PXN8.resize.start_width;
    var wr = 1 / hr;

    if (wr > hr){
        yOffset = xOffset * wr;
    }else{
        yOffset = xOffset;
    }

    //
    // for SW corner
    // ensure offset are +/-
    //
    if (xOffset > 0){
        // make Y negative if X is positive
        yOffset = 0 - Math.abs(yOffset);
    }else{
        // make y positive if X is negative
        yOffset = Math.abs(yOffset);
    }
    if (PXN8.resize.canResizeWest(xOffset) && PXN8.resize.canResizeSouth(yOffset))
    {
        PXN8.resize.dx = event.clientX;
        PXN8.resize.dy = event.clientY;
        PXN8.sx = Math.round(PXN8.sx + xOffset);
        PXN8.ey = Math.round(PXN8.ey + yOffset);
        return true;
    }
    return false;
};


PXN8.resize.neTest = function(xOffset,yOffset,event) {
    if (xOffset == 0 || yOffset == 0){
        return false;
    }
    var hr = PXN8.resize.start_height/PXN8.resize.start_width;
    var wr = 1 / hr;

    if (wr > hr){
        xOffset = yOffset * wr;
    }else{
        xOffset = yOffset;
    }
    //
    // for NE corner
    // ensure offset are +/-
    //
    if (yOffset > 0){
        // make Y negative if X is positive
        xOffset = 0 - Math.abs(xOffset);
    }else{
        // make y positive if X is negative
        xOffset = Math.abs(xOffset);
    }
    if (PXN8.resize.canResizeEast(xOffset) && PXN8.resize.canResizeNorth(yOffset))
    {
        PXN8.resize.dx = event.clientX;
        PXN8.resize.dy = event.clientY;
        PXN8.ex = Math.round(PXN8.ex + xOffset);
        PXN8.sy = Math.round(PXN8.sy + yOffset);

        return true;
    }
    return false;
};


PXN8.resize.seTest = function(xOffset,yOffset,event) {
    if (xOffset == 0 || yOffset == 0){
        return false;
    }
    var hr = PXN8.resize.start_height/PXN8.resize.start_width;
    var wr = 1 / hr;

    if (wr > hr){
        xOffset = yOffset * wr;
    }else{
        yOffset = xOffset;
    }
    //
    // for SE corner
    // ensure offsets are both + or -
    //
    if (xOffset > 0){
        // make Y positive if X is positive
        yOffset = Math.abs(yOffset);
    }else{
        // make y negative if X is negative
        yOffset = 0 - Math.abs(yOffset);
    }
    if (PXN8.resize.canResizeEast(xOffset) && PXN8.resize.canResizeSouth(yOffset))
    {
        PXN8.resize.dx = event.clientX;
        PXN8.resize.dy = event.clientY;
        PXN8.ex = Math.round(PXN8.ex + xOffset);
        PXN8.ey = Math.round(PXN8.ey + yOffset);
        return true;
    }
    return false;
};


PXN8.resize.stopResizing = function(event){

    if (!event) event = window.event ; /* IE */

    if (document.removeEventListener){
        document.removeEventListener("mouseup",PXN8.resize.stopResizing,true);
        for (var i in PXN8.resize.handles){
            if (typeof PXN8.resize.handles[i] != "function"){
                document.removeEventListener("mousemove",PXN8.resize.handles[i].moveHandler, true);
            }
        }

    }else if (document.detachEvent){
        document.detachEvent("onmouseup",PXN8.resize.stopResizing);
        for (var i in PXN8.resize.handles){
            if (typeof PXN8.resize.handles[i] != "function"){
                document.detachEvent("onmousemove",PXN8.resize.handles[i].moveHandler);
            }
        }
    }
    if (event.stopPropogation) event.stopPropogation(); /*  DOM Level 2 */
    else event.cancelBubble = true; /* IE */

    PXN8.listener.notify(PXN8.ON_SELECTION_COMPLETE);

};


    /**
     * Returns a handler that get's called when the user
     * mouses-down on one of the resize handlers
     */
PXN8.resize.startResizing = function(hdlr){
    var result = function(event){

        if (!event) event = window.event;

        PXN8.resize.dx = event.clientX;
        PXN8.resize.dy = event.clientY;

        var sel = PXN8.getSelection();

        PXN8.resize.start_height = sel.height;
        PXN8.resize.start_width = sel.width;

        if (document.addEventListener){
            document.addEventListener("mousemove", hdlr, true);
            document.addEventListener("mouseup", PXN8.resize.stopResizing, true);
        }else if (document.attachEvent){
            document.attachEvent("onmousemove",hdlr);
            document.attachEvent("onmouseup",PXN8.resize.stopResizing);
        }
        if (event.stopPropogation){
            event.stopPropogation();/* DOM Level 2 */
        }else {
            event.cancelBubble = true; /* IE */
        }

        if (event.preventDefault){
            event.preventDefault(); /* DOM Level 2 */
        }else {
            event.returnValue = false; /*  IE */
            }


    };
    return result;
};


PXN8.resize.createResizeHandle = function(direction,size,color) {
    var result = document.createElement("div");
    result.id = direction + "_handle";
    result.style.backgroundColor = color;
    result.style.position = "absolute";
    result.style.width = size + "px";
    result.style.height = size + "px";
    result.style.overflow = "hidden"; // fixes IE
    result.style.zIndex = 999;
    result.style.cursor = direction + "-resize";
    result.onmousedown = PXN8.resize.startResizing(PXN8.resize.handles[direction].moveHandler);
    result.ondrag = function(){return false;};
    return result;
};


PXN8.resize.positionResizeHandles = function() {
    var dom = PXN8.dom;

    var sel = PXN8.getSelection();

    if (sel.width == 0){
        PXN8.resize.hideResizeHandles();
        return;
    }
    var zoom = PXN8.zoom.value();
    var rhsz = PXN8.style.resizeHandles.size;
    var rhsm = PXN8.style.resizeHandles.smallsize;

    var canvas = dom.id("pxn8_canvas");

    for (var i in PXN8.resize.handles){

        if (typeof (PXN8.resize.handles[i]) == "function"){
            continue;
        }

        var handle = dom.id( i + "_handle");
        if (!handle){
            handle = PXN8.resize.createResizeHandle(i, rhsz, PXN8.style.resizeHandles.color);
            dom.ac(canvas,handle);
        }
        if (handle.style.display == "none"){
            handle.style.display = "block";
        }
        PXN8.resize.handles[i].position(handle,sel);
    }
};

PXN8.resize.hideResizeHandles = function(hdls) {
    var dom = PXN8.dom;

    if (hdls){
        for (var i =0; i < hdls.length;i++){
            var handle = dom.id( i + "_handle");
            if (handle){
                handle.style.display = "none";
            }
        }
    }else{
        // hide all
        for (var i in PXN8.resize.handles){
            if (typeof (PXN8.resize.handles[i]) == "function"){
                continue;
            }

            var handle = dom.id( i + "_handle");
            if (handle){
                handle.style.display = "none";
            }
        }
    }
};



PXN8.resize.resizer = function( testFunc )
{
    var result = function(event){

        if (!event) event = window.event;
        var rdy = event.clientY - PXN8.resize.dy;
        var rdx = event.clientX - PXN8.resize.dx;
        /*
         * sane resizing when zoomed
         */
        var prdy = Math.round(rdy / PXN8.zoom.value());
        var prdx = Math.round(rdx / PXN8.zoom.value());

        if (prdx == 0 && prdy == 0){
            // do nothing
        }else{
            //
            // testFunc will likely change the selection
            //
            if (testFunc(prdx,prdy,event) == true){
                //
                // snap to aspect ratio
                //
                PXN8.snapToAspectRatio();
                PXN8.listener.notify(PXN8.ON_SELECTION_CHANGE,PXN8.getSelection());
            }
        }

        if (event.stopPropogation) event.stopPropogation(); /* DOM Level 2 */
        else event.cancelBubble = true; /* IE */
    };
    return result;
};


/**
 * All of the resize handles are defined here
 */
PXN8.resize.handles = {
    "n":  { moveHandler: PXN8.resize.resizer(PXN8.resize.nTest),
            position: function(handle,sel){
                var sel_rect = PXN8.dom.eb("pxn8_select_rect");
                handle.style.left = sel_rect.x + Math.ceil(sel_rect.width/2) - (PXN8.style.resizeHandles.size/2) + "px";
                handle.style.top = sel_rect.y + "px";
            }
    },
    "s":  { moveHandler: PXN8.resize.resizer(PXN8.resize.sTest),
            position: function(handle,sel){
                var sel_rect = PXN8.dom.eb("pxn8_select_rect");
                handle.style.left = sel_rect.x + Math.ceil(sel_rect.width/2) - (PXN8.style.resizeHandles.size/2) + "px";
                handle.style.top = Math.round(((sel.top + sel.height) * PXN8.zoom.value()) - PXN8.style.resizeHandles.size) + "px";
            }
    },
    "e":  { moveHandler: PXN8.resize.resizer(PXN8.resize.eTest),
            position: function(handle,sel){
                var sel_rect = PXN8.dom.eb("pxn8_select_rect");
                handle.style.left = Math.round(((sel.left + sel.width) * PXN8.zoom.value()) - PXN8.style.resizeHandles.size) + "px";
                //handle.style.left = (sel_rect.x + sel_rect.width - PXN8.style.resizeHandles.size) + "px";
                handle.style.top = sel_rect.y + Math.ceil(sel_rect.height / 2) - (PXN8.style.resizeHandles.size / 2) + "px";
                //handle.style.top = Math.round((sel.top + (sel.height/2) - (PXN8.style.resizeHandles.size /2 )) * PXN8.zoom.value()) + "px";
            }
    },
    "w":  { moveHandler: PXN8.resize.resizer(PXN8.resize.wTest),
            position: function(handle,sel){
                var sel_rect = PXN8.dom.eb("pxn8_select_rect");
                //handle.style.left = Math.round(sel.left * PXN8.zoom.value()) + "px";
                //handle.style.top = Math.round((sel.top + (sel.height/2) - (PXN8.style.resizeHandles.size /2 )) * PXN8.zoom.value()) + "px";
                handle.style.top = sel_rect.y + Math.ceil(sel_rect.height / 2) - (PXN8.style.resizeHandles.size / 2) + "px";
                handle.style.left = sel_rect.x + "px";
            }
    },
    "nw": { moveHandler: PXN8.resize.resizer(PXN8.resize.nwTest),
            position: function(handle,sel){
                handle.style.left = Math.round(sel.left * PXN8.zoom.value()) + "px";
                handle.style.top = Math.round((sel.top * PXN8.zoom.value())) + "px";
            }
    },
    "sw": { moveHandler: PXN8.resize.resizer(PXN8.resize.swTest),
            position: function(handle,sel){
                handle.style.left = Math.round(sel.left * PXN8.zoom.value()) + "px";
                handle.style.top = Math.round(((sel.top + sel.height) * PXN8.zoom.value()) - PXN8.style.resizeHandles.size) + "px";
            }
    },
    "ne": { moveHandler: PXN8.resize.resizer(PXN8.resize.neTest),
            position: function(handle,sel){
                handle.style.left = Math.round(((sel.left + sel.width) * PXN8.zoom.value()) - PXN8.style.resizeHandles.size) + "px";
                handle.style.top = Math.round((sel.top * PXN8.zoom.value())) + "px";
            }
    },
    "se": { moveHandler: PXN8.resize.resizer(PXN8.resize.seTest),
            position: function(handle,sel){
                handle.style.left = Math.round(((sel.left + sel.width) * PXN8.zoom.value()) - PXN8.style.resizeHandles.size) + "px";
                handle.style.top = Math.round(((sel.top + sel.height) * PXN8.zoom.value()) - PXN8.style.resizeHandles.size) + "px";
            }
    }
};

/**************************************************************************
PXN8.resize.enable()
====================
Enable or disable the resize handles which appear at the corners and sides of the selected
area.

Parameters
----------
* handles : An array of handles to enable or disable.
* enabled : A boolean specifying whether to enable or disable the supplied handles.

Examples
--------
To disable (hide) all of the handles...

    PXN8.resize.enable(["n","s","e","w","nw","ne","sw","se"],false);

To enable the side handles...

    PXN8.resize.enable(["n","s","e","w"],true);

<img src="pigeon300x225resizehandles.jpg"/>

***/
PXN8.resize.enable = function(handles, enable)
{
    var source = PXN8.resize.handles;
    var target = PXN8.resize.handle_store;
    var display = "none";
    var dom = PXN8.dom;


    if (enable){
        source = PXN8.resize.handle_store;
        target = PXN8.resize.handles;
        dispay = "block";
    }

    for (var i = 0; i < handles.length; i++){
        var handle = handles[i];

        var hdl = source[handle];
        delete source[handle];


        if (hdl){
            target[handle] = hdl;
            var handle_element = dom.id( handle + "_handle");

            if (handle_element){
                handle_element.parentNode.removeChild(handle_element);

                //handle_element.style.dispay = display;
            }
        }
    }

    PXN8.resize.positionResizeHandles();

};

PXN8.resize.handle_store = {};

/** ============================================================================
 *
 */
PXN8.listener.add(PXN8.ON_SELECTION_CHANGE, PXN8.resize.positionResizeHandles);
PXN8.listener.add(PXN8.ON_ZOOM_CHANGE, PXN8.resize.positionResizeHandles);
