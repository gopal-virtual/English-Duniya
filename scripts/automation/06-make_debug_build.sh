# debug build start

ionic build android

debug_build_upload_path=s3://zaya-builds-2/builds/debug/englishduniya-debug-$campaign_owner_name-$campaign_name-$JOB_NAME-$BUILD_NUMBER-$environment-$build_architecture-$content_type.apk

s3cmd put --acl-public $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-debug.apk $debug_build_upload_path
# debug build end