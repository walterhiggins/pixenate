use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;

# -----------------------------------------
# make the image sepia toned
# -----------------------------------------
sub sepia
{
	 my ($image, $params) = @_;
	 my $color = $params->{color};
	 if ($color !~ /^#/){
		  $color = "#" . $color;
	 }

	 my $overlay = $image->Clone;
		
	 
	 $overlay->Colorize(fill=>$color,opacity=>"100%");
	 $image->Quantize(colorspace=>"Gray");
	 $image->Composite(image=>$overlay,compose=>"Overlay");

	 return $image;
}
AddOperation('sepia', \&sepia);
1;
