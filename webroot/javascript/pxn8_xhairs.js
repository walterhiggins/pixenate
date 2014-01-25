/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 * This file contains code for displaying cross-hairs on the selection
 *
 */
var PXN8 = PXN8 || {};

PXN8.crosshairs = {};
/*************************************************************************

SECTION: Cross-Hairs functions
==============================
The following functions are related to setting and getting the cross-hairs image
(by default a white cross which is displayed in the center of the selection area),
and also enabling and disabling the cross-hairs.

***/

PXN8.crosshairs.enabled = true;
PXN8.crosshairs.image = null;


/**************************************************************************

PXN8.crosshairs.setEnabled()
============================
Enables or disables the display of the cross-hairs image at the center of the
selected area.

Parameters
----------

* enabled : A boolean (true or false) indicating whether or not cross-hairs should be displayed.

Related
-------
PXN8.crosshairs.isEnabled()

***/
PXN8.crosshairs.setEnabled = function(enabled){
    PXN8.crosshairs.enabled = enabled;
    PXN8.crosshairs.refresh();
};

/**************************************************************************

PXN8.crosshairs.isEnabled()
===========================
Returns a boolean value indicating whether or not the crosshairs are displayed in the selected area.

Returns
-------
*true* if the crosshairs are displayed in selections. *false* otherwise.

Related
-------
PXN8.crosshairs.setEnabled()

***/
PXN8.crosshairs.isEnabled = function(){
    return PXN8.crosshairs.enabled;
};



/**************************************************************************

PXN8.crosshairs.getImage()
==========================
Get the Image URL currently used for displaying the cross-hairs at the center
of the selected area.

Returns
-------
A URL to the image used as the cross-hairs image. The URL returned will be an
absolute URL including the domain name and full URL path.

Related
-------
PXN8.crosshairs.setImage()

***/
PXN8.crosshairs.getImage = function()
{
    if (PXN8.crosshairs.image == null){
        PXN8.crosshairs.image = PXN8.server + PXN8.root + "/images/pxn8_xhairs_white.gif";
    }
    return PXN8.crosshairs.image;
};

/***************************************************************************

PXN8.crosshairs.setImage()
==========================
You can change the cross-hairs image to suit your own tastes.

Parameters
----------
* imageURL : A URL to the image which should be displayed in the center of the selection area.

Related
-------
PXN8.crosshairs.getImage()

***/
PXN8.crosshairs.setImage = function(imageURL)
{
    PXN8.crosshairs.image = imageURL;
    PXN8.crosshairs.refresh();
};

/**
 * Called when the selection changes
 */
PXN8.crosshairs.refresh = function()
{
    var _ = PXN8.dom;
    var xhairs = _.id("pxn8_crosshairs");

    if (!PXN8.crosshairs.isEnabled()){
        if (xhairs){
            xhairs.style.display = "none";
        }
        return;
    }
    var sel = PXN8.getSelection();
    var _ = PXN8.dom;
    var selBounds = _.eb("pxn8_select_rect");
    var canvas = _.id("pxn8_canvas");
    if (!xhairs){
        xhairs = _.ac(canvas,_.ce("img",{id: "pxn8_crosshairs", src: PXN8.crosshairs.getImage()}));
    }
    if (selBounds.width <= 0){
        xhairs.style.display = "none";
        return;
    }
    //
    // center the crosshairs on the selection area
    //
    var xhcx = xhairs.width/2;
    var xhcy = xhairs.height/2;

    xhairs.style.display = "inline";
    xhairs.style.position = "absolute";
    //
    // wph 20070613 : must use Math.floor or the xhairs will not be perfectly centered
    // (off by up to 2 pixels to the right and bottom)
    //
    xhairs.style.left = Math.floor((selBounds.x + (selBounds.width / 2)) - xhcx) + "px";
    xhairs.style.top = Math.floor((selBounds.y + (selBounds.height / 2)) - xhcy) + "px";
};

PXN8.listener.add(PXN8.ON_SELECTION_CHANGE,PXN8.crosshairs.refresh);
PXN8.listener.add(PXN8.ON_ZOOM_CHANGE,PXN8.crosshairs.refresh);

