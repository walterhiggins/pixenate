
var PXN8 = PXN8 || {};

var heart_outline = "images/overlays/heart_outline.gif";
var heart_mask = "images/overlays/heart_mask.jpg";

function create_cutout()
{
    var crop = PXN8.getSelection();
    crop.operation= "crop";
    

    var mask = PXN8.getSelection();
    
    mask.operation = "mask";
    mask.filepath = heart_mask;
    var color = null;
    var pink = document.getElementById("heart_pink");
    var white = document.getElementById("heart_white");
    var trans = document.getElementById("heart_transparent");

    if (pink.checked){
        color = pink.value;
    }
    if (white.checked){
        color = white.value;
    }
    if (trans.checked){
        color = trans.value;
        mask.__extension = ".png";
    }
    
    mask.background_color = color;
    
    PXN8.tools.updateImage([crop,mask]);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            hide_valentine_config();
        });
    
}

function show_valentine_config()
{
    
    document.getElementById("all_tools").style.display="none";
    document.getElementById("valentine_config").style.display = "block";
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

    var minDim = Math.min(rw,rh);

    PXN8.overlay.start(PXN8.root + heart_outline,{width: minDim,height: minDim, top:0, left: 0 });
}

function hide_valentine_config()
{
    document.getElementById("all_tools").style.display="block";
    document.getElementById("valentine_config").style.display = "none";
    PXN8.overlay.stop();
    PXN8.unselect();
}
