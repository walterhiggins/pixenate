use strict;
use Sxoop::PXN8 ':all';
use Sxoop::PXN8::Debug;
use CGI ':standard';
#
# Change History:
# --------------
# 20110531 wph add support for https
#
#
# The 'fetch' operation retrieves an image either from the Internet or from 
# the local (server) filesystem.
#
sub fetch 
{
	 my ($image, $params, $extraInfo) = @_;

	 Sxoop::PXN8::Debug::log("Fetch.pm> ----------------------\n");

	 foreach (keys %$params)
	 {
		  Sxoop::PXN8::Debug::log("Fetch.pm> $_ = $params->{$_}\n");
	 }
	 Sxoop::PXN8::Debug::log("Fetch.pm> ----------------------\n");

	 #
	 # the fetch operation can be passed an option 'source' which 
	 # is the name of a method to be use to retrieve the image.
	 # This is for cases where the image does not reside on the filesystem
	 # or is not available for web retrieval (due to security constraints -
	 #  it's possible that the client can retrieve an image but the server
	 #  cannot because the client is 'logged in' but the server isn't).
	 #
	 if (exists $params->{source})
	 {
		  my $fetchMethod = $params->{source};
		  return $OPERATIONS{$fetchMethod}->($image,$params,$extraInfo);
	 }

	 my $imgParam = $params->{url};
	 #
	 # image url doesn't need to be escaped if it's POSTed
	 #
	 #Sxoop::PXN8::Debug::log("before : $imgParam\n");
	 #$imgParam =~ s/%([0-9A-F]{2})/chr (hex $1)/eg;
	 #Sxoop::PXN8::Debug::log("after : $imgParam\n");

	 #
	 # try to open the explicit filepath
	 #
	 if (exists $params->{filepath})
	 {

		  return fetchFromFilesystem($image,$params);

	 }

	 my $imageURL = $imgParam;


	 Sxoop::PXN8::Debug::log("Fetch.pm> Attempting to fetch image $imgParam\n");

	 my ($protocol, $domain, $relative) = ('','','');

	 #
	 # try to open the URL
	 #
	 if ($imgParam =~ /^https?:\/\// or $imgParam =~ /^ftp:\/\//) 
	 {
		  
		  ($protocol,$domain,$relative) = $imgParam =~ /([^:]+:\/\/)([^\/]+)(.*)/;

		  Sxoop::PXN8::Debug::log("Fetch.pm> protocol=$protocol domain=$domain relative=$relative\n");
		  
		  if ($ENV{HTTP_HOST} ne $domain)
		  {
				#
				# if it's on a different web server..
				#
				Sxoop::PXN8::Debug::log("Fetch.pm> Attempting to fetch image from webserver: $imgParam\n");

				return fetchFromWeb($image, {url=>$imgParam, target=>$params->{target}});
		  }
		  else
		  {
				#
				# it's on the same server - try the filesystem first and if that
				# fails try fetchFromWeb...
				#
				$imgParam = $relative;

				Sxoop::PXN8::Debug::log("Fetch.pm> image is on same webserver $imgParam\n");

		  }
	 } 

	 if ($imgParam =~ /^\//) 
	 {
		  #
		  # file is relative to web root 
		  # adjust the filename accordingly
		  #
		  
		  # prepend the . so we don't look in / root dir
		  #
		  my $prefix = "";
		  foreach (grep /.+/, split '/', $params->{pxn8root})
		  {
				$prefix .= "../";
		  }
		  if ($prefix eq "")
		  {
				$prefix = ".";
		  }
		  $imgParam = $prefix . $imgParam;
	 }
	 
	 if (-e $imgParam) 
	 {
		  #
		  # The image is accessible via the filesystem
		  #
		  Sxoop::PXN8::Debug::log("Fetch.pm> Attempting to fetch image from filesystem: $imgParam\n");

		  return fetchFromFilesystem($image,{filepath=>$imgParam});
	 }
	 else
	 {
		  Sxoop::PXN8::Debug::log("Fetch.pm> Could not find $imgParam on local filesystem\n");

		  #
		  # wph 20090407 - try again this time prefixing the PIXENATE_WORKING_DIRECTORY (for IIS / mod_perl setups)
		  #
		  if ($imgParam !~ /^$ENV{PIXENATE_WORKING_DIRECTORY}/)
		  {
				$imgParam = $ENV{PIXENATE_WORKING_DIRECTORY} . $imgParam;

				if (-e $imgParam)
				{
					 #
					 # The image is accessible via the filesystem
					 #
					 Sxoop::PXN8::Debug::log("Fetch.pm> Attempting to fetch image from filesystem: $imgParam\n");
				
					 return fetchFromFilesystem($image,{filepath=>$imgParam});
				}
		  }

		  Sxoop::PXN8::Debug::log("Fetch.pm> Could not find $imgParam on local filesystem\n");

		  Sxoop::PXN8::Debug::log("Fetch.pm> Attempting to fetch image from same webserver: $imageURL\n");
		  
		  if ($imageURL =~ /^https?:\/\// or $imageURL =~ /^ftp:\/\//)
		  {
				#
				# it already has the protocol:domain prefix
				#
				return fetchFromWeb($image, {url => $imageURL, target => $params->{target}});
		  }
		  else
		  {
				#
				# It didn't have a protocol:domain prefix - append one 
				#
				my $webroot = url(-base => 1);
				
				Sxoop::PXN8::Debug::log("Fetch.pm> Prepending $webroot to $imageURL\n");

				return fetchFromWeb($image, {url => "$webroot/$imageURL", target => $params->{target}});
		  }
	 }
}

# 
# retrieve an image from the filesystem
#
sub fetchFromFilesystem 
{
	 my ($image,$params) = @_;

	 use File::Spec;
#	 use Cwd;
	 
#	 my $cwd = cwd();
	 #
	 # wph 20080207 Changed PXN8.pm so that all targets and deps are absolute paths !
	 # my $cwd = $ENV{PIXENATE_WORKING_DIRECTORY};

	 # 
	 # wph 20080207 Changed PXN8.pm so all targets are absolute paths !
	 #my $filepath = File::Spec->rel2abs($params->{filepath},$cwd);
	 
	 
	 my $filepath = $params->{filepath};
	 #
	 # wph 20080221 change // to /
	 #
	 $filepath =~ s|\/\/|\/|g;

	 # 
	 # if pixenate_working_directory hasn't already been prepended to the filepath, prepend it.
	 #
	 if ($filepath !~ /^$ENV{PIXENATE_WORKING_DIRECTORY}/)
	 {
		  $filepath = $ENV{PIXENATE_WORKING_DIRECTORY} . $filepath;
	 }
	 unless (-e $filepath){
		  die "Fetch.pm fetchFromFilesystem() > $filepath doesn't exist\n";
	 }
	 my $imrc = $image->Read($filepath);
	 
	 if (is_imagick_error($imrc))
	 { 
		  die "Fetch.pm fetchFromFilesystem() > Image::Magick->Read($filepath) returned [$imrc]\n";
	 }else{
		  #
		  # wph 20070130 : Flatten the image prior to writing to avoid problems using Animated GIFS.
		  # (Write() will create image-0 ... image-framelength for animated GIFS)
		  #
		  my $layers = scalar @$image;
		  if ($layers > 1){
				$image = $image->Flatten();
		  }
		  return $image;
	 }
}

#
# Get an image off the web and store it on the filesystem
#
sub fetchFromWeb 
{
	 my ($image, $params) = @_;
	 my $url = $params->{url};

	 my $file = $params->{target};

	 Sxoop::PXN8::Debug::log("Fetch.pm>fetchFromWeb> url=$url, file=$file\n");

	 #
	 # test that the directory is writeable !
	 # getstore returns a 500 if the request succeeded but the file can't be written.
	 # The most likely cause of a file write failure is directory permissions
	 #
	 my @filenameparts = split '/', $file;

	 my $directorypart = join '/', @filenameparts[0..$#filenameparts-1];

	 # wph 20080201
	 # WARNING: mod_perl2 - don't assume we've changed directory !
	 # 
	 # wph 20080207 
	 # Changed PXN8.pm so that all targets are absolute paths !
	 #
	 # $directorypart = "$ENV{PIXENATE_WORKING_DIRECTORY}$directorypart";

	 unless (-w $directorypart)
	 {
		  die "Fetch.pm fetchFromWeb() > Insufficient permissions on directory: $directorypart\n" ;
	 }
	 #
	 # wph 20080201
	 # WARNING: mod_perl2 - don't assume we've changed directory !
	 #
	 # wph 20080207 
	 # Changed PXN8.pm so that all targets are absolute paths !
	 #$file = "$ENV{PIXENATE_WORKING_DIRECTORY}$file";
	 #
	 # it's a URL
	 #
	 my $rc = LWP::Simple::getstore($url,$file);

	 if (-e $file)
	 {
		  return fetchFromFilesystem($image,{filepath=>$file});
	 }
	 else
	 {
		  die "Fetch.pm fetchFromWeb() > Could not retrieve image [$file] from the web. Remote server returned: $rc while trying to access [$url] ($!)\n";
		  return 0;
	 }
}
AddOperation('filesystem', \&fetchFromFilesystem);
AddOperation('web', \&fetchFromWeb);
AddOperation('fetch', \&fetch);
1;
