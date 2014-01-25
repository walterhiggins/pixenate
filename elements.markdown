/*************************************************************************

SECTION: ELEMENTS
=================
Pixenate uses a number of special HTML elements. Please note that not all of these elements need to be included on your photo editing page. In fact the only element which is absolutely required is the *pxn8_canvas* element which can be simply included like this...

    <div id="pxn8_canvas"></div>

All of the elements described below are nested inside of the top-level *pxn8_canvas* element...

<img src="pigeon300x225_elements.jpg"/>

pxn8_canvas
===========
This element must appear on the web-page. It is the container for the photo and the selection area.

    <div id="pxn8_canvas"></div>

This DIV can be styled however you wish. It is recommend however that the padding style property is unchanged. If no position style property is specified, it will default to relative. If no float style property is specified, it will default to left.

pxn8_image
==========
This is the &lt;img&gt; tag used to display the photo being edited. This tag does not need to be included on the web-page as it will be added automatically during PXN8.initialize().

pxn8_timer
==========
This is a DIV which appears whenever the photo is being updated. The *pxn8_timer* div is (by default) appended to the *pxn8_canvas* div and you can style this element however you wish. E.g. to make the update message appear at the top of the photo, add the following CSS rule ...

    #pxn8_timer { position: absolute; top: 0px; left: 0px; }

This div does not need to be declared in the HTML as it will be automatically added by Pixenate&trade;. If not declared in HTML, the pxn8_timer div will be nested inside the pxn8_canvas div.

pxn8_warning
============
This is a DIV which appears whenever the user tries to 'undo' when there are no operations left to undo or when the user tries to 'redo' when there are no operations left to redo. You can style this div however you wish...

    #pxn8_warning { position: absolute; top: 0px; left: 0px; }

This div does not need to be declared in the HTML as it will be automatically added by Pixenate&trade;. If not declared in HTML, the pxn8_warning div will be nested inside the pxn8_canvas div.

pxn8_select_rect
================
This is the selection rectangle which appears around the selected area. This div does not need to be declared in the HTML as it will be automatically added by Pixenate&trade;. 

pxn8_scroller
=============
This is an optional wrapper <em>DIV</em> element which should surround the pxn8_canvas element if you want to constrain the size of the Canvas. See the <a href="Customization-Guide.html#constraining_canvas">Constraining Canvas size</a> section in the Customization Guide for more details.

***/
