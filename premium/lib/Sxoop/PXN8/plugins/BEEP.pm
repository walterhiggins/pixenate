use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
use Data::Dumper;
#
# Adjust the supplied script by scaling it from the $proxy dimensions up to the $image dimensions
#
sub beep
{
	 my ($image,$params,$extraInfo) = @_;

	 my $proxy_image = fetch(new Image::Magick,$params);

	 my $hires_height = $image->Get("Height");
	 my $lores_height = $proxy_image->Get("Height");
	 my $ratio = $hires_height / $lores_height;

	 my @params_to_scale = ("left","width","top","height","radius","pointsize", "x", "y", "dx", "dy","script","strokewidth","points");

	 foreach (@{$extraInfo->{script}})
	 {
		  my $op = $_;
		  Sxoop::PXN8::Debug::log("BEEP.pm> beep op=" . Dumper($op) . "\n");
		  my $xformed = xform_fields ($op, $ratio, @params_to_scale);
		  if ($xformed){
				Sxoop::PXN8::Debug::log("BEEP.pm> beep xformed=" . Dumper($op) . "\n");
		  }
	 }
	 #
	 # return the passed in image unchanged (but script contents have changed).
	 #
	 return $image;
}
#
# recursively transform all fields which are scalable
#
sub xform_fields
{
	 my $result = 0;
	 my ($object, $ratio, @scalable_fields) = @_;

	 foreach my $field_name (keys %$object)
	 {
		  my $field_type = ref $object->{$field_name};
		  if ($field_type eq "")
		  {
				# value is a scalar
				if (grep {$field_name eq $_} @scalable_fields)
				{
					 # field is scalable
					 #$object->{$field_name} = int($object->{$field_name} * $ratio);

					 $object->{$field_name} =~ s/(\d+)/$1*$ratio/eg;
					 $result = 1;
				}
		  }
		  if ($field_type eq "HASH")
		  {
				my $res = xform_fields($object->{$field_name},$ratio,@scalable_fields);
				if ($res){
					 $result = 1;
				}
		  }
		  if ($field_type eq "ARRAY")
		  {
				foreach my $item (@{$object->{$field_name}})
				{
					 if (ref $item eq "HASH"){
						  my $res = xform_fields($item,$ratio,@scalable_fields);
						  if ($res){
								$result = 1;
						  }
					 }
					 #
					 # for 'imagemagick' op the script property is an array of arrays
					 #
					 if (ref $item eq "ARRAY"){
						  foreach my $item2 (@{$item}){
								if (ref $item2 eq "HASH"){
									 my $res = xform_fields($item2,$ratio,@scalable_fields);
									 if ($res){
										  $result = 1;
									 }
								}
						  }
					 }
				}
				
		  }
	 }
	 return $result;
}

AddOperation('proxy', \&beep);
1;
