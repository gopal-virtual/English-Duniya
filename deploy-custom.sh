#!/bin/bash

source /home/ubuntu/.bashrc
export ANDROID_HOME=/home/ubuntu/apps/android-sdk-linux
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/home/ubuntu/apps/android-sdk-linux/platform-tools:/home/ubuntu/apps/android-sdk-linux/tools:/opt/nodej/bin
export NODE_PATH=/opt/nodej/lib/node_modules
REPO_PATH=$WORKSPACE
HOST="builds.zaya.in"
BUILD_PLATFORM='android'

USERNAME='admin'
PASSWORD='admin-builds'
cd $REPO_PATH

bash generate-lessondb.sh

npm install
bower install

echo "build architecture-"$build_architecture
echo "content_type-"$content_type
echo "node_locked-"$node_locked
echo "selected_tag-"$selected_tag
echo "branch name-"$BRANCH_NAME


#Checkout to the selected tag
ssh-agent bash -lc "ssh-add $HOME/.ssh/zaya_mobile  && git checkout tags/$selected_tag"

echo "Starting content sync"
#rsync -avzh ubuntu@cc-test.zaya.in:/home/ubuntu//
#rm www/bundled/*

#echo "Branch name-"$BRANCH_NAME
#if [ "$BRANCH_NAME" = 'staging' ]; then
#BUILD_TYPE='test'
#fi
#if [ "$BRANCH_NAME" = 'master' ]; then
#BUILD_TYPE='production'
#ENV='prod'
#fi

ENV='dev'
echo "Env-"$ENV
BUILD_NUMBER=`echo $selected_tag |grep -o "#.*"|grep -o "[0-9].*"`
BUILD_ENV=`echo $selected_tag |grep -o ".*-"|grep -o "[^\-]*"`

echo $BUILD_NUMBER
echo "Initiating build process"
cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png $REPO_PATH/resources/android/drawable-xxdpi/icon.png
mkdir -p $REPO_PATH/resources/android/drawable-xxdpi
cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png $REPO_PATH/resources/android/drawable-xxdpi/icon.png
mkdir -p $REPO_PATH/resources/android/drawable-xxxdpi
cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png  $REPO_PATH/resources/android/drawable-xxxdpi/icon.png
mkdir -p  $REPO_PATH/resources/android/splash/
cp $REPO_PATH/resources/android/drawable-mdpi/screen.png $REPO_PATH/resources/android/splash/screen.png


BUILD_NAME="englishduniya-custom-$BUILD_NUMBER-$BUILD_ENV-$content_type-$build_architecture.apk"
#BUNDLED="Non-Bundled"
echo "build name "$BUILD_NAME
if [ "$content_type" = 'bundled' ]; then
i=all
fi
if [ "$content_type" = 'non-bundled' ]; then
i=3
fi


echo "Bundling Content for "$i" nodes"
#node bundleContent.js $i

#echo "Configuring Environment for "$BUILD_ENV" with nodes locked $node_locked"
echo "gulp --env=$BUILD_ENV --app_type=$content_type --app_version=0.2 --lock=$node_locked"
gulp --env=$BUILD_ENV --app_type=$content_type --app_version=0.2 --lock=$node_locked

echo "starting to build"
ionic build android
cordova build --release android
# cordova build --release android --xwalk64bit

if [ "$build_architecture" = 'x86' ]; then
  unsigned_build_name="android-x86_64-release-unsigned.apk"
fi
if [ "$build_architecture" = 'arm' ]; then
  unsigned_build_name="android-armv7-release-unsigned.apk"
fi
echo "Unsigned build "$unsigned_build_name
jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/$unsigned_build_name angryape

#jarsigner -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $REPO_PATH/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk angryape
#jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk angryape
VERSION="$ANDROID_HOME/build-tools/23.0.1"
BUILD_PATH="/tmp"
echo "$VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/$unsigned_build_name $BUILD_PATH/$BUILD_NAME"
$VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/$unsigned_build_name $BUILD_PATH/$BUILD_NAME

echo "--------------BUILD MADE--------------"
#echo $BUILD_NUMBER

#echo $BUILD_NAME
#X86_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-x86.apk"
#ARM_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-arm.apk"
#echo $X86_BUILD_NAME
#select VERSION in $ANDROID_HOME/build-tools/*;
#do
#echo "$BUILD_PATH/$BUILD_NAME-x86.apk"
#  $VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk $X86_BUILD_NAME
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk $PWD/angryape_x86_64.apk
  #$VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk $ARM_BUILD_NAME
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk $PWD/angryape_armv64.apk
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk $PWD/angryape.apk
#  break
#done


#echo "club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a x86 -f $X86_BUILD_NAME -u $USERNAME -p $PASSWORD -d $BUNDLED $BUILD_DESCRIPTION"
#/usr/local/bin/club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a x86 -f $X86_BUILD_NAME -u $USERNAME -p $PASSWORD -d "$BUNDLED $BUILD_DESCRIPTION"
#/usr/local/bin/club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a arm -f $ARM_BUILD_NAME -u $USERNAME -p $PASSWORD -d "$BUNDLED $BUILD_DESCRIPTION"


#kill -9 `ps aux | grep pouchdb-server | grep -v grep | awk '{print $2}'`
