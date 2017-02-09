# Common setup start

REPO_PATH=$WORKSPACE
echo REPO_PATH $REPO_PATH
cd $REPO_PATH
HOST="builds.zaya.in"
BUILD_PLATFORM='android'
USERNAME='admin'
PASSWORD='admin-builds'

rm -f /tmp/*.apk

BASE_MEDIA_DIR="/cimedia/$JOB_NAME"
MEDIA_SOURCE="$BASE_MEDIA_DIR/$content_environment"

echo "MEDIA SOURCE "$MEDIA_SOURCE
npm install
bower install



# Common setup end


# configure icons/splashes start

# cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png $REPO_PATH/resources/android/drawable-xxdpi/icon.png
# mkdir -p $REPO_PATH/resources/android/drawable-xxdpi
# cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png $REPO_PATH/resources/android/drawable-xxdpi/icon.png
# mkdir -p $REPO_PATH/resources/android/drawable-xxxdpi
# cp $REPO_PATH/resources/android/drawable-xxhdpi/icon.png  $REPO_PATH/resources/android/drawable-xxxdpi/icon.png
# mkdir -p  $REPO_PATH/resources/android/splash/
# cp $REPO_PATH/resources/android/drawable-mdpi/screen.png $REPO_PATH/resources/android/splash/screen.png

# configure icons/splashes end#vars for step 2
content_environment=production

#vars for step 3
content_type=non-bundled
lessonsdb=http://ed-couch.zaya.in/lessonsdb
diagnosis_translationsdb=http://ed-couch.zaya.in/diagnosis_translations

#vars for step 4

environment=production 
is_bundled=false
node_locked=true
languages=hi

#vars for step 5
crosswalk=keep-and-make-single-build

#vars for step 7
build_architecture=arm


echo Campaign name $campaign_name
echo Campaign owner name $campaign_owner_name
crosswalk=keep-and-make-seperate-builds
build_architecture=arm
#ionic setup start
# Required variables
#	$keep_crosswalk
#   keep-and-make-seperate-builds
#   remove-and-make-single-build
#   keep-and-make-single-build
	
ionic state restore

ionic platform rm android
ionic platform add android

echo crosswalk is $crosswalk

if [ "$crosswalk" = 'keep-and-make-seperate-builds' ]; then
  echo "keeping crosswalk"
  cp config_with_crosswalk.xml config.xml
  ionic plugin install cordova-plugin-crosswalk-webview
  crosswalk_status="with_crosswalk"
  echo "kept crosswalk"
fi
if [ "$crosswalk" = 'remove-and-make-single-build' ]; then
  echo "removing crosswalk"
  cp config_without_crosswalk.xml config.xml
  ionic plugin rm cordova-plugin-crosswalk-webview
  build_architecture="x86andarm"
  crosswalk_status="without_crosswalk"
  echo "removed crosswalk"
fi  
if [ "$crosswalk" = 'keep-and-make-single-build' ]; then
  echo "removing crosswalk"
  echo "cdvBuildMultipleApks=false" > platforms/android/build-extras.gradle
  cp config_with_crosswalk_single_build.xml config.xml
  build_architecture="x86andarm"
  crosswalk_status="with_crosswalk"
  echo "removed crosswalk"
fi  

rm platforms/android/build/outputs/apk/*




#ionic setup end# release build start
# required variables
#	$build_architecture
#	$content_type	

rm /tmp/$JOB_NAME/*
cordova build --release android

BUILD_NAME="englishduniya-custom-$environment-$content_type-$crosswalk_status"

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
BUILD_PATH="/tmp/$JOB_NAME"

release_build_name=$BUILD_PATH/$BUILD_NAME.apk

echo "--------------"
echo build_architecture $build_architecture
echo crosswalk_status $crosswalk_status
echo crosswalk $crosswalk
echo crosswalk $crosswalk
echo unsigned_build_name $unsigned_build_name
echo BUILD_NAME $BUILD_NAME
echo release_build_name $release_build_name

$VERSION/zipalign 4 $REPO_PATH/platforms/android/build/outputs/apk/$unsigned_build_name $release_build_name

release_build_upload_path=s3://zaya-builds/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$crosswalk_status-$content_type.apk
release_build_upload_link=/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$crosswalk_status-$content_type.apk

s3cmd put --acl-public $release_build_name $release_build_upload_path

# release build endecho Update Firebase --project fos-app-ed2c2 database:update /$campaign_owner_name/campaigns/$campaign_name/ -d {\"status\":\"available\"\,\"$build_architecture-$crosswalk_status\":\"$release_build_upload_link\"}  --token 1/0fNl3uwDYBPhXJMHL9Oa-WLjS4lZxMYs5urCJdKKjm0 -y
firebase --project fos-app-ed2c2 database:update /$campaign_owner_name/campaigns/$campaign_name/ -d {\"status\":\"available\"\,\"$build_architecture-$crosswalk_status\":\"$release_build_upload_link\"}  --token 1/0fNl3uwDYBPhXJMHL9Oa-WLjS4lZxMYs5urCJdKKjm0 -y
echo Done update Firebase
crosswalk=keep-and-make-seperate-builds
build_architecture=x86
#ionic setup start
# Required variables
#	$keep_crosswalk
#   keep-and-make-seperate-builds
#   remove-and-make-single-build
#   keep-and-make-single-build
	
ionic state restore

ionic platform rm android
ionic platform add android

echo crosswalk is $crosswalk

if [ "$crosswalk" = 'keep-and-make-seperate-builds' ]; then
  echo "keeping crosswalk"
  cp config_with_crosswalk.xml config.xml
  ionic plugin install cordova-plugin-crosswalk-webview
  crosswalk_status="with_crosswalk"
  echo "kept crosswalk"
fi
if [ "$crosswalk" = 'remove-and-make-single-build' ]; then
  echo "removing crosswalk"
  cp config_without_crosswalk.xml config.xml
  ionic plugin rm cordova-plugin-crosswalk-webview
  build_architecture="x86andarm"
  crosswalk_status="without_crosswalk"
  echo "removed crosswalk"
fi  
if [ "$crosswalk" = 'keep-and-make-single-build' ]; then
  echo "removing crosswalk"
  echo "cdvBuildMultipleApks=false" > platforms/android/build-extras.gradle
  cp config_with_crosswalk_single_build.xml config.xml
  build_architecture="x86andarm"
  crosswalk_status="with_crosswalk"
  echo "removed crosswalk"
fi  

rm platforms/android/build/outputs/apk/*




#ionic setup end# release build start
# required variables
#	$build_architecture
#	$content_type	

rm /tmp/$JOB_NAME/*
cordova build --release android

BUILD_NAME="englishduniya-custom-$environment-$content_type-$crosswalk_status"

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
BUILD_PATH="/tmp/$JOB_NAME"

release_build_name=$BUILD_PATH/$BUILD_NAME.apk

echo "--------------"
echo build_architecture $build_architecture
echo crosswalk_status $crosswalk_status
echo crosswalk $crosswalk
echo crosswalk $crosswalk
echo unsigned_build_name $unsigned_build_name
echo BUILD_NAME $BUILD_NAME
echo release_build_name $release_build_name

$VERSION/zipalign 4 $REPO_PATH/platforms/android/build/outputs/apk/$unsigned_build_name $release_build_name

release_build_upload_path=s3://zaya-builds/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$crosswalk_status-$content_type.apk
release_build_upload_link=/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$crosswalk_status-$content_type.apk

s3cmd put --acl-public $release_build_name $release_build_upload_path

# release build endecho Update Firebase --project fos-app-ed2c2 database:update /$campaign_owner_name/campaigns/$campaign_name/ -d {\"status\":\"available\"\,\"$build_architecture-$crosswalk_status\":\"$release_build_upload_link\"}  --token 1/0fNl3uwDYBPhXJMHL9Oa-WLjS4lZxMYs5urCJdKKjm0 -y
firebase --project fos-app-ed2c2 database:update /$campaign_owner_name/campaigns/$campaign_name/ -d {\"status\":\"available\"\,\"$build_architecture-$crosswalk_status\":\"$release_build_upload_link\"}  --token 1/0fNl3uwDYBPhXJMHL9Oa-WLjS4lZxMYs5urCJdKKjm0 -y
echo Done update Firebase
crosswalk=keep-and-make-single-build
build_architecture=x86andarm
#ionic setup start
# Required variables
#	$keep_crosswalk
#   keep-and-make-seperate-builds
#   remove-and-make-single-build
#   keep-and-make-single-build
	
ionic state restore

ionic platform rm android
ionic platform add android

echo crosswalk is $crosswalk

if [ "$crosswalk" = 'keep-and-make-seperate-builds' ]; then
  echo "keeping crosswalk"
  cp config_with_crosswalk.xml config.xml
  ionic plugin install cordova-plugin-crosswalk-webview
  crosswalk_status="with_crosswalk"
  echo "kept crosswalk"
fi
if [ "$crosswalk" = 'remove-and-make-single-build' ]; then
  echo "removing crosswalk"
  cp config_without_crosswalk.xml config.xml
  ionic plugin rm cordova-plugin-crosswalk-webview
  build_architecture="x86andarm"
  crosswalk_status="without_crosswalk"
  echo "removed crosswalk"
fi  
if [ "$crosswalk" = 'keep-and-make-single-build' ]; then
  echo "removing crosswalk"
  echo "cdvBuildMultipleApks=false" > platforms/android/build-extras.gradle
  cp config_with_crosswalk_single_build.xml config.xml
  build_architecture="x86andarm"
  crosswalk_status="with_crosswalk"
  echo "removed crosswalk"
fi  

rm platforms/android/build/outputs/apk/*




#ionic setup end# release build start
# required variables
#	$build_architecture
#	$content_type	

rm /tmp/$JOB_NAME/*
cordova build --release android

BUILD_NAME="englishduniya-custom-$environment-$content_type-$crosswalk_status"

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
BUILD_PATH="/tmp/$JOB_NAME"

release_build_name=$BUILD_PATH/$BUILD_NAME.apk

echo "--------------"
echo build_architecture $build_architecture
echo crosswalk_status $crosswalk_status
echo crosswalk $crosswalk
echo crosswalk $crosswalk
echo unsigned_build_name $unsigned_build_name
echo BUILD_NAME $BUILD_NAME
echo release_build_name $release_build_name

$VERSION/zipalign 4 $REPO_PATH/platforms/android/build/outputs/apk/$unsigned_build_name $release_build_name

release_build_upload_path=s3://zaya-builds/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$crosswalk_status-$content_type.apk
release_build_upload_link=/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$crosswalk_status-$content_type.apk

s3cmd put --acl-public $release_build_name $release_build_upload_path

# release build endecho Update Firebase --project fos-app-ed2c2 database:update /$campaign_owner_name/campaigns/$campaign_name/ -d {\"status\":\"available\"\,\"$build_architecture-$crosswalk_status\":\"$release_build_upload_link\"}  --token 1/0fNl3uwDYBPhXJMHL9Oa-WLjS4lZxMYs5urCJdKKjm0 -y
firebase --project fos-app-ed2c2 database:update /$campaign_owner_name/campaigns/$campaign_name/ -d {\"status\":\"available\"\,\"$build_architecture-$crosswalk_status\":\"$release_build_upload_link\"}  --token 1/0fNl3uwDYBPhXJMHL9Oa-WLjS4lZxMYs5urCJdKKjm0 -y
echo Done update Firebase
crosswalk=remove-and-make-single-build
build_architecture=x86andarm
#ionic setup start
# Required variables
#	$keep_crosswalk
#   keep-and-make-seperate-builds
#   remove-and-make-single-build
#   keep-and-make-single-build
	
ionic state restore

ionic platform rm android
ionic platform add android

echo crosswalk is $crosswalk

if [ "$crosswalk" = 'keep-and-make-seperate-builds' ]; then
  echo "keeping crosswalk"
  cp config_with_crosswalk.xml config.xml
  ionic plugin install cordova-plugin-crosswalk-webview
  crosswalk_status="with_crosswalk"
  echo "kept crosswalk"
fi
if [ "$crosswalk" = 'remove-and-make-single-build' ]; then
  echo "removing crosswalk"
  cp config_without_crosswalk.xml config.xml
  ionic plugin rm cordova-plugin-crosswalk-webview
  build_architecture="x86andarm"
  crosswalk_status="without_crosswalk"
  echo "removed crosswalk"
fi  
if [ "$crosswalk" = 'keep-and-make-single-build' ]; then
  echo "removing crosswalk"
  echo "cdvBuildMultipleApks=false" > platforms/android/build-extras.gradle
  cp config_with_crosswalk_single_build.xml config.xml
  build_architecture="x86andarm"
  crosswalk_status="with_crosswalk"
  echo "removed crosswalk"
fi  

rm platforms/android/build/outputs/apk/*




#ionic setup end# release build start
# required variables
#	$build_architecture
#	$content_type	

rm /tmp/$JOB_NAME/*
cordova build --release android

BUILD_NAME="englishduniya-custom-$environment-$content_type-$crosswalk_status"

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
BUILD_PATH="/tmp/$JOB_NAME"

release_build_name=$BUILD_PATH/$BUILD_NAME.apk

echo "--------------"
echo build_architecture $build_architecture
echo crosswalk_status $crosswalk_status
echo crosswalk $crosswalk
echo crosswalk $crosswalk
echo unsigned_build_name $unsigned_build_name
echo BUILD_NAME $BUILD_NAME
echo release_build_name $release_build_name

$VERSION/zipalign 4 $REPO_PATH/platforms/android/build/outputs/apk/$unsigned_build_name $release_build_name

release_build_upload_path=s3://zaya-builds/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$crosswalk_status-$content_type.apk
release_build_upload_link=/englishduniya-release-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$crosswalk_status-$content_type.apk

s3cmd put --acl-public $release_build_name $release_build_upload_path

# release build endecho Update Firebase --project fos-app-ed2c2 database:update /$campaign_owner_name/campaigns/$campaign_name/ -d {\"status\":\"available\"\,\"$build_architecture-$crosswalk_status\":\"$release_build_upload_link\"}  --token 1/0fNl3uwDYBPhXJMHL9Oa-WLjS4lZxMYs5urCJdKKjm0 -y
firebase --project fos-app-ed2c2 database:update /$campaign_owner_name/campaigns/$campaign_name/ -d {\"status\":\"available\"\,\"$build_architecture-$crosswalk_status\":\"$release_build_upload_link\"}  --token 1/0fNl3uwDYBPhXJMHL9Oa-WLjS4lZxMYs5urCJdKKjm0 -y
echo Done update Firebase