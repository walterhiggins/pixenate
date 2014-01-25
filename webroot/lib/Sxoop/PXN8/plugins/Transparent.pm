use strict;
use Sxoop::PXN8 ':all';
sub transparent
{
	 my ($image, $params) = @_;

	 my $color = "";
	 
	 if (exists $params->{x}) 
	 {
		  if (exists $params->{reduce}) 
		  {
				$image->Quantize(colors=>256);
		  }
		  my @pixels = $image->GetPixels(
													width=>1, 
													height=>1, 
													x => $params->{x}, 
													y => $params->{y},
											 );
		  
		  unless (exists $params->{reduce}) {
				@pixels = map { $_ / 256 } @pixels;
		  }

		  $color = sprintf("#%02X%02X%02X", @pixels);

	 }else {
		  $color = $params->{color};
	 }

	 $image->Transparent(color=>$color);

	 return $image;
}

AddOperation('transparent', \&transparent);

1;

