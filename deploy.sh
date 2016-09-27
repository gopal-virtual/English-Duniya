#!/bin/bash
HOST="builds.zaya.in"
BUILD_PLATFORM='android'
echo "Git variables values are "
ENV=dev


node bundleContent.js all

gulp --env=$ENV --app_type=bundled --app_version=0.2

ionic build android
cordova build --release android
# cordova build --release android --xwalk64bit
#jarsigner -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $REPO_PATH/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk angryape
jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk angryape
# jarsigner -verbose -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk angryape
VERSION="$ANDROID_HOME/build-tools/23.0.1"
BUILD_PATH=""
#echo $BUILD_NUMBER
#if [ $i -eq 3 ]; then
#BUILD_NAME="englishduniya-$ENV-non-bundled-$BUILD_NUMBER"
#BUNDLED=" Non-Bundled "
#fi
#
#if [ "$i" == "all" ]; then
#BUILD_NAME="englishduniya-$ENV-bundled-$BUILD_NUMBER"
#BUNDLED=" Bundled "
#fi
BUILD_NAME="englishduniya-$ENV-bundled"

X86_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-x86.apk"
ARM_BUILD_NAME="$BUILD_PATH/$BUILD_NAME-arm.apk"
#select VERSION in $ANDROID_HOME/build-tools/*;
#do
echo "$BUILD_PATH/$BUILD_NAME-x86.apk"
#  $VERSION/zipalign -v 4 $REPO_PATH/platforms/android/build/outputs/apk/android-x86-release-unsigned.apk $X86_BUILD_NAME
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-x86_64-release-unsigned.apk $PWD/angryape_x86_64.apk
  $VERSION/zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk $ARM_BUILD_NAME
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-arm64-release-unsigned.apk $PWD/angryape_armv64.apk
  # $VERSION/zipalign -v 4 $PWD/platforms/android/build/outputs/apk/android-release-unsigned.apk $PWD/angryape.apk
#  break
#done


#echo "club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a x86 -f $X86_BUILD_NAME -u $USERNAME -p $PASSWORD -d $BUNDLED $BUILD_DESCRIPTION"
#/usr/local/bin/club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a x86 -f $X86_BUILD_NAME -u $USERNAME -p $PASSWORD -d "$BUNDLED $BUILD_DESCRIPTION"
#/usr/local/bin/club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a arm -f $ARM_BUILD_NAME -u $USERNAME -p $PASSWORD -d "$BUNDLED $BUILD_DESCRIPTION"
#done

#
#if [ $? -eq 0 ] ; then
#	echo "******************************** Starting to create tag and push ************************************"
#    TAG_NAME="$BUILD_TYPE-#$BUILD_NUMBER"
#    echo $TAG_NAME
#    TAG_MESSAGE="Tag created on branch $BRANCH_NAME for commit $GIT_COMMIT by jenkins job $BUILD_NUMBER. [Message] $COMMIT_MESSAGE "
#	echo $TAG_MESSAGE
#    git tag -fa "$TAG_NAME" -m "$TAG_MESSAGE"
#    ssh-agent bash -lc "ssh-add $HOME/.ssh/zaya_mobile  && git push origin --tags "
#fi

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
