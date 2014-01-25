use strict;
use Sxoop::PXN8 ':all';
sub mask 
{
	 my ($image, $params, $extraInfo) = @_;

	 my $imrc = 0;

	 my $iw = $image->Get("width");
	 my $ih = $image->Get("height");

	 # background is transparent by default
	 my $background_color = "#00000000"; 
	 
	 if ( exists $params->{background_color} )
	 {
		  $background_color = $params->{background_color};
	 }

	 my $background = Image::Magick->new();
	 $background->Set(size=>$iw . "x" . $ih);
	 $background->ReadImage("xc:$background_color");
	 

	 use File::Spec;
	 my $cwd = $ENV{PIXENATE_WORKING_DIRECTORY};

	 my $abs_path = File::Spec->rel2abs($params->{filepath},$cwd);
	 my $mask = Image::Magick->new();
	 $imrc = $mask->Read($abs_path);
	 die "mask error while reading mask file: $imrc\n" if (is_imagick_error($imrc));

	 $imrc = $mask->Resize(width => $iw, height => $ih);
	 die "mask error while resizing mask: $imrc\n" if (is_imagick_error($imrc));
	 
	 $imrc = $background->Composite(image=>$image,mask=>$mask);
	 die "mask error while compositing: $imrc\n" if (is_imagick_error($imrc));
	 
	 return $background;
}
AddOperation('mask',\&mask);
1;
