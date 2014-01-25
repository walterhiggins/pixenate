/*
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 */
PXN8 = PXN8 || {};
/**
 * NAMESPACE
 */
PXN8.tools.ui = {};
/**
 * NO-OP function
 */
PXN8.tools.ui.nop = function(){return false;};

/* ===========================================================================
 * BLUR RELATED FUNCTIONS
 */
PXN8.tools.ui.blur = function()
{
    var _ = PXN8.dom;

    var radius = _.id("blurRadius").value;

    if (isNaN(radius) || radius < 1 || radius > 8){
        alert(PXN8.strings.BLUR_RANGE);
        return false;
    }

    var sel = PXN8.getSelection();

    sel.radius = radius;

    PXN8.tools.blur(sel);

    return true;
};

/*
 * Configure the blur tool panel
 */
PXN8.tools.ui.config_blur = function(element,event)
{
    var _ = PXN8.dom;

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";
    //applyBtn.onclick = PXN8.tools.ui.blur;
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        PXN8.tools.ui.blur();
        return false;
    };

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_BLUR_TOOL));

    var form = _.ac(_.cl("pxn8_config_content"),_.ce("form",{onsubmit: function(){PXN8.tools.ui.blur();return false;}}));

    var radiusInput = _.ce("input",{className: "pxn8_small_field",type: "text",id: "blurRadius",value: 2,name: "blurRadius"});

    var table = _.table([[PXN8.strings.RADIUS_LABEL,radiusInput]],{width: "100%"});

    _.ac(form,table);

    radiusInput.onfocus = radiusInput.select;

    _.ac(_.cl("pxn8_tool_prompt"),_.tx(PXN8.strings.BLUR_PROMPT));

    radiusInput.focus();
};

/* ===========================================================================
 * RESIZE RELATED FUNCTIONS
 */

/*
 * Resize the image
 */
PXN8.tools.ui.resize = function()
{
    var _ = PXN8.dom;

    var newWidth = _.id("resizeWidth").value;
    var newHeight = _.id("resizeHeight").value;

    if (newWidth == PXN8.image.width && newHeight == PXN8.image.height){
        return false;
    }
    // wph 20070517 : #18002

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0){
        alert(PXN8.strings.NUMERIC_WIDTH_HEIGHT);
        return false;
    }
    if (newWidth.match(/[0-9]+/) && newHeight.match(/[0-9]+/)){
        /* OK */
    }else{
        alert(PXN8.strings.NUMERIC_WIDTH_HEIGHT);
        return false;
    }
    if (newWidth > PXN8.resizelimit.width || newHeight > PXN8.resizelimit.height){
        alert(PXN8.strings.LIMIT_SIZE + PXN8.resizelimit.width + "x" + PXN8.resizelimit.height);
        return false;
    }
    PXN8.unselect();
    PXN8.tools.resize(newWidth,newHeight);

    return true;
};
/**
 *
 */
PXN8.tools.ui.config_resize = function(element,event)
{
    var _ = PXN8.dom;

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";

    /* fix #17996 */
    var oldSelection = PXN8.getSelection();
    var cancelBtn = _.id("pxn8_cancel");

    _.onceOnlyClickEvent(cancelBtn,function(){
        PXN8.select(oldSelection);
        return false;
    });


    //applyBtn.onclick = PXN8.tools.ui.resize;
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //

    applyBtn.onclick = function(){
        PXN8.tools.ui.resize();
        return false;
    };

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_RESIZE_TOOL));

    var configContent = _.cl("pxn8_config_content");

    _.cl("pxn8_tool_prompt");

	 var form = _.ac(configContent,_.ce("form"));
    form.onsubmit = function(){ PXN8.tools.ui.resize(); return false; };

    var preserveRatioCheckbox = _.ce("input",{type: "checkbox", id: "preserve", value: true, defaultChecked: true});
	 preserveRatioCheckbox.onclick = function(){ if (this.checked){ matchHeightToWidth();}return true;};

    var iwidth = _.ce("input",{className: "pxn8_small_field", type: "text", value: PXN8.image.width, id: "resizeWidth", name: "resizeWidth"});
    iwidth.onfocus = iwidth.select;

    iwidth.onblur = function(){ changeDim('width'); };
    var iheight  = _.ce("input",{className: "pxn8_small_field",type: "text", value: PXN8.image.height, id: "resizeHeight", name: "resizeHeight"});
    iheight.onfocus =  iheight.select;
    iheight.onblur = function(){ changeDim('height');};

    var resizeToSelectedArea = _.ce("a",{href: "#resize_to_selected_area"});
    _.ac(resizeToSelectedArea,_.tx(PXN8.strings.RESIZE_SELECT_LABEL ));
    resizeToSelectedArea.onclick = function(){
        var sel = PXN8.getSelection();
        if (sel.width <= 0 || sel.height <= 0){
            PXN8.show.alert(PXN8.strings.RESIZE_SELECT_AREA);
            return false;
        }
        PXN8.unselect();
        PXN8.tools.resize(sel.width,sel.height);
        return false;
    };

    var table = _.table([[PXN8.strings.ASPECT_LABEL, preserveRatioCheckbox],
                           [PXN8.strings.WIDTH_LABEL,  iwidth],
                           [PXN8.strings.HEIGHT_LABEL, iheight],
                           [resizeToSelectedArea] ]);
    _.ac(form,table);

    iwidth.focus();

    /**
     * default to 75% of image size
     */
    PXN8.select(0,0,PXN8.image.width * 0.75,PXN8.image.height * 0.75);

    iwidth.setAttribute('value', PXN8.image.width);
    iheight.setAttribute('value', PXN8.image.height);

};

/**
 * Change the brightness, hue and saturation
 */
