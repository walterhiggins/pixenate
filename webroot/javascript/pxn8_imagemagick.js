/**
 * (c) 2006-2008 Sxoop Technologies Ltd.
 *
 * A bridge between javascript and server-side ImageMagick.
 *
 */

var PXN8 = PXN8 || {};

/*************************************************************************

SECTION: ImageMagick Bridge functions
=====================================
Using the ImageMagick plugin, it is possible to call imagemagick functions from
javascript.
This can prove useful if you want to extend the features available in Pixenate without
writing server-side Pixenate plugins in Perl.
For complex functions, you should probably consider coding a server-side Perl plugin but for basic
functions, you can now code a client-side javascript plugin.
The following table shows how you might write the Fill-Flash plugin using only Javascript. On the left hand side is
listed the javascript code to perform a fill-flash. This code uses the PXN8.ImageMagick API to call ImageMagick manipulation routines via javascript.
On the right hand side is shown the equivalent code implemented as a perl server-side plugin.

<table>
  <tr>
    <th>Javascript (client side)</th>
    <th>Perl (server side) Equivalent</th>
  </tr>
 <tr>
 <td valign="top"><pre>



function fill_flash(opacity)
{
   var image = PXN8.ImageMagick.start();

   var brighter = image.Clone();

   if (!opacity){
      opacity = 50;
   }

   image.Method("Composite",{"image": brighter,
                             "compose": "Screen",
                             "opacity": opacity + "%"});

   PXN8.ImageMagick.end(image);
}
</pre></td>

<td valign="top"><pre>
use strict;
use Sxoop::PXN8 ':all';

sub fill_flash
{
  my ($image, $params) = @_;

  my $brighter = $image->Clone();

  my $opacity = 50;
  if (exists $params->{opacity}){
      $opacity = $params->{opacity};
  }
  my $imrc = $image->Composite(image   => $brighter,
                               compose => "Screen",
                               opacity => $opacity . "%");
  if (is_imagick_error($imrc))
  {
      die "FillFlash failed: $imrc";
  }
  return $image;
}
AddOperation('fill_flash', \&fill_flash);
1;
</pre></td>
</tr>
</table>

***/

