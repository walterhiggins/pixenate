use strict;
use Sxoop::PXN8 ':all';
sub instant_fix 
{
  my ($image) = @_;
  $image->Normalize();
  $image->Enhance();
  return $image;
}
AddOperation('instant_fix', \&instant_fix);
1;
