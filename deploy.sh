#!/bin/bash
rm $PWD/angryape.apk
cordova build --release android
jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk angryape
select VERSION in $ANDROID_HOME/build-tools/*;
do
  $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk $PWD/angryape.apk
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
