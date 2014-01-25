use strict;
use Sxoop::PXN8 ':all';

sub extent
{
	 my ($image,$params) = @_;

	 # transparent by default
	 my $color = "#00000000";
	 
	 if (exists $params->{color}){
		  $color = $params->{color};
	 }
	 my $width = $params->{width};
	 my $height = $params->{height};
	 my $left = 0;
	 if (exists $params->{left}){
		  $left = $params->{left};
	 }
	 my $top = 0;
	 if (exists $params->{top}){
		  $top = $params->{top};
	 }
	 my $rc = $image->Extent(width => $width, 
									 height => $height, 
									 x => $left, 
									 y => $top,
									 background=>$color);
	 die "Extent.pm> $rc" if ($rc);
	 
	 return $image;

}
AddOperation('extent',\&extent);
1;
