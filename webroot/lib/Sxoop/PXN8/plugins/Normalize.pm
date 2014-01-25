use strict;
use Sxoop::PXN8 ':all';

sub normalize
{
  my ($image) = @_;
  $image->Normalize();
  return $image;
}
AddOperation('normalize', \&normalize);
1;
