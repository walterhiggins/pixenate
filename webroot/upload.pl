#!/usr/bin/perl -I./lib
#   
# ^^^
# The #! (hash-bang) line says which command to use to interpret this script.
# If perl is installed in a different location to the one above then change
# this line.
#

use lib "[% print $lib_dir; %]";
#
# ^^^
# This line says which directory to load supporting modules from. If you are
# running this script in a standard CGI environment (i.e. NOT mod_perl or perliis.dll)
# then you can leave this line unchanged.
# 
# If you ARE running this script in a non-CGI environment (either mod_perl or the 
# perliis.dll ISAPI filter on IIS) then you should change the value between quotes ("lib")
# to be the full path to the pixenate/lib directory. e.g.
#
# /usr/local/www/apache22/data/pixenate/lib 
# 
# or
#
# c:/inetpub/wwwroot/pixenate/lib
#

# !!! DO NOT CHANGE ANY CODE BELOW THIS LINE !!!
#-----------------------------------------------------------------------
#
# (c) Copyright 2005-2010 SXOOP Technologies Ltd. All rights reserved.
#
# upload.pl
# 
# Upload files to Pixenate's cache directory for editing
#
# ----------------------------------------------------------------------------
use strict;


use CGI ':standard';
use CGI::Carp qw(carpout fatalsToBrowser);
use Digest::MD5;
use File::Spec;

