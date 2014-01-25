use strict;
use Sxoop::PXN8 ':all';
use File::Spec;
#use Cwd;

sub _whiten
{
	 my ($image, $params) = @_;
	 #my $cwd = cwd();
	 my $cwd = $ENV{PIXENATE_WORKING_DIRECTORY};

	 my $imrc = 0;

	 #
	 # first create a plain white image the same size as the selected area
	 #
	 my $white = new Image::Magick();
	 $white->Set(size => $params->{width} . "x" . $params->{height});
	 
	 # need to explicitly set matte => false now so it has an alpha channel
	 $white->Set( matte => 'false' );   
	 $white->ReadImage("xc:#ffffff");

	 #
	 # then create a mask from the teethmask.jpg image
	 #
	 my $mask = Image::Magick->new;
	 my $absPath = File::Spec->rel2abs("images/teethmask.jpg",$cwd);
	 $imrc = $mask->Read($absPath);
	 die "whiten error: $imrc\n" if (is_imagick_error($imrc));
	 $mask->Resize(width => $params->{width}, height => $params->{height});
	 $mask->Set( matte => 'false' );
    #
	 # need to reduce opacity by 50% again because CopyOpacity will bring white in source
	 # image back up to the level it is in the mask image. the workaround is to 
	 # darken the white in the mask so that it is gray.
	 # TO DO: wph 20070820 Think about exposing brightness as a tool parameter
	 #
	 $mask->Modulate(brightness=> 50);

	 #
	 # Apply the mask to the white image
	 #
	 $white->Composite(image=>$mask, compose=>'CopyOpacity');									

	 #
	 # overlay the white image (which now has transparent parts) on top of the original image
	 #
	 $imrc = $image->Composite(image => $white, 
										compose=>"Over",  # must explicitly specify compose method
										x => $params->{left}, 
										y => $params->{top});

	 die "whiten error: $imrc\n" if (is_imagick_error($imrc));

	 return $image;
}
# -----------------------------------------
# whiten teeth (also works on eyeballs ;-)
#
# -----------------------------------------
sub whiten 
{
	 my ($image, $params) = @_;
	 return _whiten($image,$params);
}
AddOperation('whiten', \&whiten);
1;
