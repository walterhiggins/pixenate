/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 * This file contains code which handles event managment
 *
 */
var PXN8 = PXN8 || {};


/***************************************************************************

SECTION: DOM Event handling Wrapper functions
=============================================
The following section details some DOM-related event-handling functions used by
Pixenate.

***/

PXN8.event = {};
PXN8.event._added = [];

/**************************************************************************

PXN8.event.addListener()
========================
A cross-browser way to add event listeners - works with Safari, Internet Explorer and Firefox.

Parameters
----------
* element : The element (or the ID of the element) to which the event listener will be added.
* eventType : The event type string e.g. "mouseup","mousedown","click","keypress" etc.
* eventHandler :  The function which will be called when the event fires.

Returns
-------
The callback function which was supplied as an argument.

Examples
--------
    var onButtonClick = PXN8.event.addListener(document.getElement("myButton"),"click",function(event){
       event = event || window.event;
       alert("You clicked the button!");
    });

Related
-------
PXN8.event.removeListener()

***/
PXN8.event.addListener = function(el,eventstr,func){

    if (typeof el == 'string'){ el = PXN8.dom.id(el); }

    if (el.addEventListener){
        el.addEventListener(eventstr,func,true);
    }else if (el.attachEvent){
        el.attachEvent("on" + eventstr,func);
    }

    var record = {"element": el, "event": eventstr, "listener": func};
    PXN8.event._added.push(record);
    return func;
};

/*************************************************************************

PXN8.event.removeListener()
===========================
A cross-browser way to remove event listeners - works with Safari, Internet Explorer and Firefox.

Parameters
----------
* element : The element (or the ID of the element) from which the event listener will be removed.
* eventType : The event type string e.g. "mouseup","mousedown","click","keypress" etc.
* eventHandler : The callback to be removed (must be a named function or a function reference - see PXN8.event.addListener)

Examples
--------
To remove a named function from the list of listeners for an event on a particular element...

    PXN8.event.removeListener(document.getElementById("myButton"),"click",onButtonClick);

Related
-------
PXN8.event.addListener()

***/
PXN8.event.removeListener = function(el,eventstr,func){

    if (typeof el == 'string'){ el = PXN8.dom.id(el);}

    if (func){
        PXN8.event._removeListener(el,eventstr,func);
    } else {
        // if no func is supplied then remove ALL listeners of this type
        // from the element
        var original = PXN8.event._added;
        var removed = false;
        for (var i =0; i < original.length; i++){
            var record = original[i];
            if (record){
                if (record.eventstr == eventstr && record.element == el){
                    PXN8.event._removeListener(el,eventstr,record.listener);
                    original[i] = null;
                    removed = true;
                }
            }
        }
        if (!removed){ return ;}
        /**
         * Clear out any null elements from _added (not safe to do this in above loop).
         */
        var temp = [];
        for (var i = 0;i < original.length;i++){
            if (original[i] != null){
                temp.push(original[i]);
            }
        }
        PXN8.event._added = temp;
    }
};

PXN8.event._removeListener =  function(el,eventstr,func){

    if (typeof el == 'string'){ el = PXN8.dom.id(el); }

    if (el.removeEventListener){
        el.removeEventListener(eventstr,func,true);
    }else if (el.detachEvent){
        el.detachEvent("on" + eventstr,func);
    }
};


/**
 * PXN8.event.closure creates an event closure
 * Parameters: object The object to be baked into the event handler
 * func - The event handler (a function)
 * The closure returned will take 4 parameters...
 * object: The object that has been baked in.
 * source: The HTML element that triggered the event
 * event: The event which triggered the function call.
 * caller: The closure itself - this will not be the same as the function passed into PXN8.event.closure.
 */
PXN8.event.closure = function(object,func){
    return function(event){
        event = event || window.event;
        var source = (window.event) ? event.srcElement : event.target;
        func(event,object,source,arguments.callee);
    };
};

/**
 * Creates an event handler where the source, and event are guaranteed to be present and correct
 * It does things like normalizing the event (removing IE & firefox discrepancies)
 */
PXN8.event.normalize = function(func){
    return function(event){
        event = event || window.event;
        var source = (window.event) ? event.srcElement : event.target;
        func(event,source,arguments.callee);
    };
};


/**
 * Bind event-handling behaviour to all elements of a particular class
 */
PXN8.behaviour = {

    bind: function(className,behaviourObject){
        var elements = PXN8.dom.clz(className);
        for (var i = 0;i < elements.length; i++)
        {
            for (var j in behaviourObject){
                PXN8.event.addListener(elements[i],j,behaviourObject[j]);
            }
        }
    }
};
