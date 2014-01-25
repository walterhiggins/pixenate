use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;

sub _fix_red_eye 
{
	 my ($image, $params) = @_;
	 my $cx = int($params->{left} + ($params->{width}/2));
	 my $cy = int($params->{top} + ($params->{height}/2));
	 my $rx = int($params->{width}/2);
	 my $ry = int($params->{height}/2);


	 my $red_channel = $image->Clone();

	 $red_channel->Separate(channel=>"Red");

	 my @pixels = $red_channel->GetPixels(map=>"RGB",
													  x  => $params->{left},
													  y  => $params->{top},
													  height => $params->{height},
													  width => $params->{width});

	
	 my %iris = find_iris($params->{left},$params->{top},$params->{width},$params->{height},@pixels);

	 $cx = $iris{cx};
	 $cy = $iris{cy};
	 $rx = $iris{radius};
	 $ry = $iris{radius};
	 my $darkest = $iris{darkest};


#	 $red_channel->Draw ( primitive => "ellipse", 
#								 fill => sprintf("#%02X%02X%02X",$darkest,$darkest,$darkest),
#								 stroke=>"none",
#								 antialias => "True",
#								 points => "$cx, $cy $rx, $ry 0,360");

	 #
	 # wph 20070221 : old method was to draw an ellipse but this resulted in 
	 # blue/green halos around the eye if the exact center of the affected area
	 # was not selected.
	 # combining the smarts of the find_iris() subroutine with an even older method of
	 # determining which parts of the iris are red-ish lets the user be more careless in
	 # selecting the affected area.
	 #
	 my $margin_of_error = 2;
	 my $left = $cx - ($rx + $margin_of_error);
	 my $top = $cy - ($ry + $margin_of_error);
	 my $width = $iris{radius} * 2 + ($margin_of_error * 2);
	 my $height = $iris{radius} * 2 + ($margin_of_error * 2);

	 my @iris = $image->GetPixels(map=>"RGB", x=> $left, y=> $top, width=> $width , height=> $height);
	 
	 my @rgbs = grep { $_ != -1} map {$_ % 3 == 0 ? [$iris[$_], $iris[$_+1], $iris[$_+2]] : -1} (0..$#iris);
	 
	 my ($row,$col) = 0;

	 #
	 # is it reddish ?
	 #
	 my $percentDiff = 0.30;
	 my $lowerPercent = 0.26;
	 
	 my $diff = 65535 * $percentDiff;
	 my $lowerDiff = 65535 * $lowerPercent;

	 foreach (0..$height)
	 {
		  $row = $_;
		  
		  foreach (0..$width){
				$col = $_;
				my $index = ($row * $width) + $col;
				my $rgb = $rgbs[$index];
				

				# It's reddish if the R value is > $percentDiff higher than both
				# the G and B values
				#
				my $rgdiff = $rgb->[0] - $rgb->[1];
				my $rbdiff = $rgb->[0] - $rgb->[2];
				if (($rgdiff > $diff && $rbdiff > $diff) ||
					 ($rgb->[0] > 32767 && $rgdiff > $lowerDiff && $rbdiff > $lowerDiff)){
					 
					 my $cell = sprintf("pixel[%d,%d]",$left + $col, $top + $row);
					 my $value = sprintf("#%02X%02X%02X",$darkest,$darkest,$darkest);
					 
					 $red_channel->Set($cell => $value);
					 
				}
		  }
	 }
	 
	 $image->Composite(image=>$red_channel, compose=>"CopyRed");
	 
	 return $image;
}
#------------------------------------------------------------------------
# FIX red eye
#------------------------------------------------------------------------
sub fix_red_eye
{

	 my ($image,$params) = @_;

	 if (ref $params eq "ARRAY"){
		  foreach (@$params){
				_fix_red_eye($image, $_);
		  }
	 }else{
		  _fix_red_eye($image,$params);
	 }
}

sub darkest_in_region 
{
	 my @region = @_;
	 my $result = 256;
	 foreach (0..($#region / 3))
	 {
		  my ($r,$g,$b) = @region[$_..$_+2];
		  $r = $r / 256;
		  if ($r < $result){
				$result = $r;
		  }
	 }
	 return $result;
}
sub find_iris 
{
	 my ($x,$y,$width,$height,@pixels) = @_;

	 my @red_values = grep {$_ >= 0} map { $_ % 3== 0 ? $pixels[$_]/256 : -1 } (0..$#pixels);
	 

	 my $cx = int($width/2);
	 my $cy = int($height/2);
	 
	 my @vertical_strip = grep {$_ >= 0} map { $_ % $width == $cx ? $red_values[$_] : -1 } (0..$#red_values);

	 #
	 # Starting at the center of the selected area, move down storing the point where the strip is darkest
	 #
	 my $darkest = 255;
	 my $ry = $height / 2;
	 
	 #foreach (0..$#vertical_strip){
	 foreach ($cy..$#vertical_strip)
	 {
		  if ($vertical_strip[$_] < $darkest){
				$darkest = $vertical_strip[$_];
				$ry = $_ - $cy;
		  }
	 }
	 #
	 # Now we have the radius (working from the center downwards) but this might not be the best radius value
	 # It's possible that a darker point could be found sooner working from the center upwards in which case 
	 # That value should be used instead. (to avoid situations where lower eye-lashes are brighter than upper eyelashes).
	 #
#	 my $i = $cy;
#	 while ($i >= 0){
#		  if ($vertical_strip[$i] < $darkest){
#				$darkest = $vertical_strip[$i];
#				$ry = $cy - $i;
#		  }
#		  $i = $i -1;
#	 }

	 $ry = $ry + 1;


	 $darkest = int($darkest);
	 #
	 # Sometimes the darkest red value in the lower half of the selected area won't be dark 
	 # enough (the fixed area will still look dark red). To get around this, make $red_threshold the
	 # default lower value if the darkest cell is brighter than $red_threshold
	 #
	 my $red_threshold = 96;

	 $darkest = $darkest > $red_threshold ? $red_threshold : $darkest;

	 return (darkest => $darkest, cx => int($x + $cx), cy => int($y + $cy), radius => int($ry));
}


sub brightest_cell 
{
	 my ($width,@pixels) = @_;

	 my $brightest = 0;
	 my @result = ($brightest,-1,-1);

	 foreach (0..$#pixels){
		  my $v = $pixels[$_] ;
		  if ($v > $brightest){
				$brightest = $v;
				my $x = $_%$width;
				@result = ($v,$x,($_-$x)/$width);
		  }
	 }
	 return @result;
}

AddOperation('fixredeye', \&fix_red_eye);
1;
