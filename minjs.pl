#!/usr/bin/perl
use strict;

use JavascriptMinimizer ':all';

open JS, "<$ARGV[0]";
my $content = join '', <JS>;
close JS;


$content = minimize($content);

open OUT, ">$ARGV[0]";
print OUT "//minimized!\n$content"; 
close OUT;
