/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 * This file contains code for handling hi-res images
 *
 */

var PXN8 = PXN8 || {};
// called when the hi-res update is complete
PXN8.ON_HIRES_COMPLETE = "ON_HIRES_COMPLETE";
PXN8.ON_HIRES_BEGIN = "ON_HIRES_BEGIN";


PXN8.hires = {
    originalURL: "",
    responses : [],
    jsonCallback : function(jsonResponse){
        PXN8.listener.notify(PXN8.ON_HIRES_COMPLETE,jsonResponse);
    }
};
/**
 * Given a series of commands, scale each of the commands to a certain ratio
 * Only certain commands need to be scaled
 * Any command with 'top','left','width','height' or 'radius' parameters needs
 * to be scaled.
 */
PXN8.hires.scaleScript = function(script,ratio)
{
    var paramsToScale = ["left","width","top","height","radius"];

    for (var i = 0;i < script.length; i++){
        var op = script[i];
        for (var j = 0; j < paramsToScale.length; j++){
            var attr = paramsToScale[j];

            if (op[attr]){
                op[attr] = op[attr] * ratio;
            }
        }
    }
};

/**
 * Called whenever the image is updated by the user.
 */
PXN8.hires.doImageChange = function(eventType)
{
    var loRes = PXN8.images[0];
    var ratio = PXN8.hires.responses[0].height / loRes.height;

    var script = PXN8.getScript();

    PXN8.hires.interpolate(script,PXN8.hires.originalURL,ratio);

};
/**
 * Apply a script which was performed on a lo-res version of the image
 * to the high-res version of the same image.
 * Parameters : originalScript - the Original Script that was used on the
 * the lo-res version (see PXN8.getScript() )
 *  hiresImageURL - the URL to the hi-res version of the same image
 *  ratio  - the hires height divided by the lo-res height
 *   (e.g. if the hires image is 3000x2000 and the lo-res image is 600x400
 *   the ratio will be 5 )
 */
PXN8.hires.interpolate = function(originalScript,hiresImageURL,ratio)
{
    originalScript[0].image = hiresImageURL;

    PXN8.hires.scaleScript(originalScript,ratio);

    PXN8.listener.notify(PXN8.ON_HIRES_BEGIN);

    var opNumberWas = PXN8.opNumber;

    PXN8.ajax.submitScript(originalScript,function(jsonResponse){
        //
        // wph 20070228 : curry so the callback will know which opNumber
        // it was called for (may not be what the current value of PXN8.opNumber is
        // when this is eventually invoked!)
        //
        jsonResponse.initOpNumber = opNumberWas;
        PXN8.hires.jsonCallback(jsonResponse);

    });
};


/**
 * Initialize the Hi-Res Ajax Requestor
 * This will kick off a listener which will request an updated version of the hi-res image
 * whenever the user changes the lo-res version.
 */
PXN8.hires.init = function(imageUrl)
{
    PXN8.listener.add(PXN8.ON_HIRES_COMPLETE,function(eventType,jsonResponse){
        PXN8.hires.responses[jsonResponse.initOpNumber] = jsonResponse;
    });
    // set so that later calls will use same URL
    PXN8.hires.originalURL = imageUrl;

    var fetch = {operation: "fetch",
                 image: imageUrl,
                 pxn8root: PXN8.root,
                 random: Math.random()
    };
    PXN8.listener.notify(PXN8.ON_HIRES_BEGIN);

    var opNumberWas = PXN8.opNumber;

    PXN8.ajax.submitScript([fetch],function(jsonResponse){
        //
        // wph 20070228 : curry so the callback will know which opNumber
        // it was called for (may not be what the current value of PXN8.opNumber is !)
        //
        jsonResponse.initOpNumber = opNumberWas;
        PXN8.hires.jsonCallback(jsonResponse);
    });


    PXN8.listener.add(PXN8.ON_IMAGE_CHANGE,PXN8.hires.doImageChange);
    /**
     * over-ride the default PXN8.getUncompressedImage if in hi-res mode
     */
    PXN8.getUncompressedImage = PXN8.hires.getUncompressedImage;
};

/**
 * Get the path to the uncompressed hi-res edited image
 */
PXN8.hires.getUncompressedImage = function()
{
    var result = false;
    if (PXN8.hires.responses[PXN8.opNumber]){
        result = PXN8.hires.responses[PXN8.opNumber].uncompressed;
    }
    return result;

};

