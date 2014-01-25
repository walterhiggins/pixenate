#!/usr/bin/perl 

use lib "webroot/lib";
use lib "lib";
use strict;
use Sxoop::TinyMake ':all';

use File::Path;
use File::Copy;
use POSIX;
use JavascriptMinimizer ':all';
use Sxoop::TinyTemplate ':all';

my ($trg) = @ARGV;

my $directory = "./target";

if (! $trg ) {
    $trg = "package";
}
# targets:
#   clean
#   basic
#   premium
#   website
#   basic_tarball
#   premium_tarball
my $parentDir = $directory;

$directory .= "/pixenate";

# change // to /

$directory =~ s|\/\/|\/|g;

# ========================================================================
# SUBROUTINES
# ========================================================================
sub change_permissions 
{
    print "changing permissions...\n";
    my @files = filetree($directory);
    foreach (@files){
	if (-d $_){
	    #
	    # all directories are 
	    sh "chmod a+rx $_";
	}else {
	    if ($_ =~ /\.pl$/){
		sh "dos2unix $_";
		sh "chmod a+rx $_";
	    }else{
		#
		# baseline permission is r-wr--r--
		#
		sh "chmod a+rw $_";
	    }
	}
    }
    sh "chmod a+rwx $directory/";
    sh "chmod a+rwx $directory/cache";
    sh "chmod a+rwx $directory/log";
    sh "chmod a+rwx $directory/images/fonts";
    print "permissions changed.\n";
}

sub minify_javascript 
{
    print "\nminimizing file $sources[0]\n";
	 
    open JS, $sources[0] or die "Could not open input file $sources[0]: $!\n";
    my $content = join '', <JS>;
    close JS;
	 
    $content = minimize($content);
    
    open OUT, ">$target" or die "could not open output file $target: $!\n";
    print OUT "// generated on " . gmtime() . "\n$content"; 
    close OUT;
	 
}

sub merge_files
{
    print "combining files...\n";
    
    my @all_content = ();
    foreach (@sources)
    {
	if ($_ ne $target){
	    print "   $_\n";
	    open (FILE, $_) or die "Could not open file $_: $!";
	    push @all_content, <FILE>;
	    close FILE;
	}
    }
    print "...into a single file called $target\n";
    open (MERGED, ">$target") or die "Could not create $target: $!";
    print MERGED @all_content;
    close MERGED;
}


sub plain_old_copy {

    my ($directoryPath) = $target =~ /(.*)\//;
    mkpath $directoryPath;
    
    copy $sources[0], $target or die "Could not copy $sources[0] to $target because $!\n";
    
    print "copied $sources[0] to $target\n";
}

sub source_to_target {
    my (@files) = @_;
    
    my %result = map {
	
	my $source = $_;
	my $target = $source;
	($target) = $target =~ /(\/.*)/; # chop off first path.
	$target = "$directory/$target";
	$target => [$source];
		  
    } @files;
    return {%result};
}

sub template_targets 
{
    my ($langs, $suffixes, @templates) = @_;
    my $result = [];
    foreach my $template (@templates)
    {
	foreach my $suffix (@$suffixes)
	{
	    my $target = $template;
	    my ($sourceRoot) = $target =~ /(.*?)\//;
	    $target =~ s/$sourceRoot/$directory/;
	    $target =~ s/template$/$suffix/;
	    my ($temp) = $template =~ /(.*)\//;
	    my ($theme) = $template =~ /(.*)\//;
	    foreach my $lang (@$langs)
	    {
		if ($lang ne "en"){
		    $target =~ s/\.$suffix/_$lang\.$suffix/;
		}
		file $target => [$template, glob ("*.template")], sub {
		    process_template($suffix,$lang,$trg,$theme);
		};
		push @$result, $target;
	    }
	}
    }
    return $result;
}