/****************************************************************************

PXN8.ImageMagick
================
PXN8.ImageMagick is the object used as a proxy for the server-side Image::Magick class.
PXN8.ImageMagick is a <a href="http://en.wikipedia.org/wiki/Mock_object">Mock Object</a>. Methods invoked on this object are not implemented
in the client in realtime - the methods are invoked on the server when the PXN8.ImageMagick.end() method is called.

You construct a new PXN8.ImageMagick object like so...

var myImage = new PXN8.ImageMagick();

... However, it is more common to simply use the default PXN8.ImageMagick() object returned by the global PXN8.ImageMagick.start() method.

The PXN8.ImageMagick object has just 4 methods.

* Method : Use this to invoke image manipulation routines on the image. For a full list of methods available you should consult the ImageMagick website. <a href="http://imagemagick.org/script/perl-magick.php#manipulate">http://imagemagick.org/script/perl-magick.php#manipulate</a>.
** Method takes 2 parameters, the name of the Method (e.g. "Crop", "Rotate", "Draw" etc) and the parameters for the method. Please bear in mind that PXN8.ImageMagick is a mock object - the <em>Method</em> method lets you use the full array of ImageMagick manipulation routines.

* Clone : This works exactly like the Clone function in ImageMagick. It creates a deep copy of an existing image.

* Append : This will append all images side by side.

* push : pushes an image on to the image stack. (equivalent to perl code : push (@$image1, $image2) ;)

In addition, there are 2 static functions belonging to the PXN8.ImageMagick class.

* PXN8.ImageMagick.start() : This returns an object which is a reference to the current image. (see example of use above)

* PXN8.ImageMagick.end(image, updateFlag) : This commits all of the ImageMagick operations to the server and indicates which of the images to send to the editor. There is an optional <em>updateFlag</em> which indicates whether or not the operation should be committed or simply returned. It might be useful to simply return the operation if you would like to include it as one of a batch of operations (see PXN8.tools.updateImage() ).

Example
-------

The following snippet of code will create a reflection at the bottom of the current image.

    //
    // start an editing session using PXN8.ImageMagick
    //
    var image = PXN8.ImageMagick.start();

    var reflectionHeight = 100;
    var imageWidth = PXN8.getImageSize().width;

    //
    // clone the image and flip the clone
    //
    var flipped = image.Clone();
    flipped.Method("Flip");

    //
    // create a white background for the reflection to fade to.
    //
    var white = new PXN8.ImageMagick();
    white.Method("Set",{size: imageWidth + "x" + reflectionHeight});
    white.Method("Read", "xc:white");

    //
    // create a gradient mask to apply to the flipped image
    //
    var mask = new PXN8.ImageMagick();
    mask.Method("Set", {size: imageWidth + "x" + reflectionHeight});
    mask.Method("Read", "gradient:#000000-#FFFFFF");
    mask.Method("Set", {matte: false});

	 //
    // apply the mask
    //
    white.Method("Composite",{image: mask, compose: "CopyOpacity"});

    //
    // superimpose the faded white on top of the flipped image
    //
    flipped.Method("Composite",{image: white, compose: "Over", x:0, y:0});

    //
    // crop the flipped image
    //
    flipped.Method("Crop",{x:0,y:0,width: imageWidth, height: reflectionHeight});

    //
    // push the flipped image on to the original
    //
    image.push(flipped);

    //
    // append the images
    //
    var reflection = image.Append(false);

    //
    // Commit the operations to the server
    //
    PXN8.ImageMagick.end(reflection);

You can see the example code in action <a href="example-imagemagick.html">here</a>.

An example of how to create a fake-polaroid effect using Pixenate's ImageMagick bridge is <a href="example-imagemagick2.html">available here</a>.

An example of adding a grey border to make a rectangular image square is in <a href="example-imagemagick3.html">Example #3</a>.

A more advanced example of using PXN8.ImageMagick to create a clone tool that uses free-hand selection can be found <a href="example-clone.html">here</a>.

***/

PXN8.ImageMagick = function()
{
    var id = PXN8.ImageMagick.objectCount++;
    if (id == 0){
        this.handle = "_";
    }else{
        this.handle = "im" + id;
    }
    return this;
};

PXN8.ImageMagick.curry = function(methodName){
	 return function(a) {
		  var statement = new Array();
		  statement.push(this.handle);
		  statement.push(methodName);
        for (var i = 0; i < arguments.length;i++){
            statement.push(arguments[i]);
        }
        PXN8.ImageMagick.statements.push(statement);
	 };
};
PXN8.ImageMagick.prototype.Method = function()
{
	 var methodName = arguments[0];
	 if (!PXN8.ImageMagick.prototype[methodName])
	 {
		  PXN8.ImageMagick.prototype[methodName] = PXN8.ImageMagick.curry(methodName);
	 }
    var statement = new Array();
    statement.push(this.handle);
    for (var i = 0; i < arguments.length;i++){
        statement.push(arguments[i]);
    }
    PXN8.ImageMagick.statements.push(statement);
};

PXN8.ImageMagick.prototype.Crop = function(coords){
	 var _coords = {x: (coords.left || coords.x),
						 y: (coords.top || coords.y),
						 width: coords.width,
						 height: coords.height};
	 this.Method("Crop",_coords);
};

PXN8.ImageMagick.prototype._CropToText = function ( textParams){
	 this.Method("_CropToText", textParams) ;
};
PXN8.ImageMagick.prototype._ScaleTo = function (scaleParams){
	 this.Method("_ScaleTo", scaleParams) ;
};
PXN8.ImageMagick.prototype.Clone = function()
{
    var clone = new PXN8.ImageMagick();
    var statement = new Array();
    statement.push(clone.handle);
    statement.push("clone_from");
    statement.push(this.handle);
    PXN8.ImageMagick.statements.push(statement);
    return clone;
};

PXN8.ImageMagick.prototype.Append = function(stack)
{
    var appended = new PXN8.ImageMagick();
    var statement = new Array();
    statement.push(appended.handle);
    statement.push("append");
    statement.push([this.handle,stack]);
    PXN8.ImageMagick.statements.push(statement);
    return appended;
};

