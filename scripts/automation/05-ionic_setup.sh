#ionic setup start
# Required variables
#	$keep_crosswalk
	
ionic state restore

if [ "$keep_crosswalk" = 'true' ]; then
  echo "keeping crosswalk"
  cp config_with_crosswalk.xml config.xml
  ionic plugin install cordova-plugin-crosswalk-webview
  echo "kept crosswalk"
fi
if [ "$keep_crosswalk" = 'false' ]; then
  echo "removing crosswalk"
  cp config_without_crosswalk.xml config.xml
  ionic plugin rm cordova-plugin-crosswalk-webview
  build_architecture="x86andarm"
  echo "removed crosswalk"
fi  

ionic platform rm android
ionic platform add android
rm platforms/android/build/outputs/apk/*

#ionic setup end