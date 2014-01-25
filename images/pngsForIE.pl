#!/usr/bin/perl
use strict;
use Image::Magick;
use File::Path;

mkpath "temp";

my @pngs = glob ("icons/futura/*.png");

foreach my $filepath (@pngs){
	 my ($filename) = $filepath =~ /([a-zA-Z\_\-0-9]+\.png$)/;
	 print "$filename\n";
	 my $image = new Image::Magick();
	 $image->Set(size=>"44x44");
	 $image->Read("xc:#e0e0e0");
	 my $image2 = new Image::Magick();
	 $image2->Read($filepath);
	 $image->Composite(compose=>"Over",image=>$image2, x=>3, y=>3);
	 $image->Write("temp/$filename");
	 
}

