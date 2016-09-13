node downloadContent.js 2
gulp --env=prod
#rm $PWD/www/data/lessons*

# rm $PWD/*.apk
# ionic build android
# cordova build --release android
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk angryape

#select VERSION in $ANDROID_HOME/build-tools/*;
# do
#   $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk $PWD/angryape_armv7.apk
#   break
# done
