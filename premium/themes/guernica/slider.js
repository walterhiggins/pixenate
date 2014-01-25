function Slider(element,model,completedCallback,moveCallback)
{
    if (typeof(element) == "string"){
        element = PXN8.dom.id(element);
    }
    
    var imgs = element.getElementsByTagName("img");

    for (var i = 0; i < imgs.length; i++){
        imgs[i].style.position = "absolute";
		  imgs[i].style.left = "0px";
    }
    
    var slide = imgs[0];
    var knob = imgs[1];
    var min = 0;
    var max = slide.width - knob.width;


    var pixel_range = max ;
    
    var data_range = model.max - model.min;
    
    var data_to_pixel = function(data_x){
        var pixel_x = pixel_range / data_range * (data_x - model.min);
        pixel_x += knob.width / 2;
        return pixel_x;
    };

    var pixel_to_data = function(pixel_x){
        var data_x = pixel_x - knob.width / 2;
        data_x = model.min + (data_x / pixel_range) * data_range;
        return data_x;
    };
    
    
    var pixel_start = data_to_pixel(model.start);
    
    var move_knob = function (x,completedCallback){
        
        if (typeof(x) != "number"){
            var event = x || window.event;
            x = event.clientX - PXN8.dom.ep(element).x;
        }
        
        
        x = Math.max(x, min + (knob.width / 2));
        x = Math.min(x, slide.width - (knob.width / 2) );


        var dx = pixel_to_data(x);
        
        var dx2 = dx - (dx % model.step);
        
        var x2 = data_to_pixel(dx2);
        
        if (completedCallback){
            completedCallback(pixel_to_data(x2));
        }
        knob.style.left = (x2 - knob.width / 2) + "px";

        return pixel_to_data(x2);
    };

    move_knob(pixel_start);
    
    /**
     * Need to create an overlay div and attach events to that.
     */
    var overlay = PXN8.dom.ce("div");
    overlay.style.zIndex = 999;
    overlay.style.position = "absolute";
    overlay.style.top = "0px";
    overlay.style.left = "0px";
    overlay.style.width = slide.width;
    overlay.style.height = slide.height;
    overlay.style.borderStyle = "solid";
    overlay.style.borderWidth = "1px";

    // need to set background color for onclick to work in IE - grrrr!
    overlay.style.backgroundColor = "white";

    element.appendChild(overlay);

    PXN8.dom.opacity(overlay,0.0);

    overlay.onmousedown = function(event){
        overlay.onmousemove = function(event){
            event = event || window.event;
            var v = move_knob(event);
            if (moveCallback){
                moveCallback(v);
            }
            
        };
        overlay.onmouseup = function(event){
            overlay.onmousemove = null;
            overlay.onmouseout = null;
            move_knob(event,completedCallback);
        }
		  overlay.onmouseout = overlay.onmouseup;
        move_knob(event);
    };
    
    this.setValue =  function(v){
        move_knob(data_to_pixel(v));
    };
}
