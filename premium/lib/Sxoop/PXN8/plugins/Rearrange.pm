use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;

sub rearrange
{
	 my ($image, $params) = @_;
	 my @piece_coords = @{$params->{pieces}};
	 my @pieces = ();

	 foreach (0..$#piece_coords)
	 {
		  my $coords = $piece_coords[$_];

        Sxoop::PXN8::Debug::log("Rearrange.pm> crop ".
										  $coords->{x} . ", " . $coords->{y} . " ". 
										  $coords->{width} . " X ". $coords->{height} . "\n");

		  my $piece = $image->Clone();
		  my %crop_params = (width => $coords->{width}, height => $coords->{height}, x => $coords->{x},	y => $coords->{y});

		  my $imrc = $piece->Crop(%crop_params);

        die "$imrc" if (is_imagick_error($imrc));

        Sxoop::PXN8::Debug::log("Rearrange.pm> piece_width ". $piece->Get("width") . "\n");

		  push @pieces, $piece;
	 }

	 foreach my $index (0..$#pieces)
	 {
		  my $dx = $piece_coords[$index]->{dx};
		  my $dy = $piece_coords[$index]->{dy};

        if ($dx == 0 && $dy == 0){ 
				next;
		  }
		  my $ox = $piece_coords[$index]->{x};
		  my $oy = $piece_coords[$index]->{y};
		  my $nx = $ox + $dx;
		  my $ny = $oy + $dy;
		  Sxoop::PXN8::Debug::log("Rearrange.pm> placing piece $index at $nx, $ny\n");
		  my $imrc = $image->Composite(image => $pieces[$index], compose=>"Over", x => $nx, y=>$ny);
        die "$imrc" if (is_imagick_error($imrc));
	 }

	 return $image;

}
AddOperation('rearrange',\&rearrange);
1;
