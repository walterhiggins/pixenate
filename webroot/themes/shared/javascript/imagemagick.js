/**
 * Copyright (c) Sxoop Technologies Ltd. 2008 All rights reserved.
 *
 * This javascript file contains a few function which use the Pixente-ImageMagick bridge to
 * provide custom photo manipulation via javascript.
 *
 * Walter Higgins 22 May 2008
 */

/**
 * Create a warhol-esque 2x2 popart poster
 */
function imagemagick_popart()
{
    var size = PXN8.getImageSize();
    var md = size.width>size.height?size.height: size.width;
    if (md > 1024 ){
        md = 1024;
    }

    var image = PXN8.ImageMagick.start();
    image.Crop({width: md, height: md, x: ((size.width/2)-md/2),y:((size.height/2)-md/2)});
    var canvas = new PXN8.ImageMagick();
    canvas.Set({size: (md * 2) + "x" + (md * 2)});
    canvas.Read("xc:white");
    image.Enhance();
    image.Enhance();

    var level = 4;
    var opacity = "25%";

    var p1 = image.Clone();
    p1.Posterize({levels: level});

    var p2 = p1.Clone();
    p2.Colorize({fill: "red", opacity: opacity});

    var p3 = p1.Clone();
    p3.Colorize({fill: "green", opacity: opacity});

    var p4 = p1.Clone();
    p4.Colorize({fill: "yellow", opacity: opacity});

    canvas.Composite({image: p1, compose: "Over", x: 0, y:0});
    canvas.Composite({image: image, compose: "Over", x: md, y:0});
    canvas.Composite({image: p3, compose: "Over", x: 0, y: md});
    canvas.Composite({image: p4, compose: "Over", x: md, y: md});

    PXN8.ImageMagick.end(canvas);
}

/**
 * Create a vertical reflection
 */
function imagemagick_reflection()
{
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
    flipped.Flip();

    //
    // create a white background for the reflection to fade to.
    //
    var white = new PXN8.ImageMagick();
    white.Set({size: imageWidth + "x" + reflectionHeight});
    white.Read("xc:white");

    //
    // create a gradient mask to apply to the flipped image
    //
    var mask = new PXN8.ImageMagick();
    mask.Set({size: imageWidth + "x" + reflectionHeight});
    mask.Read("gradient:#000000-#FFFFFF");
    mask.Set({matte: false});

	 //
    // apply the mask
    //
    white.Composite({image: mask, compose: "CopyOpacity"});

    //
    // superimpose the faded white on top of the flipped image
    //
    flipped.Composite({image: white, compose: "Over", x:0, y:0});

    //
    // crop the flipped image
    //
    flipped.Crop({x:0,y:0,width: imageWidth, height: reflectionHeight});

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

}


/**
 * Create a fake polaroid effect using Pixenate's ImageMagick bridge plugin.
 *
 * Pixenate plugin development in Javascript - Yay!
 */
function imagemagick_polaroid(degrees, text)
{
    //
    // image is the current image being edited (see PXN8.initialize())
    //
    var image = PXN8.ImageMagick.start();

    var size = PXN8.getImageSize();

	 var smallestSide = Math.min(size.width, size.height);
    //
    // crop the image to a square shape.
    //
    image.Crop({height: smallestSide, width: smallestSide, x: (size.width-smallestSide)/2, y: (size.height-smallestSide)/2});

    var xBorderWidth = smallestSide / 8;
    var yBorderWidth = xBorderWidth * 2;

    //
    // create a polaroid-style border
    //
    var border = new PXN8.ImageMagick();
    border.Set( {size:  (smallestSide + xBorderWidth*2) + "x" + (smallestSide + yBorderWidth*2)});
    border.Read( "xc:#ffffff");
    //
    // superimpose the cropped photo on top of the border
    //
    border.Composite( {image: image, compose: "Over", x: xBorderWidth, y: xBorderWidth});
	 if (text && text.length > 0){
		  border.Annotate( {text: text, gravity: "South", y: xBorderWidth, pointsize: 12});
	 }

    //
    // create a drop-shadow
    var shadow = new PXN8.ImageMagick();
    shadow.Set({size: (smallestSide + (xBorderWidth * 2) + 4) + "x" + (smallestSide + (yBorderWidth*2)+4)});
    shadow.Read("xc:white");
    shadow.Draw({primitive: "Rectangle",points: "1,1," +(smallestSide+ (xBorderWidth* 2 + 1)) + "," + (smallestSide + (yBorderWidth*2)+1), fill: "#808080"});
    shadow.Blur("2.0x2.0");
    //
    // superimpose the border on top of the shadow
    //
    shadow.Composite({image: border, compose: "Over", x: 1, y: 1});
    //
    // rotate the image slightly
    //
    shadow.Rotate({degrees: degrees, background: "white"});

    PXN8.ImageMagick.end(shadow);
}
/**
 * Blur an oval shaped part of the image.
 * e.g. to heavily blur a face...
 *
 * imagemagick_ovalblur("9.0x9.0",PXN8.getSelection());
 *
 */
function imagemagick_ovalblur(blurRadius,coords)
{
    // get current image being edited
    var image = PXN8.ImageMagick.start();
    // clone it
    var cropped = image.Clone();
    // crop it
    cropped.Crop({x: coords.left, y:coords.top, width: coords.width, height:coords.height});
    // blur it
    cropped.Blur(value);

    // create an alpha mask
    var mask = new PXN8.ImageMagick();
    mask.Set({size: coords.width + "x" + coords.height});
    mask.Read("xc:#000000");
    //
    // draw a white ellipse on the black background
    //
    mask.Draw({
        primitive: "ellipse",
        points: (coords.width/2) + "," + (coords.height/2) + "," + (coords.width/2) + "," + (coords.height/2) + ",0,360",
        method: "Floodfill",
        fill: "#ffffff",
        stroke: "none"
    });
    // blur the mask itself so there isn't a hard transition from blur to non-blur
    mask.Blur("5.0x5.0");

    mask.Set({matte: "false"});

    // apply the mask to the cropped image
    cropped.Composite({image: mask, compose: "CopyOpacity"});

    // insert the cropped image back into the photo
    image.Composite({image: cropped, compose: "Over", x: coords.left, y: coords.top})

    // we're done.
    PXN8.ImageMagick.end(image);
}
