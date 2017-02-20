# cat scripts/automation/01-common_setup.sh scripts/automation/01.1-fos_builds_setup.sh scripts/automation/02-media_sync.sh scripts/automation/03-bundle_content.sh scripts/automation/04-run_gulp.sh scripts/automation/05-ionic_setup.sh scripts/automation/06-make_debug_build.sh scripts/automation/07-make_release_build.sh scripts/automation/08-upload_build.sh > scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/01-common_setup.sh 			>  scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/01.1-fos_builds_setup.sh 	>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/02-media_sync.sh			 	>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/03-bundle_content.sh			>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/04-run_gulp.sh				>> scripts/automation/fos-builds-generated-script.sh
printf '\n'crosswalk='keep-and-make-seperate-builds'>> scripts/automation/fos-builds-generated-script.sh 
printf '\n'build_architecture=arm'\n'				>> scripts/automation/fos-builds-generated-script.sh 
cat scripts/automation/05-ionic_setup.sh 			>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/07-make_release_build.sh 	>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/08-update_firebase.sh  		>> scripts/automation/fos-builds-generated-script.sh
printf '\n'crosswalk='keep-and-make-seperate-builds'>> scripts/automation/fos-builds-generated-script.sh 
printf '\n'build_architecture=x86'\n'				>> scripts/automation/fos-builds-generated-script.sh 
cat scripts/automation/05-ionic_setup.sh 			>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/07-make_release_build.sh 	>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/08-update_firebase.sh  		>> scripts/automation/fos-builds-generated-script.sh
printf '\n'crosswalk='keep-and-make-single-build'	>> scripts/automation/fos-builds-generated-script.sh 
printf '\n'build_architecture=x86andarm'\n'			>> scripts/automation/fos-builds-generated-script.sh 
cat scripts/automation/05-ionic_setup.sh 			>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/07-make_release_build.sh 	>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/08-update_firebase.sh  		>> scripts/automation/fos-builds-generated-script.sh
printf '\n'crosswalk='remove-and-make-single-build'	>> scripts/automation/fos-builds-generated-script.sh 
printf '\n'build_architecture=x86andarm'\n'			>> scripts/automation/fos-builds-generated-script.sh 
cat scripts/automation/05-ionic_setup.sh 			>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/07-make_release_build.sh 	>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/08-update_firebase.sh  		>> scripts/automation/fos-builds-generated-script.sh
printf '\n'crosswalk='keep-and-make-single-build'	>> scripts/automation/fos-builds-generated-script.sh 
printf '\n'build_architecture=x86andarm'\n'			>> scripts/automation/fos-builds-generated-script.sh 
printf '\n'content_type=bundled'\n'					>> scripts/automation/fos-builds-generated-script.sh 
cat scripts/automation/03-bundle_content.sh			>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/04-run_gulp.sh				>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/05-ionic_setup.sh 			>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/07-make_release_build.sh 	>> scripts/automation/fos-builds-generated-script.sh
cat scripts/automation/08-update_firebase.sh  		>> scripts/automation/fos-builds-generated-script.sh

bash scripts/automation/fos-builds-generated-script.sh