sub insert_build_number
{
    my ($trg) = @_;
    
    my $build_number = strftime("%Y%m%d",gmtime());
    
    my $lib_dir = "lib";
    
    open CODE, "<$sources[0]";
    my $template = join '', <CODE>;
    close CODE;
    
    print "inserting build number into $sources[0]\n";
    my ($directoryPath) = $target =~ /(.*)\//;
    mkpath $directoryPath;
    
    open OUTPUT, ">$target" or die "Could not open output file $target because:  $!";
    my $parsed = parse ($template);
    select OUTPUT ;
    eval $parsed;
    
    die "ERROR WHILE Evaluating...\n\n$parsed\n\n $@" if ($@);
    
    close OUTPUT;
    select STDOUT;
}
sub process_template
{
    my ($suffix,$country,$trg,$theme) = @_;
    
    my $perlcode = include "$theme/index.template", {debug => 1};
    
    my $outputfile = "";
    ($theme) = $theme =~ /\/(.*)/; # chop off the first path from filepath
    if ($country eq "en"){
	$outputfile = "$directory/$theme/index" . ".$suffix";
    }else{
	$outputfile = "$directory/$theme/index" . "_$country.$suffix";
    }
    # make the path if not already present
    my ($directoryPath) = $outputfile =~ /(.*)\//;
    mkpath $directoryPath;
    
    print "Generating $outputfile\n";
    open OUTPUT, ">$outputfile" or die "Cant open file $outputfile because $!";
    select OUTPUT;
    
    my $pg = {language => $suffix,
	      country => $country,
	      target => $trg,
	      theme => $theme =~ /themes\/([a-z0-9]+)/,
	      directory => $directory };
    
    eval $perlcode;
    if ($@){
	my $error = "Error while parsing $theme/index.template $@\n\n";
	my @lines = split "\n",$perlcode;
	foreach (0..$#lines){
	    $error .= "$_: $lines[$_]\n";
	}
	die $error;
    }
    close OUTPUT;
    select STDOUT;
}

sub tarball {
    
    my $tarball_name = "pxn8-$trg";
    my $date_part = strftime("%Y%m%d",gmtime());
    $tarball_name .= "-full-";

    $tarball_name .= $date_part . ".tar.gz";
    
    my @result = sh "tar -cvzpf $parentDir/$tarball_name -C $parentDir pixenate/";
    print "$_" foreach (@result);
}

sub process_javascript
{
    print "generating $target [$trg edition]\n";
    
    my ($directoryPath) = $target =~ /(.*)\//;
    mkpath $directoryPath;
    
    my $perlcode = include $sources[0];

    open OUTPUT, ">$target" or die "cant open file $target because $!";
    select OUTPUT;
    
    my $pg = {target => $trg };
    $pg->{year} = (gmtime())[5] + 1900;
    
    eval $perlcode;
    if ($@){
	my $error = "Error while parsing $sources[0] $@\n\n";
	my @lines = split "\n",$perlcode;
	foreach (0..$#lines){
	    $error .= "$_: $lines[$_]\n";
	}
	die $error;
    }
    close OUTPUT;
    select STDOUT;
}

