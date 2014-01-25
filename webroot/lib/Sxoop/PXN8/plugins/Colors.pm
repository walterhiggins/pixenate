use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
# -----------------------------------------
# Change brightness, hue and saturation
# -----------------------------------------
sub colors
{
	 my ($image,$params) = @_;
	 
	 my $brightness = $params->{brightness} || 100;
	 my $saturation = $params->{saturation} || 100;
	 my $hue        = $params->{hue}        || 100;
	 my $contrast   = $params->{contrast}   || 0;
	 
	 Sxoop::PXN8::Debug::log (__FILE__ . " ABOUT TO CALL MODULATE\n");
	 my $imrc = $image->Modulate(brightness=>$brightness, 
										  saturation=>$saturation, 
										  hue=>$hue,
										  );
	 Sxoop::PXN8::Debug::log (__FILE__ . " MODULATE returned OK\n");
	 
	 die "colors error: $imrc\n" if (is_imagick_error($imrc));

	 if ($contrast < -5){
		  $contrast = -5;
	 }
	 if ($contrast > 5){
		  $contrast = 5;
	 }
	 my $sharpen = "True";
	 if ($contrast < 0){
		  $sharpen = "False";
	 }
	 $contrast = sqrt($contrast**2);

	 while ($contrast > 0){
		  $image->Contrast(sharpen=>$sharpen);
		  $contrast--;
	 }
	 return $image;
	 
}
AddOperation('colors', \&colors);
1;
