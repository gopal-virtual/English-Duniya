#!/bin/bash
source /home/ubuntu/.bashrc
export ANDROID_HOME=/home/ubuntu/apps/android-sdk-linux
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/home/ubuntu/apps/android-sdk-linux/platform-tools:/home/ubuntu/apps/android-sdk-linux/tools:/opt/nodej/bin
export NODE_PATH=/opt/nodej/lib/node_modules
REPO_PATH=$WORKSPACE
cd $REPO_PATH

npm install
bower install

echo "Starting content sync"
rsync -avzh ubuntu@eg-api.zaya.in:/home/ubuntu/classcloud/classcloud/media/ell media/

BRANCH_NAME=`git branch -a |grep \* |grep -o "[a-zA-Z0-9].*"`
echo "Branch name-"$BRANCH_NAME
if [ "$BRANCH_NAME" = 'development' ]; then
ENV='dev'
fi
if [ "$BRANCH_NAME" = 'master' ]; then
ENV='prod'
fi

echo $ENV
echo "Initiating build process"
cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png $REPO_PATH/resources/android/drawable-xxdpi/icon.png
mkdir -p $REPO_PATH/resources/android/drawable-xxdpi
cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png $REPO_PATH/resources/android/drawable-xxdpi/icon.png
mkdir -p $REPO_PATH/resources/android/drawable-xxxdpi
cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png  $REPO_PATH/resources/android/drawable-xxxdpi/icon.png
mkdir -p  $REPO_PATH/resources/android/splash/
cp $REPO_PATH/resources/android/drawable-mdpi/screen.png $REPO_PATH/resources/android/splash/screen.png

array=( 3 all )
for i in "${array[@]}"
do
echo "Bundling Content"
node bundleContent.js 3

echo "Configuring Environment for "$ENV
gulp --env=$ENV

echo "starting to build"
ionic build android
cordova build --release android
# cordova build --release android --xwalk64bit
jarsigner -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $REPO_PATH/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk angryape
#jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk angryape
VERSION="$ANDROID_HOME/build-tools/23.0.1"
BUILD_PATH="/tmp"
echo $BUILD_NUMBER
if [ $i -eq 3 ]; then
BUILD_NAME="englishduniya-$ENV-non-bundled-$BUILD_NUMBER"
fi

if [ "$i" == "all" ]; then
BUILD_NAME="englishduniya-$ENV-bundled-$BUILD_NUMBER"
fi
echo $BUILD_NAME
X86_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-x86.apk"
ARM_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-arm.apk"
echo $X86_BUILD_NAME
#select VERSION in $ANDROID_HOME/build-tools/*;
#do
echo "$BUILD_PATH/$BUILD_NAME-x86.apk"
  $VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk $X86_BUILD_NAME
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk $PWD/angryape_x86_64.apk
  # $VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk "$BUILD_PATH/$BUILD_NAME-armv7.apk"
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk $PWD/angryape_armv64.apk
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk $PWD/angryape.apk
#  break
#done

done


#kill -9 `ps aux | grep pouchdb-server | grep -v grep | awk '{print $2}'`
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



