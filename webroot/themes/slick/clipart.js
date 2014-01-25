
var PXN8 = PXN8 || {};

PXN8.clipart = {};

function correctPNG(){};

function change_clipart(o)
{
    PXN8.clipart = o;
    var selection = PXN8.getSelection();
    //
    // enter 'overlay' mode
    // in this mode, every time the user selects an area of the photo,
    // the overlay image is super-imposed on top so the user knows  where the
    // overlay will appear once the overlay operation is applied.
    //
    var zoom = PXN8.zoom.value();
	 var img = document.all?PXN8.clipart.gif:PXN8.clipart.png;
	 var img = PXN8.clipart.png;

	 PXN8.overlay.start(PXN8.root + img,{width: PXN8.clipart.width /zoom,height: PXN8.clipart.height / zoom, top:selection.top, left: selection.left });

}

function show_clipart_config()
{
    document.getElementById("all_tools").style.display="none";
    document.getElementById("clipart_config").style.display = "block";

	 //
	 // wph 20090128 - loading the clipart images on demand speeds up initial page load
	 //
	 var req = PXN8.ajax.createRequest();
	 req.onreadystatechange = function(){
		  if (req.readyState == 4 && req.status == 200){
				document.getElementById("clipart_table_container").innerHTML = req.responseText;
		  }
	 };
	 req.open("GET", "/pixenate/themes/slick/clipart_table.html");
	 req.send(null);

    var selection = PXN8.getSelection();
    //
    // enter 'overlay' mode
    // in this mode, every time the user selects an area of the photo,
    // the overlay image is super-imposed on top so the user knows  where the
    // overlay will appear once the overlay operation is applied.
    //
    var zoom = PXN8.zoom.value();

    var theImage = document.getElementById("pxn8_image");

    var rw = theImage.width / zoom;
    var rh = theImage.height / zoom;

    if (rh < PXN8.clipart.height || rw < PXN8.clipart.width){
        //
        // zoom the photo so that the clipart doesn't obscure it completely
        //
        var nw = PXN8.clipart.width * 2;
        var nz = nw / rw;
        PXN8.zoom.zoomByValue(nz);
        zoom = nz;
    }
	 // wph 20081125 - allow clipart to clip the bounds of the image
    PXN8.select.constrainToImageBounds = false;
    var theCanvas = document.getElementById("canvas_container");
    theCanvas.style.overflow = "hidden";

    PXN8.overlay.start(PXN8.root + PXN8.clipart.gif,{width: PXN8.clipart.width /zoom,height: PXN8.clipart.height / zoom, top:selection.top, left: selection.left });

	 correctPNG();
}

function hide_clipart_config()
{
    PXN8.select.constrainToImageBounds = true;
    document.getElementById("all_tools").style.display="block";
    document.getElementById("clipart_config").style.display = "none";
    PXN8.overlay.stop();
    PXN8.unselect();
}

function add_clipart_to_photo()
{
    //
    // construct an overlay operation object
    //
    var params = PXN8.getSelection();
    if (PXN8.clipart.png){
        params.filepath = "." + PXN8.clipart.png;
    }else{
        params.filepath = "." + PXN8.clipart.gif;
    }

    params.tile = "false";

    //
    // Overlay the clipart
    //
    PXN8.tools.overlay(params);

    //
    // exit overlay mode after the image has changed
    //
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            PXN8.overlay.stop();
            PXN8.unselect();
        });
}
