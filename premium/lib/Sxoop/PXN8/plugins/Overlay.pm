use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
use LWP::Simple qw(!head);
use Digest::MD5;
use Data::Dumper;
# -----------------------------------------
# Add an overlay image 
# -----------------------------------------
sub overlay
{
	 my ($image, $params, $extraInfo) = @_;
	 
	 my $imrc; # imagemagick return code
	 my $overlay = new Image::Magick;

	 my $x = $params->{left};
	 my $y = $params->{top};
	 my $tile = 'false';
	 if (exists($params->{tile})) {
		  $tile = $params->{tile};  
	 }

	 my $opacity = 100;
	 if (exists ($params->{opacity}))
	 {
		  $opacity = $params->{opacity};
		  if ($opacity <= 0)
		  {
				# if opacity is set at 0 or less then just return original image
				return $image;
		  }
	 }

	 #
	 # for backwards compatibility with 1.3sp3
	 #
	 if (exists $params->{image}){
		  $params->{filepath} = $params->{image};
		  delete $params->{image};
	 }

	 if (exists $params->{url} or exists $params->{filepath})
	 {
		  my $paramUsed = $params->{filepath} or $params->{url};
		  
		  my ($ext) = $paramUsed =~ /.*\.(.*)/;
		  my $hex = Digest::MD5::md5_hex($paramUsed);

		  my $fetchParams = {target => $ENV{PIXENATE_WORKING_DIRECTORY} . $ENV{PIXENATE_CACHE_DIR} . "/$hex.$ext"};
		  
		  if ($params->{filepath}){
				$fetchParams->{filepath} = $params->{filepath};
		  }else{
				$fetchParams->{url} = $params->{url};
		  }
		  $overlay = fetch($overlay,$fetchParams);
	 }

	 if ($tile ne "true"){
		  #
		  # The overlay won't be tiled.
		  #
		  if (exists $params->{width}){
				$overlay->Resize(width => $params->{width}, height => $params->{height});
		  }
	 }
	 my $position = "front";
	 if (exists ($params->{position})){
		  $position = $params->{position};
	 }


	 my $a;
	 my $b;

	 if ($position =~ /front/i)
	 {
		  my $extend = "false";
		  if (exists $params->{extend}) {
				$extend = $params->{extend};
		  }
		  if ($extend =~ /true/i) {
				my $oh = $overlay->Get("Height");
				my $ow = $overlay->Get("Width");
				Sxoop::PXN8::Debug::log ("Overlay.pm> Extending image to $ow x $oh\n");
				$image->Extent(width=>$ow, height=>$oh, 
									x=> 0-$x, 
									y=> 0-$y,
                           background=>"#00000000");
				$x = 0;
				$y = 0;
		  }
		  $a = $image;
		  $b = $overlay;

	 }else{
		  $a = $overlay;
		  $b = $image;
    }

	 if ($opacity != 100) {
		  $b = $b->Fx(expression=>"a?$opacity/100:0",channel=>"alpha");
	 }
	 
	 $imrc = $a->Composite(image   => $b, tile    => $tile, compose => "Over", x=>$x, y=>$y);
	 die ("Overlay.pm> ERROR $imrc") if (is_imagick_error($imrc));

    my $w = $a->Get("width");
    my $h = $a->Get("height");
    $a->Set("page",$w . "x" . $h . "+0+0");

	 return $a;

}
AddOperation('overlay',\&overlay);
1;
