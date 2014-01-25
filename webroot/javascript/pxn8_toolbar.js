/* ============================================================================
 *
 * (c) Copyright SXOOP Technologies Ltd. 2005-2009
 * All rights reserved.
 *
 * This file contains code which handles display of the Pixenate Toolbar.
 *
 */

var PXN8 = PXN8 || {};

PXN8.toolbar = {};

/**
 * You can override this value in your html
 */
PXN8.toolbar.crop_options = ["4x6","5x8"];


/**
 * -- function:    PXN8.toolbar.draw
 * -- description: Draw the toolbar
 * -- param: buttons. An array of strings. Can be any of the following...
 * --   "undo","redo","undoall", "redoall", "unselect", "selectall", "fillflash",
 * --   "crop", "rotate", "instantFix", "enhance", "normalize", "zoomout","zoomin"
 */
PXN8.toolbar.draw = function(buttons){

    var dom = PXN8.dom;

    if (!buttons){
        buttons = new Array();
        for (var i in PXN8.toolbar.buttons){
            buttons.push(i);
        }
    }

    document.writeln("<table cellspacing='0' cellpadding='0'><tbody><tr id='pxn8_toolbar_table'></tr></tbody></table>");

    for (var i in PXN8.toolbar.menu){
        document.writeln("<div id='pxn8_toolbar_" + i + "' class='pxn8_toolbar_dropdown' style='display:none;'></div>");
    }
    /**
     * wph 20060704: Need to move the drop-down menus up to the
     * document.body because the position will break inside a
     * relative div.
     * Create a closure that will move the dropdown menus to the body
     * when executed.
     */
    function moveMenusToBody(){
        for (var i in PXN8.toolbar.menu){
            var menuElement = document.getElementById("pxn8_toolbar_" + i);
            var menuParent = menuElement.parentNode;
            menuParent.removeChild(menuElement);
            document.body.appendChild(menuElement);
        }
    };
    /**
     * Delay running the closure until the document has loaded.
     */
    PXN8.dom.addLoadEvent(moveMenusToBody);

	 var toolbar = dom.id('pxn8_toolbar_table');

    for (var h =0; h < buttons.length; h++)
    {
        var i= buttons[h];

        var widgetModel = PXN8.toolbar.buttons[i];

        var cell = dom.ac(toolbar,dom.ce("td"));
        var widget = dom.ce("a",{className: "pxn8_toolbar_btn",
                                 href: "javascript:void(0);",
                                 onclick: widgetModel.onclick,
                                 title: widgetModel.tooltip,
                                 onmousedown: function(){this.className = 'pxn8_toolbar_btndown';},
                                 onmouseup: function(){this.className = 'pxn8_toolbar_btn';},
                                 onmouseout: function(){this.className = 'pxn8_toolbar_btn';}
        });



	     var arrowLink = dom.ce("a",{href: "javascript:void(0);",
                                    onclick: function(event,element){
                                        widgetModel.arrowClicked = widgetModel.arrowClicked==true?false:true;
                                    }
        });

        dom.ac(cell,widget);
        var widgetImage = dom.ce("img", {border: 0,
                                         alt: widgetModel.tooltip,
                                         src: PXN8.server + PXN8.root + widgetModel.image
        });
        dom.ac(widget,widgetImage);

    }

    dom.ac(dom.ac(dom.ac(toolbar,
                         dom.ce("td")),
                  dom.ce("a",{ href: "http:/" + "/pixenate.com/"})),
           dom.ce("img",{border: 0,
                         id: "pxn8_poweredby",
                         src: PXN8.server + PXN8.root + "/images/icons/powered_by_pxn8.gif"}));

};

/**
 * Hide the dropdown menu
 */
PXN8.toolbar.hidemenu = function(e)
{
    if (!e) var e = window.event;
    var tg = (window.event) ? e.srcElement : e.target;
    if (tg.nodeName != 'DIV') return;
    var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
    while (reltg != tg && reltg.nodeName != 'BODY'){
        reltg = reltg.parentNode;
    }
    if (reltg == tg) return;

    tg.style.display = "none";
};