PXN8.tools.ui.bsh = function()
{

    var _ = PXN8.dom;

    var bright = _.id("brightness");
    var sat = _.id("saturation");
    var h = _.id("hue");
    var contrast = _.id("contrast");
    var contrastValue = contrast.options[contrast.selectedIndex];


    if (isNaN(bright.value) || bright.value < 0 || bright.value.match(/\S+/) == null){
        alert(PXN8.strings.BRIGHTNESS_RANGE);
        return false;
    }
    if (isNaN(h.value) || h.value < 0 || h.value > 200 || h.value.match(/\S+/) == null){
      alert (PXN8.strings.HUE_RANGE);
      return false;
    }
    if (isNaN(sat.value) || sat.value < 0 || sat.value.match(/\S+/) == null){
        alert(PXN8.strings.SATURATION_RANGE);
        return false;
    }

    if (bright.value == 100 && h.value == 100 && sat.value == 100 && contrastValue.value == 0){
        return false;
    }


    PXN8.tools.colors ({brightness: bright.value,
                        hue: h.value,
                        saturation: sat.value,
                        contrast: contrastValue.value});
    return true;

};


PXN8.tools.ui.config_oilpainting = function(element, event)
{
    var _ = PXN8.dom;

    var cancelBtn = _.id("pxn8_cancel");

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";

    _.cl("pxn8_tool_prompt");

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_OILPAINT_TOOL));

    var configContent = _.cl("pxn8_config_content");

    var form = _.ac(configContent,_.ce("form",{onsubmit: function(){
        return false;
    }}));

    /**
     * Construct a slider control to control the brightness
     */
    var slide = _.ce("div");
    _.ac(slide,_.tx(PXN8.strings.RADIUS_LABEL));

    var radius_input =   _.ce("input",{className: "pxn8_slidervalue", type: "text", name: "oilpaint_radius", id: "oilpaint_radius"});

    var table = _.table([[ slide,     radius_input]],{width: "90%"});
    _.ac(form,table);

    var previewer = PXN8.preview.initialize("pxn8_preview");

    // make it a slide
    PXN8.slide.bind(slide,'oilpaint_radius',1,7,4,1,function(){oilpaint_preview(previewer);});

    var cells = table.getElementsByTagName("td");
    for (var i = 0 ; i < cells.length; i++){
        cells[i].vAlign = "bottom";
    }
    radius_input.focus();
    radius_input.select();

    PXN8.preview.show(previewer,{operation: "oilpaint", radius: 4});

    _.onceOnlyClickEvent(cancelBtn,function(){
        PXN8.preview.hide(previewer);
        return false;
    });
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        var radius = _.id("oilpaint_radius").value;
        PXN8.tools.oilpaint(Math.max(1,Math.min(10,radius)));
        PXN8.preview.hide(previewer);
        return false;
    };

};

function oilpaint_preview(previewer)
{
    var _ = PXN8.dom;
    var radius = _.id("oilpaint_radius").value;
    radius = isNaN(radius)?4:radius;
    var limited = Math.max(1,Math.min(8,radius));
    var op = {operation: "oilpaint", radius: limited};
    PXN8.preview.show(previewer,op);
}

PXN8.tools.ui.config_charcoal = function(element, event)
{
    var _ = PXN8.dom;

    var previewer = PXN8.preview.initialize("pxn8_preview");

    var cancelBtn = _.id("pxn8_cancel");
    _.onceOnlyClickEvent(cancelBtn,function(){
        PXN8.preview.hide(previewer);
        return false;
    });

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        var radius = _.id("charcoal_radius").value;
        var limited = Math.max(1,Math.min(8,radius));
        PXN8.tools.charcoal(limited);
        PXN8.preview.hide(previewer);
        return false;
    };

    _.cl("pxn8_tool_prompt");

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_CHARCOAL_TOOL));

    var configContent = _.cl("pxn8_config_content");

    var form = _.ac(configContent,_.ce("form",{onsubmit: function(){
        return false;
    }}));

    /**
     * Construct a slider control to control the brightness
     */
    var slide = _.ce("div");
    _.ac(slide,_.tx(PXN8.strings.RADIUS_LABEL));

    var radius_input =   _.ce("input",{className: "pxn8_slidervalue", type: "text", name: "charcoal_radius", id: "charcoal_radius"});

    var table = _.table([[ slide,     radius_input]],{width: "90%"});
    _.ac(form,table);

    // make it a slide
    PXN8.slide.bind(slide,'charcoal_radius',1,7,4,1,function(){charcoal_preview(previewer);});

    var cells = table.getElementsByTagName("td");
    for (var i = 0 ; i < cells.length; i++){
        cells[i].vAlign = "bottom";
    }
    radius_input.focus();
    radius_input.select();

    PXN8.preview.show(previewer,{operation: "charcoal", radius: 4});

};

function charcoal_preview(previewer)
{
    var _ = PXN8.dom;
    var radius = _.id("charcoal_radius").value;
    radius = isNaN(radius)?4:radius;
    var limited = Math.max(1,Math.min(8,radius));
    var op = {operation: "charcoal", radius: limited};
    PXN8.preview.show(previewer,op);
}

/*
 * ----------------------------------------------------------------
 * Setup the Tool configuration panel for Brightness/Hue/Saturation
 * ----------------------------------------------------------------
 */
