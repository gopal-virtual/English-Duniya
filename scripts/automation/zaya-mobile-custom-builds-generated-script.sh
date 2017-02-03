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

# configure icons/splashes end


#Media Sync Start

if [ "$content_environment" = 'test' ]; then
echo  $MEDIA_SOURCE --download --remoteresource .	
blobxfer --saskey "?sv=2015-04-05&ss=b&srt=sco&sp=rwdlac&se=2017-02-28T15:12:28Z&st=2016-11-10T07:12:28Z&spr=https&sig=RGOG%2Bj0fU%2B4q1Puwo%2B8WXq5p3%2BzDLyBiVjzVedC%2FU5o%3D" cctestmedia media $MEDIA_SOURCE --download --remoteresource .
fi
if [ "$content_environment" = 'production' ]; then
echo $MEDIA_SOURCE --download --remoteresource .
blobxfer --saskey "?sv=2015-04-05&ss=b&srt=sco&sp=rwdlac&se=2018-05-31T10:28:00Z&st=2016-08-27T02:28:00Z&spr=https&sig=bFWCBNiodY%2BxfcMsEMSKc2jGAB1jTiEW0yp0WqEnyVo%3D" edmedia media $MEDIA_SOURCE --download --remoteresource .
fi

# Media Sync end# Start content bundle
# Required variables - 
#	$content_type
#	$MEDIA_SOURCE
#	$lessonsdb
#	$diagnosis_translationsdb
if [ "$content_type" = 'bundled' ]; then
lessons_download_count=all
is_bundled=true
fi
if [ "$content_type" = 'non-bundled' ]; then
lessons_download_count=0
is_bundled=false
fi

rm -f -r www/bundled/*
echo --lessons=$lessons_download_count --source_folder=$MEDIA_SOURCE --lessons_db=$lessonsdb --diagnosis_db=$diagnosis_translationsdb
node bundleContent.js --lessons=$lessons_download_count --source_folder=$MEDIA_SOURCE --lessons_db=$lessonsdb --diagnosis_db=$diagnosis_translationsdb


# End content bundle# gulp start
echo --env=$environment --app_type=$content_type --is_bundled=$is_bundled --lock=$node_locked --languages=$languages --lessonsdb=$lessonsdb --diagnosisdb=$diagnosis_translationsdb
gulp --env=$environment --app_type=$content_type --is_bundled=$is_bundled --lock=$node_locked --languages=$languages --lessonsdb=$lessonsdb --diagnosisdb=$diagnosis_translationsdb

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
		s3cmd put --acl-public $final_build_name s3://zaya-builds/test/$content_type/$build_architecture/englishduniya-$build_architecture-$content_type.apk
	#fi
#fi

# upload build end