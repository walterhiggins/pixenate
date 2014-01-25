#!/usr/bin/perl -I./lib
#-------------------------------------------------------------------------------
#
# (c) Copyright 2005-2009 Sxoop Technlogies Ltd. All rights reserved.
#
# Save a photo to the client's local disk.
#
# parameters: 
#   [1] image - A relative filepath to the photo file.
#   [2] originalFilename - An optional name given to the file when it was first
#       uploaded.
#
#-------------------------------------------------------------------------------
use strict;
use CGI ':standard';
use POSIX;

#
# do this if there's an error 
#
sub graceful_exit 
{
	 print "Content-type: text/plain\n\n";
	 print @_;
}

sub handle_request
{
#
# new CGI object
#
	 my $query = CGI->new;
#

	 my $image = $query->param('image');

	 my $originalFilename = $query->param('originalFilename');
	 
# strip all but the filename from the original filepath
	 
	 $originalFilename = (reverse(split (/[\/\\]/, $originalFilename)))[0];
	 
# if there is no original filename then the file will be saved in 
# the form 20070920145302.jpg 
#
	 my $timeStr = strftime("%Y%m%d%H%M%S",gmtime());
	 
	 my $filename = "";
	 if ($originalFilename){
		  $filename = $originalFilename ;
	 }else {
		  $filename = "$timeStr" . ".jpg"; 
	 }
	 
# wph 20110202 Sanitize the filename (remove | chars) first...
	 $image =~ s/\|.*//;

# try to open the image
	 
	 if (!open(JPEG, $image)){
		  graceful_exit("Can't open file $image because $!");
		  return;
	 }

	 
# print attachment header
	 
	 print $query->header(-type=>'application/octet-stream', -attachment => "$filename");
	 
#
# put image file into BINARY mode and stream to stdout/client
#
	 my $buff = "";
	 binmode JPEG;
	 binmode STDOUT;
	 while (read(JPEG, $buff, 16384)){
		  print STDOUT $buff;
	 }
	 close JPEG;
#
# all done.
#
}

handle_request();


