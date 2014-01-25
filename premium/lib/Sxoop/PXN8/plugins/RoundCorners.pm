package RoundCorners;
use strict;
use Sxoop::PXN8 ':all';

#------------------------------------------------------------------------
# add rounded corners to image
#------------------------------------------------------------------------
sub add_rounded_corners 
{
	 my ($image, $params) = @_;
	 
	 
	 # default to white corners if no color specified
	 $params->{color} = "#ffffff" unless exists $params->{color};
	 
	 # default to 32 if no radius specified
	 $params->{radius} = 32 unless exists $params->{radius};
	 
	 my $color = $params->{color};
	 my $radius = $params->{radius};
	 
	 my $imrc = undef;
	 
	 my $w = $image->Get("width");
	 my $h = $image->Get("height");
	 if ($radius > $w/2){
		  $radius = $w/2;
	 }
	 if ($radius > $h/2){
		  $radius = $h/2;
	 }
	 
	 my $mask = Image::Magick->new;
	 $mask->Set(size=>sprintf("%dx%d",($radius*2)+1,($radius*2)+1));
	 $mask->ReadImage("xc:#FFFFFF");
	 $mask->Draw(primitive=>"ellipse",	  
					 points=>sprintf("%d,%d %d,%d 0,360",$radius,$radius,$radius,$radius),		  
					 method=>"Floodfill",			  
					 fill=>"#000000",				  
					 stroke=>"none");
	 
  
	 my $corners = $mask->Clone;
	 # im 6.0.7 doesn't do corners correctly
	 # the mask doesn't seem to work !
	 $corners->Colorize(fill=>$color);
	 
	 # wph 20061003: this command won't work with 6.2.9-8 
	 #
	 # $corners->Composite(image=>$corners,mask=>$mask);
	 #
	 # The recommended alternative approach ...
	 #
	 $mask->Set(matte=>'false');
	 $corners->Composite(image=>$mask, compose=>'CopyOpacity');

	 
	 my $tl = $corners->Clone();
	 my $tr = $corners->Clone();
	 my $bl = $corners->Clone();
	 my $br = $corners->Clone();
	 
	 $tl->Crop(x=>0,y=>0,width=>$radius,height=>$radius);
	 $tr->Crop(x=>$radius+1,y=>0,width=>$radius,height=>$radius);
	 $bl->Crop(x=>0,y=>$radius+1,width=>$radius,height=>$radius);
	 $br->Crop(x=>$radius+1,y=>$radius+1,width=>$radius,height=>$radius);
  
	 $image->Composite(image=>$tl,gravity=>"NorthWest", compose => "Over");
	 $image->Composite(image=>$tr,gravity=>"NorthEast", compose => "Over");
	 $image->Composite(image=>$bl,gravity=>"SouthWest", compose => "Over");
	 $image->Composite(image=>$br,gravity=>"SouthEast", compose => "Over");

	 return $image;
}
AddOperation('roundcorners', \&add_rounded_corners);
1;
