/*
 * (c) Copyright SXOOP Technologies Ltd. 2005-2010
 * All rights reserved.
 *
 */
PXN8 = PXN8 || {};

/**************************************************************************

SECTION: Freehand drawing Functions
===================================
Pixenate allows you to do freehand drawing on top of an image. This is
achieved by first calling PXN8.freehand.start() to put the editor in a
state ready for drawing. Once the editor is in this state, the user
can draw freehand lines of any color and width by moving the pointer
while the mouse button is held down.
The color can be set using the PXN8.freehand.color property. The width
of the line can be set using the PXN8.freehand.width property.

<blockquote>N.B. PXN8.freehand is a relatively new feature of
Pixneate. It depends on Raphael javascript libraries.</blockquote>

***/

PXN8.freehand = {};

/**************************************************************************

PXN8.freehand.color
===================
Set this property to change the default color that a new PXN8.freehand.Path object will use,
when created in freehand mode. Color should be a hex string. Default value is "red"

Examples
--------
   PXN8.freehand.color = "#00ff00"; // green

***/
PXN8.freehand.color = "#ff0000";

/**************************************************************************

PXN8.freehand.opacity
=====================
Set this property to change the default opacity that a new PXN8.freehand.Path object will use,
when created in freehand mode. Default value is 0.

Examples
--------
   PXN8.freehand.opacity = ; // green

***/
PXN8.freehand.opacity = 0;

/**************************************************************************

PXN8.freehand.width
===================
Set this property to change the default brush width that a new PXN8.freehand.Path object will use,
when created in freehand mode. Width should be numeric.

Examples
--------
   PXN8.freehand.width = 12; // a brush 12x12 pixels.

***/
PXN8.freehand.width = 1;

// private
PXN8.freehand.started = false;

/**************************************************************************

PXN8.freehand.start()
=========================
Line drawing in Pixenate is achieved by passing an array of
PXN8.freehand.Path objects to the PXN8.tools.freehand() function. The
easiest way to construct an array of Path objects is using the
PXN8.freehand.start() / PXN8.freehand.end() pair of functions. What
these functions do is place the editor in a special mode where the
user can draw freehand lines using the mouse (Each line in a freehand
drawing is equivalent to 1 PXN8.freehand.Path object so a freehand
drawing can be thought of as an array of PXN8.freehand.Path objects).

Related
-------
PXN8.freehand.end PXN8.tools.freehand

Examples
--------
<a href="example-freehand.html">Freehand Drawing Example</a>

***/
PXN8.freehand.start = function()
{
	 if (PXN8.log){ PXN8.log.trace("PXN8.freehand.start()"); }

	 var _ = PXN8.dom;

	 if (!Raphael){
		  alert("Warning: PXN8.freehand requires the Raphael Javascript Library");
		  return;
	 }
    if (PXN8.freehand.started){
        alert("Warning: PXN8.freehand has already started");
        return;
    }
	 var self = PXN8.freehand;

    self.started = true;

	 PXN8.unselect();
	 var pos = _.ep("pxn8_canvas");

	 var theImage = _.id("pxn8_image");

	 var glassPane = _.ce("div",{id: "pxn8_freehand_glasspane"});

    _.css(glassPane,
	 {
		  top             : pos.y + "px",
		  left            : pos.x + "px",
		  position        : "absolute" ,
		  width           : theImage.width,
		  height          : theImage.height,
		  backgroundColor : "white",
		  opacity         : 0.01,
		  filter          : "alpha(opacity:1)",
		  cursor          : "crosshair"
	 });
	 _.ac(document.body,glassPane);

	 var raphaelContainer = _.ce("div",{id: "pxn8_raphael_container"});
	 _.css(raphaelContainer,
	 {
		  position : "absolute",
		  top      : pos.y + "px",
		  left     : pos.x + "px"
	 });
	 _.ac(document.body, raphaelContainer);

	 self.paper = Raphael("pxn8_raphael_container",theImage.width,theImage.height);

	 self.oldmousemove = document.body.onmousemove;
	 document.body.onmousemove = self.onmousemove;

    self.oldmousedown = document.body.onmousedown;
    self.oldmouseup = document.body.onmouseup;

    document.body.onmousedown = function(event){
        event = event || window.event;
        event.cancelBubble = true;
        self.mousedown = true;
		  _.css("pxn8_raphael_container",{cursor: "crosshair"});
    };
    document.body.onmouseup = function(event){
        event = event || window.event;
        self.mousedown = false;
		  _.css("pxn8_raphael_container",{cursor: "default"});
    };

	 PXN8.listener.add(PXN8.ON_ZOOM_CHANGE,self.onZoomChange);
};

