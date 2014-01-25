/**
 * cardmaker.js - Theme-specific javascript for picking cards, editing photos, cropping photos to fit cards and
 * adding text to cards.
 *
 * @copyright 2007 Sxoop Technologies. All rights reserved.
 */
//
// gActiveCard is a string identifying the currently active card being used.
// the string is a key into the gCardDB hash.
// (see card_db.js)
//
gActiveCard = null;
gPlaceholder = 0;

// the URL to the current active card
gCardURL = null;

// the filepath (relative to pixenate) of the current active card.
gCardPath = null;


function mode_pick_product()
{
    hide_all();
    jQuery("#products img").click(mode_pick_card);
    jQuery("#products").show("slow");
}

// ========================================================================
// [1] Ask the user to pick a card
// ========================================================================
//
// this is the first thing that the page does if a card has not already been picked
// (see index.php/asp/jsp)
//
function mode_pick_card()
{
    hide_all();
    jQuery("#cards img").click(on_click_card);
    jQuery("#cards").show("slow");
}
//
// when the user clicks a card thumbnail show them a list of photos to overlay on the card
//
function on_click_card(e)
{
    var cardsample_th = e.srcElement ? e.srcElement.src : e.target.src;
    hide_all();
    //
    // set active card !
    //
    gActiveCard = cardsample_th.replace(/.*\//,'');

    var card = gCardDB[gActiveCard];

    if (gPlaceholdersFilled == ""){
        gPlaceholdersFilled = [];
    }

    for (var i =0;i < card.photo_placeholders.length;i++){
        gPlaceholdersFilled[i] = false;
    }

    gCardURL = card.fullsize;
    gCardPath = gPathToCards + card.fullsize;

    if (card.photo_placeholders.length == 1){
        mode_pick_photo(0);
    }else{
        mode_pick_placeholder(gCardURL);
    }
}

// ========================================================================
// [2] Ask the user to pick a placeholder (where the photo will be place) on the card
//     (if the card has only one placeholder skip this step)
// ========================================================================
//
// put the user in 'pick a placeholder' mode
//
function mode_pick_placeholder(imageURL)
{
    hide_all();

    jQuery("#placeholders").show("slow");
    jQuery("#placeholders_container").empty();
    jQuery("<img src=\"" + imageURL + "\">")
        .load(function(){setup_placeholders(this);})
        .appendTo("#placeholders_container");
}
//
// create clickable placeholder divs that match the geometries
// specified in card_db.js for the current active card.
//
//
function setup_placeholders(image)
{
    var placeholders = gCardDB[gActiveCard].photo_placeholders;
    var oh = image.height;
    var ow = image.width;
    var r = gCardMaxHeight / image.height;

    image.height = gCardMaxHeight ;

    var curry = function(x){
        return function(e){
            mode_pick_photo(x);
        };
    };

    for (var i = 0; i < placeholders.length; i++){
        if (gPlaceholdersFilled[i] == false){
            var html = "<div class=\"placeholder\" id=\"placeholder_" + i +
                "\"><p>" + (i+1) + "</p></div>";

            var placeholder = jQuery(html);
            placeholder.appendTo("#placeholders_container");
            placeholder.css("position","absolute");
            placeholder.css("top", (placeholders[i].top * r) + "px");
            placeholder.css("left", (placeholders[i].left * r) + "px");
            placeholder.css("width",(placeholders[i].width * r) + "px");
            placeholder.css("height",(placeholders[i].height *r) + "px");
            placeholder.css("background-color",gPlaceholderColor);
            placeholder.css("cursor","pointer");
            placeholder.click(curry(i));
        }
    }
}

// ========================================================================
// [3] Ask user to choose a photo to place on the card.
// ========================================================================
//
// Let the user pick a photo.
// the placeholderIndex is an index to the currently active photo_placeholder
//
function mode_pick_photo(placeholderIndex)
{
    gPlaceholder = placeholderIndex;
    fill_placeholder(gPlaceholder);

    hide_all();

    jQuery("#photos img").click(on_click_photo);
    jQuery("#photos").show("slow");
}
//
// when the user clicks a photo thumbnail show them the original size photo in the editor.
//
function on_click_photo(e)
{
    var photo_th = e.srcElement ? e.srcElement.src : e.target.src;
    photo_th = photo_th.replace(/\/thumbnails/,"");
    mode_edit_photo(photo_th);
}
//
// when the user uploads a photo set the '_card' parameter to be the current active card
// so that we'll remember what it is when upload.pl redirects us back to index.php/asp/jsp
//
function on_upload(form)
{
    form._gActiveCard.value = gActiveCard;
    form._gPlaceholder.value = gPlaceholder;
    form._gCardPath.value = gCardPath;
    form._gCardURL.value = gCardURL;
    form._gPlaceholdersFilled.value = "[" + gPlaceholdersFilled.toString() + "]";

    var current_page = window.location.href;
    current_page = current_page.split("#")[0];
    current_page = current_page.split("?")[0];
    form.next_page.value = current_page;

    return true;
}

// ========================================================================
// [4] Edit the photo (enhance, fix colors, rotate etc)
// ========================================================================
//
// if a card *has* been picked and a photo has been picked (or uploaded) then
// start editing the photo
//
function mode_edit_photo(photo)
{
    hide_all();
    jQuery("#cropper").hide();
    jQuery("#add_text").hide();
    jQuery("#crop_preview_container").hide();

    jQuery("#edit_and_crop").show("slow");
    jQuery("#editor").show();
    jQuery("#pxn8_canvas").show();

    PXN8.zoom.zoomByValue(1.0);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_LOAD,function(){
            var img = document.getElementById("pxn8_image");
            if (img.width > gEditModeMaxPhotoWidth ||
                img.height > gEditModeMaxPhotoHeight){
                PXN8.zoom.toSize(gEditModeMaxPhotoWidth,gEditModeMaxPhotoHeight);
            }

        });
    PXN8.initialize(photo);
    PXN8.listener.add(PXN8.ON_SELECTION_CHANGE,disable_selection);


}
//
// This is a PXN8.ON_SELECTION_CHANGE listener which basically unselects
// (thus making it appear as if selection is disabled).
// during edit mode the user doesn't need to make selections (only when cropping)
//
function disable_selection()
{
    var sel = PXN8.getSelection();
    if (sel.width > 0 || sel.height > 0){
        PXN8.unselect();
    }
}
// ========================================================================
// [5] Crop and place the photo to fit the placeholder on the card.
// ========================================================================
//
// first set up the crop panel
//
function mode_crop_photo()
{
    if (!PXN8.ready){
        alert("Please wait for the image to load");
        return;
    }

    var activeImageURL = PXN8.getUncompressedImage();
    if (!activeImageURL){
        activeImageURL = jQuery("#pxn8_image")[0].src;
    }else{
        activeImageURL = PXN8.root + "/" + activeImageURL;
    }

    PXN8.zoom.toSize(gCropModeMaxPhotoWidth,gCropModeMaxPhotoHeight);

    PXN8.listener.remove(PXN8.ON_SELECTION_CHANGE,disable_selection);
    PXN8.listener.add(PXN8.ON_SELECTION_CHANGE,update_crop_preview);


    jQuery("#edit_and_crop").show("slow");
    jQuery("#editor").hide("slow");
    jQuery("#cropper").show("slow");
    jQuery("#crop_preview_container").show("slow");


    jQuery("#crop_preview img").remove();

    var cardHTML = "<img src=\"" + gCardURL  + "\" class=\"card\"/>";

    jQuery(cardHTML).load(on_load_card).appendTo("#crop_preview");

    var imgHTML = "<img id=\"clipped_image\" src=\"" + activeImageURL + "\"/>";

    jQuery(imgHTML).appendTo("#clipped");

    if (gCardURL.match(/png$/)){
		  // wph 20090123 - FF3 - changed z-index from -1 to 0
        jQuery("#clipped").css("z-index",0);
    }else{
        jQuery("#clipped").css("z-index",2);
    }
}
//
// this function gets called everytime the user changes the selection in crop-mode
//
function update_crop_preview()
{
    var placeholder = gCardDB[gActiveCard].photo_placeholders[gPlaceholder];

    var zoom = PXN8.zoom.value();
    var theImage = document.getElementById("pxn8_image");

    var iw = theImage.width / zoom;
    var ih = theImage.height / zoom;

    var sel = PXN8.getSelection();
    var cow = placeholder.width * clip_ratio;
    var coh = placeholder.height * clip_ratio;

    var rw = sel.width /  cow;
    var rh = sel.height / coh;

    var clipped_image = jQuery("#clipped_image");

    clipped_image.attr("width", iw / rw );
    clipped_image.attr("height",ih / rh );
    clipped_image.css("left",(0 - ((sel.left / rw) )) + "px");
    clipped_image.css("top",(0 - ((sel.top / rh) )) + "px");
}
//
// Called when the card has loaded in crop preview mode
//
function on_load_card ()
{
    var placeholder = gCardDB[gActiveCard].photo_placeholders[gPlaceholder];

    ow = this.width;
    oh = this.height;
    var ivw = jQuery("#pxn8_image").attr("width");
    var ivh = jQuery("#pxn8_image").attr("height");

    var zoom = PXN8.zoom.value();
    clip_ratio = ivh / oh;

    this.width = ow * clip_ratio;
    this.height = oh * clip_ratio;

    var clipped = jQuery("#clipped");
    clipped.css("top",   (placeholder.top* clip_ratio) + "px");
    clipped.css("left",  (placeholder.left * clip_ratio) + "px");
    clipped.css("width", (placeholder.width * clip_ratio) + "px");
    clipped.css("height",(placeholder.height * clip_ratio) + "px");

    if (document.all){
        setTimeout(function(){
                try{correctPNG();}catch(e){}
            },50);
        }

   PXN8.selectByRatio(placeholder.width + "x" + placeholder.height,true);
}
//
// apply the crop and overlay it on top of the card
//
function crop_and_overlay()
{
    var sel = PXN8.getSelection();

    var placeholder = gCardDB[gActiveCard].photo_placeholders[gPlaceholder];

    //
    // if the card is a PNG assume it's placeholder is also transparent
    //

    var crop =    {operation: "crop",    left: sel.left, top: sel.top, width: sel.width, height: sel.height};
    var resize =  {operation: "resize",  width: placeholder.width, height: placeholder.height};
    var overlay = {operation: "overlay", left: placeholder.left, top: placeholder.top, image: gCardPath};


    if (gCardPath.match(/png$/)){
        //
        // the card is a PNG so superimpose the card on top of the photo
        //
        overlay.position = "front"; // (default)
        overlay.extend = true;      // change photo canvas size to match card before overlaying the card.
    }else{
        //
        // the card is not a PNG so superimpose the photo on top of the card
        //
        overlay.position = "back";  // the overlay will be placed at the back of the photo
    }

    PXN8.listener.add(PXN8.ON_SELECTION_CHANGE,disable_selection);
    PXN8.listener.remove(PXN8.ON_SELECTION_CHANGE,update_crop_preview);
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            if (!all_placeholders_filled()){
                // go back to mode_pick_placeholder()
                gCardURL = PXN8.root + PXN8.getUncompressedImage();
                gCardPath = PXN8.getUncompressedImage();
                mode_pick_placeholder(gCardURL);
            }else{
                mode_add_message();
            }

    });
    PXN8.listener.onceOnly(PXN8.ON_IMAGE_CHANGE,function(){
            PXN8.zoom.toSize(gCropModeMaxPhotoWidth,gCropModeMaxPhotoHeight);
        });
    PXN8.unselect();

    PXN8.tools.updateImage([crop,resize,overlay]);
}
//
// the clip ratio is the ratio of the size of the image to the size of the card
//
clip_ratio = 1;

