package Sxoop::PXN8::Bootstrap;
use strict;
#
# EDIT THE FOLLOWING VALUES (on the right hand side of the = sign) to match your specific installation
#
sub configure 
{
	 if (not exists $ENV{PIXENATE_WORKING_DIRECTORY})
	 {
		  $ENV{ PIXENATE_WORKING_DIRECTORY  } = get_working_directory();
	 }

	 open CONFIG, "<$ENV{PIXENATE_WORKING_DIRECTORY}/config.ini";
	 #
	 # disable strict vars before evaluating config file
	 #
	 no strict 'vars';
	 my $config = eval join '', <CONFIG>;
	 use strict 'vars';

	 if ($@)
	 {
		  die "Bad pixenate configuration file - please fix the config.ini file: $@" ;
	 }
	 close CONFIG;

	 foreach (keys %$config)
	 {
		  $ENV{"PIXENATE_$_"} = $config->{$_};
	 }
}

# !!! DO NOT CHANGE BELOW THIS LINE !!!
# ------------------------------------------------------------------------
# 
# use the current webserver / script environment to 
# find out what the current working directory is
#
sub get_working_directory
{
	 my $script_filename = $0;
	 my $rwd = "";
	 if (exists $ENV{PATH_TRANSLATED})
	 {
		  $script_filename = $ENV{PATH_TRANSLATED}; # IIS
	 }
	 elsif (exists $ENV{SCRIPT_FILENAME})
	 {
		  $script_filename = $ENV{SCRIPT_FILENAME};	# Apache
	 }
	 elsif (exists $ENV{X_TOMCAT_SCRIPT_PATH})
	 {
		  $script_filename = $ENV{X_TOMCAT_SCRIPT_PATH}; # Tomcat 
	 }
	 #
	 # Real working directory is the path part of the filepath 
	 #
	 my ($rwd) = $script_filename =~ /(.+[\/\\])/;
    #
    # On some machines (perl 5.8.6 ?) $0 will be the script filename 
    # with no path prefix.
    #
    $rwd = "./" if ($rwd eq "");

	 #
	 # wph 20080221 For IIS - convert \\ to / as path separator
	 #
	 $rwd =~ s/\\/\//g; 
	 return $rwd;
}

1;