PXN8.freehand.onZoomChange = function(eventType,zoom)
{
	 var self = PXN8.freehand;

	 var sz = PXN8.getImageSize();

    PXN8.dom.id("pxn8_raphael_container").innerHTML = "";
	 self.paper = Raphael("pxn8_raphael_container",sz.width * zoom,sz.height * zoom);

	 //
	 // redraw all the canvas contents
	 //

	 self.refresh();
};
/**
 * Refresh the Raphael canvas
 */
PXN8.freehand.refresh = function()
{
	 var self = PXN8.freehand;
	 var i = 0;
	 self.paper.clear();
	 for (i = 0;i < self.paths.length; i++){
		  self.paths[i].refresh();
	 }
};
/**************************************************************************
PXN8.freehand.end()
=========================
This function takes the editor out of freehand drawing mode and back
to its standard editing mode. All previous settings are restored.

Related
-------
PXN8.freehand.start PXN8.tools.freehand

Examples
--------
<a href="example-freehand.html">Freehand Drawing Example</a>

***/
PXN8.freehand.end = function()
{
	 if (PXN8.log){ PXN8.log.trace("PXN8.freehand.end()"); }

    var self = PXN8.freehand;
    if (!self.started){
        return;
    }
    self.started = false;
	 self.activePath = null;
	 self.paths = [];

	 document.body.removeChild(document.getElementById("pxn8_freehand_glasspane"));
	 document.body.removeChild(document.getElementById("pxn8_raphael_container"));
    document.body.onmousemove = self.oldmousemove;
    document.body.onmousedown = self.oldmousedown;
    document.body.onmouseup = self.oldmouseup;

	 PXN8.listener.remove(PXN8.ON_ZOOM_CHANGE,self.onZoomChange);
};
/**************************************************************************
PXN8.freehand.undo()
=========================
A function for fine-grained undo of individual paths within a freehand drawing.
This function will remove the last path created in freehand mode.

***/

PXN8.freehand.undo = function()
{
	 var self = PXN8.freehand;
	 var lastPath = self.paths.pop();
	 if (!lastPath){
		  return;
	 }
	 lastPath.view.remove();
};


PXN8.freehand.count = 0;
PXN8.freehand.mousedown = false;

PXN8.freehand.isDrawing = function(event){
	 return PXN8.freehand.mousedown || event.button;
};
PXN8.freehand.onmousemove = function(event)
{
	 event = event || window.event;
	 var self = PXN8.freehand;

    if (!self.isDrawing(event))
    {
        // the mouse has move and the shift key isn't pressed.
        // this means a new path must be created the next time the mouse is
        // moved and the shift key is held down.
        self.count = 0;
        return;
    }
    var canvasPos = PXN8.dom.ep("pxn8_canvas");
	 var windowOffset = PXN8.getWindowScrollPoint();
    var cx = Math.floor(event.clientX - canvasPos.x + windowOffset.x);
    var cy = Math.floor(event.clientY - canvasPos.y + windowOffset.y);

   var theImage = document.getElementById("pxn8_image");

   if (cx < 0 || cx > theImage.width
       || cy < 0 || cy > theImage.height){
       self.count = 0;
       return;
   }


	if (self.count != 0)
   {
		 PXN8.freehand.activePath.lineTo(cx,cy);
   }
	else
   {
       self.count = 2;
       PXN8.freehand.activePath = new PXN8.freehand.Path(
			  PXN8.freehand.width,
			  PXN8.freehand.color,
			  cx, cy, []);
   }
};
PXN8.freehand.activePath = null;
PXN8.freehand.paths = [];

PXN8.freehand.getPaths = function()
{
	 var result = [];
	 var i = 0;
	 var path = null;
	 for (i = 0;i < PXN8.freehand.paths.length; i++){
		  path = PXN8.freehand.paths[i];
		  //
		  // check that path isn't just a M x, y with no accompanying L or
		  // you will end up with a line going from top left corner of image to x, y
		  //
		  if (path.d.length > 2){
				result.push(path);
		  }
	 }
	 return result;
};
/**
 * Given a PXN8.freehand.Path object, return it's points as a string for use in ImageMagick operations.
 *
 */
