/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-[% print $pg->{year};%]
 * All rights reserved.
 *
 * This file contains code which handles AJAX / JSON requests
 *
 */

var PXN8 = PXN8 || {};

/**************************************************************************

SECTION: Pixenate AJAX Functions
===========================================
Pixenate provides functions to create XMLHttpRequest Objects and to submit photo editing operations using custom JSON response handlers.
***/

PXN8.ajax = {};
    // [% if ($pg->{target} eq "hosted" or $pg->{target} eq "website" or $pg->{target} eq "clustered") { %]
    /*
      [%
      #
      # HOSTED Edition - use script tag insertion because XMLHttpRequest won't work.
      #
      %]
    */
PXN8.ajax.useXHR = false;
    // ======================================================================
    // [% } else { # use XMLHttpRequest %]
    // ======================================================================
PXN8.ajax.useXHR = true;
    //[% } %]


/***************************************************************************

PXN8.ajax.createRequest
=======================
Create a XMLHttpRequest Object.

Returns
-------
A new XMLHttpRequest Object.

***/
PXN8.ajax.createRequest = function(){

	if (typeof XMLHttpRequest != 'undefined') {
   	 return new XMLHttpRequest();
   }
   try 	{
       return new ActiveXObject("Msxml2.XMLHTTP");
   } catch (e) {
       try {
           return new ActiveXObject("Microsoft.XMLHTTP");
       } catch (e) { }
   }
   return false;
};

