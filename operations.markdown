/*************************************************************************

SECTION: OPERATIONS
===================
This section is only applicable if you would like to know more about using Preview Panels or combining multiple photo operations into a single user operation.
Every change which can be made to a photo is performed using 'operations'. Operations are Javascript objects which are of the following form...

    {operation: "operation-name", ...}

... where "operation-name" is a string which is one of the following...

1. "enhance"
2. "normalize"
3. "instant_fix" (deprecated)
4. "rotate"
5. "blur"
6. "colors"
7. "crop"
8. "filter"
9. "interlace"
10. "lomo"
11. "fill_flash"
12. "overlay"
13. "add_text"
14. "whiten"
15. "fixredeye"
16. "resize"
17. "roundcorners"
18. "grayscale"
19. "charcoal"
20. "oilpaint"
21. "unsharpmask"
22. "fetch"
23. "mask"
24. "rearrange"
25. "imagemagick"

For example, to rotate an image thru 90° you could do the following...

    var rotate90 = {operation: "rotate", angle: 90};
    PXN8.tools.updateImage( [ rotate90 ] );

... or simply call...

   PXN8.tools.rotate({angle: 90});

In fact using the PXN8.tools.* functions is the recommended approach for simple operations. Where knowledge of the above operation names becomes important is in the following scenarios...

1. You want to use the Preview panel to preview an operation OR...
2. You want to combine two or more operations into a single user operation - for example - to allow users to crop and add rounded corners with just one user command.

If you want to combine two or more operations into a single atomic user operation please use <a href="#PXN8.tools.startTransaction">PXN8.tools.startTransaction()</a> and <a href="#PXN8.tools.endTransaction">PXN8.tools.endTransaction()</a>.
***/
