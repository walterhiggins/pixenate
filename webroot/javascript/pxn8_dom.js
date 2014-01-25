/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2010
 * All rights reserved.
 *
 * This file contains code for manipulating the DOM (document object model)
 */
var PXN8 = PXN8 || {};
/**************************************************************************

SECTION: DOM manipulation utility Functions
===========================================
Pixenate uses a number of the following DOM manipulation functions which can
be used independently of Pixenate.
***/

PXN8.dom = {
    /**
     * Computing the style is expensive.
     * cache computation results here.
     */
    cachedComputedStyles: {}
};

/***************************************************************************

PXN8.dom.cl()
=============
Remove all child nodes from the specified element. This method repeated calls
Element.removeChild(Element.firstChild) until there are no children left.

Parameters
----------
* element : A HTML Element or the element's id attribute value.

Returns
-------
element. The element which was passed in.

Examples
--------
    var el = PXN8.dom.cl(document.getElementById("myElement"));
    // this is equivalent to...
    var el = PXN8.dom.cl("myElement");

Related
-------
PXN8.dom.ac PXN8.dom.ce PXN8.dom.id

***/
PXN8.dom.cl = function(elt)
{
    if (typeof elt == 'string'){ elt = PXN8.dom.id(elt); }
    if (!elt) return false;
    while (elt.firstChild){ elt.removeChild(elt.firstChild);}
    return elt;
};

/***************************************************************************

PXN8.dom.tx()
=============
A convenience function which is shorthand for document.createTextNode().

Parameters
----------
* string : The text from which to create a new TextNode.

Returns
-------
The newly created TextNode object.

Example
-------
     var tn = PXN8.dom.tx("Hello World");
     document.body.appendChild(tn);

Related
-------
PXN8.dom.ac PXN8.dom.ce

***/
PXN8.dom.tx = function(str){ return document.createTextNode(str);};

/***************************************************************************

PXN8.dom.id()
=============
A Convenience function which is shorthand for document.getElementById()

Parameters
----------
* string : The id attribute of the element to return.

Returns
-------

The DOM Element object which has the matching id attribute. If no match is found
then *null* is returned instead.

Example
-------
    example: var el = PXN8.dom.id("myElementId");

***/
PXN8.dom.id = function(str){ return document.getElementById(str);};

/**************************************************************************

PXN8.dom.ce()
=============

Description
-----------
A convenience function which is shorthand for document.createElement(). This function also
allows you to set attributes for the element.

Parameters
----------
* nodeType
The nodename of the type of element you want to create, for example,
if you want to create an *img* element then the nodename will be 'img'.

* attributes (optional)
An object whose properties are the attribute/value pairs for the new element.

Returns
-------
The newly created DOM Element object.

Example
-------
     // create an image with src attribute = "myimage.jpg" and a 4 pixel border.
     var img = PXN8.dom.ce("img", { src: "myimage.jpg" border: 4});

Related
-------
PXN8.dom.ac

***/
PXN8.dom.ce = function(nodeType,attrs)
{
    var el = document.createElement(nodeType);
    for (var i in attrs){ el[i] = attrs[i];}
    return el;
};

/***************************************************************************

PXN8.dom.css()
=============
A convenience function for specifying multiple CSS properties for an element

Parameters
----------
* elt
The element to which the css properties will be applied
* attrs
The attributes (CSS properties) to apply

Returns
-------
The element

Example
-------
    // make the #palette DIV's background blue and it's font size 18px
    PXN8.dom.css("palette", { backgroundColor: "blue", fontSize: "18px" });

Related
-------
PXN8.dom.ce

***/
PXN8.dom.css = function(elt,attrs)
{
	 var i;
    if (typeof elt == 'string'){ elt = PXN8.dom.id(elt); }
	 for (i in attrs){
		  elt.style[i] = attrs[i];
	 }
	 return elt;
};
/***************************************************************************

PXN8.dom.ac()
=============
A convenience function which is shorthand for Element.appendChild().

Parameters
----------
* parent
The parent element to which the child element will be appended.
* child
The child element to append.

Returns
-------
The newly appended *child* DOM Element object.

Example
-------
    var address = document.getElementById("address");
    var user = document.getElementById("user");
    PXN8.dom.ac(user,address);
    // the 'address' is now a child element of the 'user' element

Related
-------
PXN8.dom.ce

***/
PXN8.dom.ac = function(parent,child)
{
    if (typeof parent == 'string'){ parent = PXN8.dom.id(parent); }
    if (typeof child == 'string'){ child = PXN8.dom.id(child); }
    if (!parent || !child){ return false; }

    parent.appendChild(child);
    return child;
};