// ========================================================================
// [6] Add a Message
// ========================================================================
//
// Initialize the 'add-text' panel
// for each 'text' property in the gCardDB record display either an <input type="text"/> field
// or a <textarea> field (depending on whether the text object's 'multiline' property is true or false
// (see card_db.js)
//
function mode_add_message()
{
    jQuery("#editor").hide();
    jQuery("#cropper").hide();
    jQuery("#crop_preview_container").hide();

    jQuery("#pxn8_canvas").show();
    jQuery("#messages").empty();

    jQuery("#edit_and_crop").show();
    jQuery("#add_text").show("slow");

    gAddTextOpNumber = PXN8.opNumber;

    if (gCardDB[gActiveCard].text_placeholders){
        var placeholders = gCardDB[gActiveCard].text_placeholders;
        for (var i = 0;i < placeholders.length; i++){
            var text = placeholders[i];
            var html = "";
            if (text.multiline){
                html = "<li><textarea name=\"text_" + i + "\" id=\"text_" + i + "\">Message # " + (i+1) + " Here</textarea></li>";
            }else{
                html = "<li><input class=\"text\" type=\"text\" name=\"text_" + i + "\" id=\"text_" + i + "\" value=\"Message # " + (i+1) + " here\"></li>";
            }
            jQuery(html).appendTo("#messages");
        }
    }else{
        end_cardmaker();
    }
}
//
// Add the text to the card
// There can be multiple text inputs/textareas so each must be added.
//
function add_message_to_card()
{
    var textOperations= [];
    var placeholders = gCardDB[gActiveCard].text_placeholders;
    for (var i = 0; i < placeholders.length; i++){
        textOperation = {operation: "add_text"};
        textOperation.gravity = placeholders[i].gravity;
        if (placeholders[i].y){
            textOperation.y = placeholders[i].y;
        }
        if (placeholders[i].x){
            textOperation.x = placeholders[i].x;
        }
        textOperation.pointsize = placeholders[i].pointsize;
        textOperation.fill = placeholders[i].fill;
        textOperation.font = placeholders[i].font;
        var t = jQuery("#text_" + i)[0].value;
        textOperation.text = t;
        //
        // add the text operation to the textOperations array
        //
        textOperations.push(textOperation);
    }
    //
    // now pass the array of textOperations to Pixenate
    //
    PXN8.tools.updateImage(textOperations);

}
//
// The undo button which appears on the add_text pane should only
// undo text-additions.
//
gAddTextOpNumber = 0;
function undo_add_message()
{
    if (PXN8.opNumber > gAddTextOpNumber){
        PXN8.tools.undo();
    }
}
// ========================================================================

