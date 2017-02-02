cat scripts/automation/01-common_setup.sh scripts/automation/02-media_sync.sh scripts/automation/03-bundle_content.sh scripts/automation/04-run_gulp.sh scripts/automation/05-ionic_setup.sh scripts/automation/06-make_debug_build.sh scripts/automation/07-make_release_build.sh scripts/automation/08-upload_build.sh > scripts/automation/zaya-mobile-custom-builds-generated-script.sh

# declare -a build_steps=('' '' '' '' '' '' '' '');
# echo $build_steps
# for step in $build_steps
# do
# echo $step
# done
bash scripts/automation/zaya-mobile-custom-builds-generated-script.sh