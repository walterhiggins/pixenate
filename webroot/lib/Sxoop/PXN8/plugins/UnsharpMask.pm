use strict;
use Sxoop::PXN8 ':all';

sub unsharpmask
{
  my ($image, $params) = @_;
  my $imrc = $image->UnsharpMask($params);

  die "unsharpmask failed because : $imrc" if (is_imagick_error($imrc));

  return $image;
}
AddOperation('unsharpmask', \&unsharpmask);
1;
