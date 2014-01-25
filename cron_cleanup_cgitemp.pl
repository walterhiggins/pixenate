#!/usr/bin/perl

use strict;

my @cgitemp = glob ("/var/tmp/CGItemp*");

my $now = time;
my $diff = 60*60*8;


foreach (@cgitemp){
	 my @filestats = stat $_;
	 my $last_modified = $filestats[9];
	 if ($now - $last_modified > $diff){
		  unlink $_;
	 }
}