/***************************************************************************

PXN8.dom.eb()
=============
Get the Bounds (size and coordinates) of an element on the page.

Parameters
----------
* element : An Element Object or the element's id attribute.

Returns
-------
The element bounds for an element. Bounds are in the form of an object with the following
properties... *x*, *y*, *width*, *height*

Example
-------
     var bounds = PXN8.dom.eb("myElementId");
     // bounds = {x: 48, y: 105, width: 200, height: 120}

Related
-------
PXN8.dom.ep PXN8.dom.cursorPos PXN8.dom.windowSize

***/
PXN8.dom.eb = function(elt)
{
    if (typeof elt == 'string'){ elt = PXN8.dom.id(elt); }
    if (!elt){ return false; }

    var x = null;
    var y = null;

    if(elt.style.position == "absolute")
    {
        x = parseInt(elt.style.left);
        y = parseInt(elt.style.top);
    } else {
        var pos = this.ep(elt);
        x = pos.x;
        y = pos.y;
    }
    return {x: x, y: y, width: elt.offsetWidth, height: elt.offsetHeight};
};
/***************************************************************************

PXN8.dom.ep()
=============
Given an element, calculate it's absolute position relative to the BODY element.

Parameters
----------
* element : An Element object or it's id attribute.

Returns
-------
An object with attributes x and y representing the
coordinates of the top left corner of the element

Example
-------
     var pos = PXN8.dom.ep("myElementId");
     // pos = { x: 48, y: 105 }
Related
-------
PXN8.dom.eb PXN8.dom.cursorPos

***/
PXN8.dom.ep = function (elt)
{
    if (typeof elt == 'string'){ elt = PXN8.dom.id(elt); }
    if (!elt) { return false; }

    var tmpElt = elt;
    var posX = parseInt(tmpElt["offsetLeft"]);
    var posY = parseInt(tmpElt["offsetTop"]);
    while(tmpElt.tagName.toUpperCase() != "BODY") {
        tmpElt = tmpElt.offsetParent;
        // IE7 bug ? - in one case the body tag was overlooked.
        if (tmpElt == null){
            break;
        }
        posX += parseInt(tmpElt["offsetLeft"]);
        posY += parseInt(tmpElt["offsetTop"]);
    }
    return {x: posX, y:posY};
};


/***************************************************************************

PXN8.dom.windowSize()
=====================
Calculate the size of the browser window (it's outer width & height).

Returns
-------
An object with 'height' and 'width' properties.

Example
-------
     var winSz = PXN8.dom.windowSize();
     // winSz = { height: 768, width: 1002}

Related
-------
PXN8.dom.eb PXN8.dom.cursorPos PXN8.dom.ep

***/
PXN8.dom.windowSize = function()
{
    if (document.all){
        return {width: document.body.clientWidth,
                height: document.body.clientHeight};
    }else{
        return {width: window.outerWidth,
                height: window.outerHeight};
    }
};
/***************************************************************************

PXN8.dom.opacity()
==================
Sets the opacity of a given element.

Parameters
----------
* element : The elment object or it's id attribute.
* value : The opacity expressed as a number between 0 and 1.0.

Example
-------
    PXN8.dom.opacity("myElementId",0.5);
    // sets opacity of the 'myElementId' element to 50%

***/
PXN8.dom.opacity = function(elt, value)
{
    if (typeof elt == 'string'){ elt = PXN8.dom.id(elt); }
    /*
     * it's quite possible that the element has been deleted
     */
    if (!elt){
        return;
    }
    if (document.all){
        elt.style.filter = "alpha(opacity:" + (value*100) + ")";
    }else{
        elt.style.opacity = value;
        elt.style._moz_opacity = value;
    }
};

