Fonts bundled with Pixenate
===========================

All of the fonts in this directory are made available by their
creators free of charge. These fonts are not owned by Sxoop
Technologies. All copyright remains with the original owners.

Adding these fonts to ImageMagick
=================================

Linux / Unix
------------
A file type-pixenate.xml is included in this directory.
You should open that file in an editor and modify the 'glyphs'
attribute of each <type> element to include the full absolute path to
the .ttf or .otf file.


Then edit your type.xml file (see
http://pixenate.com/pixenate/docs/Installation-Guide.html#imagemagick_linux_fonts
) and add the following line...

<include file="type-pixenate.xml" />

Copy the type-pixenate.xml file to the same directory where type.xml
resides.

Windows
-------

Copy the *.otf and *.ttf files to the fonts folder in your windows
control panel. 
