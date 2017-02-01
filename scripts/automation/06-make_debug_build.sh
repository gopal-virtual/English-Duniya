# debug build start

ionic build android

debug_build_upload_path=s3://zaya-builds/debug/englishduniya-$campaign_name-$BUILD_NUMBER-$environment-$build_architecture-$content_type.apk

s3cmd put --acl-public $REPO_PATH/platforms/android/build/outputs/apk/android-armv7-debug.apk $debug_build_upload_path
# debug build end