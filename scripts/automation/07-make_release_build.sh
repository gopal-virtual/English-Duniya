# release build start
# required variables
#	$build_architecture
#	$content_type	

cordova build --release android

BUILD_NAME="englishduniya-custom-$environment-$content_type-crosswalk-$crosswalk"

if [ "$build_architecture" = 'x86' ]; then
  unsigned_build_name="android-x86-release-unsigned.apk"
  BUILD_NAME="$BUILD_NAME-$build_architecture"
fi
if [ "$build_architecture" = 'arm' ]; then
  unsigned_build_name="android-armv7-release-unsigned.apk"
  BUILD_NAME="$BUILD_NAME-$build_architecture"
fi
if [ "$build_architecture" = 'x86andarm' ]; then
  unsigned_build_name="android-release-unsigned.apk"
  BUILD_NAME="$BUILD_NAME-$build_architecture"
fi



jarsigner -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/$unsigned_build_name angryape

VERSION="$ANDROID_HOME/build-tools/23.0.1"
BUILD_PATH="/tmp"

release_build_name=$BUILD_PATH/$BUILD_NAME.apk


$VERSION/zipalign 4 $REPO_PATH/platforms/android/build/outputs/apk/$unsigned_build_name $release_build_name

release_build_upload_path=s3://zaya-builds/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$content_type.apk
release_build_upload_link=/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$content_type.apk

s3cmd put --acl-public $release_build_name $release_build_upload_path
# release build end