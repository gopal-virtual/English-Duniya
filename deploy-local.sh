#!/bin/bash

#bash generate-lessondb.sh
#rsync -avzh ubuntu@cc-test.zaya.in:/home/ubuntu/prod_content/ell media/
#rm www/bundled/*
#export ANDROID_HOME=/home/kartik/android-sdk-linux/platform-tools


echo $ANDROID_HOME
BUILD_TYPE='local'
ENV='test'

BUILD_NAME="englishduniya-$ENV-non-bundled"
BUNDLED="Non-Bundled"
gulp --env=$ENV --app_type=$BUNDLED

ionic build android
cordova build --release android
jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk angryape


#VERSION="build-tools/23.0.1"
BUILD_PATH="builds/"

ARM_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-arm.apk"
rm $ARM_BUILD_NAME
$ANDROID_HOME/build-tools/23.0.1/zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk $ARM_BUILD_NAME
