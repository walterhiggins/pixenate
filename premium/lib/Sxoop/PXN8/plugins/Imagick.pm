use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
use Data::Dumper;

sub imagemagick
{
	 my ($image,$params) = @_;

	 my $symbols = {"_"=>$image};

	 my $script = $params->{script};

	 foreach my $statement (@$script)
	 {
		  Sxoop::PXN8::Debug::log("Imagick.pm> statement=" . Dumper($statement));
		  my ($object_name,$method,$params) = @$statement;

		  if ($method =~ /write/i)
		  {
				next;
		  }

		  if (exists $symbols->{$object_name}){
				# OK already present
		  }
		  else
		  {
				$symbols->{$object_name} = new Image::Magick;
		  }
		  my $object = $symbols->{$object_name};

		  # convert object_names to image_handles
		  if (ref $params eq "HASH"){
				foreach my $pk (keys %$params)
				{
					 my $pv = $params->{$pk};
					 if (ref $pv eq "HASH"){
						  if (exists $pv->{'handle'})
						  {
								$params->{$pk} = $symbols->{$pv->{'handle'}};
						  }
					 }
				}
		  }
		  Sxoop::PXN8::Debug::log("Imagick.pm> object=$object\n");
		  Sxoop::PXN8::Debug::log("Imagick.pm> method=$method\n");


		  my $imrc = 0;

		  if ($method eq "clone_from")
		  {
				$symbols->{$object_name} = $symbols->{$params}->Clone();
		  }
		  elsif ($method eq "append")
		  {
				$symbols->{$object_name} = $symbols->{$params->[0]}->Append($params->[1]);
		  }
		  elsif ($method eq "return")
		  {
				return $symbols->{$object_name};
		  }
		  elsif ($method eq "push")
		  {
				push (@{$symbols->{$object_name}}, $symbols->{$params});
		  }
		  elsif ($method eq "_CropToText")
		  {
				# wph 20090120 To allow for auto-cropping to a Annotate() method's output
				my @dims = $object->QueryMultilineFontMetrics ( %$params );
				my $cropWidth = $dims[4] + 5;
				my $cropHeight = $dims[5] + 5;
				Sxoop::PXN8::Debug::log("Imagick.pm> dims=" . Dumper(@dims) );

				$object->Crop ( width => $cropWidth , y => 0, height => $cropHeight , x => 0);
		  }
        elsif ($method eq "_ScaleTo")
		  {
				my $current_width = $object->Get("width");
				my $current_height = $object->Get("height");
				my $new_width = 0;
				my $new_height = 0;
				if (exists $params->{width})
				{
					 $new_width = $params->{width};
					 $new_height = $current_height / ( $current_width / $new_width );
				}
				else
				{
					 $new_height = $params->{height};
					 $new_width = $current_width / ( $current_height / $new_height );
				}
				$object->Resize( width => $new_width, height => $new_height );
		  }
		  else
		  {
				if (!$params)
				{
					 $imrc = $object->$method();
				}
				elsif (ref $params eq "HASH")
				{
					 if ($method eq "Read"){
						  if (exists $params->{filename})
						  {
								#
								# only allow opening of files from pixenate working directory
								#
								$params->{filename} = $ENV{PIXENATE_WORKING_DIRECTORY} . $params->{filename};
						  }
					 }
					 $imrc = $object->$method(%$params);
				}
				else
				{
					 $imrc = $object->$method($params);
				}
		  }				
		  
		  die "$method failed: $imrc" if (ref $imrc eq "" && is_imagick_error($imrc));

		  Sxoop::PXN8::Debug::log("Imagick.pm> returncode=$imrc\n");
	 }
	 return $symbols->{"_"};

}
AddOperation('imagemagick', \&imagemagick);
1;
