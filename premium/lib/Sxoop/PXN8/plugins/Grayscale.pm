use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;

# -----------------------------------------
# make the image black and white
# -----------------------------------------
sub grayscale
{
	 my ($image, $params) = @_;
	 $image->Quantize(colorspace=>"Gray");
	 return $image;
}
AddOperation('grayscale', \&grayscale);
1;
