rm config.xml
cp config_with_crosswalk.xml config.xml
ionic plugin install cordova-plugin-crosswalk-webview
ionic platform rm android
ionic platform add android
rm platforms/android/build/outputs/apk/*
ionic build android
