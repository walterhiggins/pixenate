//
// clone.js : All of the javascript functions related to cloning
//
// cloning is the copy and pasting of arbitrarily shaped areas of the photo.
//
var points = new Array();
//
// show the copy panel and prompt the user to plot points on the photo which will be used
// to create a cut-out
//
function start_copy()
{
    PXN8.select.enable(false,true); // the 2nd parameter forces a PXN8.unselect()
    points = [];
    redraw_points();
    PXN8.event.addListener("pxn8_canvas","click",add_point);
    document.getElementById("copy_panel").style.display = "block";
}
function end_copy()
{
    PXN8.select.enable(true);
    points = [];
    redraw_points();
    PXN8.event.removeListener("pxn8_canvas","click",add_point);
    document.getElementById("copy_panel").style.display = "none";
}
function start_paste(jsonResponse)
{
    hourglass.style.display = "none";
    document.getElementById("paste_panel").style.display = "block";
    start_paste.overlay = PXN8.server + PXN8.root + "/" + jsonResponse.image;
    start_paste.overlay_path = jsonResponse.image;
    PXN8.select.enable(true);
    PXN8.overlay.start(start_paste.overlay, {top: 0, left: 0, width: (copy.r-copy.l), height: (copy.b - copy.t)});
}
function end_paste()
{
    PXN8.overlay.stop();
    document.getElementById("paste_panel").style.display = "none";
    PXN8.unselect();
}

function paste ()
{
    var params = PXN8.getSelection();
    params.filepath = start_paste.overlay_path;
    params.position = "front";
    PXN8.tools.overlay(params);

    var hourglass = document.getElementById("hourglass");
    hourglass.style.display = "block";
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
       PXN8.overlay.start(start_paste.overlay,params);
       hourglass.style.display = "none";

    });
}


function add_point(event)
{

    var x = event.x || event.layerX;
    var y = event.y || event.layerY;

    var zoom = PXN8.zoom.value();
    var point = {x: x / zoom, y: y / zoom};
    points.push(point);

    draw_point(point);

}
function redraw_points()
{
    var canvas = document.getElementById("pxn8_canvas");
    var images = canvas.getElementsByTagName("img");
    var forRemoval = [];

    for (var i = 0;i < images.length; i++){
        if (images[i].className == "point"){
            forRemoval.push(images[i]);
        }
    }
    for (i = 0;i < forRemoval.length; i++){
        canvas.removeChild(forRemoval[i]);
    }

    for (i = 0;i < points.length; i++){
        draw_point(points[i]);
    }
}

//
// important - the plotted points must be redrawn when the user zooms in or out.
//
PXN8.listener.add(PXN8.ON_ZOOM_CHANGE, redraw_points);

function draw_point(p)
{
    var d = PXN8.dom;
    var zoom = PXN8.zoom.value();

    var pointImg = d.ce("img",{src: PXN8.server + PXN8.root +
                               "/images/pxn8_xhairs_white.gif", className: "point"});
    pointImg.style.position = "absolute";
    pointImg.style.top = (p.y * zoom) - 4 + "px";
    pointImg.style.left = (p.x * zoom) - 4 + "px";
    d.ac("pxn8_canvas",pointImg);
}

/**
 * copy() uses PXN8.ImageMagick objects to create a cut-out alpha mask of the plotted area and then
 * applies that mask to the photo. The image returned by the operation will not be used
 * to update the current image but instead will be used as the input to a subsequent PXN8.tools.overlay() operation.
 */
function copy()
{
    var image = PXN8.ImageMagick.start();
    var mask = new PXN8.ImageMagick();
    var sz = PXN8.getImageSize();

    var hourglass = document.getElementById("hourglass");
    hourglass.style.display = "block";


    mask.Set ({size: sz.width + "x" + sz.height});
    mask.Read("xc: #000000");

    var pointStr = "";
    copy.l = sz.width;
    copy.r = 0;
    copy.t = sz.height;
    copy.b = 0;

    for (var i = 0;i < points.length; i++){
        pointStr += points[i].x + "," + points[i].y + " ";
        if (points[i].x < copy.l){
            copy.l = points[i].x;
        }
        if (points[i].x > copy.r){
            copy.r = points[i].x;
        }
        if (points[i].y < copy.t){
            copy.t = points[i].y;
        }
        if (points[i].y > copy.b){
            copy.b = points[i].y;
        }
    }

    mask.Draw( { primitive: "polyline", points: pointStr, fill: "#ffffff"});
    mask.Set({matte: 'false'});

    var bg = new PXN8.ImageMagick();
    bg.Set({size: sz.width + "x" + sz.height});

    // the 00 (transparent) alpha part is essential.

    bg.Read("xc: #0000ff00");
    bg.Set({matte: 'false'});
    bg.Transparent ({color: "#0000ff"});
    bg.Composite ( {image: image, mask: mask});
    bg.Crop({x: copy.l, y: copy.t, width: (copy.r - copy.l), height: (copy.b - copy.t)});
    var op = PXN8.ImageMagick.end( bg, false);
    op.__extension = ".png";

    var script = PXN8.getScript();
    script.push(op);
    end_copy();

    //
    // Submit the script but don't update the current image with the changed image
    // instead use the changed image for pasting on top of the current image.
    //
    PXN8.ajax.submitScript(script,start_paste);
}
