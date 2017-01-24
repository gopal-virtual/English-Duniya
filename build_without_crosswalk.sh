rm config.xml
cp config_without_crosswalk.xml config.xml
ionic plugin rm cordova-plugin-crosswalk-webview
ionic platform rm android
ionic platform add android
rm platforms/android/build/outputs/apk/*
ionic build android
