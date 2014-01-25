#!/usr/bin/perl -I./webroot/lib
use strict;
use POSIX;
use Sxoop::TinyMake ':all';

my @suffixes = ('.css','.js','.htpl','.pm','.pl');


my @files = filetree("./");

my $total = 0;

foreach my $suffix (@suffixes){
	 my @matchingfiles = grep /$suffix$/, @files;
	 my @array = ();
	 foreach my $matchingfile (@matchingfiles){
		  open FILE, $matchingfile or die "cant open $matchingfile : $!\n";
		  my @contents = <FILE>;
		  printf ("%-80s%5d\n",$matchingfile, $#contents);
		  push @array, @contents;
		  close FILE;
	 }
	 $total += $#array;

	 print "\n$suffix : $#array\n------------\n";
}

print "total : $total\n";
