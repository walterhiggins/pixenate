#!/usr/bin/perl
# ------------------------------------------------------------------------
#
# generate_fonts.pl : Generate both the javascript/pxn8_fonts.js javascript file
#                     and the sample GIFs for each font.
#                     You should run this script from the command line from
#                     the pixenate directory. 
#                     On windows, do the following...
#
#                     C:\> cd Inetpub\wwwroot\pixenate
#                     C:\> perl generate_fonts.pl
#
#                     On unix, do the following...
#        
#                     $ cd /usr/local/www/htdocs/pixenate
#                     $ perl generate_fonts.pl
# 
#                     If you install new fonts on your system and want those fonts
#                     to be recognized by Pixenate then you should run this script
#                     again.
# ------------------------------------------------------------------------
use strict;
use Image::Magick;

my $im = new Image::Magick();
my $imrc = 0;

my @im_fonts = $im->QueryFont();

my $fontsDir = "./images/fonts";

my $js_filename = "./javascript/pxn8_fonts.js";
open (JAVASCRIPT, ">$js_filename") or die "Could not create $js_filename because $!\n";

print JAVASCRIPT "PXN8.fonts = {\n";

foreach (0..$#im_fonts)
{

	 my $im_font = $im_fonts[$_];

	 my $filename = "$fontsDir/$im_font" . ".gif";

	 if (! -e $filename)
    {
		  my $font = new Image::Magick;
		  $imrc = $font->Set(size=> "144x20");
		  die $imrc if ($imrc);

		  $imrc = $font->Read("xc:#00000000");
		  die $imrc if ($imrc);

		  $imrc = $font->Annotate(pointsize=> 16, text=>$im_font, gravity=>"west", font => $im_font, fill=>"#000000");
		  die $imrc if ($imrc);

		  #
		  # DANGER: ensure $filename is absolute path in case this 
		  # script is running under mod_perl2 
		  #
		  $imrc = $font->Write(filename=>$filename);

	 }

	 print JAVASCRIPT "\t\"$im_font\": \"$filename\"";
	 if ($_ < $#im_fonts){
		  print JAVASCRIPT ",\n";
	 }
}

print JAVASCRIPT "\n};";

close JAVASCRIPT;

print "OK $js_filename has been created with $#im_fonts Fonts\n";