/***************************************************************************

PXN8.dom.clz()
==============
Return an array of elements with the supplied classname

Parameters
----------
* className : A string containing the name of the class.

Returns
-------
An array of Element objects with a matching *class* attribute.

Example
-------
    <span class="finance">Loan: $40,000</span>
    <span class="address">8092 Wolverdale drive</span>
    <span class="finance">Repayments: $800</span>
    <script type="text/javascript">
     var allFinanceElements = PXN8.dom.clz("finance");
     // allFinanceElements = [SpanElement{8092 Wolverdale drive}, SpanElement{Repayments: $800}]
    </script>

Related
-------
PXN8.dom.addClass PXN8.dom.removeClass

***/
PXN8.dom.clz = function(className)
{
    var links = document.getElementsByTagName("*");

    var result = new Array();
    for (var i = 0;i < links.length; i++){
        if (links[i].className.match(className)){
            result.push(links[i]);
        }
    }
    return result;
};

/***************************************************************************

PXN8.dom.removeClass()
======================
Removes a class from the element's className (or 'class' attribute).

Parameters
----------
* element : An element or it's attribute id, from which you want to remove the class.

* className : The name of the class to remove.

Example
-------

     // before
     // <span id="myElementId" class="finance private">Repayments: $800</span>
     PXN8.dom.removeClass("myElementId","private");
     // after
     // <span id="myElementId" class="finance">Repayments: $800</span>
Related
-------
PXN8.dom.addClass PXN8.dom.clz

***/
PXN8.dom.removeClass = function(elt,className)
{
    if (typeof elt == 'string'){ elt = PXN8.dom.id(elt); }
    var oldClassname = elt.className;
    var oldClasses = oldClassname.split(/ /);
    var newClasses = [];
    for (var i = 0;i < oldClasses.length; i++){
        if (oldClasses[i] != className){
            newClasses.push(oldClasses[i]);
        }
    }
    var newClassname = newClasses.join(' ');
    elt.className = newClassname;
};

/***************************************************************************

PXN8.dom.addClass()
===================
Add a new class to the element's className (or *class* attribute).

Parameters
----------

* element : The element or it's id attribute.
* className : The name of the class to add to this element.

Example
-------
Before...
    <div class="panel">...</div>
Javascript...
    PXN8.dom.addClass("myElementId","dragable");
After...
    <div class="panel dragable">...</div>

Related
-------
PXN8.dom.removeClass PXN8.dom.clz

***/
PXN8.dom.addClass = function(elt,className)
{
    if (typeof elt == 'string'){ elt = PXN8.dom.id(elt); }
    elt.className += ' ' + className;
};

/***************************************************************************

PXN8.dom.isClass()
==================
Does the element's className contain the supplied classname ?

Parameters
----------

* element : The element object or it's id attribute.
* className : The name of the class for which to check.

Returns
-------
*true* or *false* .

Related
-------
PXN8.dom.addClass PXN8.dom.removeClass

***/
PXN8.dom.isClass = function(elt,className)
{
    if (typeof elt == 'string'){ elt = PXN8.dom.id(elt); }
    var clzs = elt.className.split(/ /);
    for (var i = 0; i < clzs.length; i++){
        if (clzs[i] == className){
            return true;
        }
    }
    return false;
};

/***************************************************************************

PXN8.dom.computedStyle()
========================
Returns the style of an element based on it's external stylesheet, and any inline styles.

Parameters
----------
* elementId : The id of the element whose style must be computed

Returns
-------
A CSSStyleDeclaration object.

***/
PXN8.dom.computedStyle = function(elementId)
{
    var result = null;

    if (this.cachedComputedStyles[elementId]){
        result = this.cachedComputedStyles[elementId];
    }else{
        var element = this.id(elementId);
        if (document.all){

            result = element.currentStyle;

        }else{
            if (window.getComputedStyle){
                result = window.getComputedStyle(element,null);
            }else{
                /**
                 * Safari doesn't support getComputedStyle()
                 */
                result = element.style;
            }
        }
	// wph 20091221 - fancybox lives in an iframe - computedStyle may not work in Firefox.
	if (result == null){
	    result = {};
	}
        this.cachedComputedStyles[elementId] = result;
    }
    return result;
};
/***************************************************************************

PXN8.dom.cursorPos()
====================
Return the current adjusted cursor position.

Parameters
-----------

* event : The event (a MouseEvent) from which to obtain the cursor position.

Returns
-------
An object with *height* and *width* parameters.

Related
-------
PXN8.dom.ep PXN8.dom.eb

***/
PXN8.dom.cursorPos = function (e)
{
    e = e || window.event;
    var cursor = {x:0, y:0};
    if (e.pageX || e.pageY) {
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    }
    else {
        var sl = document.documentElement.scrollLeft || document.body.scrollLeft;
        var st = document.documentElement.scrollTop || document.body.scrollTop;
        cursor.x = e.clientX + sl - document.documentElement.clientLeft;
        cursor.y = e.clientY + st - document.documentElement.clientTop;
    }
    return cursor;
};

