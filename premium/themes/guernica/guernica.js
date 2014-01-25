/* ------------------------------------------------------------------------
 * THEME-SPECIFIC IMMEDIATE CODE FOLLOWS
 */
//
// When the document has loaded...
//
PXN8.dom.addLoadEvent(function(){

    PXN8.listener.add(PXN8.ON_IMAGE_CHANGE,function(){
        var changes = PXN8.getScript();
        var _ = PXN8.dom;
        var ub = _.id("undo_btn");
        var rb = _.id("redo_btn");
		  
        if (changes.length > 1){
            ub.disabled = false;
            ub.innerHTML = "Undo " + changes[changes.length -1].operation;
        }else {
            ub.disabled = true;
            ub.innerHTML = "Undo";
        }

        if (PXN8.maxOpNumber > (changes.length-1)){
            rb.disabled = false;
            rb.innerHTML = "Redo " + PXN8.history[PXN8.opNumber+1].operation;
        }else{
            rb.disabled = true;
            rb.innerHTML = "Redo";
        }
    });

    var zoom_slider = new Slider("zoom_slide",{start: 2, step: 0.125, min: 0, max: 4},function(v){
            var mag = 0.25 * (Math.pow(2,v));
            
            PXN8.zoom.zoomByValue(mag);
    });

});
/* ------------------------------------------------------------------------
 * THEME-SPECIFIC FUNCTION DEFINITIONS FOLLOW
 */

/* ------------------------------------------------------------------------
 *
 */
function crop(){
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
        cancel_panel('basic_fixes_link','basic_fixes');
    });
    PXN8.tools.crop();
}		  
/* ------------------------------------------------------------------------
 *
 */
function tabto(link,id){

    if (PXN8.dom.isClass(link,'disabled')){
        return;
    }	
   
    var ur = document.getElementById("undoredo");
    ur.style.display = "block";

    var panels = PXN8.dom.clz('panel');

    for (var i = 0; i < panels.length; i++){
        panels[i].style.display = "none";
    }

    for (var i in {basic_fixes: 0, tuning: 0, effects: 0}){
        var el = document.getElementById(i);
        el.style.display = "none";
    }
    var el = document.getElementById(id);
    el.style.display = "block";
   
    var tabs = PXN8.dom.clz('tab');
    for (var i = 0;i < tabs.length;i++){
        PXN8.dom.removeClass(tabs[i],'selected');
    }
    PXN8.dom.addClass(link,'selected');
}
/* ------------------------------------------------------------------------
 *
 */
function show_panel(id)
{
    for (var i in {basic_fixes: 0, tuning: 0, effects: 0}){
        var el = document.getElementById(i);
        el.style.display = "none";
    }
    var tabs = PXN8.dom.clz('tab');
    for (var i = 0;i < tabs.length; i++){
        PXN8.dom.addClass(tabs[i],'disabled');
    }
    var el = document.getElementById(id);
    el.style.display = "block";

    var ur = document.getElementById("undoredo");
    ur.style.display = "none";
}
/* ------------------------------------------------------------------------
 *
 */
function cancel_panel(link,pallette)
{
    PXN8.dom.removeClass('basic_fixes_link','disabled');
    PXN8.dom.removeClass('tuning_link','disabled');
    PXN8.dom.removeClass('effects_link','disabled');
    tabto(link,pallette);
	
}

/* ------------------------------------------------------------------------
 *
 */
function init_flashfill_panel ()
{
    show_panel('fillflash_panel');
    var fillflash_prev =	PXN8.preview.initialize("fillflash_preview","resize");
    PXN8.preview.show(fillflash_prev);
    var luminosity = 0;
    var luminosity_slider = new Slider("fillflash_slide",{start: 0,step: 1, min: 0, max: 100},function(v){
		  PXN8.preview.show(fillflash_prev,{"operation": "fill_flash", "opacity": v});
	     luminosity = v;
    });
    PXN8.dom.id("fillflash_apply").onclick = function(){
	     PXN8.tools.fill_flash(luminosity);
		  cancel_panel('basic_fixes_link','basic_fixes');
    };
}

