use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
# -----------------------------------------
# Add a lomo effect to the image
# -----------------------------------------
sub lomoize
{
	 my ($image, $params)  = @_;
	 my $opacity = $params->{opacity};
	 my $saturate = $params->{saturate};

	 my $imrc = undef;
	 if ($saturate eq "true"){
		  $imrc = $image->Modulate(brightness=>120,saturation=>140,hue=>100);
		  die "lomo error: $imrc\n" if (is_imagick_error($imrc));
	 }
	 
	 my $iw = $image->Get("width");
	 my $ih = $image->Get("height");
		
	 my $diameter = $iw > $ih?$iw:$ih;
	 
	 my $bottom = $image->Clone;
	 Sxoop::PXN8::Debug::log (__FILE__ ." opacity=$opacity\n");
	 $imrc = $bottom->Colorize(fill=>"#000000",opacity=>sprintf("%d%%",100-$opacity));
	 die "lomo error: $imrc\n" if (is_imagick_error($imrc));
	 
	 my $mask = Image::Magick->new;
	 Sxoop::PXN8::Debug::log ("lomo [5]\n");

	 use File::Spec;
#	 use Cwd;
#	 my $cwd = cwd();
	 my $cwd = $ENV{PIXENATE_WORKING_DIRECTORY};

	 my $absPath = File::Spec->rel2abs("images/mask256x256.jpg",$cwd);
	 $imrc = $mask->Read($absPath);

	 die "lomo error: $imrc\n" if (is_imagick_error($imrc));
	 
	 $imrc = $mask->Resize(width=>$diameter,height=>$diameter);
	 die "lomo error: $imrc\n" if (is_imagick_error($imrc));
	 
	 $imrc = $mask->Crop(x=>($diameter-$iw)/2, y=> ($diameter-$ih)/2,
								width=>$iw, height=> $ih);
	 die "lomo error: $imrc\n" if (is_imagick_error($imrc));
	 
	 $imrc = $bottom->Composite(image=>$image,mask=>$mask);
	 die "lomo error: $imrc\n" if (is_imagick_error($imrc));
	 
	 return $bottom;
}
AddOperation('lomo', \&lomoize);
1;