PXN8.tools.ui.config_bsh = function(element,event)
{
    var _ = PXN8.dom;

    var previewer = PXN8.preview.initialize("pxn8_preview");

    var cancelBtn = _.id("pxn8_cancel");
    _.onceOnlyClickEvent(cancelBtn,function(){
        PXN8.preview.hide(previewer);
        return false;
    });

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        PXN8.preview.hide(previewer);
        PXN8.tools.ui.bsh();
        return false;
    };

    _.cl("pxn8_tool_prompt");

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_COLOR_TOOL));

    var configContent = _.cl("pxn8_config_content");

    var form = _.ac(configContent,_.ce("form",{onsubmit: function(){
        PXN8.tools.ui.bsh();
        return false;
    }}));

    /**
     * Construct a slider control to control the brightness
     */
    var brightness_slide = _.ce("div");
    _.ac(brightness_slide,_.tx(PXN8.strings.BRIGHTNESS_LABEL));

    var brightness_input =   _.ce("input",{className: "pxn8_slidervalue",
                                   type: "text",
                                   name: "brightness",
                                   id: "brightness", value: 100});

    /**
     * Construct a slider control to control the saturation
     */
    var saturation_slide = _.ce("div");
    _.ac(saturation_slide,_.tx(PXN8.strings.SATURATION_LABEL));

    var saturation_input = _.ce("input",{className: "pxn8_slidervalue", type: "text", name: "saturation", id: "saturation", value: 100});

    /**
     * Construct a slider control to control the HUE
     */
    var hue_slide =  _.ce("div");

    _.ac(hue_slide,_.tx(PXN8.strings.HUE_LABEL));

    var hue_input = _.ce("input",{className: "pxn8_slidervalue",
                               type: "text",
                               name: "hue",
                               id: "hue",
                               value: 100});

    /**
     * Construct a 'contrast' dropdown combobox
     */
    var sel = _.ce("select",{name: "contrast", id: "contrast" });
    var options = {"-3": "-3", "-2": "-2", "-1": "-1", "0": PXN8.strings.CONTRAST_NORMAL, "1": "+1", "2": "+2", "3": "+3"};
    var j  = 0;
    for (var i in options){
        if (typeof options[i] != "function"){
            sel.options[j++] = new Option(options[i],i);
        }
    }
    sel.selectedIndex = 3;

    var table = _.table([[ brightness_slide,     brightness_input,   "%"],
                           [ saturation_slide,    saturation_input,     "%"],
                           [ hue_slide,    hue_input,     "%"],
                           [ PXN8.strings.CONTRAST_LABEL, sel]],{width: "90%"});
    _.ac(form,table);

    // make it a slide
    PXN8.slide.bind(brightness_slide,'brightness',0,200,100,5,function(){colors_preview(previewer);});
    PXN8.slide.bind(saturation_slide,'saturation',0,200,100,5,function(){colors_preview(previewer);});
    PXN8.slide.bind(hue_slide,'hue',0,200,100,5,function(){colors_preview(previewer);});

    var cells = table.getElementsByTagName("td");
    for (var i = 0 ; i < cells.length; i++){
        cells[i].vAlign = "bottom";
    }

    sel.onchange = function(){colors_preview(previewer);};

    var br = _.id("brightness");
    br.focus();
    br.select();

    PXN8.preview.show(previewer);

};

/*
 * -------------------------------------------------------------------------
 * CROP RELATED FUNCTIONS
 * -------------------------------------------------------------------------
 */

/*
 * perform crop operation
 */
PXN8.tools.ui.crop = function()
{
    var sel = PXN8.getSelection();

    if (sel.width <= 0 || sel.height <= 0){
        PXN8.show.alert(PXN8.strings.CROP_SELECT_AREA);
        return false;
    }

    PXN8.tools.crop(sel);

    PXN8.unselect();

    PXN8.selectByRatio("free");

    return true;
};

/*
 * Configure the Crop tool panel
 */
PXN8.tools.ui.config_crop = function(element,event)
{
    var _ = PXN8.dom;

    var oldSelection = PXN8.getSelection();

    var selH = _.ce("input",{className: "pxn8_small_field", type: "text", value: oldSelection.height});
    var selW = _.ce("input",{className: "pxn8_small_field", type: "text", value: oldSelection.width});

    var onSelChange = function(){
        var selection = PXN8.getSelection();
        selH.value = selection.height;
        selW.value = selection.width;
    };

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        PXN8.tools.ui.crop();
        PXN8.listener.remove(PXN8.ON_SELECTION_CHANGE,onSelChange);
        return false;
    };


    var cancelBtn = _.id("pxn8_cancel");
    _.onceOnlyClickEvent(cancelBtn,function(){
        /* change the aspect ratio back to 'free select' */
        PXN8.selectByRatio("free");
        /* fix #17971 */
        PXN8.select(oldSelection);
        PXN8.listener.remove(PXN8.ON_SELECTION_CHANGE,onSelChange);
        return false;
    });

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_CROP_TOOL));

    var theImg = _.id("pxn8_image");

    var helpArea = _.cl("pxn8_tool_prompt");

    var form = _.ac(_.cl("pxn8_config_content"),_.ce("form"));

    form.onsubmit =  function(){
        PXN8.tools.ui.crop();
        return false;
    };

    var sel = _.ce("select",{id: "aspect_ratio", name: "aspect_ratio"});
    sel.onchange = function() {
        var selected = sel.options[sel.selectedIndex];
        PXN8.selectByRatio(selected.value);
    };
    var options = {"free": PXN8.strings.CROP_FREE,
                   "1x1" : PXN8.strings.CROP_SQUARE,
						 "1x1.618": "Golden Ratio",
                   "4x6" : "4x6",
                   "5x7" : "5x7",
                   "8x10": "8x10",
                   "6x8" : "6x8"};
    var j = 0;
    for (var i in options){
        if (typeof options[i] != "function"){
            sel.options[j++] = new Option(options[i],i);
        }
    }

    /**
     * Preview Crop link
     */
    var prevCropLink = _.ce("a",{href: "#preview_crop",onclick: function(){PXN8.tools.preview_crop()}});
    // wph 20070517
    _.ac(prevCropLink,_.tx("Preview"));

    var rotateSelLink = _.ce("a",{href: "#rotate_selection",onclick: PXN8.rotateSelection});

    _.ac(rotateSelLink,_.tx("Rotate selection"));


    var onSelDimChange = function(){

        var ih = selH.value;
        var iw = selW.value;
        if (isNaN(ih) || isNaN(iw) || ih < 0 || iw < 0){
            return;
        }
        var image = _.id("pxn8_image");
        var zoom = PXN8.zoom.value();

        var realdims = {width: image.width / zoom, height: image.height / zoom};

        var nw = Math.min(realdims.width , iw);
        var nh = Math.min(realdims.height , ih);

        PXN8.select(0, 0,nw,nh);

    };

    selH.onchange = onSelDimChange;
    selW.onchange = onSelDimChange;

    PXN8.listener.add(PXN8.ON_SELECTION_CHANGE,onSelChange);


    var table = _.table([[PXN8.strings.ASPECT_CROP_LABEL, sel],
                         [prevCropLink, rotateSelLink],
                         ["Width:", selW],
                         ["Height:",selH]], {width: "100%"});

    _.ac(form,table);

    sel.focus();

};


