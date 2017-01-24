#!/bin/bash

#bash generate-lessondb.sh
#rsync -avzh ubuntu@cc-test.zaya.in:/home/ubuntu/prod_content/ell media/
#rm www/bundled/*

# export ANDROID_HOME=/opt/android-sdk-linux/


echo $ANDROID_HOME
BUILD_TYPE='local'
ENV='content'

BUILD_NAME="englishduniya-$ENV-non-bundled"
BUNDLED="Non-Bundled"
gulp --env=$ENV --app_type=$BUNDLED

ionic build android
cordova build --release android
jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk angryape


#VERSION="build-tools/23.0.1"
BUILD_PATH="builds"

ARM_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-arm.apk"
rm $ARM_BUILD_NAME
select VERSION in $ANDROID_HOME/build-tools/*;
do
echo "$BUILD_PATH/$BUILD_NAME-x86.apk"
  $VERSION/zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk $ARM_BUILD_NAME
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk $PWD/angryape_x86_64.apk
  # $VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk $ARM_BUILD_NAME
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk $PWD/angryape_armv64.apk
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk $PWD/angryape.apk
 break
done