/* ------------------------------------------------------------------------
 *
 */
function init_color_panel() 
{
    show_panel('color_panel');
    var color_prev = PXN8.preview.initialize("color_preview");
    PXN8.preview.show(color_prev);
    var brightness = 100;
    var saturation = 100;
    var hue = 100;
    var contrast = 0;
   
    var preview_colors = function(){
        PXN8.preview.show(color_prev,{"operation": "colors", "brightness": brightness,"saturation" : saturation,"hue": hue,"contrast" : contrast});
    };
   
   
    var brightness_slider = new Slider("brightness_slide",{start: 100, step: 1, min: 1, max: 200},function(v){
	     brightness = Math.round(v);
        if (brightness == 0){
            brightness = 1;
        }
        preview_colors();
    });

    var saturation_slider = new Slider("saturation_slide",{start: 100, step: 1, min: 1, max: 200},function(v){
	     saturation = Math.round(v);
        if (saturation == 0){
            saturation = 1;
        }
        preview_colors();
    });

    var hue_slider = new Slider("hue_slide",{start: 100, step: 1, min: 1, max: 200},function(v){
	     hue = Math.round(v);
        if (hue == 0){
            hue = 1;
        }
        preview_colors();
    });

    var contrast_slider = new Slider("contrast_slide",{start: 0, step: 1, min: -3, max: 3},function(v){
	     contrast = Math.round(v);
        preview_colors();
    });

    PXN8.dom.id("color_apply").onclick = function(){
	     PXN8.tools.colors({"brightness": brightness,"saturation": saturation,"hue": hue,"contrast": contrast});
		  cancel_panel('tuning_link','tuning');
    };
}

/* ------------------------------------------------------------------------
 *
 */
function init_oilpaint_panel()
{
    show_panel('oilpaint_panel');
    var prev = PXN8.preview.initialize("oilpaint_preview");

    var radius = 4;

    var oilpaint_radius_slider = new Slider("oilpaint_radius_slide",{start: radius, step: 1, min: 1, max: 7},function(v){
	     radius = Math.round(v);
		  PXN8.preview.show(prev,{"operation": "oilpaint", "radius": radius});
    });
    PXN8.dom.id("oilpaint_apply").onclick = function(){
	     PXN8.tools.oilpaint(radius);
		  cancel_panel('effects_link','effects');
    };
    PXN8.preview.show(prev,{"operation": "oilpaint", "radius": radius});
}

/* ------------------------------------------------------------------------
 *
 */
function init_unsharpmask_panel()
{
    show_panel('unsharpmask_panel');
    var prev = PXN8.preview.initialize("unsharpmask_preview");

    // rule of thumb;
    // if radius < 1 then 
    //   sigma = radius 
    // else
    //   sigma = sqrt of radius
    //
    var radius = 0.5;
    var sigma = 0.5;
    var amount = 1;
    var threshold = 0;
    

    var onSlideChange = function(){
		  PXN8.preview.show(prev,{"operation": "unsharpmask", 
                                "radius": radius, 
                                "sigma" : sigma,
                                "amount" : amount,
                                "threshold": threshold,
                                "__quality":100});
    };
    
    
    var unsharpmask_radius_slider = new Slider("unsharpmask_radius_slide",{start: 5, step: 1, min: 1, max: 80},function(v){
	     radius = Math.round(v) / 10;
        onSlideChange();
    });

    var unsharpmask_sigma_slider = new Slider("unsharpmask_sigma_slide",{start: 5, step: 1, min: 1, max: 80},function(v){
	     sigma = Math.round(v) / 10;
        onSlideChange();
    });

    var unsharpmask_amount_slider = new Slider("unsharpmask_amount_slide",{start: 10, step: 1, min: 1, max: 30},function(v){
	     amount = Math.round(v) / 10;
        onSlideChange();
    });

    var unsharpmask_threshold_slider = new Slider("unsharpmask_threshold_slide",{start: 0, step: 1, min: 0, max: 100},function(v){
	     threshold = Math.round(v) ;
        onSlideChange();
    });

    PXN8.dom.id("unsharpmask_apply").onclick = function(){

	     PXN8.tools.unsharpmask(/*
    {"radius": radius, 
                                "sigma": sigma, 
                                "amount": amount, 
                                "threshold": threshold}*/);

		  cancel_panel('effects_link','effects');
    };

    onSlideChange();
}