/* ===========================================================================
 * FILTER RELATED FUNCTIONS
 * ===========================================================================
 */

/*
 * Add a lens filter to the image
 */
PXN8.tools.ui.filter = function(x,y,c,o)
{
    var _ = PXN8.dom;

    var applyBtn  = _.id("pxn8_apply");
    applyBtn.style.display = "inline";

    PXN8.tools.filter({top: y, color: c, opacity : o} );
    return true;
};

/*
 *
 */
PXN8.tools.ui.config_filter = function (element, event)
{
    var _ = PXN8.dom;
    var defaultColor = "#FFA500";
	 var color = defaultColor;

    var applyBtn = _.id("pxn8_apply");

    applyBtn.style.display = "none";

    var canvas = _.id("pxn8_canvas");
    var oldonmousedown = canvas.onmousedown;

    var onImageUpdated = null;
    onImageUpdated = function()
	 {
        applyBtn.style.display = "inline";
        var pin1 = _.id("left_pin");
        if (pin1){
            pin1.style.display = "none";
        }
        canvas.onmousedown = oldonmousedown;
    };
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,onImageUpdated);


    var cancelBtn = _.id("pxn8_cancel");
    _.onceOnlyClickEvent(cancelBtn,onImageUpdated);

	 _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_FILTER_TOOL));

    PXN8.unselect();

    var configContent = _.cl("pxn8_config_content");


    var picker = PXN8.colors.picker(defaultColor,function(v)
	 {
		  color = v;
    });

	 _.ac(configContent,picker);

    /**
     * Construct a slider control to control opacity
     */
    var opacitySliderDiv = _.ce("div");
    _.ac(opacitySliderDiv,_.tx(PXN8.strings.OPACITY_LABEL));

    var opacityInput = _.ce("input",{className: "pxn8_slidervalue", type: "text", name: "filter_opacity", id: "filter_opacity", value: 75});

    var table3 = _.table([[opacitySliderDiv,         opacityInput, _.tx("%")]]);

    _.ac(configContent,table3);

    cells = table3.getElementsByTagName("td");
    for (var i = 0;i < cells.length; i++){
        cells[i].vAlign = "bottom";
    }

    _.ac(_.cl("pxn8_tool_prompt"),_.tx(PXN8.strings.FILTER_PROMPT));

    var newonmousedown = function(event){

        if (!event) event = window.event;
        var cursorPos = _.cursorPos(event);

        var imagePoint = PXN8.mousePointToElementPoint(cursorPos.x,cursorPos.y);

        canvas.onmousedown = oldonmousedown;

        // show pin
        var pin1 = _.id("left_pin");
        if (pin1 == null){
            pin1 = PXN8.createPin("left_pin", PXN8.root + "/images/bluepin.gif");
            document.body.appendChild(pin1);
        }

        pin1.style.display = "block";
        pin1.style.left = "" + (cursorPos.x -7) + "px";
        pin1.style.top = "" + (cursorPos.y - 7) + "px";
		  var opacity = _.id("filter_opacity").value;
        PXN8.tools.ui.filter(imagePoint.x,imagePoint.y,color,opacity);
        return true;
    };

    // make it a slide
    PXN8.slide.bind(opacitySliderDiv,'filter_opacity',0,100,75);

    canvas.onmousedown = newonmousedown;

};

/* ===========================================================================
 * INTERLACE RELATED FUNCTIONS
 * ===========================================================================
 */


/*
 * Setup the configuration panel for the interlace effect
 */
PXN8.tools.ui.config_interlace = function (element,event)
{
    var _ = PXN8.dom;
    var defaultColor = "#000000";
    var defaultOpacity = 20;
    var previewer = PXN8.preview.initialize("pxn8_preview");

    var cancelBtn = _.id("pxn8_cancel");
    _.onceOnlyClickEvent(cancelBtn,function()
	 {
        PXN8.preview.hide(previewer);
        return false;
    });
	 var color = defaultColor;

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";

    //
    // apply   button is a link and therefore it's onclick
    // Must return false to work correctly in IE
    //
    applyBtn.onclick = function()
	 {
		  var opacity = _.id("interlace_opacity").value;
        PXN8.tools.ui.interlace(color,opacity);
        PXN8.preview.hide(previewer);
        return false;
    };

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_INTERLACE_TOOL));

    var configContent = _.cl("pxn8_config_content");

    var picker = PXN8.colors.picker(defaultColor,function(v){
		  color = v;
        interlace_preview(previewer,color,PXN8.dom.id("interlace_opacity").value);
    });

    _.ac(configContent,picker);

    /**
     * Construct a slider control to control opacity
     */
    var opacitySliderDiv = _.ce("div");
    _.ac(opacitySliderDiv,_.tx(PXN8.strings.OPACITY_LABEL));

    var opacityInput = _.ce("input",
	 {
		  className: "pxn8_slidervalue",
		  type: "text",
		  name: "interlace_opacity",
		  id: "interlace_opacity",
		  value: defaultOpacity
	 });

    _.ac(configContent,_.table([[opacitySliderDiv, opacityInput, _.tx("%")]]));

    // make it a slide
    PXN8.slide.bind(opacitySliderDiv,'interlace_opacity',0,100,defaultOpacity,5,function(){
        interlace_preview(previewer,color,_.id("interlace_opacity").value);
    });

    var helpArea = _.id("pxn8_tool_prompt");
    _.cl(helpArea);
    helpArea.appendChild(_.tx(PXN8.strings.INTERLACE_PROMPT));

    opacityInput.focus();

    PXN8.preview.show(previewer, {"operation": "interlace", "color": defaultColor, "opacity": defaultOpacity});

};

/*
 * Add an interlace effect to the image
 */
