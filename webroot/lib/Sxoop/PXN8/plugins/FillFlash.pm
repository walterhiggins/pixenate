use strict;
use Sxoop::PXN8 ':all';

sub fill_flash 
{
  my ($image, $params) = @_;

  my $brighter = $image->Clone();
  
  my $opacity = 50;
  if (exists $params->{opacity}){
		$opacity = $params->{opacity};
  }
  my $imrc = $image->Composite(image=>$brighter,compose=>"Screen", opacity=> $opacity . "%");
  if (is_imagick_error($imrc))
  {
		die "FillFlash failed: $imrc";
  }
  return $image;
}
AddOperation('fill_flash', \&fill_flash);
1;
