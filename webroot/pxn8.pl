#!/usr/bin/perl 
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
# (c) Copyright Sxoop Technologies Ltd. 2005 - 2010
#
# All rights reserved.
#
# This script (with the aid of supporting modules)
# performs all of the image transformations
#
use strict;


use CGI ':standard';
use Data::Dumper;
#
# ^^^
# Leave these lines unchanged.
#

BEGIN {
    #
    # initialize the $timesCalled variable 
    #
    no strict 'vars';
    $timesCalled = 0;
    use strict 'vars';

}
# 
# try to load supporting perl modules
#
eval {
    require Sxoop::PXN8::Bootstrap;       # configuration
    Sxoop::PXN8::Bootstrap::configure();
    
    require Sxoop::PXN8 ;                 # core functionality
    require Sxoop::PXN8::Debug;           # debugging
    require JSON;                         # 3rd-party JSON lib
};

if ($@) 
{
    #
    # catch error
    #
    my $error = "Unable to load server-side pixenate perl modules: Change the [use lib ] statement in pxn8.pl";
    handle_error ( "$error : $@" );
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
        # catch error
        #
        my $error = "An error occured while trying to handle the request.";
        handle_error ( "$error : $@" );
    }
}

sub remove_old_images
{
    # ------------------------------------------
    # remove old files from the cache
    # delete cache files older than $cacheAge
    # ------------------------------------------
    my $absCacheDir = $ENV{PIXENATE_WORKING_DIRECTORY} . $ENV{PIXENATE_CACHE_DIR};
    opendir (DIR, $absCacheDir);
    my @all_cache_files = readdir(DIR);
    closedir(DIR);
#	 my @all_cache_files = glob ("$absCacheDir/*");

    Sxoop::PXN8::Debug::log("pxn8.pl> remove_old_image(): There are " . (scalar @all_cache_files) . " files in $absCacheDir.\n");
    
    my %map_filename_lastmod = ();
    
    foreach my $photo_file (@all_cache_files)
    {
        if (-e $photo_file){
            $map_filename_lastmod{$photo_file} = (stat $photo_file)[9];
        }
    }
    
    my @oldimages = ();
    my $time = time();
    my $diff = $ENV{PIXENATE_DELETE_TEMPS_AFTER};
    
    foreach (keys %map_filename_lastmod)
    {
        if ($time - $map_filename_lastmod{$_} > $diff)
        { 
            push @oldimages, $_;
        }
    }

    Sxoop::PXN8::Debug::log("pxn8.pl> remove_old_image(): There are " . (scalar @oldimages) . " old files.\n");

    my @deleted = ();
    my @cantdelete = ();

    foreach my $oldimage (@oldimages){
        my $deleted = unlink $oldimage;
        if ($deleted)
        {
            push @deleted, $oldimage;
        }
        else
        {
            #
            # photo might have already been deleted from different process
            #
            if (-e $oldimage){
                push @cantdelete, $oldimage;
            }
        }
    }
    if (@deleted){
	Sxoop::PXN8::Debug::log("pxn8.pl> removed the following files: @deleted \n" );
    }
    if (@cantdelete){
        Sxoop::PXN8::Debug::log("pxn8.pl> cant remove the following files: @cantdelete \n" );
    }
}
#
# handle_request gets called each time this cgi script is invoked. 
#
sub handle_request
{
    #
    # increment timesCalled
    #
    no strict 'vars';
    $timesCalled++;
    use strict 'vars';
    #
    # load all plugins
    # 
    my $plugin_dir = $ENV{PIXENATE_WORKING_DIRECTORY} . $ENV{PIXENATE_PLUGIN_DIR};
    push @INC, $plugin_dir;
    Sxoop::PXN8::Debug::log("PIXENATE WORKING DIRECTORY is " . $ENV{PIXENATE_WORKING_DIRECTORY} . "\n");
    Sxoop::PXN8::Debug::log("pxn8.pl> Plugin directory is $plugin_dir\n");
    
    opendir (DIR, $plugin_dir);
    my @plugin_files = readdir(DIR);
    closedir(DIR);
	 
    foreach (grep (/\.pm$/, @plugin_files))
    {
	Sxoop::PXN8::Debug::log ("pxn8.pl> Loading plugin $_\n");
        require $_;
    }
    
    if ($ENV{PIXENATE_DELETE_TEMPS_CGI}){
	#
	# remove old images from the cache
	#
	remove_old_images();
    }
    
    # ----------------------------------------
    # turn the script parameter into an array
    # ----------------------------------------
    my $query = new CGI();
    
    my $script = $query->param('script');
    
    #
    # wph 20090220 - if called from Java
    #
    
    if (scalar @ARGV > 0){
	$script = join '', <STDIN>;
    }
    
    Sxoop::PXN8::Debug::log ("pxn8.pl> SCRIPT PARAMETER VALUE : <<$script>>\n");
    
    my $callback = $query->param('callback');
    my $aref = 0;
    eval {
        $aref = JSON::jsonToObj($script);
    };
    if ($@){
	my $error_msg = "Cannot convert from JSON to object: $@";
	Sxoop::PXN8::Debug::log("pxn8.pl> ERROR: $error_msg\n");
	die $error_msg;
    }
    
    my @script = ();
    
    if ($aref)
    {
        @script = @$aref;
    }
    
    Sxoop::PXN8::Debug::log ("pxn8.pl> ======== START OF SCRIPT ========\n");
    
    Sxoop::PXN8::Debug::log(Dumper($aref));
    
    Sxoop::PXN8::Debug::log ("pxn8.pl> ========  END OF SCRIPT  ========\n");
    
    $| = 1;
    
    #
    # wph 20070813 : 'use Image::Magick' caused CGI.pm to fail with the following error...
    #
    # CGI.pm: Server closed socket during multipart read (client aborted?).
    #
    # I assume this was because pxn8.pl can have a 'application/x-www-form-urlencoded' enctype and so 
    # CGI.pm must read from STDIN. 
    # Unfortunately there seems to be a conflict with CGI.pm version 3.2.9 and Image::Magick 6.3.3
    # I suspect that a 'use Image::Magick' will do something to the STDIN stream which causes CGI.pm
    # to fail.
    # The workaround is to 'require Image::Magick' - this means the imagemagick module is loaded at
    # runtime - not compile-time as with 'use'.
    #

    require Image::Magick;
    
    my $im = new Image::Magick;
    my $im_version = $im->Get("version");
    my @im_formats = $im->QueryFormat();
    my @im_fonts = $im->QueryFont();
    
    my $status = "OK";
    my $compressed_path = "";
    my $uncompressed_path = "";
    my $width = -1;
    my $height = -1;
    my $errorMessage = "";
    my $opNumber = scalar @script;
    
    if (@script) 
    {
        #
        # catch dies
        #
        ($compressed_path, $uncompressed_path, $width, $height) = eval {
	    
            Sxoop::PXN8::script_to_image($aref);
	    
        };
        #
        # strip the PIXENATE_WORKING_DIRECTORY prefix for the web
        # 
        ($compressed_path) = $compressed_path =~ /^$ENV{PIXENATE_WORKING_DIRECTORY}(.+)/;
        ($uncompressed_path) = $uncompressed_path =~ /^$ENV{PIXENATE_WORKING_DIRECTORY}(.+)/;

    }
    else
    {
        $status = "ERROR";
        $errorMessage = "No script supplied";
    }
    if ($@)
    {
	
        Sxoop::PXN8::Debug::log("pxn8.pl> ERROR: $@\n" );
	
        $status = "ERROR";
        $errorMessage = "$@";
        #
        # remove all newlines from error message
        #
        $errorMessage =~ s/\n//g;
        $errorMessage =~ s/\r//g;
    }
    else
    {
        Sxoop::PXN8::Debug::log("pxn8.pl> Returning image $compressed_path\n");
    }
    $height = -1 if (!$height) ;
    $width = -1 if (!$width);
    
    #
    # setup output object before converting it to JSON
    #
    my $output =  {
        status => $status,
        errorMessage => $errorMessage,
        image => $compressed_path,
        uncompressed => $uncompressed_path,
        width => $width,
        height => $height,
        opNumber => $opNumber
    };
    no strict 'vars';
    $output->{footer} = $timesCalled;
    use strict 'vars';
    
    #
    # print debug information if no script is supplied 
    #
    if (!@script)
    {
	#
	# wph 20090119 - don't print debug output unless PIXENATE_DEBUG is true
	#
	if ($ENV{PIXENATE_DEBUG})
	{
	    
	    $output->{debug} = {imagemagick => {version => $im_version,
						formats => [@im_formats],   
						fonts => [@im_fonts] },
				environment => {}
	    };
	    foreach (keys %ENV){
		if ($_ =~ /^PIXENATE/){
		    $output->{debug}->{environment}->{$_} = $ENV{$_};
		}
	    }
# [% 
#   THIS IS A COMMENT WHICH WONT APPEAR IN BUILT CODE
#   -------------------------------------------------
#   $build_number is defined in the the insert_build_number() subroutine
#   in the makefile.pl script.
# %]  
	    $output->{debug}->{build} = "[% print $build_number; %]";  
	    $output->{debug}->{plugins} = [];
	    foreach (keys %Sxoop::PXN8::OPERATIONS){
		push (@{$output->{debug}->{plugins}}, $_);
	    }
        }
    }
    
    my $output_json = JSON::objToJson($output,{pretty=>1});
    
    print "Content-type: text/plain\n\n";
    if ($callback)
    {
	$output_json = "$callback($output_json);";
    }

    Sxoop::PXN8::Debug::log ("pxn8.pl> ======== START OF OUTPUT ========\n");
    Sxoop::PXN8::Debug::log ($output_json);
    Sxoop::PXN8::Debug::log ("\npxn8.pl> ======== END OF OUTPUT ========\n");
    
    print $output_json;
    
    
}



#
# The following subroutine will display all runtime errors as JSON so errors
# will go to the browser and can be displayed by the Pixenate client-side engine.
# 
sub handle_error 
{
    my ($error) = @_;
    #
    # remove all newlines from error message
    #
    $error =~ s/\n//g;    $error =~ s/\r//g;
    $error =~ s/"//g;     $error =~ s/'//g;

    print "Content-type: text/plain\n\n";
    print '{status: "ERROR",' . "\n";
    print ' errorMessage: "' . $error . '"}';

}

