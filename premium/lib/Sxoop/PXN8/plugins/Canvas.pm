use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;

sub canvas 
{
	 my ($image, $params) = @_;
	 my $color = $params->{color};
	 my $width = $params->{width};
	 my $height = $params->{height};
	 $image = new Image::Magick();
	 $image->Read("xc:$color");
	 $image->Resize(width=>$width, height=>$height);
	 return $image;
}
AddOperation('canvas',\&canvas);
1;
