use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;


sub vertical_gradient 
{
	 my ($width, $height, $startcolor, $endcolor) = @_;

	 my $test = Image::Magick->new;

	 my $imrc = 0;

	 $test->Set(size=>sprintf("%sx%s",$width,$height));
	 $imrc = $test->ReadImage(sprintf("gradient:%s-%s",$startcolor,$endcolor));

	 die "vertical_gradient() failed : $imrc" if (is_imagick_error($imrc));

	 return $test;
}
# -----------------------------------------
# add a lens filter 
# -----------------------------------------
sub filter 
{
	 my ($image, $params,$extra) = @_;

	 #
	 # wph 20080226 : Filter behaves unexpectedly
	 # if called on an image which has had another op (in tests - roundcorners)
	 # performed on it in memory.
	 # the workaround is to reload the image from the disk prior to performing filter.
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
		  Sxoop::PXN8::Debug::log("Filter: Reading image from file $previous_image\n");
		  
	 }

	 my $color = $params->{color};
	 my $opacity = $params->{opacity};

	 my $w = $image->Get("width");
	 
	 my $filter = Image::Magick->new;
	 
	 my $version = $filter->Get("version");
	 
	 my $imrc = 0;


	 if ($version =~ /6\.2/) {
		  #
		  # the old way 
		  #
		  $filter->Set(size=>$w."x".$params->{top});
		  $imrc = $filter->ReadImage("gradient:$color-none");
		  if (is_imagick_error($imrc)){
				die "Filter operation failed - could not read image gradient:$color-none : $imrc";
		  }
		  $filter = $filter->Fx(channel=>'alpha',	expression=>"u/100*$opacity");
		  
		  $imrc = $image->Composite(image=>$filter);
		  die "Filter operation failed: Could not Composite : $imrc" if (is_imagick_error($imrc));
				
	 }else {
		  
		  #
		  # the new way
		  #
		  $filter->Set(size=>$w."x".$params->{top});
		  my $imrc = $filter->ReadImage("xc:$color");
		  my $whiteness = 255 * ( $opacity / 100 );
		  my $fade_to_white = sprintf("#%02X%02X%02X",$whiteness,$whiteness,$whiteness);
		  
		  
		  my $mask = vertical_gradient($w,$params->{top}, $fade_to_white, "#000000");
		  $mask->Set( matte => 'false' );
		  
		  $imrc = $filter->Composite(image => $mask, compose => "CopyOpacity");
		  die $imrc if (is_imagick_error($imrc));
				
		  $imrc = $image->Composite(image => $filter, compose => "Over", x=>0, y=>0);
		  
		  die "Filter operation failed (6.3) - could not composite : $imrc" if (is_imagick_error($imrc));
	 }
		  
	 return $image;

}
AddOperation('filter', \&filter);
1;
