# Start content bundle
# Required variables - 
#	$content_type
#	$MEDIA_SOURCE
#	$lessonsdb
#	$diagnosis_translationsdb
if [ "$content_type" = 'bundled' ]; then
lessons_download_count=all
fi
if [ "$content_type" = 'non-bundled' ]; then
lessons_download_count=0
fi

rm -f -r www/bundled/*
echo --lessons=$lessons_download_count --source_folder=$MEDIA_SOURCE --lessons_db=$lessonsdb --diagnosis_db=$diagnosis_translationsdb
node bundleContent.js --lessons=$lessons_download_count --source_folder=$MEDIA_SOURCE --lessons_db=$lessonsdb --diagnosis_db=$diagnosis_translationsdb


# End content bundle