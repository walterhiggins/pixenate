use strict;
use Sxoop::PXN8 ':all';

sub enhance
{
  my ($image) = @_;
  $image->Enhance();
  return $image;
}

AddOperation('enhance', \&enhance);

1;