PXN8.ImageMagick.prototype.push = function(image){
	 var statement = new Array();
	 statement.push(this.handle);
	 statement.push("push");
	 statement.push(image.handle);
	 PXN8.ImageMagick.statements.push(statement);
	 return this;
};

PXN8.ImageMagick.start = function()
{
    PXN8.ImageMagick.objectCount = 0;
    var image = new PXN8.ImageMagick();
    PXN8.ImageMagick.statements = new Array();
    return image;
};

PXN8.ImageMagick.end = function(image,callback)
{
    var op = {operation: "imagemagick"};
    op.script = PXN8.ImageMagick.statements;
    op.script.push([image.handle,"return"]);

	 if (typeof callback == "undefined")
	 {
		  PXN8.tools.updateImage([op]);
	 }else if (typeof callback == "boolean"){
		  if (callback == true){
				PXN8.tools.updateImage([op]);
		  }
	 }else if (typeof callback == "function"){
		  PXN8.ajax.submitScript([op],callback);
	 }
	 return op;
};
/****************************************************************************

PXN8.ImageMagick.maskFromPaths
==============================
This utility function will return a PXN8.ImageMagick() image object which is a
mask constructed (white on black) from the supplied paths. If you want to reverse the mask
then call the ImageMagick "Negate" method on the returned object.
This function can be used in conjunction with PXN8.freehand.* functions to create a mask from a path.
This can be very useful for creating freehand masks, e.g. for more fine-grained application of tools such as
Red-Eye and teeth-whitening.

Parameters
----------

* size  : An object with 'width' and 'height' properties (for example the object returned by PXN8.getImageSize() )
* paths : An array of PXN8.freehand.Path objects

Returns
-------
A PXN8.ImageMagick() object which is a white-on-black mask constructed from the supplied paths.

Examples
--------
See <a href="example-advanced-redeye.html">Advanced Red-Eye Removal</a>.

Related
-------
PXN8.freehand.Path() PXN8.freehand.start() PXN8.freehand.end() PXN8.ImageMagick.start() PXN8.ImageMagick.end()

***/
PXN8.ImageMagick.maskFromPaths = function(size, paths)
{
	 var result = new PXN8.ImageMagick();
	 result.Set({size: size.width + "x" + size.height});
	 result.Read("xc:#000000");
	 for (var i = 0; i < paths.length; i++){
       var path = paths[i];
       var ps = PXN8.freehand.getPoints(path);
       result.Draw({stroke: "#ffffff", fill: "#00000000", primitive: "path", points: ps, strokewidth: path.width});
    }
    // must reset mask's matte to false _after_ Draw because Draw
    // resets it to true
	 result.Set({matte: false});
	 return result;
};
// some common methods
PXN8.ImageMagick.methods = ["AdaptiveBlur","AdaptivelyResize","AdaptiveSharpen","AdaptiveThreshold",
                            "AddNoise","AffineTransform","Annotate","AutoOrient",
                            "Blur","Border","BlackThreshold",
                            "Charcoal","Colorize","Contrast","Composite",
                            "Draw",
                            "Edge","Emboss","Enhance","Extent",
                            "Flip","Flop","Frame","Gamma","GaussianBlur","Implode","Label",
                            "Level","Magnify","Mask","Minify","Modulate","MotionBlur",
                            "Negate","Normalize","OilPaint","Opaque","Posterize","Quantize","Raise",
                            "ReduceNoise","Resample","Read",,"Rotate","Resize","Roll","Set","SetPixel",
                            "Shadow","Sharpen","Shear","Sketch","Solarize","Spread","Stegano","Stereo","Strip","Swirl",
                            "Texture","Thumbnail","Threshold","Tint","Transparent","Transpose","Transverse",
                            "Trim","UnsharpMask","Vignette","Wave","WhiteThreshold"];

for (var i = 0; i < PXN8.ImageMagick.methods.length;i++)
{
    var method = PXN8.ImageMagick.methods[i];
    PXN8.ImageMagick.prototype[method] = PXN8.ImageMagick.curry(method);
}

