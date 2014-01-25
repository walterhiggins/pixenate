use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
# -----------------------------------------
# Resize the image
# -----------------------------------------
sub resize 
{
	 my ($image, $params) = @_;
	 my $width = $params->{width};
	 my $height = $params->{height};
#
#   wph 20060127
#   commenting this out as it's now product
#
# 	 if ($width > 1600 || $height > 1600){
# 		  my $requested_width = $width;
# 		  $width = 1600;
# 		  $height = $height*1600/$requested_width;
# 	 }
	 
	 my $imrc = $image->Resize(width=>$width,height=>$height);
	 if (is_imagick_error($imrc))
	 {
		  die "$imrc";
	 }
	 
	 return $image;
}
AddOperation('resize', \&resize);
1;
