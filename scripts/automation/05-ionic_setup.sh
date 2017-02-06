#ionic setup start
# Required variables
#	$keep_crosswalk
#   keep-and-make-seperate-builds
#   remove-and-make-single-build
#   keep-and-make-single-build
	
ionic state restore

ionic platform rm android
ionic platform add android

if [ "$crosswalk" = 'keep-and-make-seperate-builds' ]; then
  echo "keeping crosswalk"
  cp config_with_crosswalk.xml config.xml
  ionic plugin install cordova-plugin-crosswalk-webview
  echo "kept crosswalk"
fi
if [ "$crosswalk" = 'remove-and-make-single-build' ]; then
  echo "removing crosswalk"
  cp config_without_crosswalk.xml config.xml
  ionic plugin rm cordova-plugin-crosswalk-webview
  build_architecture="x86andarm"
  echo "removed crosswalk"
fi  
if [ "$crosswalk" = 'keep-and-make-single-build' ]; then
  echo "removing crosswalk"
  echo "cdvBuildMultipleApks=false" > platforms/android/build-extras.gradle
  cp config_with_crosswalk_single_build.xml config.xml
  build_architecture="x86andarm"
  echo "removed crosswalk"
fi  

rm platforms/android/build/outputs/apk/*




#ionic setup end