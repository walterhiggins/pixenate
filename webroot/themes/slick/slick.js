/*
 * optimized rotation: if rotated 90 degrees x 4 then just undo previous 3 operations
 */
function slickRotate(event)
{
    PXN8.tools.rotate({angle:90});
    return false;
}

function submit_upload_form(form)
{
    var fname = document.getElementById("filename").value;
    if (fname == "" ){
        alert("Press the Browse button to choose a file first");
        return false;
    }
    form.pxn8_root.value = PXN8.root;
    // upload won't work if page is in a frameset.
    var current_page = window.location.href;
    current_page = current_page.split("#")[0];
    current_page = current_page.split("?")[0];
    form.next_page.value = current_page;

    return true;
}
function loadImageFromPrompt()
{
    var loc = prompt("Please enter the web address of the image:","http:/" + "/");
    if (loc){
        toggleVisibility(null,'sourceoptions'); //
        //
        // loadImage is deprecated in favour of PXN8.initialize()
        //
        //PXN8.loadImage(loc);
        //
        PXN8.initialize(loc);

    }
    return false;
}
function toggleVisibility(element, targetId, nodeTexts)
{
    var dom  = PXN8.dom;

    var targetElement = dom.id(targetId);
    if (targetElement.style.display == "none"){
        targetElement.style.display = "block";
        if (nodeTexts){
            element.innerHTML = nodeTexts.hide;
        }
    }else{
        targetElement.style.display = "none";
        if (nodeTexts){
            element.innerHTML = nodeTexts.show;
        }
    }
    return false;
}
function toggleConfigVisibility(visible)
{
    var dom = PXN8.dom;

    var toolPalette = dom.id("all_tools");
    toolPalette.style.display = visible?"none":"block";
    var toolPalette = dom.id("pxn8_config_area");
    toolPalette.style.display = visible?"block":"none";
}

function configureTool (func, element, event)
{
    if (typeof element == "string"){
        element = PXN8.dom.id(element);
    }

    if (!event){
        event = window.event;
    }

    PXN8.tooltip.hide(element);
    toggleConfigVisibility(true);

    var cleanUp = function(){
        var _ = PXN8.dom;
        PXN8.resize.enable(["n","s","e","w","ne","nw","sw"],true);

        var cancelBtn = _.id("pxn8_cancel");
        if (cancelBtn){
            //
            // for the RedEye mode, Change "Done" back to "Cancel"
            //
            _.cl(cancelBtn);
            _.ac(cancelBtn,_.tx("Cancel"));
            //
            // wph 20070120 : remove the 'undo' button
            //
        }
        var undoBtn = _.id("pxn8_redeye_undo_btn");
        if (undoBtn){
            undoBtn.parentNode.removeChild(undoBtn);
        }
    };
    cleanUp();
    func(element,event);
}
/**
 * The following code temporarily highlights the 'Undo' button
 * when the image is modified so that the user is subtly guided
 * to the location of the 'Undo' button.
 */

var undoHilited = false;
PXN8.listener.add(PXN8.ON_IMAGE_CHANGE,function(){
	     if (PXN8.opNumber == 1 && !undoHilited){
            el = document.getElementById("undo").parentNode;
            el.style.backgroundColor = "lemonchiffon";

            setTimeout(function(){
                    el.style.backgroundColor = "transparent";
                },2000);
            undoHilited = true;
        }
    });

function _undo()
{
    PXN8.tooltip.hide(this,"undo");
    PXN8.tools.undo();
    return false;
}

function _redo()
{
    PXN8.tooltip.hide(this,"redo");
    PXN8.tools.redo();
    return false;
}
function _selectall()
{
    PXN8.tooltip.hide(this,"selectall");
    PXN8.selectAll();
    return false;
}
function _selectnone()
{
    PXN8.tooltip.hide(this,"selectnone");
    PXN8.unselect();
    return false;
}
function _zoomin()
{
    PXN8.tooltip.hide(this,"zoomin");
    PXN8.zoom.zoomIn();
}
function _zoomout()
{
    PXN8.tooltip.hide(this,"zoomout");
    PXN8.zoom.zoomOut();
}
function _enhance()
{
    PXN8.tooltip.hide(this,"enhance");
	 PXN8.tools.enhance();
    return false;
}
function _normalize()
{
    PXN8.tooltip.hide(this,"normalize");
	 PXN8.tools.normalize();
    return false;
}
function _fill_flash()
{
    PXN8.tooltip.hide(this,"fill_flash");
    PXN8.tools.fill_flash();
    return false;
}
function _crop()
{
    configureTool(PXN8.tools.ui.config_crop,"crop",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _resize()
{
    configureTool(PXN8.tools.ui.config_resize,"resize",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _rotate()
{
    PXN8.tooltip.hide(this,"rotate");
    PXN8.tools.rotate({angle: 90});
    return false;
}
function _rotateccw()
{
    PXN8.tooltip.hide(this,"rotateccw");
    PXN8.tools.rotate({angle: 270});
    return false;
}
function _flipvertically()
{
    PXN8.tooltip.hide(this,"flipvertically");
    PXN8.tools.rotate({flipvt: true});
    return false;
}
function _fliphorizontally()
{
    PXN8.tooltip.hide(this,"fliphorizontally");
    PXN8.tools.rotate({fliphz: true});
    return false;
}
function _spiritlevel()
{
    configureTool(spiritlevelmode,"spiritlevel",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _redeye()
{
    configureTool(PXN8.tools.ui.config_redeye,"redeye",window.event);
    return false;
}
function _whiten()
{
    configureTool(PXN8.tools.ui.config_whiten,"whiten",window.event);
    return false;
}
function _sepia()
{
    configureTool(PXN8.tools.ui.config_sepia,"sepia",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _bsh()
{
    configureTool(PXN8.tools.ui.config_bsh,"bsh",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _lomo()
{
    configureTool(PXN8.tools.ui.config_lomo,"lomo",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _filter()
{
    configureTool(PXN8.tools.ui.config_filter,"filter",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _roundedcorners()
{
    configureTool(PXN8.tools.ui.config_roundedcorners,"roundedcorners",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _interlace()
{
    configureTool(PXN8.tools.ui.config_interlace,"interlace",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _snow()
{
    PXN8.tooltip.hide(this);
    PXN8.tools.snow();
    return false;
}
function _addtext()
{
    configureTool(showConfigText,"addtext",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}
function _oilpainting()
{
    configureTool(PXN8.tools.ui.config_oilpainting,"oilpainting",window.event);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            toggleConfigVisibility(false);
        });
    return false;
}

function _sketch()
{
	 var image = PXN8.ImageMagick.start();

    var tile = new PXN8.ImageMagick();
    tile.Method("Read",{filename: "images/overlays/pencil_tile.gif"});
	 image.Quantize({colorspace: "Gray"});
	 image.Composite({image: tile, tile: "true", compose: "ColorDodge"});

	 /*
	  * the expensive way
	  *
	  image.Quantize({colorspace: "Gray"});
	  image.Sketch({radius: 0, sigma: 20, angle: 120});
	  */

    PXN8.ImageMagick.end(image);
}