/* ------------------------------------------------------------------------
 *
 */
function init_tint_panel()
{
    show_panel('tint_panel');

    PXN8.unselect();
   
    var red = parseInt("ff",16);
    var green = parseInt("a5",16);
    var blue = parseInt("00",16);
    var color = ((red * 256 * 256) + green * 256 + blue).toString(16);

    var opacity = 80;

    var onSliderMove = function(id,v){
        var pc = Math.round(v / 255 * 100);
        PXN8.dom.id(id).innerHTML = pc + "% ";
    };
   
   
    var redMove = function(v){ onSliderMove("tint_red_value",v);};
    var greenMove = function(v){onSliderMove("tint_green_value",v);};
    var blueMove = function(v){onSliderMove("tint_blue_value",v);};
    var opacityMove = function(v){PXN8.dom.id("tint_opacity_value").innerHTML = Math.round(v) + "%";};
   

    var update_tint_preview = function(){
        color = ((red * 256 * 256) + (green * 256) + blue).toString(16);
        while (color.length < 6){
            color = "0" + color;
        }
        PXN8.dom.id("tint_color").style.backgroundColor = "#" + color;
        PXN8.dom.opacity("tint_color",opacity/100);
    };
   
   
    var red_slider = new Slider("tint_red_slide",{start: red, step: 1, min: 0, max: 255},function(v){red = Math.round(v);update_tint_preview();},redMove);
    var green_slider = new Slider("tint_green_slide",{start: green, step: 1, min: 0, max: 255},function(v){green = Math.round(v);update_tint_preview();},greenMove);
    var blue_slider = new Slider("tint_blue_slide",{start: blue, step: 1, min: 0, max: 255},function(v){blue = Math.round(v);update_tint_preview();},blueMove);
    var opacity_slider = new Slider("tint_opacity_slide",{start: opacity, step: 1, min: 0, max: 100},function(v){opacity = Math.round(v);update_tint_preview();},opacityMove);

    /**
     * Initialize color preview and slider values
     */
    update_tint_preview();
    redMove(red);
    greenMove(green);
    blueMove(blue);
    opacityMove(opacity);

    var overlay = PXN8.dom.ce("div",{id: "tint_overlay"});
   
    var eb = PXN8.dom.eb("pxn8_canvas");
   
    overlay.style.position = "absolute";
    overlay.style.top = eb.y + "px";
    overlay.style.left = eb.x + "px";
    overlay.style.width = eb.width + "px";
    overlay.style.height = eb.height + "px";
    overlay.style.backgroundColor = "white";
    document.body.appendChild(overlay);
    PXN8.dom.opacity(overlay,0.01);
   
    var tidyup = null;

    var onMouseDown = function(event){
        if (!event){ event = window.event;}
        var eb = PXN8.dom.eb("pxn8_canvas");
        var cp = PXN8.dom.cursorPos(event);
        var x = cp.x - eb.x;
        var y = cp.y - eb.y;

        var flag = PXN8.dom.createFlag(cp.x,cp.y,"tint_flag");
        
        y = y / PXN8.zoom.value();
        
        PXN8.tools.filter({top: y, color: "#" + color, "opacity": opacity});
            
        PXN8.event.removeListener("tint_overlay","mousedown",onMouseDown);

        PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            document.body.removeChild(flag);
            document.body.removeChild(overlay);
        });
        cancel_panel('effects_link','effects');
        
    };
    tidyup = function(){
       
    };
    
    PXN8.event.addListener(overlay,"mousedown",onMouseDown);

    PXN8.dom.id("cancel_tint").onclick = function(){
        document.body.removeChild(overlay);
        cancel_panel('effects_link','effects');
    };
    
    
}
/* ------------------------------------------------------------------------
 *
 */
