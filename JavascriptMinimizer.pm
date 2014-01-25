package JavascriptMinimizer;
use strict;
require Exporter;
our @ISA = ("Exporter");
our @EXPORT_OK = ("minimize");
our %EXPORT_TAGS = (all => \@EXPORT_OK);

sub minimize 
{
	 my ($content) = @_;

	 $content =~ s/\/\/.*//gm;
	 $content =~ s/(\s)\s+/$1/gm;
	 $content =~ s/[\n\r]+/\n/gm;
	 
	 $content =~ s/\s+=\s+/=/gm;
	 $content =~ s/\s+-\s+/-/gm;
	 $content =~ s/\s+\+\s+/\+/gm;

	 $content =~ s/\s+\*\s+/\*/gm;

	 $content =~ s/\s+==\s+/==/gm;
	 $content =~ s/\s+:\s+/:/gm;
	 
	 $content =~ s/\)\n{/){/gm;

	 
	 #$content =~ s/;\n}/;}/gm;
	 $content =~ s/\n}/}/gm;
	 
	 my $comment = qr{/\*[^*]*\*+([^/*][^*]*\*+)*/};
	 $content =~ s/$comment//gm;
	 
	 my @lines = grep /.+/, split "\n", $content;

	 $content = join "\n", @lines;
	 $content =~ s/;\n/;/gm;
	 $content =~ s/{\n/{/gm;
	 $content =~ s/,\n/,/gm;
	 $content =~ s/}\n/}/gm;
	 # replace trailing whitespace and newline with '' (blank)
	 $content =~ s/\s+\n//gm;

	 #
	 #my @x = split /;var/, $content;
	 #$content = join ";\nvar", @x;
	 #
	 return $content;
}
1;
