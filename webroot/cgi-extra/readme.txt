This folder contains additional non-core CGI scripts.

sanity_test.pl - use this to determine if you're CGI / Web server is
setup so that modules/packages in the 'lib' folder can be imported.

save_to_server.pl - This is a sample script that demonstrates how to
save an image permanently to the server in Perl.

pixenate_cleanup_cache.pl - this script should be run peridically in
the background (not via CGI) to remove old images from the
pixenate/cache directory.
