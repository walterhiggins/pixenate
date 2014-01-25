package Sxoop::PXN8;
############################################################################
# Copyright (c) 2005-2010, Sxoop Technologies Ltd, All rights reserved.
############################################################################
use strict;
require Exporter;
use POSIX;
use LWP::Simple qw(!head);
use File::Copy;
use Sxoop::PXN8::Debug;

use Sxoop::TinyMake ':all';
use Digest::MD5;

# wph 20070813: see notes below...
#use Image::Magick;

use Data::Dumper;

our @ISA = ("Exporter");
our @EXPORT_OK = qw(%OPERATIONS AddOperation script_to_image is_imagick_error);
our %EXPORT_TAGS = (all => \@EXPORT_OK,);


sub timestring
{
    return strftime("%Y%m%d %H:%M:%S",gmtime);
}

our %OPERATIONS = ();

$OPERATIONS{cache} = sub {
	 my ($image,$params) = @_; 
	 # wph 20090401 - fetchFromFilesystem returns an error (Undefined Subroutine)
	 #return fetchFromFilesystem($image,{filepath=>$params->{image}});
	 # 
	 return $OPERATIONS{"filesystem"}->($image,{filepath=>$params->{image}});
};

sub is_imagick_error
{
    my ($imrc) = @_;
    my ($code) = $imrc =~ /([0-9]+)/;
    return $code >= 400;
}
sub AddOperation 
{
    my ($operationName, $operationFunc) = @_;
    $OPERATIONS{$operationName} = $operationFunc;
}
#
# sets any default __ properties where there are none present
#
sub normalize_script
{
    #
    # ensure the appropriate environment variables have been set
    #
    foreach ('PIXENATE_WORKING_DIRECTORY', 'PIXENATE_CACHE_DIR')
    {
	if (!exists $ENV{$_}){
	    die "The $_ environment variable has not been set. Please set them in the PXN8/Bootstrap.pm module.";
	}
    }
    
    my @script = @_;
    
    my $default_extension = '.jpg';
    my $default_quality = 85;
    my $default_uncompressed = 1;
    
    #
    # but use PIXENATE_JPEG_QUALITY environment setting if present
    #
    if (exists $ENV{PIXENATE_JPEG_QUALITY})
    {
	my $env_qual = $ENV{PIXENATE_JPEG_QUALITY};
	if ($env_qual > 0 && $env_qual < 101)
	{
	    $default_quality = $env_qual;
	}
    }
    
    foreach my $si (0..$#script)
    {
	my $statement = $script[$si];
	if (!exists $statement->{__extension})
	{
	    $statement->{__extension} = $default_extension;
	}
	if ($statement->{__extension} =~ /^\.jpg$/i)
	{
	    $statement->{__compression} = "JPEG";
	}
	else
	{
	    $statement->{__compression} = "None";
	}
	if (!exists $statement->{__quality})
	{
	    $statement->{__quality} = $default_quality;
	}
	if (!exists $statement->{__uncompressed})
	{
	    $statement->{__uncompressed} = $default_uncompressed;
	}
	
	my $compressed_filename = "";
	if ($statement->{operation} eq "cache")
	{
	    $compressed_filename = "$ENV{PIXENATE_WORKING_DIRECTORY}/$statement->{image}";
	    $statement->{__uncompressed} = 0;
	}
	else
	{
	    my $premd5 = join '', Dumper(@script[0..$si]);
	    my $md5sum = Digest::MD5::md5_hex($premd5);
	    $compressed_filename = 
		sprintf (
		    "%s/%s/photo_%d_%s%s",
		    $ENV{PIXENATE_WORKING_DIRECTORY},
		    $ENV{PIXENATE_CACHE_DIR},
		    $si,
		    $md5sum, 
		    $statement->{__extension}
		);
	}

	$compressed_filename =~ s/\/{2}/\//g;

	$statement->{__compressed_filename} = $compressed_filename;
	if ($statement->{__uncompressed})
	{
	    #
	    # only replace . with / in the filename part not the entire path 
	    #
	    
	    my $t = $compressed_filename;
	    
	    my @t = split '/', $compressed_filename;
	    
	    $t[-1] =~ s/\./_/g;

	    $t = join '/', @t;
	    
	    $statement->{__uncompressed_filename} = 
		$t
		. "working" 
		. $statement->{__extension};
	}
	else
	{
	    $statement->{__uncompressed_filename} = undef;
	}
	
    }
}
#
#
# Build an image from a PXN8 script
# A script is a list of image-editing statements.
#
sub script_to_image
{
    #
    # turn off tinymake's default verbosity
    #
    $Sxoop::TinyMake::VERBOSE = 0;
    
    my $IMAGE = 0;
    my ($aref) = @_;
    my @script = @$aref;
    
    #
    # fill in default values for each statement in the script
    #
    normalize_script(@script);
    
    #
    # for each image in the list
    # create a build rule to build the image
    # Each image in the list, has as a prerequisite, the previous image in the list
    # The first image in the list has no prerequisites.
    #
    for (my $i = $#script; $i >= 0; $i--) 
    {
	my $current_statement = $script[$i];
	
	my $previous_statement = undef;
	# 
	# the script is broken down line by line
	# each line creates a distinct image
	# the next line depends on the image from the previous line being present
	#
	my $dependencies = [];
	
	if ($i > 0)
	{
	    $previous_statement = $script[$i-1];
	    $dependencies = [$previous_statement->{__compressed_filename}];
	}
	
	my $operation = $current_statement->{operation};
	
	if (! exists $OPERATIONS{$operation} ) 
	{
	    die "PXN8.pm script_to_image > " 
		. "The '$operation' plugin is not available in this version of the software. " 
		. "Contact the site administrator about upgrading Pixenate.\n";
	}
	
	my $index = $i;
	
	Sxoop::PXN8::Debug::log("PXN8.pm> $current_statement->{operation} : file $current_statement->{__compressed_filename} => @$dependencies\n");
	
	#
	# create a dependency for the image and a BLOCK to call to build the image
	# please refer to perldoc TinyMake for more information on TinyMake
	#
	file $current_statement->{__compressed_filename} => $dependencies, sub 
	{
	    #
	    # if image has not already been created
	    #
	    my $imrc = 0;
	    Sxoop::PXN8::Debug::log("PXN8.pm> Performing operation $operation\n");
	    if ($IMAGE == 0)
	    {
		#
		# wph 20070813: don't use 'use Image::Magick' it breaks STDIN for CGI.pm
		#
		require Image::Magick;
		$IMAGE = Image::Magick->new();
		if (@sources)
		{
		    #
		    # wph 20080212 : Must use () around 'or' for precedence otherwise
		    # __uncompressed_filename is always used
		    #
		    my $previous_image =	(
			$previous_statement->{__uncompressed_filename}	
			or 
			$previous_statement->{__compressed_filename}
			);
		    
		    $imrc = $IMAGE->Read($previous_image);
		    if (is_imagick_error($imrc))
		    {
			die "PXN8.pm script_to_image > Could not read image file $previous_image: $! ($imrc)\n";
		    }
		}
	    }
	    #
	    # pass in the target to the operation
	    #
	    $current_statement->{target} = $target;
	    
	    my @params = (
		$IMAGE, 
		$current_statement, 
		{
		    script => \@script,
		    index  => $index	  
		}
		);
	    #
	    # Invoke the plugin to edit the image
	    #
	    eval {
		$IMAGE = $OPERATIONS{$operation}->(@params);
	    };
	    if ($@){
		Sxoop::PXN8::Debug::log("PXN8.pm> An exception occured while performing operation $operation: $@\n");
		die "'$operation' Plugin Exception: $@";
	    }
	    if ($IMAGE == 0 or $IMAGE == undef)
	    {
		Sxoop::PXN8::Debug::log("PXN8.pm> Operation '$operation' did not return a valid image\n");
		die "PXN8.pm script_to_image > Operation '$operation' did not return a valid image\n";
	    }
	    Sxoop::PXN8::Debug::log("PXN8.pm> Operation '$operation' complete.\n");
	    
	    #
	    # write the file that the browser will use for display
	    #
	    $imrc = $IMAGE->Write (
		filename    => $target, 
		compression => $current_statement->{__compression}, 
		quality	    => $current_statement->{__quality}
		);
	    
	    if (is_imagick_error($imrc))
	    {
		my $errorMessage = "ERROR: PXN8.pm Image::Magick->Write filename=> $target failed : $imrc.";
		if ($imrc =~ /permission denied/i)
		{
		    $errorMessage .= " Try 'chmod a+w pixenate/cache' to remedy the problem.";
		}
		die "$errorMessage\n";
	    }
	    
	    if ($current_statement->{__uncompressed})
	    {
		#
		# write the full non-compressed file
		#
		$imrc = $IMAGE->Write ( 
		    filename	=> $current_statement->{__uncompressed_filename},
		    compression => "None",
		    quality	=> 100
		    );
		
		if (is_imagick_error($imrc))
		{
		    die "ERROR: PXN8.pm script_to_image > Image::Magick->Write filename=> " 
			. $current_statement->{__uncompressed_filename} 
		    . " failed : $imrc\n";
		}
	    }
	};
    }
    #
    # Kick off the image-building process
    #
    my $final_statement = $script[$#script];
    
    my $file_to_build = $final_statement->{__compressed_filename};
    
    Sxoop::PXN8::Debug::log("PXN8.pm> about to build $file_to_build\n");
    
    make $file_to_build;
    
    Sxoop::PXN8::Debug::log("PXN8.pm> built $file_to_build\n");
    
    #
    # return both the low-quality and high-quality images
    #
    my @result = ();
    push @result, $final_statement->{__compressed_filename};
    push @result, $final_statement->{__uncompressed_filename};
    
    if ($IMAGE)
    {
	push @result, $IMAGE->Get("Width");
	push @result, $IMAGE->Get("Height");
    }
    return @result;
}

1;
