package Sxoop::PXN8::Debug;
############################################################################
# Copyright (c) 2005-2009, Sxoop Technologies Ltd, All rights reserved.
############################################################################
use strict;
use POSIX;
require Exporter;
our @ISA = ("Exporter");
our @EXPORT_OK = qw(log);

# number of calls after which output will be flushed.
# make this 1 if you are debugging a crash.

our $flush = 100;

our @output = ();

sub log {
	 #
	 # some versions of IIS don't handle STDERR which may result in
	 # incorrect headers being sent . To turn off debug
	 # set DEBUG => 0 in the config.ini file
	 #
	 push @output, strftime("%c",localtime());
	 push @output, " ", @_;
	 if ($#output > $flush){
		  flushlog();
	 }
}

sub flushlog 
{
	 if ($ENV{PIXENATE_DEBUG})
	 {
		  my @gmtime = gmtime();
		  
		  use File::Spec;
		  use Cwd;
		  
		  #my $cwd = cwd();
		  my $cwd = $ENV{PIXENATE_WORKING_DIRECTORY};

		  my $abs_logdir = File::Spec->rel2abs($ENV{PIXENATE_LOG_DIR},$cwd);

		  my $logfilename = sprintf("%s/pxn8-%d-%02d-%02d.log",
											 $abs_logdir,
											 1900+$gmtime[5],
											 1+$gmtime[4],
											 $gmtime[3]);

		  if (!open(LOGFILE, ">>$logfilename")){
				#
				# the log file could not be opened ...
				# ...why ?
				my $openErrorMessage = $!;
				my $dir_writable = -w $abs_logdir;
				my $file_exists = -e $logfilename;
				my $file_writable = -w $logfilename;
				
				#
				# wph 20070906 : IIS 5.1 forbids appending to the log file
				# [need to figure out why]
				#
				# IIS5.1 also redirect all STDERR output to STDOUT so must comment out
				# the following code...
				#
# 				warn "Debug.pm> [warning] Can't open logfile $logfilename ($openErrorMessage). ".
# 					  "Directory writable $dir_writable, ". 
# 					  "File exists: $file_exists, ".
# 					  "File writable: $file_writable";
				#
				# flush output - don't want to run out of memory
				#
				@output = ();
				return;
		  }
		  foreach (@output){
				print LOGFILE $_;
		  }
		  close LOGFILE;
		  
		  @output = ();
	 }
}

END {
	 flushlog();
}
1;

