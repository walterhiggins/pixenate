use strict;
use Sxoop::PXN8 ':all';
#------------------------------------------------------------------------
# Simulate a charcoal drawing
#------------------------------------------------------------------------
sub charcoal
{
	 my ($image,$params) = @_;

	 my $imrc = $image->Charcoal(sigma=>1.0,radius=> $params->{radius});
	 if (is_imagick_error($imrc)){
		  die "$imrc";
	 }
	 return $image;
}

AddOperation('charcoal', \&charcoal);

1;