/**
 * OnToolClick handles the special case of a toolbar button which
 * has a default action or displays a dropdown menu of operations if the
 * dropdown arrow is clicked.
 * menuDiv : the dropdown menu's div
 * button_offset: a numeric offset for where the dropdown arrow is
 * menuMap: A hash of menu text to functions
 * default_func: The default function to be called if the dropdown arrow
 * isn't clicked.
 */
PXN8.toolbar.ontoolclick = function(event, menuDiv, button_offset, menuMap, default_func)
{
    var dom = PXN8.dom;
    if (!event){
        event = window.event;
    }
    var button = (window.event) ? event.srcElement : event.target;

    menuDiv.onmouseout = function(event){
        PXN8.toolbar.hidemenu(event);
    };

    if (menuDiv.style.display == "block"){
        menuDiv.style.display = "none";
        return;
    }

    /**
     * Hide all other dropdowns
     */
    var dropdowns = PXN8.dom.clz("pxn8_toolbar_dropdown");
    for (var i = 0; i < dropdowns.length; i++){
        var dropdown = dropdowns[i];
        dropdown.style.display = "none";
    }


    var pos = dom.eb(button);
    var ox = event.clientX - pos.x ;
    var oy = event.clientY - pos.y ;


    if (ox > button_offset){
        dom.cl(menuDiv);

        for (var i in menuMap){

            var callback = function(f){
                return function(){
                    f();
                    var dropdowns = PXN8.dom.clz("pxn8_toolbar_dropdown");
                    for (var i = 0; i < dropdowns.length; i++){
                        var dropdown = dropdowns[i];
                        dropdown.style.display = "none";
                    }
                    return false;
                };
            };


            var link = dom.ce("a",{href: "javascript:void(0);",
                                   className: "pxn8_toolbar_option",
                                   onclick : callback(menuMap[i].onclick),
                                   title: menuMap[i].tooltip
                });
            if (menuMap[i].image){
                var linkImage = dom.ce("img", {border: 0, src: PXN8.server + PXN8.root + "/" +menuMap[i].image, alt: menuMap[i].tooltip});
                dom.ac(link,linkImage);
            }

            dom.ac(link,dom.tx(i));
            dom.ac(menuDiv,link);
        }
        menuDiv.style.display = "block";
        menuDiv.style.top = pos.y + pos.height + 4 + "px";
        menuDiv.style.left = (pos.x - 4) + "px";

    }else{
        default_func();
    }
    return false;

};
/*************************************************************************
 *
 * TOOLBAR and SUBMENU definitions start here
 *
 */

/**
 * Toolbar menu definitions go here
 */
PXN8.toolbar.menu = {
    crop: {},
    rotate: {},
    instantFix: {}
};

PXN8.toolbar.buttons = {};

PXN8.toolbar.buttons.zoomin = {
    onclick: function(){
        PXN8.zoom.zoomIn();return false;
    },
    image: "/images/icons/magnifier_zoom_in.gif",
    tooltip: "Zoom In"
};

PXN8.toolbar.buttons.zoomout = {
    onclick: function(){PXN8.zoom.zoomOut();return false;},
    image: "/images/icons/magnifier_zoom_out.gif",
    tooltip: "Zoom Out"
};

PXN8.toolbar.buttons.rotate = {
    onclick: function(event){
        var dropdown = document.getElementById("pxn8_toolbar_rotate");
        var menuContents = {
            "Clockwise": {
                onclick: function(){PXN8.tools.rotate({angle: 90});},
                image: "/images/icons/rotate_clockwise.gif",
                tooltip: "Rotate the image 90 degrees clockwise"
            },

            "Anti-Clockwise": {
                onclick: function(){PXN8.tools.rotate({angle: 270});},
                image: "/images/icons/rotate_anticlockwise.gif",
                tooltip: "Rotate the image 90 degrees anti-clockwise"

            },
            "Flip Vertically": {
                onclick: function(){PXN8.tools.rotate({flipvt: "true"});},
                image: "/images/icons/shape_flip_vertical.gif",
                tooltip: "Flip the image on the Vertical axis"
            },
            "Flip Horizontally": {
                onclick: function(){PXN8.tools.rotate({fliphz: "true"});},
                image: "/images/icons/shape_flip_horizontal.gif",
                tooltip: "Flip the image on the Horizontal axis"
            }

        };
        PXN8.toolbar.ontoolclick(event,dropdown,40,menuContents,function(){PXN8.tools.rotate({angle:90});});
        return false;
    },
    image: "/images/icons/rotate.gif",
    tooltip: "Rotate the photo by 90 degrees clockwise"
};

