#!/bin/bash
rm $PWD/*.apk
cordova build --release android
jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk angryape
select VERSION in $ANDROID_HOME/build-tools/*;
do
  $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk $PWD/angryape_x86.apk
  $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk $PWD/angryape_armv7.apk
  break
done
cat << "EOF"
  /$$$$$$                                                 /$$$$$$
 /$$__  $$                                               /$$__  $$
| $$  \ $$ /$$$$$$$   /$$$$$$   /$$$$$$  /$$   /$$      | $$  \ $$  /$$$$$$   /$$$$$$
| $$$$$$$$| $$__  $$ /$$__  $$ /$$__  $$| $$  | $$      | $$$$$$$$ /$$__  $$ /$$__  $$
| $$__  $$| $$  \ $$| $$  \ $$| $$  \__/| $$  | $$      | $$__  $$| $$  \ $$| $$$$$$$$
| $$  | $$| $$  | $$| $$  | $$| $$      | $$  | $$      | $$  | $$| $$  | $$| $$_____/
| $$  | $$| $$  | $$|  $$$$$$$| $$      |  $$$$$$$      | $$  | $$| $$$$$$$/|  $$$$$$$
|__/  |__/|__/  |__/ \____  $$|__/       \____  $$      |__/  |__/| $$____/  \_______/
                     /$$  \ $$           /$$  | $$                | $$
                    |  $$$$$$/          |  $$$$$$/                | $$
                     \______/            \______/                 |__/
EOF