/***************************************************************************

PXN8.dom.addLoadEvent()
=======================
Add a callback to the window's onload event. This is a convenience function which enables
multiple functions to be called when the *window.onload* event is fired.

Parameters
----------
* function : The callback function to be called when the window has loaded.

Example
-------
    PXN8.dom.addLoadEvent(function(){
        alert("The window has loaded");
    });

***/
PXN8.dom.addLoadEvent = function(func)
{
    var oldonload = window.onload;
    if (typeof window.onload != 'function'){
        window.onload = func;
    } else {
        window.onload = function(){
            if (oldonload){
                oldonload();
            }
            func();
        };
    }
};

PXN8.dom.addClickEvent = function(elt,func)
{
    var oldonclick = elt.onclick;
    if (typeof oldonclick != 'function'){
        elt.onclick = func;
    } else {
        elt.onclick = function(){
            if (oldonclick){
                oldonclick(elt);
            }
            func(elt);
        };
    }
};
PXN8.dom.onceOnlyClickEvent = function(elt,func)
{
    var oldonclick = elt.onclick;

    PXN8.dom.addClickEvent(elt,function(){
        func();
        elt.onclick = oldonclick;
    });
};
/**
 * Make constructing tables easier
 *  param rows An array of arrays (2-dimensional)
 *    Each item in the inner arrays must be either a string or a DOM element.
 *
 *  e.g. PXN8.dom.table([[ "Row1Col1", document.getElementById("pxn8_image") ],
 *                         [ "Row2Col1", "Hello World" ],
 *                         [ "This spans two columns"  ]]);
 */
PXN8.dom.table = function(rows, attributes)
{
    var dom = PXN8.dom;

    var result = dom.ce("table",attributes);
    var tbody = dom.ce("tbody");
	 result.appendChild(tbody);
    /**
     * First scan the array to find find the widest row (most cells)
     */
    var mostCells = 0;
    for (var i = 0; i < rows.length; i++){
        var row = rows[i];
        if (row.length > mostCells){
           mostCells = row.length;
        }
    }

    for (var i = 0; i < rows.length; i++){
        var tr = dom.ce("tr");
	     tbody.appendChild(tr);
        var rowData = rows[i];
        var cellsInRow = rowData.length;
        for (var j = 0; j < rows[i].length; j++){
            var cellData = rows[i][j];

            var td = dom.ce("td");
	         tr.appendChild(td);
            if (j == rows[i].length -1 && cellsInRow < mostCells){
                td.colSpan = (mostCells - cellsInRow)+1;
            }
            if (typeof cellData == "string"){
	             td.appendChild(dom.tx(cellData));
            }else if (PXN8.isArray(cellData)){
                // it's an array
                for (var k = 0; k < cellData.length; k++){
                    if (typeof cellData[k] == "string"){
	                     td.appendChild(dom.tx(cellData[k]));
                    }else{
	                     td.appendChild(cellData[k]);
                    }
                }
            }else{
	             td.appendChild(cellData);
            }
        }
    }
    return result;
};

/**
 * Add a Flag icon to the page, placing it at x,y with ID of id
 * Returns the <IMG> flag element
 */
PXN8.dom.createFlag = function(x,y,id)
{
    var flag = PXN8.dom.ce("img",{"src": PXN8.root + "images/icons/flag.gif", "id": id});
    document.body.appendChild(flag);
    flag.style.position = "absolute";
    flag.style.top = y - 16 +  "px";
    flag.style.left = x - 11 + "px";
    return flag;
};