PXN8.toolbar.buttons.add_text = {
    onclick: function(event){},
    image: "/images/icons/add_text.gif",
    tooltip: "Add Text to photo"
};

PXN8.toolbar.buttons.normalize = {
    onclick: function(){PXN8.tools.normalize();return false;},
    image: "/images/icons/normalize.gif",
    tooltip: "Gives better color balance"
};

PXN8.toolbar.buttons.enhance = {
    onclick: function(event){PXN8.tools.enhance();return false;},
    image: "/images/icons/enhance.gif",
    tooltip: "Smooths facial lines"
};

PXN8.toolbar.buttons.save = {
    onclick: function(event){return PXN8.save.toServer();},
    image: "/images/icons/save.gif",
    tooltip: "Save image to server"
};

PXN8.toolbar.buttons.instantFix = {
    onclick: function(event){
        var dropdown = document.getElementById("pxn8_toolbar_instantFix");
        var fixes = {
            "Enhance":   {
                onclick: function(){PXN8.tools.enhance(); },
                tooltip: "Enhance the photo (smooths facial lines)"
            },
            "Normalize": {
                onclick: function(){PXN8.tools.normalize();},
                tooltip: "Normalize gives better color balance"
            }
        };
        PXN8.toolbar.ontoolclick(event,dropdown,48,fixes,PXN8.tools.instantFix);

        return false;
    },
    image: "/images/icons/instant_fix.gif",
    tooltip: "A quick fix solution - gives better color balance and smooths lines"
};

PXN8.toolbar.buttons.crop = {
    onclick: function(event){

        var dropdown = document.getElementById("pxn8_toolbar_crop");

        var callback = function(opt){
            return function(){
                PXN8.selectByRatio(opt);
            };
        };

        var menuContents = {};

        for (var i = 0;i < PXN8.toolbar.crop_options.length; i++){
            var option = PXN8.toolbar.crop_options[i];
            menuContents[option] = {onclick: callback(option)};
        }

        PXN8.toolbar.ontoolclick(event,dropdown,40,menuContents,function(){
            var selection = PXN8.getSelection();
            if (selection.width > 0){
                PXN8.tools.crop(selection);
            }else{
                PXN8.show.alert("Select an area to crop");
            }
        });
        return false;
    },
    image: "/images/icons/cut_red.gif",
    tooltip: "Crop the image"
};

PXN8.toolbar.buttons.fillflash = {
    onclick: function(){PXN8.tools.fill_flash();return false;},
    image: "/images/icons/lightning_add.gif",
    tooltip: "Add Fill-Flash to brighten the image"

};

PXN8.toolbar.buttons.undo = {
    onclick: function(){PXN8.tools.undo();return false;},
    image: "/images/icons/undo.gif",
    tooltip: "Undo the last operation"

};

PXN8.toolbar.buttons.redo = {
    onclick: function(){PXN8.tools.redo();return false;},
    image: "/images/icons/redo.gif",
    tooltip: "Redo the last operation"
};

PXN8.toolbar.buttons.undoall = {
    onclick: function(){PXN8.tools.undoall();return false;},
    image: "/images/icons/undo_all.gif",
    tooltip: "Undo all operations"
};

PXN8.toolbar.buttons.redoall = {
    onclick: function(){PXN8.tools.redoall();return false;},
    image: "/images/icons/redo_all.gif",
    tooltip: "Redo all operations"
};

PXN8.toolbar.buttons.selectall = {
    onclick: PXN8.selectAll,
    image: "/images/icons/selectall.gif",
    tooltip: "Select entire photo"
};

PXN8.toolbar.buttons.unselect = {
    onclick: PXN8.unselect,
    image: "/images/icons/unselect.gif",
    tooltip: "Select entire photo"
};




