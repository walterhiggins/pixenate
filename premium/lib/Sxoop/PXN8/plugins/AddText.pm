use strict;
use Sxoop::PXN8 ':all';

sub text 
{
  my ($image, $params) = @_;

  my $imrc = 0;

  if (exists $params->{left}){ $params->{x} = $params->{left}; }
  if (exists $params->{top}){	$params->{y} = $params->{top}; }
  #
  # as we're passing these into the Annotate method wholesale we don't want to pass any 
  # params that might cause problems.
  #
  delete $params->{top};
  delete $params->{left};
  delete $params->{operation};
  delete $params->{target};

  my %annotate_params = ();
  foreach (keys (%$params))
  {
		if ($_ =~ /^__/){
		}else{
			 $annotate_params{$_} = $params->{$_};
		}
  }

  my $px = $image->Get('page.x');
  my $py = $image->Get('page.y');
  $annotate_params{x} += $px;
  $annotate_params{y} += $py;


  $imrc = $image->Annotate(%annotate_params);

  die "AddText.pm> could not annotate because : $imrc" if (is_imagick_error($imrc));

  return $image;
}

AddOperation('add_text', \&text);

1;