/***************************************************************************

PXN8.ajax.submitScript
======================
Submit a series of image-manipulation commands to the server. This is the end-point
through which all image manipulation commands are passed to the server.
Normally you would not call this directly. However if you would like to make changes to
a photo without changing the current working displayed photo, you can do so by calling this
function and providing your own callback function. If you do so, then the current displayed image
will not be updated.

Parameters
----------
* script : An array containing a series of operations to be performed on the photo.
* callback
A function which will be called when the server has completed the supplied series of operations and returns with *JSON* response.
The callback function should accept a single parameter of type object.
The object supplied to the callback will have the following important properties...
    * status : A string value that can be eiterh "OK" or "ERROR" (if an error occurred while the server was processing the script.
    * errorMessage : A string value. Blank if no error occurred.
    * image : A relative (to PXN8.root) path to the compressed (bandwidth-friendly) image. This will be empty if an error has occurred.
    * uncompressed : A relative (to PXN8.root) path to the uncompressed (100% quality) image. This will be empty if an error has occurred.

Example
-------

    var script = PXN8.getScript();
    PXN8.ajax.submitScript(script,function(jsonResponse){
        if (jsonResponse.status == "OK"){
           var image = jsonResponse.image;
           // do something with the image
        }else{
           alert(jsonResponse.errorMessage);
        }
    });
***/
PXN8.ajax.submitScript = function(script, callback)
{
	 if (PXN8.log)
	 {
		  PXN8.log.trace("PXN8.ajax.submitScript() ----- START -----");
		  var s = PXN8.objectToString(script);
		  PXN8.log.trace(s);
		  PXN8.log.trace("PXN8.ajax.submitScript() ------ END ------");
	 }
	 var path, suffix, i, op, scriptToText, cachedJSON;
	 var urlWithoutScript, url, scriptSizeLimit, bite, c;

	 // wph 20080611
	 // although Pixenate is primarily for editing Photos (JPEG) some customers
	 // use it for editing non-photo files (e.g. PNGs).
	 // sometimes it is not desirable to convert a PNG to JPEG - for example if the PNG
	 // has an alpha channel.
	 //
    if (typeof (PXN8.convertToJPEG) == "boolean" && PXN8.convertToJPEG == false)
	 {
        //
        // ensure that the file suffix is preserved for all operations
        //
        // Need to first determine what type of image the script is using
        // (can do this by looking at either the 'fetch' or 'cache' operation's
        // image, url or filepath parameter.
        suffix = '.jpg';
		  for (i =0;i < script.length; i++)
		  {
				op = script[i];
            if (op.operation == "fetch")
				{
                path = op.url || op.filepath;
					 c = path.indexOf('?');
					 if (c == -1){
						  c = path.length;
					 }
                suffix = path.substring(path.lastIndexOf('.'),c);
					 break;
            }
				if (op.operation == "cache")
				{
                path = op.image;
					 c = path.indexOf('?');
					 if (c == -1){
						  c = path.length;
					 }
                suffix = path.substring(path.lastIndexOf('.'),c);
					 break;
				}
        }
		  // we have the suffix - now force all ops to use that suffix
		  for (i = 0;i < script.length;i++)
		  {
				op = script[i];
				if (!op.__extension)
				{
					 op.__extension = suffix;
				}else{
					 // wph 20090107 if the op *has* an extension ensure all subsequent ops have same extension
					 // (e.g. transparent + rotate should result in a .png file)
					 suffix = op.__extension;
				}

		  }
    }
	 // wph 20090107 Ensure that if an extension has been set for an operation, then all subsequent operations have
	 // the same extension
	 suffix = '';
	 for (i = 0;i < script.length; i++){
		  op = script[i];
		  if (op.__extension){
				suffix = op.__extension;
		  }else{
				if (suffix != ''){
					 op.__extension = suffix;
				}
		  }
	 }

    // wph 20070226:
    // optimize the script.
    //
    // [1] if there are 2 or more sequential resizes, then only use the last resize.
    // [2] if the user is rotating (without flipping ) then aggregate each rotation into
    // a single operation (modulus 360).
    //
    script = PXN8.optimizeScript(script);

    scriptToText = escape(PXN8.objectToString(script));

    cachedJSON = PXN8.json.getResponseForScript(scriptToText);

    if (cachedJSON){
        //
        // call immediately without going to the server
        //
        callback(cachedJSON);
        return;
    }


	 if (PXN8.ajax.useXHR == false)
    {
		  urlWithoutScript = PXN8.server + PXN8.root + "/" + PXN8.basename + "?callback=pxn8cb&script=";

		  url = urlWithoutScript + scriptToText;

		  //
		  // Internet Explorer imposes a limit of 2048 (2083 but 2048 is recommended to be on the safe side)
		  // characters on any GET url.
		  //
		  scriptSizeLimit = 2048 - urlWithoutScript.length;
		  if (scriptToText.length > scriptSizeLimit)
		  {
				//
            // divide and conquer
            //
            // take a manageable bite and leave the remainder for the next request.
            // Think of it like pacman...
            // when each manageable request is complete we have a token pointing to the end
            // of that request chain.
            // we then start a new request chain using that token as a starting point.
            //
            bite = "[";
            c = 0;
            i = 0;
            for (;i < script.length; i++)
            {
                var optext = escape(PXN8.objectToString(script[i]));
                if (bite.length + optext.length  < scriptSizeLimit)
                {
                    bite = bite + (i>0?"," : "");
                    bite = bite + optext;
                }else{
                    break;
                }
            }
            bite = bite + "]";

            var remainder = script.slice(i);

            pxn8cb = function(json) {
                var script = [{"operation": "cache", "image": json.image}];
                for (var i = 0;i < remainder.length;i++){
                    script.push(remainder[i]);
                }
                PXN8.ajax.submitScript(script,callback);
            };
            url = urlWithoutScript + bite;

        }
        else
        {
            pxn8cb = function(json){
					 PXN8.json.setResponseForScript(scriptToText,json);
                callback(json);
            };
        }
		  var insertScriptTag = function()
		  {
				var scriptTag = document.createElement("script");
				scriptTag.setAttribute("type", "text/javascript");
				scriptTag.setAttribute("src", url);
				document.getElementsByTagName("head")[0].appendChild(scriptTag);
		  };
		  if (PXN8.browser.isIE6())
		  {
				// wph 20080729
				// IE6: for long script URLs (e.g. PXN8.ImageMagick funcs) the script sometimes never loads.
				// only workaround is to postpone insertion.
				setTimeout(insertScriptTag,50);
		  }
		  else
		  {
				insertScriptTag();
		  }

	 }
    else // PXN8.ajax.useXHR = true
    {
        var req = PXN8.ajax.createRequest();

        var onJSONerror = function(r)
        {
            alert(unescape(PXN8.strings.WEB_SERVER_ERROR) + "\n" + r.statusText + "\n" + r.responseText) ;
            var timer = document.getElementById("pxn8_timer");
            if (timer){
                timer.style.display = "none";
            }
            PXN8.updating = false;
        };

        PXN8.json.bindScriptToResponse(req,callback,scriptToText,onJSONerror);

        req.open("POST", PXN8.root + "/" + PXN8.basename, true);
        req.setRequestHeader('Content-Type',
                             'application/x-www-form-urlencoded');

        var submission = "script=" + scriptToText;

        req.send(submission);

	 }
};

/**
 * Perform a series of optimizations on the script
 */
PXN8.optimizeScript = function(script)
{
    var self = PXN8;

    for (var i = 0; i < self.optimizations.length; i++){
        var optimize = self.optimizations[i];
        script = optimize(script);
    }
    return script;
};

