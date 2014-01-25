#!/usr/bin/perl
# ----------------------------------------------------------------------------
#
# (c) Copyright 2005-2009 SXOOP Technologies Ltd. All rights reserved.
#
# save_to_server.pl 
#
# A sample perl script that demonstrates how to permanently save to the server 
# a photo that has been edited using PXN8.
#
# This script is provided for demonstration purposes only. Please create 
# a PHP, JSP, ASP or other CGI app to save images to the server that conforms
# to your websites photo storage scheme.
# ----------------------------------------------------------------------------
use strict;

BEGIN {
	 #
	 # Customers have reported problems with IIS6 where
	 # the current working directory is not the same as the directory
	 # in which the script resides.
	 # the following code ensures that the current working directory matches
	 # the directory in which the script resides.
	 # 
	 my ($rwd) = $0 =~ /(.+[\/\\])/;
	 chdir $rwd;
	 #
	 # also required for IIS6 - IIS doesn't handle STDERR very well.
	 # the following will fix STDERR on IIS6
	 use CGI::Carp qw(fatalsToBrowser);
}
use CGI ':standard';
use Image::Magick;
use File::Copy "cp";

my $cgi = new CGI();
#
# image_to_save will be a path relative to webroot
#
# e.g. if Pixenate is installed in C:\Inetpub\wwwroot\pixenate
# then the value for image_to_save would be something like...
#
# ./cache/9_0fb2ce.working.jpg
#
#
my $image_to_save = $cgi->param("image_to_save");

my @path_parts = split '/', $image_to_save;
#
# just the filename - no directory prefix
#
my $filename_part = $path_parts[$#path_parts];

#
# this will probably be based on the user.
# 
# directory is relative to current script's location
# (let's assume it is $WEBROOT/pixenate/cgi-extra and that the gallery
# is in $WEBROOT/pixenate/cgi-extra/gallery
#
my $save_to_location = "./gallery/";
#
# at the very least you should check that the image passed in is a valid image
#
my $photo = new Image::Magick();
my $imagemagick_result = $photo->Read($image_to_save);

if ($imagemagick_result){
	 # 
	 # it's not a valid image
	 #
	 die "Attempt to save invalid image";
}else{
	 # 
	 # it's a valid image so save it
	 #
	 cp ($image_to_save, "$save_to_location/$filename_part") or die "could not copy image $!";
}

print "Content-type: text/html\n\n";

print <<HTML;
<html>
  <body>
    The image has been saved to <a href="$save_to_location/$filename_part">this location</a>
  </body>
</html>
HTML



