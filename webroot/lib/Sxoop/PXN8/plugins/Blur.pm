use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
# -----------------------------------------
# blur a region of the image
#
# -----------------------------------------
sub blur 
{
	 my ($image, $params) = @_;
	 
	 my $radius = $params->{radius};
	 $radius = 1 unless $radius;
	 
	 my $blurred= $image;
	 if ($params->{width} > 0 && $params->{height} > 0){
		  
		  $blurred = $image->Clone;
		  $blurred->Crop(x=>$params->{left},
							  y=>$params->{top},
                       width=>$params->{width},
                       height=>$params->{height});
	 }
	 $blurred->Blur(sprintf("0.0x%0.1f",$radius));
	 if ($params->{width} > 0 && $params->{height} > 0){
		  $image->Composite(image=>$blurred,
								  x=>$params->{left},
								  y=>$params->{top});
	 }
	 return $image;
}
AddOperation('blur', \&blur);
1;
