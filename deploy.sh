#!/bin/bash
source /home/ubuntu/.bashrc
export ANDROID_HOME=/home/ubuntu/apps/android-sdk-linux
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/home/ubuntu/apps/android-sdk-linux/platform-tools:/home/ubuntu/apps/android-sdk-linux/tools:/opt/nodej/bin
export NODE_PATH=/opt/nodej/lib/node_modules
REPO_PATH=$WORKSPACE
HOST="builds.zaya.in"
BUILD_PLATFORM='android'
echo "Git variables values are "
BRANCH_NAME=`echo $GIT_BRANCH |grep -o "/.*"|grep -o "[A-Za-z0-9].*"`
COMMIT_MESSAGE=`git show -s --format=%B $GIT_COMMIT`
BUILD_DESCRIPTION=$COMMIT_MESSAGE
USERNAME='admin'
PASSWORD='admin-builds'
cd $REPO_PATH

npm install
bower install

echo "Starting content sync"
rsync -avzh ubuntu@eg-api.zaya.in:/home/ubuntu/classcloud/classcloud/media/ell media/

echo "Branch name-"$BRANCH_NAME
if [ "$BRANCH_NAME" = 'build' ]; then
BUILD_TYPE='test'
ENV='dev'
fi
if [ "$BRANCH_NAME" = 'master' ]; then
BUILD_TYPE='production'
ENV='prod'
fi

echo "Env-"$ENV
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
#ionic build android
#cordova build --release android
# cordova build --release android --xwalk64bit
#jarsigner -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $REPO_PATH/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk angryape
#jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk angryape
VERSION="$ANDROID_HOME/build-tools/23.0.1"
BUILD_PATH="/tmp"
echo $BUILD_NUMBER
if [ $i -eq 3 ]; then
BUILD_NAME="englishduniya-$ENV-non-bundled-$BUILD_NUMBER"
BUNDLED=" Non-Bundled "
fi

if [ "$i" == "all" ]; then
BUILD_NAME="englishduniya-$ENV-bundled-$BUILD_NUMBER"
BUNDLED=" Bundled "
fi
echo $BUILD_NAME
X86_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-x86.apk"
ARM_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-arm.apk"
echo $X86_BUILD_NAME
#select VERSION in $ANDROID_HOME/build-tools/*;
#do
echo "$BUILD_PATH/$BUILD_NAME-x86.apk"
#  $VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk $X86_BUILD_NAME
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk $PWD/angryape_x86_64.apk
  # $VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk "$BUILD_PATH/$BUILD_NAME-armv7.apk"
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk $PWD/angryape_armv64.apk
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk $PWD/angryape.apk
#  break
#done


echo "club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a x86 -f /tmp/englishduniya-dev-non-bundled-67-x86.apk -u $USERNAME -p $PASSWORD -d $BUNDLED \"$BUILD_DESCRIPTION\""
/usr/local/bin/club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a x86 -f /tmp/englishduniya-dev-non-bundled-67-x86.apk -u $USERNAME -p $PASSWORD -d \"$BUNDLED $BUILD_DESCRIPTION\"
done1


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
