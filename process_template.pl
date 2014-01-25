#!/usr/bin/perl -I./webroot/lib
#-----------------------------------------------------------------------
#
# (c) Copyright SXOOP Technology 2005
#
# All rights reserved.
#
#-----------------------------------------------------------------------

use strict;
use Sxoop::PerlTagsBasic;
my $processor = new Sxoop::PerlTagsBasic();
my @output = ();

if (scalar @ARGV > 1){
  $processor->{language} = $ARGV[1];
  $processor->{target} = $ARGV[2];
  $processor->{directory} = $ARGV[3];
}

$processor->process(filename=>$ARGV[0],
						  output=>\@output);

print @output;
