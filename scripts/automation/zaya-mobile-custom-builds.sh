cat scripts/automation/01-common_setup.sh 		> scripts/automation/zaya-mobile-custom-builds-generated-script.sh 
# cat scripts/automation/02-media_sync.sh 		>> scripts/automation/zaya-mobile-custom-builds-generated-script.sh
# cat scripts/automation/03-bundle_content.sh 	>> scripts/automation/zaya-mobile-custom-builds-generated-script.sh
cat scripts/automation/04-run_gulp.sh		 	>> scripts/automation/zaya-mobile-custom-builds-generated-script.sh
cat scripts/automation/05-ionic_setup.sh 		>> scripts/automation/zaya-mobile-custom-builds-generated-script.sh
cat scripts/automation/restore-resources.sh 	>> scripts/automation/zaya-mobile-custom-builds-generated-script.sh 
# cat scripts/automation/07-make_release_build.sh >> scripts/automation/zaya-mobile-custom-builds-generated-script.sh
cat scripts/automation/06-make_debug_build.sh 	>> scripts/automation/zaya-mobile-custom-builds-generated-script.sh 
# cat scripts/automation/08-upload_build.sh 		>> scripts/automation/zaya-mobile-custom-builds-generated-script.sh

bash scripts/automation/zaya-mobile-custom-builds-generated-script.sh