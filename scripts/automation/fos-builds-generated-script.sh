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

campaign_name=playstore

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
keep_crosswalk=true

#vars for step 7
build_architecture=x86


echo Campaign name $campaign_name# gulp start
# Required variables - 
# 	$environment 
#	$content_type 
#	$is_bundled 
#	$node_locked
#	$languages
#	$lessonsdb
#	$diagnosis_translationsdb
#   $app_source

echo --env=$environment --app_type=$content_type --campaign_name=$campaign_name --is_bundled=$is_bundled --lock=$node_locked --languages=$languages --lessonsdb=$lessonsdb --diagnosisdb=$diagnosis_translationsdb
gulp --env=$environment --app_type=$content_type --campaign_name=$campaign_name --is_bundled=$is_bundled --lock=$node_locked --languages=$languages --lessonsdb=$lessonsdb --diagnosisdb=$diagnosis_translationsdb

# gulp end#ionic setup start
# Required variables
#	$keep_crosswalk
	
ionic state restore

if [ "$keep_crosswalk" = 'true' ]; then
  echo "keeping crosswalk"
  cp config_with_crosswalk.xml config.xml
  ionic plugin install cordova-plugin-crosswalk-webview
  echo "kept crosswalk"
fi
if [ "$keep_crosswalk" = 'false' ]; then
  echo "removing crosswalk"
  cp config_without_crosswalk.xml config.xml
  ionic plugin rm cordova-plugin-crosswalk-webview
  build_architecture="x86andarm"
  echo "removed crosswalk"
fi  

ionic platform rm android
ionic platform add android
rm platforms/android/build/outputs/apk/*

#ionic setup end# debug build start

ionic build android

# debug build end# release build start
# required variables
#	$build_architecture
#	$content_type	

cordova build --release android

BUILD_NAME="englishduniya-custom-$environment-$content_type"

if [ "$build_architecture" = 'x86' ]; then
  unsigned_build_name="android-x86-release-unsigned.apk"
  BUILD_NAME="$BUILD_NAME-$build_architecture"
fi
if [ "$build_architecture" = 'arm' ]; then
  unsigned_build_name="android-armv7-release-unsigned.apk"
  BUILD_NAME="$BUILD_NAME-$build_architecture"
fi
if [ "$build_architecture" = 'armandx86' ]; then
  unsigned_build_name="android-release-unsigned.apk"
  BUILD_NAME="$BUILD_NAME-$build_architecture"
fi



jarsigner -tsa http://timestamp.comodoca.com/rfc3161 -sigalg SHA1withRSA -digestalg SHA1 -keystore classcloud.keystore -storepass zayaayaz1234 $PWD/platforms/android/build/outputs/apk/$unsigned_build_name angryape

VERSION="$ANDROID_HOME/build-tools/23.0.1"
BUILD_PATH="/tmp"

final_build_name=$BUILD_PATH/$BUILD_NAME.apk


$VERSION/zipalign 4 $REPO_PATH/platforms/android/build/outputs/apk/$unsigned_build_name $final_build_name

# release build end# upload build start


echo "$HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a $build_architecture -f $final_build_name -u $USERNAME -p $PASSWORD -d $build_description"
#/usr/local/bin/club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a $build_architecture -f $final_build_name -u $USERNAME -p $PASSWORD -d "$build_description"


#if [ "$BUILD_ENV" == "production" ]; then
	
	#if [ -e $final_build_name  ];then
		s3cmd put --acl-public $final_build_name s3://zaya-builds/$environment/$content_type/$build_architecture/englishduniya-$build_architecture-$content_type.apk
	#fi
#fi

# upload build end