PXN8.tools.ui.interlace = function(lineColor,opacity)
{
    var _ = PXN8.dom;

    if (lineColor.match(/#[a-fA-F0-9]{6}/)){
        /* it's OK */
    }else{
        alert(PXN8.strings.INVALID_HEX_VALUE);
        return false;
    }
    var sel = PXN8.getSelection();
    sel.opacity = opacity;
    sel.color = lineColor;
    PXN8.tools.interlace(sel);

    return true;
};

/* ===========================================================================
 * LOMO RELATED FUNCTIONS
 * ===========================================================================
 */
function lomo_preview(previewer)
{
    var _ = PXN8.dom;
    var opacity = _.id("opacity").value;
    var saturate = _.id("saturate").checked;
    var op = {operation: "lomo"};
    op.opacity = opacity;
    op.saturate = saturate;

    PXN8.preview.show(previewer,op);

}
/*
 * Configure the lomo tool panel
 */
PXN8.tools.ui.config_lomo = function (element,event)
{
    var _ = PXN8.dom;
    var previewer = PXN8.preview.initialize("pxn8_preview");

    var cancelBtn = _.id("pxn8_cancel");
    _.onceOnlyClickEvent(cancelBtn,function(){
        PXN8.preview.hide(previewer);
        return false;
    });

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        PXN8.tools.ui.lomo();
        PXN8.preview.hide(previewer);
        return false;
    };

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_LOMO_TOOL));

    _.ac(_.cl("pxn8_tool_prompt"),_.tx(PXN8.strings.OPACITY_PROMPT));

    var form = _.ac(_.cl("pxn8_config_content"),_.ce("form",{name: "lomoform"}));

    form.onsubmit = function(){
        PXN8.tools.ui.lomo();
        return false;
    };

    var defaultOpacity = 60;

    /**
     * Construct a slider control to control opacity
     */
	 var opslide = _.ce("div");
	 var opacity_label = _.tx(PXN8.strings.OPACITY_LABEL);
	 opslide.appendChild(opacity_label);
    //_.ac(opslide,);

    var opacityField = _.ce("input",{className: "pxn8_slidervalue", type:"text", name:"opacity", id:"opacity"});

    var saturateCheckbox = _.ce("input",{type:"checkbox",name: "saturate", defaultChecked: true, id:"saturate"});

    saturateCheckbox.onclick = function(){lomo_preview(previewer);};

    var table = _.table([[opslide,                   [opacityField,"%"]],
                         [PXN8.strings.SATURATE_LABEL, saturateCheckbox]],{width: "100%"});



	 form.appendChild(table);

    // make it a slide
    PXN8.slide.bind(opslide,'opacity',0,100,defaultOpacity,5,function(){lomo_preview(previewer);});

    //_.ac(form,table);
    var cells = table.getElementsByTagName("td");
    for (var i = 0; i < cells.length; i++){
        cells[i].vAlign = "bottom";
    }

    opacityField.focus();

    PXN8.preview.show(previewer,{operation: "lomo", opacity: defaultOpacity, saturate: true});


};


/*
 * Add a lomo effect to the image
 */
PXN8.tools.ui.lomo = function()
{
    var _ = PXN8.dom;

    var opacity = _.id("opacity");
    var saturate = _.id("saturate");

    if (isNaN(opacity.value) || opacity.value <0 || opacity.value > 100){
        alert(PXN8.strings.OPACITY_RANGE);
        return false;
    }

    PXN8.tools.lomo({ "opacity": opacity.value, "saturate": saturate.checked });

    return true;
};


/*
 * whiten teeth
 */
PXN8.tools.ui.whiten = function()
{

    var selection = PXN8.getSelection();
    if (selection.width == 0 || selection.height == 0){
        PXN8.show.alert(PXN8.strings.WHITEN_SELECT_AREA);
        return false;
    }

    if (selection.width * selection.height > 16000){
        PXN8.show.alert (PXN8.strings.SELECT_SMALLER_AREA);
        return false;
    }

    PXN8.tools.whiten(selection);

    //
    // wph 20070221 : Clear selection
    //
    PXN8.unselect();

    return true;
};


/*
 * -------------------------------------------------------------------------
 * RED EYE RELATED FUNCTIONS
 * -------------------------------------------------------------------------
 */
/*
 * Fix red eye
 */
PXN8.tools.ui.redeye = function ()
{
    var selection = PXN8.getSelection();
    if (selection.width == 0 || selection.height == 0){
        alert(PXN8.strings.REDEYE_SELECT_AREA);
        return false;
    }
    var selChanged = false;

    if (selection.width > 100){
        selection.left = selection.left + ((selection.width - 100) / 2);
        selection.width = 100;
        selChanged = true;

    }
    if (selection.height > 100){
        selection.top = selection.top + ((selection.height - 100) / 2);
        selection.height = 100;
        selChanged = true;

    }
    if (selChanged){
        PXN8.select(selection);
    }

    PXN8.tools.fixredeye(selection);

    PXN8.unselect();
    return true;
};

PXN8.tools.ui.config_whiten = function()
{
    var _ = PXN8.dom;

    var applyBtn = _.id("pxn8_apply");
    var cancelBtn = _.id("pxn8_cancel");

    applyBtn.style.display = "inline";
    applyBtn.onclick = PXN8.tools.ui.whiten;

    var cleanUp = function(){
        var _ = PXN8.dom;
        PXN8.resize.enable(["n","s","e","w","ne","nw","sw"],true);

        //
        // for this mode, Change "Done" back to "Cancel"
        //
        _.cl(cancelBtn);
        _.ac(cancelBtn,_.tx("Cancel"));
        //
        // wph 20070120 : remove the 'undo' button
        //
        var undoBtn = _.id("pxn8_redeye_undo_btn");
        if (undoBtn){
            undoBtn.parentNode.removeChild(undoBtn);
        }
    };
    _.onceOnlyClickEvent(cancelBtn,function(){
        cleanUp();
    });
    //
    // for this mode, Change Cancel to Done.
    //
    _.cl(cancelBtn);
    _.ac(cancelBtn,_.tx("Done"));

    //
    // wph 20070120 add 'undo' button to panel
    //
    var buttons = _.id("pxn8_apply").parentNode;
    var undoBtn = _.id("pxn8_redeye_undo_btn");
    if (undoBtn == null){
        undoBtn = _.ce("button", {id: "pxn8_redeye_undo_btn"});

        buttons.insertBefore(undoBtn,cancelBtn);
        buttons.insertBefore(_.tx("\n"),cancelBtn);

        undoBtn.onclick = function(){
            PXN8.tools.undo();
            return false;
        };
        _.ac(undoBtn,_.tx("Undo"));
    }



    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_WHITEN_TOOL));

    _.ac(_.cl("pxn8_config_content"),_.tx("Select the area you wish to whiten. Then click 'Apply'."));

    _.cl("pxn8_tool_prompt");

};


