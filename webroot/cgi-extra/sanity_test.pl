#!/usr/bin/perl -I../lib
# ----------------------------------------------------------------------------
#
# (c) Copyright 2005-2009 SXOOP Technologies Ltd. All rights reserved.
#
# This CGI script verifies that Modules/Packages can be imported from the  
# lib directory. Use only in case of debugging problems importing modules 
# from lib directory.
# There may be problems using pxn8.pl with Plesk / Mod_Perl 2.0 in that
# mod_perl 2 is usually set up so that the current working directory will
# not be passed into the CGI script.
#
# ----------------------------------------------------------------------------
use strict;

BEGIN 
{
	 use lib "../lib";
}

eval 
{
	 require Sxoop::TinyMake ;
};

use Cwd;

print "Content-type: text/plain\n\n";

if ($@){
	 print "Sanity test FAILED";
	 print "Cannot import Perl Modules from directory: " . cwd();
}
else {
	 print "Sanity test PASSED";

}


