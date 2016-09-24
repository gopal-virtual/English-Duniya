node bundleContent.js 3
gulp --env=prod
developer

#!/bin/bash
# pouchdb-server --port 5984 &

# sleep 2
# gulp
# node port.js
# rm $PWD/www/data/lessons*
# pouchdb-dump http://localhost:5984/lessonsGrade1 > $PWD/www/data/lessonsGrade1.db
# pouchdb-dump http://localhost:5984/lessonsGrade2 > $PWD/www/data/lessonsGrade2.db
# pouchdb-dump http://localhost:5984/lessonsGrade3 > $PWD/www/data/lessonsGrade3.db

rm $PWD/*.apk
ionic build android
# ionic build android --xwalk64bit
cordova build --release android
# cordova build --release android --xwalk64bit
#jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk angryape
jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk angryape
select VERSION in $ANDROID_HOME/build-tools/*;
do
#  $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk $PWD/angryape_x86.apk
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk $PWD/angryape_x86_64.apk
 $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk $PWD/angryape_armv7.apk
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk $PWD/angryape_armv64.apk
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk $PWD/angryape.apk
  break
done
kill -9 `ps aux | grep pouchdb-server | grep -v grep | awk '{print $2}'`
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