PXN8.freehand.getPoints = function(path)
{
	 var result = null;
	 if (path.d.length > 2){
		  result = "M " + path.d[0] + " " + path.d[1] + " L";
		  for (j = 2; j < path.d.length; j = j + 2){
				result += " " + path.d[j] + " " + path.d[j+1];
		  }
	 }
	 return result;
};
/**************************************************************************

PXN8.freehand.Path()
=========================
A PXN8.freehand.Path() object contains all of the information and
methods for drawing a Path ( a series of lines ) both on the client
(using Raphael JS library) and on the server (using Pixenate /
ImageMagick).

Paramaters
----------
* width : The brush width (should be numeric) in pixels.
* color : The stroke color (should be hex strig - e.g. "#ff0000" for red).
* x     : The x coordinate for the start of the path
* y     : The y coordinate for the start of the path

Returns
-------
A new PXN8.freehand.Path object.

Examples
--------

    //
    // create a square 50 x 50 starting at point 100, 10 (100 from
    // left, 10 from top)
    //
    var myPath = new PXN8.freehand.Path(2,"#ff0000", 100, 10);
    myPath.lineTo(150, 10);
    myPath.lineTo(150, 60);
    myPath.lineTo(100, 60);
    myPath.lineTo(100, 10);

	 //
    // bake the path into the image
	 //
    PXN8.tools.freehand([myPath]);


***/
PXN8.freehand.Path = function(width, color, x, y)
{
	 var zoom = PXN8.zoom.value();

    this.d = [x / zoom, y / zoom];
    this.color = color;
    this.width = width;
	 this.opacity = PXN8.freehand.opacity;

    this.view = PXN8.freehand.paper.path(
		  {
				stroke: color,
				"fill-opacity": this.opacity,
				"stroke-width":width * zoom
		  });
    this.view.moveTo(x,y);
    this.view.lineTo(x,y);
	 PXN8.freehand.paths.push(this);
    return this;

};

/**************************************************************************

PXN8.freehand.Path.lineTo()
===========================

The lineTo() method is used to plot a new point on the path to which a
line will be drawn.

Parameters
----------
* x     : The x coordinate for the next point of the path
* y     : The y coordinate for the next point of the path

***/
PXN8.freehand.Path.prototype.lineTo = function(x,y)
{
    this.view.lineTo(x,y);
	 var zoom = PXN8.zoom.value();
    this.d.push(x / zoom,y / zoom);
};
PXN8.freehand.Path.prototype.refresh = function(){
	 var x,y = 0;
	 var zoom = PXN8.zoom.value();

	 x = this.d[0] * zoom;
	 y = this.d[1] * zoom;
	 var i = 0;
	 this.view = PXN8.freehand.paper.path(
		  {
				stroke: this.color,
				"fill-opacity":this.opacity,
				"stroke-width":this.width * zoom
		  });
    this.view.moveTo(x,y);
    this.view.lineTo(x,y);
	 for (i = 2;i < this.d.length; i+=2){
		  x = this.d[i] * zoom;
		  y = this.d[i+1] * zoom;
		  this.view.lineTo(x,y);
	 }
};

/**************************************************************************

PXN8.tools.freehand()
=====================

Allows freehand drawing on top of an image.

Parameters
----------
* paths : An array of PXN8.freehand.Path objects.

Examples
--------

    //
    // create a square 50 x 50 starting at point 100, 10 (100 from
    // left, 10 from top)
    //
    var myPath = new PXN8.freehand.Path(2,"#ff0000", 100, 10);
    myPath.lineTo(150, 10);
    myPath.lineTo(150, 60);
    myPath.lineTo(100, 60);
    myPath.lineTo(100, 10);

    //
    // bake the path into the image
    //
    PXN8.tools.freehand([myPath]);

See also: <a href="example-freehand.html">Freehand Drawing Example</a>


Related
-------
PXN8.freehand.Path PXN8.freehand.start PXN8.freehand.end

***/
PXN8.tools.freehand = function(paths)
{
	 if (typeof paths == "undefined"){
		  paths = PXN8.freehand.paths;
	 }
    var i =0,
		  j = 0,
		  path = null,
		  ps = "",
		  p = null,
		  image = null,
		  end = 0;

	 var ops = [];

	 if (PXN8.ajax.useXHR)
	 {
        var image = PXN8.ImageMagick.start();
		  var paths = PXN8.freehand.getPaths();
        for (;i < paths.length;i++)
        {
            path = paths[i];
				ps = PXN8.freehand.getPoints(path);
				image.Draw({stroke: path.color, fill: "#00000000", primitive: "path", points: ps, strokewidth: path.width});

        }
		  PXN8.ImageMagick.end(image);
	 }
    else
    {
        var chunkedPaths = [];
        //
        // if not using XHR, there is an upper limit of about 2000 chars per request
        // break long paths into chunks of 100 because no single Pixenate operation should exceed about 1000 characters.
        //
        for (i = 0; i < paths.length;i++){
            p = paths[i];
            j = p.d.length;
            var start = 0;
            while (j > 0){
                end = Math.min(start+j,start+100);
                var tp = {width: p.width, color: p.color, d:[]};
                tp.d = p.d.slice(start,end);
                chunkedPaths.push(tp);
                j = j - (end - start);
                start = end;
            }
        }

        for (i = 0;i < chunkedPaths.length;i++)
        {
            path = chunkedPaths[i];
				if (path.d.length > 2)
				{
					 image = PXN8.ImageMagick.start();
					 ps = PXN8.freehand.getPoints(path);
					 image.Draw({stroke: path.color, fill: "#00000000", primitive: "path", points: ps, strokewidth: path.width});
					 ops.push(PXN8.ImageMagick.end(image,false));
				}
        }
        PXN8.tools.updateImage(ops);
	 }
};
