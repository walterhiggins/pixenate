/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 * This file contains code which handles saving of images
 *
 */
var PXN8 = PXN8 || {};

/*************************************************************************

SECTION: Saving edited Photos
=============================
The following functions are used for saving the edited photo to the user's
client-side storage or to the server's own storage on the web.

***/

PXN8.save = {};

/**************************************************************************

PXN8.save.toDisk()
==================
Save the photo to the user's client-side storage.

***/
PXN8.save.toDisk = function()
{
    var uncompressedImage = PXN8.getUncompressedImage();
    if (uncompressedImage){
        var newURL = PXN8.server + PXN8.root + "/save.pl?";

        if (typeof pxn8_original_filename == "string"){
            newURL += "originalFilename=" + pxn8_original_filename + "&";
        }

        newURL += "image=" + uncompressedImage;

        document.location = newURL;

    }else{
        document.location = "#";
        PXN8.show.alert("You have not changed the image !");
    }
};

/**************************************************************************

PXN8.save.toServer()
====================
Save to server is a wrapper function. It in turn will call *pxn8_save_image()*
which is a function which must be implemented by the customer.

Related
-------
PXN8.getUncompressedImage pxn8_save_image

***/
PXN8.save.toServer = function()
{

    var relativeFilePathToUncompressedImage = PXN8.getUncompressedImage();

    /**
     * wph 20070102 : Don't prohibit the user from saving just because they haven't changed
     * the image.
     * Let the custom pxn8_save_image() function handle that case if needed.
     *
     if (!relativeFilePathToUncompressedImage){
     alert("The image has not been modified.");
     return false;
     }
    */

    if (typeof pxn8_save_image == 'function'){
        return pxn8_save_image(relativeFilePathToUncompressedImage);
    } else {

        alert("This feature is not available by default.\n" +
              "To enable this feature you must create a PHP,ASP or JSP page to save the image to your own server.\n" +
              "You must also create a javascript function called 'pxn8_save_image()' - it's first parameter is the URL of the changed image.\n" +
              "The path to the changed image (relative to the directory where PXN8 is installed) is " + PXN8.getUncompressedImage());
        return false;
    }

};

/**************************************************************************

pxn8_save_image()
=================
This function is not provided by Pixenate but must be implemented by the customer
if you want to be able to save edited photos to your own webserver.

Parameters
----------

* imagePath : A path to the image which should be saved or <em>false</em> if the image has not been changed.

The imagePath parameter will be a path relative to the directory where pixenate is installed.

For example the imagePath parameter might be *cache/03_04fbcedaf099feded02working.jpg*.
If Pixenate is installed at /var/www/html/pixenate then the actual path to the file will be...

    /var/www/html/pixenate/cache/03_04fbcedaf099feded02working.jpg

... so to save the image to your webserver's filesystem or database you need to copy the image at the
above path to your own permanent storage.
You should provide a .PHP, .JSP, .ASP or CGI program to do just this.
Your pxn8_save_image() function should call this CGI passing the *imagePath* value as a parameter
to the server program.

Examples
--------

    function pxn8_save_image( newImagePath ){
       //
       // newImagePath parameter will be something like...
       //
       // cache/03_04fbcedaf099feded02working.jpg
       //
       // ... this path is relative to where pixenate was installed

       if (newImagePath != false){
          document.location = "save.php?replacementImagePath=" + newImagePath;
       }else{
          alert("The image has not been modified");
       }
    }

Related
-------
PXN8.save.toServer PXN8.getUncompressedImage

***/

// [% if ($pg->{target} eq "website") { %]

/**
 * description: Save image to flickr
 * This method should be called from your form's onsubmit attribute.
 * See the examples in slick and default templates.
 */
PXN8.save.toFlickr = function(form)
{
    if (typeof form == 'undefined'){
        alert("Incorrect use of PXN8.save.toFlickr - this should be called via a form's onsubmit attribute");
        return false;
    }
    if (PXN8.opNumber == 0){
        PXN8.show.alert("You have not changed the image !");
        return false;
    }
    /*
     * Need to add an additional field to the form before
     * saving.
     */
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = "img";
    /**
     * wph 20070126 : prepend "." so callback.pl doesn't try to open from / root
     */
    input.value = PXN8.server + PXN8.root + PXN8.getUncompressedImage();
    form.appendChild(input);
    return true;
};

/*
 * Save the image to CNET's AllYouCanUpload photo-storage service
 * N.B. This is an ALPHA function until CNET release an API
 * as of June 28 2006 It relies on a screen-scraping perl program on the
 * server side. You have been warned.
 */
PXN8.save.allyoucanupload = function()
{
    var dom = PXN8.dom;

    var changedImage = PXN8.getUncompressedImage();
    if (!changedImage){
        PXN8.show.alert("You have not changed the image !");
        return false;
    }


    PXN8.prepareForSubmit('Saving image. Please wait...');

    var req = PXN8.ajax.createRequest();
    req.open("GET", "/allyoucanupload.pl?image=" + PXN8.server + PXN8.root + "/" + changedImage,true);
    PXN8.json.bind(req, function(response){
        var timer = document.getElementById("pxn8_timer");
        if (timer){
            timer.style.display = "none";
        }
        PXN8.updating = false;
        prompt("Here is the permanent URL for your image.\n" +
               "Copy and paste this URL into your blog, myspace or bebo page.",
               response.original_image);
    });
    req.send(null);
};
//[% } %]
