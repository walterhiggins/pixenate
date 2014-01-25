function hidepanel(id)
{
    document.getElementById(id).style.display = "none";
}

function myconfigresizepanel()
{
    document.getElementById('resizepanel').style.display = "block";

    var fh = document.getElementById("resizeHeight");
    if (fh){
        fh.value = PXN8.image.height;
    }

    var fw = document.getElementById("resizeWidth");
    if (fw){
        fw.value = PXN8.image.width;
        fw.focus();
    }
}
function myresize()
{
    PXN8.tools.ui.resize();
    document.getElementById('resizepanel').style.display = "none";
}

function myundoall()
{
    PXN8.tools.undoall();

    setEnabled('undo',PXN8.opNumber > 0);
    setEnabled('undoall',PXN8.opNumber > 0);
    setEnabled('redo',PXN8.maxOpNumber > PXN8.opNumber);

}

function myundo()
{
    PXN8.tools.undo();

    setEnabled('undo',PXN8.opNumber > 0);
    setEnabled('undoall',PXN8.opNumber > 0);
    setEnabled('redo',PXN8.maxOpNumber > PXN8.opNumber);

}
function mycolors (param, value)
{
    if (param == "brightness"){
        PXN8.tools.colors({brightness: value});
    }
    if (param == "contrast"){
        PXN8.tools.colors({contrast: value});
    }

    return false;
}

function myzoomin ()
{
    PXN8.zoom.zoomIn();
    setEnabled('zoomin',PXN8.zoom.canZoomIn());
    setEnabled('zoomout',PXN8.zoom.canZoomOut());
    setEnabled('fitcanvas',true);
    return false;
}
function myzoomout ()
{
    PXN8.zoom.zoomOut();
    setEnabled('zoomin',PXN8.zoom.canZoomIn());
    setEnabled('zoomout',PXN8.zoom.canZoomOut());
    setEnabled('fitcanvas',true);
    return false;
}
function openUploadDlg()
{
	var dlg = document.getElementById("uploadArea");
	dlg.style.display = "block";
	var scroller = document.getElementById("pxn8_scroller");
	var seb = PXN8.dom.eb(scroller);
	dlg.style.top = seb.y + 30 + "px";
	dlg.style.left = seb.x + 30 + "px";
}
function closeUploadDlg()
{
	var dlg = document.getElementById("uploadArea");
	dlg.style.display = "none";
}
function myfitcanvas ()
{
    var scroller = document.getElementById("pxn8_scroller");
    var width = parseInt(scroller.style.width);
    var height = parseInt(scroller.style.height);
    PXN8.zoom.toSize(width,height);

    setEnabled('zoomout',PXN8.zoom.canZoomOut());
    setEnabled('zoomin',PXN8.zoom.canZoomIn());
    setEnabled('fitcanvas',false);

    return false;
}
/**
 * Setup listeners
 */
PXN8.listener.add(PXN8.ON_IMAGE_CHANGE,function(){
    setEnabled('fitcanvas',true);
    setEnabled('undo',PXN8.opNumber > 0);
    //setEnabled('save',PXN8.opNumber > 0);
    setEnabled('undoall',PXN8.opNumber > 0);
    setEnabled('redo',PXN8.maxOpNumber > PXN8.opNumber);
});

PXN8.listener.add(PXN8.ON_SELECTION_CHANGE, function(){
    var sel = PXN8.getSelection();
    setEnabled('selectnone',sel.width > 0);
	 setEnabled('crop',sel.width > 0);
});

/**
 *
 */
function uploadImage()
{
    PXN8.prepareForSubmit('Uploading Image. Please wait...');
    document.getElementById('uploadForm').submit();
}

function myshrink(value)
{
    PXN8.tools.resize(PXN8.image.width*value,PXN8.image.height*value);
}

function myredo()
{
    PXN8.tools.redo();

    setEnabled('undo',PXN8.opNumber > 0);
    setEnabled('undoall',PXN8.opNumber > 0);
    setEnabled('redo',PXN8.maxOpNumber > PXN8.opNumber);
}

function setEnabled(id,enable)
{
    if (enable){
        var link = document.getElementById(id);
	     link.disabled = false;

    }else{
        var link = document.getElementById(id);
	     link.disabled = true;
    }
}
/**
 * Called when the imaage upload form is about to be submitted.
 */
function submit_upload_form(form)
{
  var filename = document.getElementById("filename").value;
  if (filename == "" ){
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

PXN8.dom.addLoadEvent(function(){
    PXN8.listener.add(PXN8.ON_IMAGE_LOAD,function(){

        var saveBtn = document.getElementById("save");
        if (PXN8.opNumber > 0){
				saveBtn.disabled = false;
        }else{
				saveBtn.disabled = true;
        }
    });

});

var preservingRatio = true;

function preserveRatio(input)
{
    preservingRatio = input.value;
}
function changeDim(dim)
{
    if (!preservingRatio){
        return;
    }
    var img = document.getElementById("pxn8_image");
    var zoom = PXN8.zoom.value();
    var ih = img.height / zoom;
    var iw = img.width / zoom;

    if (dim == "width"){
        var nw = document.getElementById("resizeWidth").value;
        var nh = Math.round(nw * ih / iw);
        document.getElementById("resizeHeight").value = nh;

    }else{
        var nh = document.getElementById("resizeHeight").value;
        var nw = Math.round(nh * iw / ih);
        document.getElementById("resizeWidth").value = nw;
    }
}