/*
 * Configure the red eye tool panel
 */
PXN8.tools.ui.config_redeye = function (element,event)
{
    var _ = PXN8.dom;

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";
    var cancelBtn = _.id("pxn8_cancel");

    PXN8.resize.enable(["n","s","e","w","ne","nw","sw"],false);

    var cleanUpAfterRedEye = function(){
        var _ = PXN8.dom;
        PXN8.resize.enable(["n","s","e","w","ne","nw","sw"],true);

        //
        // for the RedEye mode, Change "Done" back to "Cancel"
        //
        _.cl(cancelBtn);
        _.ac(cancelBtn,_.tx("Cancel"));
        //
        // wph 20070120 : remove the 'undo' button
        //
        var undoBtn = _.id("pxn8_redeye_undo_btn");
        if (undoBtn){
            undoBtn.parentNode.removeChild(undoBtn);
        }
    };
    _.onceOnlyClickEvent(cancelBtn,function(){
        cleanUpAfterRedEye();
    });

    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        var selectionAreaOK = PXN8.tools.ui.redeye();
        if (selectionAreaOK){
            //
            // wph 20070119
            // Don't clean up after apply button.
            // cleanup should only occur after the 'cancel/done' button is clicked.
            // cleanUpAfterRedEye();
        }
        return false;
    };

    //
    // for the RedEye mode, Change Cancel to Done.
    //
    _.cl(cancelBtn);
    _.ac(cancelBtn,_.tx("Done"));

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_REDEYE_TOOL));

    //
    // wph 20070120 add 'undo' button to panel
    //
    var buttons = _.id("pxn8_apply").parentNode;
    var undoBtn = _.id("pxn8_redeye_undo_btn");
    if (undoBtn == null){
        undoBtn = _.ce("button", {id: "pxn8_redeye_undo_btn"});


        buttons.insertBefore(undoBtn,cancelBtn);
        buttons.insertBefore(_.tx("\n"),cancelBtn);

        undoBtn.onclick = function(){
            PXN8.tools.undo();
            return false;
        };
        _.ac(undoBtn,_.tx("Undo"));
    }

    var table = _.table([[PXN8.strings.REDEYE_PROMPT]],{width: "100%"});
    _.ac(_.cl("pxn8_config_content"),table);

    _.cl("pxn8_tool_prompt");

    applyBtn.focus();
};


/*
 *
 */
function matchHeightToWidth(){

    var _ = PXN8.dom;

    var width = _.id("resizeWidth").value;
    var heightInput = _.id("resizeHeight");

    var expr = /^([0-9]+)(%*)$/;
    var match = width.match(expr);
    if (match != null){
        if (match[2] == '%'){
            heightInput.value = Math.round(PXN8.image.height *  (match[1] / 100));
        }else{
            heightInput.value = Math.round(PXN8.image.height * (width / PXN8.image.width));
        }
    }
}
/*
 *
 */
function matchWidthToHeight(){
    var _ = PXN8.dom;

    var height = _.id("resizeHeight").value;
    var widthInput = _.id("resizeWidth");

    var expr = /^([0-9]+)(%*)$/;
    var match = height.match(expr);
    if (match != null){
        if (match[2] == '%'){
            widthInput.value = Math.round(PXN8.image.width *  (match[1] / 100));
        }else{
            widthInput.value = Math.round(PXN8.image.width * (height / PXN8.image.height));
        }
    }
}
/*
 *
 */
function changeDim(axis){
    var _ = PXN8.dom;

    var preserve = _.id("preserve");
    if (preserve.checked){
        if (axis == 'width'){
            matchHeightToWidth();
        }else{
            matchWidthToHeight();
        }
    }
    return true;
};

/* ===========================================================================
 * ROTATE RELATED FUNCTIONS
 */

/*
 *
 */
PXN8.tools.ui.rotate = function ()
{
    var _ = PXN8.dom;

    var angleCombo = _.id("angle");
    var angle = angleCombo.options[angleCombo.selectedIndex].value;
    var flipVt = _.id("flipvt").checked;
    var flipHz = _.id("fliphz").checked;

    if (angle == 0 && flipVt == false && flipHz == false ){
        alert(PXN8.strings.PROMPT_ROTATE_CHOICE);
        return false;
    }

    PXN8.tools.rotate({"angle": angle, "flipvt": flipVt, "fliphz": flipHz});

    return false;
};

/*
 * ROTATE IMAGE
 */
PXN8.tools.ui.config_rotate = function (element,event)
{
    var _ = PXN8.dom;

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";
    //applyBtn.onclick = PXN8.tools.ui.rotate;
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        PXN8.tools.ui.rotate();
        return false;
    };

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_ROTATE_TOOL));

    PXN8.unselect();

    _.cl("pxn8_tool_prompt");

    var form = _.ac(_.cl("pxn8_config_content"), _.ce("form"));
    form.onsubmit =  function(){
        PXN8.tools.ui.rotate();
        return false;
    };

	 var flipvt = _.ce("input", {type: "checkbox", name:"flipvt", id:"flipvt"});

    var fliphz = _.ce("input", {type: "checkbox", name: "fliphz", id: "fliphz"});

    var sel = _.ce("select",{name: "angle", id: "angle", className: "pxn8_small_field"});

    var options = {"0": "   ", "90": "90", "180": "180", "270": "270  "};
    var j = 0;
    for (var i in options){
        if (typeof options[i] != "function"){
            sel.options[j++] = new Option(options[i], i);
        }
    }

    var table = _.table([[PXN8.strings.FLIPVT_LABEL, flipvt],
                           [PXN8.strings.FLIPHZ_LABEL, fliphz],
                           [PXN8.strings.ANGLE_LABEL,  sel ]],
        {width: "100%"});


    _.ac(form,table);

    flipvt.focus();
};