function init_charcoal_panel()
{
    show_panel('charcoal_panel');
    var prev = PXN8.preview.initialize("charcoal_preview");

    var radius = 4;

    var charcoal_radius_slider = new Slider("charcoal_radius_slide",{start: radius, step: 1, min: 1, max: 7},function(v){
	     radius = Math.round(v);
		  PXN8.preview.show(prev,{"operation": "charcoal", "radius": radius});
    });
    PXN8.dom.id("charcoal_apply").onclick = function(){
	     PXN8.tools.charcoal(radius);
		  cancel_panel('effects_link','effects');
    };
    PXN8.preview.show(prev,{"operation": "charcoal", "radius": radius});
}

/* ------------------------------------------------------------------------
 *
 */
function init_sepia_panel() {
    show_panel('sepia_panel');
    var prev = PXN8.preview.initialize("sepia_preview");

    var red = parseInt("a2",16);
    var green = parseInt("8a",16);
    var blue = parseInt("65",16);
    var color = ((red * 256 * 256) + green * 256 + blue).toString(16);


    var onSliderMove = function(id,v){
        var pc = Math.round(v / 255 * 100);
        PXN8.dom.id(id).innerHTML = pc + "% ";
    };
   
   
    var redMove = function(v){onSliderMove("sepia_red_value",v);};
    var greenMove = function(v){onSliderMove("sepia_green_value",v);};
    var blueMove = function(v){onSliderMove("sepia_blue_value",v);};
   

    var update_sepia_preview = function(){
        color = ((red * 256 * 256) + (green * 256) + blue).toString(16);
        while (color.length < 6){
            color = "0" + color;
        }
        PXN8.dom.id("sepia_color").style.backgroundColor = "#" + color;
        PXN8.preview.show(prev,{"operation": "sepia", "color": color});
    };
   
   
   
    var red_slider = new Slider("sepia_red_slide",{start: red, step: 1, min: 0, max: 255},function(v){
	     red = Math.round(v);
        update_sepia_preview();
    },redMove);

    var green_slider = new Slider("sepia_green_slide",{start: green, step: 1, min: 0, max: 255},function(v){
	     green = Math.round(v);
        update_sepia_preview();
    },greenMove);

    var blue_slider = new Slider("sepia_blue_slide",{start: blue, step: 1, min: 0, max: 255},function(v){
        blue = Math.round(v);
        update_sepia_preview();
    },blueMove);


    PXN8.dom.id("sepia_apply").onclick = function(){
	     PXN8.tools.sepia(color);
		  cancel_panel('effects_link','effects');
    };

    update_sepia_preview();
    redMove(red);
    greenMove(green);
    blueMove(blue);
}


/* ------------------------------------------------------------------------
 *
 */
var redeye_fixes = 0;
var fix_redeye_on_selection_complete = null;

function redeye_start(){
    PXN8.resize.enable(["n","s","e","w","nw","ne","sw","se"],false);
    PXN8.unselect();
    
    fix_redeye_on_selection_complete = PXN8.listener.add(PXN8.ON_SELECTION_COMPLETE,function(){
        var sel = PXN8.getSelection();
        if (sel.width > 0){
            PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){PXN8.unselect();});
            PXN8.tools.fixredeye(PXN8.getSelection());
            redeye_fixes = redeye_fixes + 1;
        }
    });
}

function redeye_stop() 
{
	 PXN8.resize.enable(["n","s","e","w","nw","ne","sw","se"],true);
    PXN8.listener.remove(PXN8.ON_SELECTION_COMPLETE,fix_redeye_on_selection_complete);
    redeye_fixes = 0;
}

function reset_redeye()
{
    PXN8.tools.history(0 - redeye_fixes);
    redeye_fixes = 0;
}

function cancel_redeye()
{
    reset_redeye();
    redeye_stop();
    cancel_panel('basic_fixes_link','basic_fixes');
}
