use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;

# -----------------------------------------
# Rotate the image
# -----------------------------------------
sub rotate 
{
	 my ($image, $params, $extra) = @_;

	 my $imrc = 0;
	 my $angle = $params->{angle};
	 my $flipvt = $params->{flipvt};
	 my $fliphz = $params->{fliphz};
	 if ( $flipvt eq "true"  or $fliphz eq "true")
	 {
		  
		  #
		  # wph 20070807 : flip() will yield unexpected results
		  # if the in-memory operation preceding this one was 'Filter'.
		  # The problem isn't resolved by calling $image->Flatten() either
		  # so the only solution seems to be to reload the image from the
		  # filesystem prior to performing a Flip()
		  #
		  my $script = $extra->{script};
		  my $index = $extra->{index};
		  if ($index > 0)
		  {
				my $previous_statement = $script->[$index-1];
				my $previous_image = 
					 $previous_statement->{__uncompressed_filename} 
				or
					 $previous_statement->{__compressed_filename} ;

				$image = new Image::Magick();
				$image->ReadImage($previous_image);
				Sxoop::PXN8::Debug::log("Rotate: Reading image from file $previous_image");
				
		  }
	 }
	 if ($flipvt eq "true")
	 {
		  $imrc = $image->Flip();
		  if (is_imagick_error($imrc))
		  {
				die "$imrc";
		  }
	 }
	 if ($fliphz eq "true")
	 {
		  $imrc = $image->Flop();
		  if (is_imagick_error($imrc))
		  {
				die "$imrc";
		  }
	 }
	 if ($angle > 0)
	 {
		  $imrc = $image->Rotate(degrees=>$angle);
		  if (is_imagick_error($imrc))
		  {
				die "$imrc";
		  }
	 }
	 return $image;
}

AddOperation('rotate', \&rotate);
1;
