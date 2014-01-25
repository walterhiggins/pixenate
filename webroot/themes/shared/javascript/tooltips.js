/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 *
 */
var PXN8 = PXN8 || {};

PXN8.tooltip = {
    forDisplay: {}
};
PXN8.tooltip._show = function(tipId)
{
    var dom = PXN8.dom;

	 var tipDiv = null;

	 if (PXN8.tooltip.forDisplay[tipId] == false){
		  return;
	 }

	 tipDiv = dom.id(tipId);

	 if (tipDiv == null){
		  return;
	 }
	 if (tipDiv.style == null){
		  return;
	 }
	 tipDiv.style.display = "block";

	 var imgBounds = dom.eb(dom.id("pxn8_image"));

	 tipDiv.style.top  = imgBounds.y + 10 + "px";
	 tipDiv.style.left = imgBounds.x + 10 + "px";
	 var shadow = dom.id("tipshadow");
	 if (!shadow){
		  shadow = dom.ac(document.body,dom.ce("div"));
	 }
	 shadow.id = "tipshadow";
	 shadow.style.backgroundColor = "black";
	 var opacity = 50;
	 shadow.style.opacity = opacity/100;
	 shadow.style._moz_opacity = opacity/100;
	 shadow.style.filter = "alpha(opacity:" + opacity + ")";
	 var tipBounds = dom.eb(tipDiv);
	 shadow.style.position = "absolute";
	 shadow.style.top = tipBounds.y + 3 + "px";
	 shadow.style.left = tipBounds.x + 3 + "px";
	 shadow.style.width = tipBounds.width+ "px";
	 shadow.style.height = tipBounds.height + "px";
};

PXN8.tooltip.show = function(element, elementId)
{
	 var tipId = null;
	 if (elementId){
		  tipId = elementId + "_tip";
	 }else{
		  tipId = element.id + "_tip";
	 }
	 PXN8.tooltip.forDisplay[tipId] = true;
	 setTimeout("PXN8.tooltip._show('" + tipId + "');",300);
};

PXN8.tooltip.hide = function (element, elementId)
{
    var dom = PXN8.dom;

	 var tipDiv = null;
	 var tipId = null;

	 if (elementId){
		  tipId = elementId + "_tip";
	 }else{
		  tipId = element.id + "_tip";
	 }

	 PXN8.tooltip.forDisplay[tipId] = false;

	 tipDiv = dom.id(tipId);

	 if (tipDiv){
		  tipDiv.style.display="none";
	 }
	 var shadow = dom.id("tipshadow");
	 if (shadow){
		  document.body.removeChild(shadow);
	 }
};

PXN8.dom.addLoadEvent(function(){
    var haveTooltips = PXN8.dom.clz("pxn8_has_tooltip");

    for (var i = 0;i < haveTooltips.length; i++){
        var el = haveTooltips[i];
        el.onmouseover = PXN8.curry(PXN8.tooltip.show,el);
        el.onmouseout = PXN8.curry(PXN8.tooltip.hide,el);
    }
});
