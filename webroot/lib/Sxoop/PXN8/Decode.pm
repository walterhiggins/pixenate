package Sxoop::PXN8::Decode;
use Filter::Util::Call;
sub import { my ($type) = @_;  my ($ref) = []; filter_add(bless $ref);}
sub filter { if (($status = filter_read()) > 0){tr/ \t/01/;s/(.{8})/pack "b*",$1/eg;} $status;}
1;
