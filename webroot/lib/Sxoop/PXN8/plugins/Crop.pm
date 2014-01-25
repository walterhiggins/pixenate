use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
# -----------------------------------------
# Crop an image
# -----------------------------------------
#
sub crop
{
	 my ($image, $params) = @_;
	 #
	 # make sure that the crop is based on the correct canvas coordinates
	 # the image should be repaged after each crop.
	 #
	 my @page = split /\D/, $image->Get("page");

	 my $imrc = $image->Crop(width=>$params->{width},
									 height=>$params->{height},
									 x=>$params->{left} + $page[2],
									 y=>$params->{top} + $page[3]);

    if (is_imagick_error($imrc))
    {
       die "Crop method failed: $imrc";
    }
	 return $image;
}
AddOperation('crop', \&crop);
1;
