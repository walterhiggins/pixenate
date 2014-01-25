use strict;
use Sxoop::PXN8 ':all';
#------------------------------------------------------------------------
# Simulate an oil painting
#------------------------------------------------------------------------
sub oilpaint
{
	 my ($image,$params) = @_;

	 $image->OilPaint(radius=> $params->{radius});

	 return $image;
}

AddOperation('oilpaint', \&oilpaint);

1;
