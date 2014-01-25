/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 * This file contains most of the string literals used by PXN8's UI
 *
 */

var PXN8 = PXN8 || {};

PXN8.strings = {};

// alert when no more redo
PXN8.strings.NO_MORE_REDO = "No more operations left to redo!";

// alert when no more undo
PXN8.strings.NO_MORE_UNDO     = "No operations left to undo!";


// alert when fully zoomed in
PXN8.strings.NO_MORE_ZOOMIN  = "Cannot zoom-in any further!";

    // alert when fully zoomed out
PXN8.strings.NO_MORE_ZOOMOUT      = "Cannot zoom-out any further!";

    // alert when using old IE (pre 6.0)
PXN8.strings.MUST_UPGRADE_IE      = "You must upgrade to Internet Explorer 6.0 to use PXN8";

    // alert when AJAX request fails due to server error
PXN8.strings.WEB_SERVER_ERROR     = "Web server error:";

    // alert when an image fails to load due to bad URL
PXN8.strings.IMAGE_ON_ERROR1      = "An error occured while attempting to load ";

PXN8.strings.IMAGE_ON_ERROR2       = "\nPlease check the URL is correct and try again";

    // alert when no pxn8_config_content div has been defined
PXN8.strings.NO_CONFIG_CONTENT    = "ERROR: no config_content element is defined in your html template";

PXN8.strings.CONFIG_BLUR_TOOL     = "Configure Blur tool";

    // appears at the bottom of the blur config tool
PXN8.strings.BLUR_PROMPT          = "Enter a value in the range 1 to 8 for blur radius. A larger radius results in a more blurred image.";

    // alert when blur out of range
PXN8.strings.BLUR_RANGE           = "Blur radius must be in the range 1 - 8";

PXN8.strings.RADIUS_LABEL         = "Radius:";

    // alert when brightness out of range
PXN8.strings.BRIGHTNESS_RANGE     = "Enter a percentage value for brightness";

    // alert when hue out of range
PXN8.strings.HUE_RANGE            = "Hue must be in the range 0-200";

    // alert when saturation out of range
PXN8.strings.SATURATION_RANGE     = "Enter a percentage value for saturation";

    // appears at the top of the crop tool panel
PXN8.strings.CONFIG_CROP_TOOL     = "Configure Crop Tool";

PXN8.strings.CONFIG_COLOR_TOOL    = "Change colors ";

    // appears at the top of the lens filter tool panel
PXN8.strings.CONFIG_FILTER_TOOL   = "Configure Lens Filter";

    // appears at the bottom of the blur config tool.
PXN8.strings.FILTER_PROMPT        = "Click on the image and a graduated filter of the selected color (and opacity) will be overlayed on top of the image";

    // appears at the top of the interlace tool panel
PXN8.strings.CONFIG_INTERLACE_TOOL= "Configure Interlace Effect";

PXN8.strings.INTERLACE_PROMPT      = "Creates an interlaced overlay above the image making it appear like a grab from a TV screen.";

PXN8.strings.INVALID_HEX_VALUE     = "You must enter a hexadecimal color value or choose one from the color palette";

PXN8.strings.CONFIG_LOMO_TOOL      = "Configure Lomo Effect";

PXN8.strings.OPACITY_PROMPT        = "Low opacity means darker corners. High opacity means lighter corners.";

PXN8.strings.OPACITY_RANGE         = "Opacity must be in the range 0 - 100";

PXN8.strings.WHITEN_SELECT_AREA    = "You must first select the area of the image you wish to whiten";

PXN8.strings.CONFIG_WHITEN_TOOL    = "Configure Teeth Whitening";

PXN8.strings.CROP_SELECT_AREA      = "You must first select the area of the image you wish to crop";

PXN8.strings.RESIZE_SELECT_AREA    = "You must first select an area to resize to.";

PXN8.strings.RESIZE_SELECT_LABEL   = "Resize to selected area.";

PXN8.strings.SELECT_SMALLER_AREA   = "Please select a smaller area";

