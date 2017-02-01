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