eval 
{
    require Sxoop::PXN8::Debug;
    require Sxoop::PXN8::Bootstrap;
    Sxoop::PXN8::Bootstrap::configure();
};
if ($@)
{
    my $error = "Unable to load server-side pixenate perl modules: Change the [use lib] statement in upload.pl";
    handle_error ("$error : $@");
}
else 
{
    #
    # try to handle the request
    #
    eval 
    {
	handle_request();
    };
    if ($@)
    {
	#
	# catch the error
	#
	handle_error($@);
    }
}
#
# 
#
sub handle_request 
{
    # ----------------------------
    # set file upload size limit
    # ----------------------------
    
    Sxoop::PXN8::Debug::log ("upload.pl> [info] setting CGI::POST_MAX to $ENV{PIXENATE_CGI_POST_MAX}\n");
    $CGI::POST_MAX = $ENV{PIXENATE_CGI_POST_MAX};
    
    Sxoop::PXN8::Debug::log ("upload.pl> [info] creating new CGI object\n");
    
    my $query = 0;
    
    eval 
    {
	$query = new CGI();
    };
    if ($@)
    {
	Sxoop::PXN8::Debug::log ("upload.pl> [error] $@\n");
	
	print STDOUT "Content-type: text/plain\n\n";
	print STDOUT "An error occurred while trying to upload the file...\n";
	print STDOUT "$@";
	return;
    }
    my $next_page = $query->param("next_page");
    my $mode = $query->param("mode");
	 
    if ($mode ne "api" && $next_page !~ /.+/)
    {
	Sxoop::PXN8::Debug::log ("upload.pl> [warn] next_page parameter is empty");
	print STDOUT "Content-type: text/plain\n\n";
	print STDOUT "next_page parameter is not present.\n";
	return;
	
    }
    my @param_names = $query->param();
    foreach(@param_names)
    {
	Sxoop::PXN8::Debug::log ("upload.pl> [param] $_");
    }
    
    my %passthru =  map { 
	my $v = $query->param($_); 
	$_ =~ s/^_//; $_=>$v;
    } grep /^_/, @param_names;
    
    Sxoop::PXN8::Debug::log ("upload.pl> [info] created new CGI object\n");
    
    my $upload_filehandle = $query->upload('filename');
    my $image_param_name = $query->param("image_param_name");
    my $hires_image_param_name = $query->param("hires_image_param_name");
    my $pxn8_root = $query->param("pxn8_root");
    my $max_dimension = $query->param("max_dim");
    my $filename = $query->param('filename');
    
    my $cgi_error = $query->cgi_error();
    Sxoop::PXN8::Debug::log ("upload.pl> [info] cgi_error = $cgi_error\n");
    
    if ($cgi_error =~ /^413/)
    {
	my $kbLimit = $ENV{PIXENATE_CGI_POST_MAX}/1024;
	
	print STDOUT "Content-type: text/html\n\n";
	print STDOUT "<html><body>\n";
	print STDOUT "You cannot upload images greater than $kbLimit Kilobytes in size!";
	print STDOUT "<br/>Click the browser's back button to continue...";
	print STDOUT "</body></html>";
	return;
    }
    elsif ($cgi_error =~ /.+/)
    {
	print STDOUT "Content-type: text/html\n\n";
	print STDOUT "<html><body>\n";
	print STDOUT "<p>Sorry - An error occurred while uploading $filename.</p> ";
	print STDOUT "<p>$cgi_error</p>\n";
	print STDOUT "</body></html>";
	return;
    }
    
    Sxoop::PXN8::Debug::log ("upload.pl> End-user uploaded file $filename\n");
    
#
# bug fix 20060721 save.pl should use original filename
# when saving image to disk.
#
	 my $original_filename = $filename; 
#
# wph 20070117: Fix IE bug on save-to-disk of uploaded images
# (IE won't save if the uploaded image has spaces in it's name)
#
    my @ofnParts = split /[\/\\]/, $original_filename;
    $original_filename = $ofnParts[$#ofnParts];
    $original_filename =~ s/\s/_/g;
    
	 
    my ($file_ext) = $filename =~ /(\.[a-zA-Z]+)$/;
    $filename = sprintf("photo_%s.jpg", Digest::MD5::md5_hex($filename . $query->remote_host() ));
    
    my $relative_filepath = "NO_FILE_UPLOADED";
#
# flag to indicate if image had to be resized
#
    my $resize = 0;
    
    if ($upload_filehandle)
    {
	
	#---------------------------------------
	# save the uploaded image to the server
	#---------------------------------------
		  
	$relative_filepath = "$ENV{PIXENATE_CACHE_DIR}/$filename";
	
# wph 20110202 sanitize the filename (remove | chars)
	$relative_filepath =~ s/\|.*//;

	my $absolute_filepath = File::Spec->rel2abs($relative_filepath,$ENV{PIXENATE_WORKING_DIRECTORY});
	
	Sxoop::PXN8::Debug::log ("upload.pl> [info] opening $absolute_filepath for output\n");
	
	if (! open UPLOADFILE, ">$absolute_filepath") 
	{
	    Sxoop::PXN8::Debug::log ("upload.pl> [error] cant open $absolute_filepath because $!\n");
	    die "Could not open file $absolute_filepath: $!\n";
	}
	
	binmode UPLOADFILE;
	while ( <$upload_filehandle> )
	{
	    print UPLOADFILE;
	}
	close UPLOADFILE;
	
	Sxoop::PXN8::Debug::log ("upload.pl> [info] saved to $absolute_filepath\n");
	
	#
	# wph 20070813 : 'use Image::Magick' caused CGI.pm to fail with the following error...
	#
	# CGI.pm: Server closed socket during multipart read (client aborted?).
	#
	# I assume this was because upload.pl is a mutlipart/form-data enctype and so 
	# CGI.pm must read from STDIN. 
	# Unfortunately there seems to be a conflict with CGI.pm version 3.2.9 and Image::Magick 6.3.3
	# I suspect that a 'use Image::Magick' will do something to the STDIN stream which causes CGI.pm
	# to fail.
	# The workaround is to 'require Image::Magick' - this means the imagemagick module is loaded at
	# runtime - not compile-time as with 'use'.
	#
	require Image::Magick;
	my $im = new Image::Magick();
	
	my $imres = $im->Read($absolute_filepath);
	if ($imres)
	{
	    my $error_msg = "Could not read file $absolute_filepath because $imres";
	    Sxoop::PXN8::Debug::log ("upload.pl> ERROR> $error_msg\n");
	    die $error_msg;
	}
	my $original_image = $im->Clone();
	
	if ($imres)
	{
	    # its not a valid image !!!
	    Sxoop::PXN8::Debug::log ("upload.pl> about to remove invalid uploaded image [$absolute_filepath]\n");
	    unlink $absolute_filepath or die "Could not remove invalid file $absolute_filepath: $!";
	    Sxoop::PXN8::Debug::log ("upload.pl> removed image\n");
	    die "Invalid file upload : File is not an image : $!\n";
	    
	}  
	if ($max_dimension)
	{
	    #
	    # must resize images that are too big to more manageable web dimensions
	    #
	    my $iw = $im->Get('width');
	    my $ih = $im->Get('height');
	    if ($iw > $ih)
	    {
		if ($iw > $max_dimension)
		{
		    $ih = $ih * ($max_dimension / $iw);
		    $iw = $max_dimension;
		    $resize = 1;
		}
	    }
	    else
	    {
		if ($ih > $max_dimension)
		{
		    $iw = $iw * ($max_dimension/ $ih);
		    $ih = $max_dimension;
		    $resize = 1;
		}
	    }
	    
	    if ($resize == 1)
	    {
		Sxoop::PXN8::Debug::log ("upload.pl> [info] resizing image to $iw x $ih\n");
		$im->Resize(width=>$iw, height=>$ih);
		
		my $absolute_small_filepath = File::Spec->rel2abs (
		    "$ENV{PIXENATE_CACHE_DIR}/small_$filename",
		    $ENV{PIXENATE_WORKING_DIRECTORY}
		    );
		$imres = $im->Write(filename=>$absolute_small_filepath);
	    }
	    else
	    {
		Sxoop::PXN8::Debug::log ("upload.pl> [info] max_dim of $max_dimension specified but resize not needed.\n");
		
	    }
	}
	$imres = $original_image->Write(filename=>$absolute_filepath);
	if ($imres)
	{
	    die "upload.pl> Image::Magick->Write(filename=>$absolute_filepath) failed: $imres\n";
	}
    }
    
    my $server_name = $query->server_name();
    my $server_port = $query->server_port();
    my $image_param_value = undef;
    
    my $newpage = "$next_page?";
    
    if ($resize)
    {
	$image_param_value = "$pxn8_root/$ENV{PIXENATE_CACHE_DIR}/small_$filename";
    }
    else
    {
	$image_param_value = "$pxn8_root/$relative_filepath";
    }
#
# wph 20070810 Add the servername prefix 
#
    # wph 20110531 allow for https case.
    my $protocol = "http";
    if ($ENV{HTTPS} eq "on"){
	$protocol = "https";
    }
    #
    # wph 20071205 // after the servername causes problems for some servers
    # (depends on rewrite rules on IIS)
    #
    if ($image_param_value =~ /^\//)
    {
	# begins with '/' character
	$image_param_value =  $protocol . "://$ENV{HTTP_HOST}" . $image_param_value;
    }
    else
    {
	$image_param_value = $protocol . "://$ENV{HTTP_HOST}/" . $image_param_value;
    }
    
    if ($mode eq "api")
    {
	print "Content-type: text/plain\n\n";
	print $image_param_value;
	return;
    }
    $newpage .= "$image_param_name=$image_param_value&";
    if ($hires_image_param_name)
    {
	$newpage .= "$hires_image_param_name=$pxn8_root/$relative_filepath&";
    }
    $newpage .= "originalFilename=$original_filename";
    
    foreach (keys %passthru)
    {
	$newpage .= "&$_=$passthru{$_}";
    }
    
    Sxoop::PXN8::Debug::log ("upload.pl> about to redirect to: [$newpage]\n");
    
#
# On IIS 5.1 The -nph flag must be set so that the redirect works properly.
# unfortunately, setting the nph flag breaks on Apache so I need to detect the 
# server software
#
    my $server_software = $ENV{SERVER_SOFTWARE};
#
# Don't use NPH headers on IIS6.0 
#
#	 my $use_nph = !(($server_software =~ /IIS\/6/i) or ($server_software =~ /Apache/i));
    
    #
    # wph 20090130 - turn off nph for all except IIS 5
    #
    my $use_nph = ($server_software =~ /IIS\/5/i);
    
    my $header = $query->redirect(-uri=>$newpage, -status=>302,	-nph=> $use_nph );
    
    print $header;
}

# 
# Display errors at the browser
#
sub handle_error
{
    my ($error) = @_;
    #
    # remove all newlines from error message
    #
    $error =~ s/\n//g;    $error =~ s/\r//g;
    $error =~ s/"//g;	  $error =~ s/'//g;
    
    print "Content-type: text/plain\n\n";
    print "An error occurred while trying to upload the photo.\n";
    print "$error";
    
}
