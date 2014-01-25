#!/usr/bin/perl
use strict;
#
# Change the following values to suit your own installation
# 

# The following value should be an absolute path to where the pixenate directory is located
# e.g. 
# /usr/local/www/htdocs/pixenate/
# or
# c:/inetpub/wwwroot/pixenate/
#
$ENV{PIXENATE_WORKING_DIRECTORY} = "../";

# Directory (relative to pixenate_working_directory where temp files are stored.
#
$ENV{PIXENATE_CACHE_DIR} = "cache";

#
# delete files older than 4 hours
#
$ENV{PIXENATE_DELETE_TEMPS_AFTER} = 60 * 60 * 4; 

remove_old_images();

sub remove_old_images
{
    # ------------------------------------------
    # remove old files from the cache
    # delete cache files older than $cacheAge
    # ------------------------------------------
	 my $absCacheDir = $ENV{PIXENATE_WORKING_DIRECTORY} . $ENV{PIXENATE_CACHE_DIR};
	 my @all_cache_files = glob ("$absCacheDir/*");

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

    my @deleted = ();

    foreach my $oldimage (@oldimages)
	 {
        my $deleted = unlink $oldimage;
        if ($deleted)
        {
            push @deleted, $oldimage;
        }
    }
}