//
//  Start the cardmaker
//
function start_cardmaker(photo,onComplete)
{
    if (typeof gPlaceholdersFilled == "string" &&  gPlaceholdersFilled.length > 0){
        gPlaceholdersFilled = eval(gPlaceholdersFilled);
    }
    gOnComplete = onComplete;
    if (photo){
        jQuery(function(){ mode_edit_photo(photo); });
    }else{
        jQuery(function(){ mode_pick_card(); });
        //jQuery(function(){ mode_pick_product(); });
    }
}
//
// hide all divs of class 'panel'
//
function hide_all()
{
    jQuery("div.panel").hide("slow");
}
//
// gOnComplete is a function which will be called when all the placeholders are
// filled in.
//
gOnComplete = null;

// ========================================================================
// placeholder variable and setter/getter
// ========================================================================
//
// A global array of placeholders the user has filled in
//
gPlaceholdersFilled = [];
//
// set one of the plaech
function fill_placeholder(i)
{
    gPlaceholdersFilled[i] = true;
}
//
// You should replace this function with your own 'done' function which
// perhaps goes to order-processing / checkout for the card.
//
function all_placeholders_filled()
{
    var allDone = true;
    for (var i = 0; i < gPlaceholdersFilled.length; i++){
        if (gPlaceholdersFilled[i] == false){
            allDone = false;
            break;
        }
    }
    return allDone;
}

// [7] Done. (or go back and pick the next placeholder if there is one)
// ========================================================================
//
// this function will call the function passed in by start_cardmaker
// if there are no more placeholders to fill in.
//
function end_cardmaker()
{
    if (all_placeholders_filled()){
        gOnComplete();
    }else{
        // go back to mode_pick_placeholder()
        gCardURL = PXN8.root + PXN8.getUncompressedImage();
        gCardPath = PXN8.getUncompressedImage();
        mode_pick_placeholder(gCardURL);
    }
}