PXN8.strings.REDEYE_SELECT_AREA    = "You must first select the area you wish to fix";

PXN8.strings.REDEYE_SMALLER_AREA   = "Please select a smaller area to fix (less than 100x100)";

PXN8.strings.CONFIG_REDEYE_TOOL    = "Fix Red Eye";

PXN8.strings.REDEYE_PROMPT         = "To fix red-eye, select the affected area (begining at the top left corner and centering the cross-hairs on the iris) and click the 'Apply' button or press 'Enter'.";

PXN8.strings.NUMERIC_WIDTH_HEIGHT  = "You must specify a numeric value for new width and height";

PXN8.strings.LIMIT_SIZE            = "You can't resize larger than ";

PXN8.strings.ASPECT_LABEL          = "Preserve aspect ratio: ";

PXN8.strings.ASPECT_CROP_LABEL     = "Aspect ratio: ";

PXN8.strings.CROP_FREE             = "free select";

PXN8.strings.CROP_SQUARE           = "(square)";

PXN8.strings.WIDTH_LABEL           = "Width: ";

PXN8.strings.HEIGHT_LABEL          = "Height: ";

PXN8.strings.FLIPVT_LABEL          = "Flip vertically: ";

PXN8.strings.FLIPHZ_LABEL          = "Flip horizontally: ";

PXN8.strings.ANGLE_LABEL           = "Angle: ";

PXN8.strings.OPACITY_LABEL         = "Opacity: ";

PXN8.strings.CONTRAST_NORMAL       = "Normal ";

PXN8.strings.COLOR_LABEL           = "Color: ";

PXN8.strings.SEPIA_LABEL           = "Sepia";

PXN8.strings.SATURATE_LABEL        = "Saturate :";

PXN8.strings.GRAYSCALE_LABEL       = "Grayscale";

PXN8.strings.ORIENTATION_LABEL     = "Orientation: ";

PXN8.strings.CONFIG_RESIZE_TOOL    = "Resize Image";

PXN8.strings.CONFIG_ROTATE_TOOL    = "Rotate or Flip Image";

PXN8.strings.SPIRIT_LEVEL_PROMPT1  = "Please click on the left half of the crooked horizon.";

PXN8.strings.SPIRIT_LEVEL_PROMPT2  = "OK. Now click on the right half of the crooked horizon.";

PXN8.strings.CONFIG_SPIRITLVL_TOOL = "Spirit-level Mode";

PXN8.strings.CONFIG_ROUNDED_TOOL   = "Configure Rounded Corners";

PXN8.strings.CONFIG_BW_TOOL        = "Configure Sepia or Black & White";

PXN8.strings.ORIENTATION_PORTRAIT  = "Portrait";

PXN8.strings.ORIENTATION_LANDSCAPE = "Landscape";

PXN8.strings.PROMPT_ROTATE_CHOICE  = "Please specify an angle of rotation or flip orientation";

PXN8.strings.BW_PROMPT             = "Turn your photograph into black & white or add a sepia tone.";

PXN8.strings.IMAGE_UPDATING        = "The image is currently updating.\nPlease wait for the current operation to complete.";

PXN8.strings.BRIGHTNESS_LABEL      = "brightness";

PXN8.strings.SATURATION_LABEL      = "saturation";

PXN8.strings.CONTRAST_LABEL        = "contrast";

PXN8.strings.HUE_LABEL             = "hue";

PXN8.strings.UPDATING              = "Updating image. Please wait...";

PXN8.strings.CONFIG_OILPAINT_TOOL  = "Apply Oil-Painting Filter";

PXN8.strings.CONFIG_CHARCOAL_TOOL  = "Apply Charcoal Filter";

PXN8.strings.SAVING_HI_RES         = "Saving High-Resolution image. Please wait a moment...";

PXN8.strings.INVALID_PARAMETER     = "Invalid parameter passed to function.";

PXN8.strings.RESET                 = "Reset";
