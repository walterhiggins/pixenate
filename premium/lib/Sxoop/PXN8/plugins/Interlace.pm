use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;

#-----------------------------------------------------
# ADD AN INTERLACE EFFECT ON TOP OF THE SELECTED AREA
#-----------------------------------------------------
sub interlace 
{
	 my ($image,$params) = @_;

	 my $imrc ;

	 my $opacity = $params->{opacity};
	 $opacity = "60" unless defined $opacity;
	 
	 my $color = $params->{color};
	 $color = "#FFFFFF" unless defined $color;

	 my $w = $image->Get("width");
	 my $h = $image->Get("height");
	 

	 my $overlay = new Image::Magick;
	 $overlay->Set(size => $w . "x" . $h);
	 $overlay->Set(matte => 'false');
	 $imrc = $overlay->ReadImage("xc:". $color);
	 die "Interlace() > ReadImage(xc:$color) failed : $imrc" if (is_imagick_error($imrc));
	 
	 my $mask = new Image::Magick;
	 $mask->Set(size => $w . "x" . $h);
	 $mask->Set(matte => 'false');
	 $imrc = $mask->ReadImage("xc:#000000");
	 die "Interlace() > ReadImage(xc:#000000) failed : $imrc" if (is_imagick_error($imrc));
	 
	 for my $row (0..$h/3){
		  $imrc = $mask->Draw(primitive => "line",
									 stroke => "none",
									 points => sprintf("%d,%d %d,%d",0,$row*3,$w,$row*3),
									 method => "Floodfill",
									 fill   => "#ffffff");
		  die "Interlace() > Draw() method failed : $imrc" if (is_imagick_error($imrc));

	 }

	 $imrc = $mask->Modulate( brightness => $opacity);
	 die "Interlace() > Modulate() method failed : $imrc" if (is_imagick_error($imrc));
	 
	 #
	 # wph 20070820 : MUST SET matte = false AFTER Draw() - Draw() method
	 # seems to reset Matte to true.
	 #
	 $mask->Set(matte => 'false');

	 $imrc = $overlay->Composite(image=>$mask, compose => "CopyOpacity");
	 die "Interlace() > Composite(CopyOpacity) method failed : $imrc" if (is_imagick_error($imrc));


	 $imrc = $image->Composite(image=>$overlay, compose => "Over");
	 die "Interlace() > Composite(Over) method failed : $imrc" if (is_imagick_error($imrc));

	 return $image;
}
AddOperation('interlace', \&interlace);
1;