PXN8.optimizations = [
function(script) {
    /**
     * flatten resize ops
     */
    var result = [];

    for (var i = 0;i < script.length; i++){
        var op = script[i];
        var nextop = false;
        if (i+1 < script.length){
            nextop = script[i+1];
        }
        if (nextop && op.operation == 'resize' && nextop.operation == 'resize'){
            //
            // do nothing - skip this operation
            //
        }else{
            result.push(op);
        }
    }
    return result;
},
function(script) {
    /**
     * remove 2nd + more consecutive normalize operations.
     * (normalize - unlike enhance is not progressive)
     */
    var result = [];
    for (var i =0; i < script.length;i++){
        var op = script[i];
        var nextop = false;
        if (i+1 < script.length){
            nextop = script[i+1];
        }
        if (nextop && (nextop.operation == 'normalize') && (op.operation == 'normalize')){
        }else{
            result.push(op);
        }
    }
    return result;
},
function(script) {
    var result = [];

    var colorsOp = null;
    //
    // optimizations for consecutive 'colors' operations.
    //
    for (var i = 0; i < script.length; i++){
        var op = script[i];
        if (op.operation != "colors"){
            if (colorsOp != null){
                result.push(colorsOp);
            }
            result.push(op);
            colorsOp = null;
        }else{
            if (colorsOp != null){
                //
                // saturation, brightness and hue are multiplicative
                //
                colorsOp.saturation = ((colorsOp.saturation / 100) * (op.saturation /100)) * 100;
                colorsOp.brightness = ((colorsOp.brightness / 100) * (op.brightness /100)) * 100;
                colorsOp.hue = ((colorsOp.hue / 100) * (op.hue /100)) * 100;
                //
                // contrast is additive
                //
                colorsOp.contrast = colorsOp.contrast  + op.contrast ;
            }else{
                colorsOp = op;
            }
        }
    }
    if (colorsOp != null){
        result.push(colorsOp);
    }
    return result;
},

function(script) {
    /**
     * modulus 360 all consecutive rotate ops
     */
    var result = [];
    for (var i = 0;i < script.length; i++){
        var op = script[i];
        var nextop = false;
        if (i+1 < script.length){
            nextop = script[i+1];
        }
        if (nextop && (nextop.operation == 'rotate') && (op.operation == 'rotate')){
            //
            //
            //
            var flipping = (op.flipvt || op.fliphz || nextop.flipvt || nextop.fliphz);
            if (!flipping) {
                nextop.angle = (op.angle + nextop.angle) % 360;
            }else{
                //
                // it's a flip
                // is it the same type of flip as next op and are angles 0 in both cases ?
                if ((op.angle == 0 && nextop.angle == 0) && ((op.flipvt == nextop.flipvt) && (op.fliphz == nextop.fliphz))){
                    //
                    // it's two flipvts in a row or two fliphzs in a row
                    //
                    i += 1;
                }else{
                    result.push(op);
                }

            }
        }else{
            if (op.operation == 'rotate'){
                var flipping = (op.flipvt || op.fliphz || nextop.flipvt || nextop.fliphz);
                if (!flipping && op.angle == 0){
                    // skip operation - it's effectively a NOP
                }else{
                    // it's a straight rotation with an angle > 0
                    result.push(op);
                }
            }else{
                result.push(op);
            }
        }
    }
    return result;
}
];


PXN8.json = function()
{
	 var that = { };
    /**
     * An associative array of scriptText / responseText pairings.
     */
	 var scriptCache = { };
	 function getResponseForScript(script){ return scriptCache[script];};
	 function setResponseForScript(script,json){ scriptCache[script] = json;};
    /**
     * wph 20070131
     * Store scriptText/responseText pairings in a cache
     * avoid unnecessary calls to the server
     */
	 function bindScriptToResponse (request,callback,scriptAsString,onerror) {
		  request.onreadystatechange = function(){
				if (request.readyState == 4) {

					 if (request.status == 200) {
						  var json ;
						  try{
								json  = eval('('+ request.responseText + ')');
								//
								// store request/response pairing in the cache
								//
								setResponseForScript(scriptAsString,json);
                    }catch (e){
                        alert("An exception occured tring to evaluate server response:\n" +
                              request.responseText + "\nException: " + e);
                        //
                        // wph 20070905
                        // also output the error text to a window so the user can copy and paste it
                        // for sending bug reports
                        //
                        var wnd = window.open("","","height=200, width=640, scrollbars=1, resizable=1, location=0, menubar=0, toolbar=0");
                        var doc = wnd.document;
                        doc.open("text/plain");
                        doc.writeln("If contacting the site administrator, please copy and paste the following...");
                        doc.writeln("============================================================================");
                        doc.writeln("An exception (" + e + ") occured trying to evaluate server response:");
                        doc.writeln(request.responseText);
                        doc.close();
                        return;

                    }
                    callback(json);
                } else {
                    if (onerror){
                        onerror(request);
                    }else{
                        alert(unescape(PXN8.strings.WEB_SERVER_ERROR) + "\n" + request.statusText + "\n" + request.responseText) ;
                    }
                }
            }
        };
    };


    that.bindScriptToResponse = bindScriptToResponse;
    that.getResponseForScript = getResponseForScript;
    that.setResponseForScript = setResponseForScript;

    return that;
}();


    [% if ($pg->{target} eq "hosted") { %]
PXN8.server = "http:/" + "/pixenate.com";
PXN8.root = "/pixenate";
[% } %]