/*
 * Called when the user clicks the 'spirit-level' checkbox
 */
function spiritlevelmode ()
{
    var _ = PXN8.dom;

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "none";

    var oldOnImageUpdated = PXN8.onImageUpdated;

    var tidyup = function(){

        var _ = PXN8.dom;

        var blackout= _.id("blackout");
        if (blackout){
            document.body.removeChild(blackout);
        }
        var prompt = _.id("prompt");
        if (prompt){
            document.body.removeChild(prompt);
        }
        /**
         * muy importante !
         */
        PXN8.initializeCanvas();
        /**
         * ^^^^^^^^^^^^^^^
         */
        var pin1 = _.id("left_pin");
        if (pin1){
            pin1.style.display = "none";
        }
        var pin2 = _.id("right_pin");
        if (pin2){
            pin2.style.display = "none";
        }

    };

    var cancelBtn = _.id("pxn8_cancel");
    _.onceOnlyClickEvent(cancelBtn,tidyup);

    var onImageUpdated = null;

    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,tidyup);

    var blackout = document.createElement("div");
    blackout.id = "blackout";

    var imgBounds = _.eb("pxn8_image");
    PXN8.unselect();
    blackout.style.position = "absolute";
    blackout.style.backgroundColor = "black";
    _.opacity(blackout,0.7);

    blackout.style.top = imgBounds.y + "px";
    blackout.style.left = imgBounds.x + (imgBounds.width/2) + "px";
    blackout.style.width = (imgBounds.width/2)+"px";
    blackout.style.height = imgBounds.height + "px";
    document.body.appendChild(blackout);

    var prompt = document.createElement("div");
    prompt.id = "prompt";
    prompt.style.position = "absolute";
    prompt.style.backgroundColor = "white";
    prompt.style.padding = "4px";

    prompt.style.top = imgBounds.y + 10 + "px";
    prompt.style.left = imgBounds.x + 10 + "px";
    prompt.style.width = (imgBounds.width/2)- 20 + "px";
    prompt.style.overflow = "auto";

    _.ac(_.cl(prompt),_.tx(PXN8.strings.SPIRIT_LEVEL_PROMPT1));

    document.body.appendChild(prompt);


    var configContent = _.cl("pxn8_config_content");
    _.ac(configContent,_.tx(PXN8.strings.SPIRIT_LEVEL_PROMPT1));

    _.ac(_.cl("pxn8_config_title"),_.tx(PXN8.strings.CONFIG_SPIRITLVL_TOOL));

    var instructionIndex = 0;
    var points = { left: {x: 0, y: 0},
                   right: {x: 0, y: 0}};

    _.cl("pxn8_tool_prompt");

    var canvas = _.id("pxn8_canvas");
    canvas.onmousedown = function (event){
        var _ = PXN8.dom;

        event = (event)?event:window.event;
        _.ac(_.cl(configContent),_.tx(PXN8.strings.SPIRIT_LEVEL_PROMPT2));

        // show pin
        var pin1 = _.id("left_pin");
        if (pin1 == null){
            pin1 = PXN8.createPin("left_pin",PXN8.root + "/images/bluepin.gif");
            document.body.appendChild(pin1);
        }

        pin1.style.display = "block";
        var cursorPos = _.cursorPos(event);
        pin1.style.left = "" + (cursorPos.x -7) + "px";
        pin1.style.top = "" + (cursorPos.y - 7) + "px";

        points.left.x = PXN8.position.x;
        points.left.y = PXN8.position.y;

        blackout.style.left = imgBounds.x + "px";

        prompt.style.left = (imgBounds.x + (imgBounds.width/2)) + 10 + "px";
        _.ac(_.cl(prompt),_.tx(PXN8.strings.SPIRIT_LEVEL_PROMPT2));

        canvas.onmousedown = function (event){
            var _ = PXN8.dom;

            event = (event)?event:window.event;

            points.right.x = PXN8.position.x;
            points.right.y = PXN8.position.y;
            // show pin
            var pin2 = _.id("right_pin");
            if (pin2 == null){
                pin2 = PXN8.createPin("right_pin",PXN8.root + "/images/redpin.gif");
                document.body.appendChild(pin2);
            }
            pin2.style.display = "block";
            var cursorPos = _.cursorPos(event);
            pin2.style.left = "" + (cursorPos.x -7) + "px";
            pin2.style.top = "" + (cursorPos.y - 7) + "px";

            PXN8.initializeCanvas();

            var blackout= _.id("blackout");
            if (blackout){
                document.body.removeChild(blackout);
            }
            var prompt = _.id("prompt");
            if (prompt){
                document.body.removeChild(prompt);
            }

            PXN8.tools.spiritlevel(points.left.x,
                                   points.left.y,
                                   points.right.x,
                                   points.right.y);
            /**
             * wph 20070102
             * Automatically select an optimal area to crop so that the user
             * doesn't have to manually select the area.
             *
             */
				var oldSize = PXN8.getImageSize();
            PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
					 var newSize = PXN8.getImageSize();
					 var wd = Math.floor(newSize.width - oldSize.width);
					 var hd = Math.floor(newSize.height - oldSize.height);
                PXN8.select(wd,hd,oldSize.width-wd,oldSize.height-hd);
            });
        };

    };
}


/* ===========================================================================
 * ROUNDED_CORNERS RELATED FUNCTIONS
 * ===========================================================================
 */

/*
 * Configure the rounded-corners tool panel
 */
