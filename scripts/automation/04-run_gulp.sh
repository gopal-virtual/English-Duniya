# gulp start
# Required variables - 
# 	$environment 
#	$content_type 
#	$is_bundled 
#	$node_locked
#	$languages
#	$lessonsdb
#	$diagnosis_translationsdb

echo --env=$environment --app_type=$content_type --is_bundled=$is_bundled --lock=$node_locked --languages=$languages --lessonsdb=$lessonsdb --diagnosisdb=$diagnosis_translationsdb
gulp --env=$environment --app_type=$content_type --is_bundled=$is_bundled --lock=$node_locked --languages=$languages --lessonsdb=$lessonsdb --diagnosisdb=$diagnosis_translationsdb

# gulp end