sub generate_apidoc
{
    print "Generating $target from @sources\n";
    
    my @contents = ();
    
    foreach (@sources){
	open FILE, $_ or die "Cant open $_: $!\n";
	push @contents, <FILE>;
	close FILE;
    }
    
    my $d = 0;
    
    my @markdown = grep {defined} map {
	my $r = ''; 
	if ($_ =~ /^\*{3}\//){
	    $d =0;
	} 
	if ($d){ 
	    $r = $_; 
	}else{ 
	    $r = undef;
	} 
	if ($_ =~ /\/\*{40}/){ 
	    $d = 1; 
	}  
	$r
    } @contents;
    
    open MARKDOWN, ">markdown.txt" or die "Cant open markdown.txt: $!\n";
    
    my @headings = ();
    my %links_headings = ();
    my @sections = ();
    my %sections_headings = ();
    
    my %links_sections = ();
    
    my $current_section = undef;
    
    foreach (0..$#markdown)
    {
	my $line = $markdown[$_];
	
	if ($line =~ /^===/)
	{
	    my $original = $markdown[$_ - 1];
	    chomp ($original);
	    my $heading = $original;
	    
	    $heading =~ s/ //g;
	    $heading =~ s/\(\)//g;
	    
	    my $section = 0;
	    if ($original =~ /^section: /i)
	    {
		$original =~ s/section: //gi; 
		
		$heading  =~ s/section://gi;
		
		$current_section = $original;
		
		push @sections, $current_section;
		$sections_headings{$current_section} = [];
		$links_sections{$current_section} = $heading;
		$section = 1;
	    }
	    
	    my $cssClass = "";
	    if ($section){
		$cssClass = "section";
	    }
	    $markdown[$_ -1] = "<h1 class=\"$cssClass\"><a name=\"$heading\">$original</a></h1>\n";
	    $markdown[$_] = "";
	    
	    if (!$section){
		push @{$sections_headings{$current_section}}, $heading;
	    }
	    push @headings, $heading;
	    $links_headings{$heading} = $original;
	    
	}
	
	if ($line =~ /^---/ && $markdown[$_ -1] =~ /Related/i)
	{
	    my $relatedLine = $markdown[$_ + 1];
	    my @related = split / /, $relatedLine;
	    my @links = map { my $orig = $_; $_ =~ s/\(\)//; "<a href=\"#$_\">$orig</a> "} @related;
	    $markdown[$_ +1] = join '', @links;
	}
    }
    print MARKDOWN @markdown;
    
    close MARKDOWN;
    
    my @markup = `perl Markdown.pl markdown.txt`;
    
    open (HTML, ">$target") or die "Cant open file $target: $!\n";
    
    print HTML <<"EOF";
<html>
<head>
<title>Pixenate API Reference</title>
<style type="text/css">
body { 
  font-family: sans-serif; 
  margin: 0px;
  color: black;
  background: white;
  padding: 2em 1em 2em 70px;
}
h1.section {page-break-before: always;}

h1 {background-color: lavender; padding: 4px 4px 4px 8px;  font-size: 150%; }
h2 { font-size: 120%; }
pre { padding-left: 24px; background-color: #f0f0f0; font-family: Courier; }
h1.section {background-color: lemonchiffon; border-bottom: 1px solid #ccc;} 
</style>
</head>
<body>
<h1>Pixenate&trade; API Reference</h1>

<h2>Table of Contents</h2>
EOF

    foreach (@sections){
		  print HTML "<h3><a href=\"#$links_sections{$_}\">$_</a></h3>\n";
		  print HTML "<ol>\n";
		  foreach my $heading (@{$sections_headings{$_}}){
				print HTML "<li><a href=\"#$heading\">$links_headings{$heading}</a></li>\n";
		  }
		  print HTML "</ol>\n";
    }

	 print HTML <<"EOF";
@markup

<h1>&copy; Copyright Sxoop Technologies 2006 - 2008. All Rights Reserved.</h1>
</body>
</html>

EOF

close HTML;
}

# ========================================================================
# FILE SETUP 
# ========================================================================


my @basic_files = 
    grep !/#$/,             # emacs artifacts
    grep !/\.flc$/,         # 
    grep !/~$/,             #
    grep !/\.svn/,          # subversion
    grep !/Thumbs\.db$/,    # 
    grep { ! -d $_ }        # ignore directories
      filetree "webroot";
      
my @basic_copyable = 
    grep !/PXN8.pm$/,       # PXN8.pm has it's own rule
    grep !/pxn8.pl$/,       # pxn8.pl has it's own rule
    grep !/upload.pl$/,     # upload.pl has it's own rule
    grep !/\.template$/,    # templates have their own rule
    grep !/pxn8_ajax.js$/,  # pxn8_ajax.js now needs preprocessing
    grep !/pxn8_save.js$/,  # pxn8_save.js now needs preprocessing
    @basic_files;


my @basic_templates = grep /\.template$/, @basic_files;

my @premium_files = 
    grep !/#$/,             # emacs artifacts
    grep !/\.flc$/,         # 
    grep !/~$/,             #
    grep !/\.svn/,          # subversion
    grep !/Thumbs\.db$/,    # 
    grep { ! -d $_ }        # ignore directories
      filetree "premium";

my @premium_plugins = glob ("premium/lib/Sxoop/PXN8/plugins/*.pm");

my @premium_copyable = 
    grep !/\.template$/,        # templates have their own rule
    grep !/plugins/,        # plugins now have their own rule
    @premium_files;
      
my @premium_templates = grep /\.template$/, @premium_files;


my $javascript = [
    "pxn8_core.js", "pxn8_toolbar.js", "pxn8_event.js",
    "pxn8_drag.js", "pxn8_resize.js", "pxn8_dom.js",
    "pxn8_tools.js", "pxn8_hires.js",
    "pxn8_strings_en.js", "pxn8_xhairs.js", "pxn8_preview.js",
    "pxn8_overlay.js", "pxn8_slide.js", "pxn8_colors.js", "pxn8_imagemagick.js",
    "pxn8_freehand.js"
    ];

my @jsSrc = map { "webroot/javascript/$_"} @$javascript;

my $combined_javascript = "$directory/javascript/pxn8_all.js";

my $minimized_javascript = "$directory/javascript/pxn8_all_minimized.js";

my $apidoc_sources = [
    "api_intro.markdown", 
    "webroot/javascript/pxn8_core.js", 
    "webroot/javascript/pxn8_tools.js",
    "webroot/javascript/pxn8_ajax.js",
    "webroot/javascript/pxn8_save.js",
    "webroot/javascript/pxn8_xhairs.js",
    "webroot/javascript/pxn8_preview.js",
    "webroot/javascript/pxn8_resize.js",
    "webroot/javascript/pxn8_dom.js",
    "webroot/javascript/pxn8_event.js",
    "webroot/javascript/pxn8_overlay.js",
    "webroot/javascript/pxn8_imagemagick.js",
    "webroot/javascript/pxn8_freehand.js",
    "operations.markdown",
    "elements.markdown"
    ];
      
# ========================================================================
# BUILD TARGETS
# ========================================================================

#
# top-level build targets 
#

file "basic" => [ 
    "basic_copyable", 
    "$directory/lib/Sxoop/PXN8.pm", 
    "basic_pages", 
    $minimized_javascript, 
    "$directory/pxn8.pl", 
    "$directory/upload.pl"];

file "premium" => [
    "basic",
    "premium_copyable",
    "premium_plugins",
    "premium_pages"];

file "clustered" => ["premium"];

file "tarball" => ["doc", "perms"], \&tarball;

file clean => sub { 
    print "Cleaning $directory\n"; 
    rmtree "./target"; 
};

# 
# supporting targets
#

group "basic_copyable" => source_to_target(@basic_copyable), \&plain_old_copy;

file "basic_pages" => template_targets(["en"],["php", "jsp", "asp", "pl"],@basic_templates);

#
#
file "$directory/lib/Sxoop/PXN8.pm" => ['webroot/lib/Sxoop/PXN8.pm'], \&plain_old_copy;

file $combined_javascript => [
    @jsSrc,
    "$directory/javascript/pxn8_ajax.js", 
    "$directory/javascript/pxn8_save.js"], \&merge_files;
 
file "$directory/__all.js" => [
    "$directory/javascript/pxn8_all_minimized.js", 
    map {s/webroot/$directory/; $_ } glob("webroot/themes/slick/*.js"), 
    map {s/webroot/$directory/; $_ } glob("webroot/themes/shared/javascript/*.js") ], \&merge_files;
      
file "$directory/__all.css" => [
    "$directory/styles/pxn8_tooltips.css",
    "$directory/styles/pxn8_fields.css",
    "$directory/styles/pxn8_core.css",
    "$directory/styles/pxn8_colors.css",
    "$directory/themes/slick/slick.css",], \&merge_files;
 
file $minimized_javascript => [$combined_javascript], \&minify_javascript;

group "premium_copyable" => source_to_target(@premium_copyable), \&plain_old_copy;

#
#

group "premium_plugins" => source_to_target(@premium_plugins), \&plain_old_copy;


file "premium_pages" => template_targets(["en"],["php", "jsp", "asp", "pl"],@premium_templates);


file "$parentDir/index.php" => ["$directory/themes/slick/index.php"], \&plain_old_copy;

file "$parentDir/index_es.php" => ["$directory/themes/slick/index_es.php"], \&plain_old_copy;

file "$parentDir/index.pl" => ["$directory/themes/slick/index.pl"], \&plain_old_copy;

file "$parentDir/index_es.pl" => ["$directory/themes/slick/index_es.pl"], \&plain_old_copy;

file "$directory/pxn8.pl" => ["webroot/pxn8.pl"], sub { insert_build_number($trg); };

file "$directory/upload.pl" => ["webroot/upload.pl"], sub { insert_build_number($trg); };

file "$directory/javascript/pxn8_ajax.js" => ["webroot/javascript/pxn8_ajax.js"], \&process_javascript;

file "$directory/javascript/pxn8_save.js" => ["webroot/javascript/pxn8_save.js"], \&process_javascript;

file "$directory/docs/API-Reference.html" => $apidoc_sources, \&generate_apidoc;

file "perms" => \&change_permissions;

file "doc" => ["$directory/docs/API-Reference.html"];
file "docs" => ["doc"];

file "package" => [ "premium", "tarball" ];
make ($trg);