PXN8.tools.ui.config_roundedcorners = function(element,event)
{
    var _ = PXN8.dom;
    var defaultColor = "#FFFFFF";
	 var color = defaultColor;

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";
    //applyBtn.onclick = PXN8.tools.ui.roundedcorners;
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
		  var radius = _.id("pxn8_corner_radius").value;
        PXN8.tools.ui.roundedcorners(color,radius);
        return false;
    };

    var configTitle = _.cl("pxn8_config_title");
    configTitle.appendChild(_.tx(PXN8.strings.CONFIG_ROUNDED_TOOL));


    var helpArea = _.id("pxn8_tool_prompt");
    _.cl(helpArea);

    var configContent = _.cl("pxn8_config_content");

    var picker = PXN8.colors.picker(defaultColor,function(v){
		  color = v;
    });

    _.ac(configContent,picker);

    var input = _.ce("input", {className: "pxn8_small_field", type: "text", name: "pxn8_corner_radius",id: "pxn8_corner_radius",value: "32"});

    var table = _.table([[PXN8.strings.RADIUS_LABEL, input,""]]);

    _.ac(configContent,table);

};

/*
 * Add rounded corners to the image
 */
PXN8.tools.ui.roundedcorners = function (color,radius)
{
    if (isNaN(radius) || radius < 1){
        alert("Radius must be a positive numeric value");
        return false;
    }
    PXN8.tools.roundedcorners(color, radius);
    return true;
};

/*
 * Make the image sepia tone or black&white
 */
PXN8.tools.ui.sepia = function(color)
{
    var _ = PXN8.dom;

   /*
    * n.b. the order in which the grayscale/sepia elements are declared is important.
    * for the following line to work since it uses an index - not a name (can't use
    * name because they're radio buttons )
    */
   //var operation = document.forms["sepia"].elements[1].checked?"grayscale":"sepia";

    var operation = "sepia";
    var gs = _.id("gs");
    if (gs.className == "pxn8_checked"){
        operation = "grayscale";
    }


    if (operation == "sepia"){
        PXN8.tools.sepia(color);
    }else{
        PXN8.tools.grayscale();
    }

    return true;
};

/* ===========================================================================
 * SEPIA + B&W RELATED FUNCTIONS
 * ===========================================================================
 */


/*
 * Configure the sepia/black & white tool panel
 */
PXN8.tools.ui.config_sepia = function(element, event)
{
    var _ = PXN8.dom;
    var defaultColor = "#A28A65";
	 var color = defaultColor;
    var previewer = PXN8.preview.initialize("pxn8_preview");

    var cancelBtn = _.id("pxn8_cancel");
    _.onceOnlyClickEvent(cancelBtn,function(){
        PXN8.preview.hide(previewer);
        return false;
    });

    var applyBtn = _.id("pxn8_apply");
    applyBtn.style.display = "inline";

    //applyBtn.onclick = sepiaTone;
    //
    // apply   button is a link and therefore it's onclick
    // must return false to work correctly in IE
    //
    applyBtn.onclick = function(){
        PXN8.tools.ui.sepia(color);
        PXN8.preview.hide(previewer);
        return false;
    };

    var configTitle = _.cl("pxn8_config_title");
    configTitle.appendChild(_.tx(PXN8.strings.CONFIG_BW_TOOL));

    var configContent = _.cl("pxn8_config_content");



    var picker = PXN8.colors.picker(defaultColor,function(v){
		  color = v;
        var _ = PXN8.dom;
        sepia_preview(previewer,(_.id("sep").className == "pxn8_checked"),color);

    });

    _.ac(configContent,picker);

    var form2 = _.ac(configContent,_.ce("form", {name: "sepia"}));

    form2.onsubmit = function(){
        PXN8.tools.ui.sepia();
        return false;
    };
    /**
     * Sepia radio button
     */
    var d1 = _.ce("div",{className:"pxn8_checked", id: "sep"});
    _.ac(d1,_.tx(PXN8.strings.SEPIA_LABEL));

    d1.onclick = function(){
        var _ = PXN8.dom;

        d1.className = "pxn8_checked";
        var gs = _.id("gs");
        gs.className = "pxn8_unchecked";
        _.opacity(picker,1.0);

        sepia_preview(previewer,true,color);

    };
    d1.style.cursor = "pointer";
    /**
     * Grayscale radio button
     */
    var d2 = _.ce("div",{className:"pxn8_unchecked", id: "gs"});
    _.ac(d2,_.tx(PXN8.strings.GRAYSCALE_LABEL));
    d2.onclick = function(){
        var _ = PXN8.dom;
        d2.className = "pxn8_checked";
        var sep = _.id("sep");
        sep.className = "pxn8_unchecked";
        _.opacity(picker,0.5);

        sepia_preview(previewer,false);

        return true;
    };
    d2.style.cursor = "pointer";

    var table = _.table([[d1],
                           [d2]],
        {width: "100%"});

    _.ac(form2,table);

    _.ac(_.cl("pxn8_tool_prompt"),_.tx(PXN8.strings.BW_PROMPT));

    PXN8.preview.show(previewer,{operation: "sepia", color: defaultColor});

};

function sepia_preview(previewer,sepia, color)
{
    var op = {};
    if (sepia){
        op.operation = "sepia";
        op.color = color;
    }else{
        op.operation = "grayscale";
    }

    PXN8.preview.show(previewer,op);
}

function colors_preview(previewer)
{
    var _ = PXN8.dom;

    var op = {operation: "colors"};
    op.brightness = _.id("brightness").value;
    op.saturation = _.id("saturation").value;
    op.hue = _.id("hue").value;
    var contrastCombo = _.id("contrast");
    if (contrastCombo){
        op.contrast = contrastCombo.options[contrastCombo.selectedIndex].value;
    }
    PXN8.preview.show(previewer,op);
}

function interlace_preview(previewer,color,opacity)
{
    var _ = PXN8.dom;

    var op = {"operation": "interlace","color": color, "opacity": opacity};

    PXN8.preview.show(previewer,op);

}

PXN8.listener.add(PXN8.ON_SELECTION_COMPLETE,function(){
    var applyBtn = document.getElementById("pxn8_apply");
    if (applyBtn){
        //
        // IE will complain if you try to focus when the
        // control is not visible !
        //
        try{
            applyBtn.focus();
        }catch(e){
        }
    }
});
