# upload build start


echo "$HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a $build_architecture -f $final_build_name -u $USERNAME -p $PASSWORD -d $build_description"
#/usr/local/bin/club -h $HOST -t $BUILD_TYPE -l $BUILD_PLATFORM -a $build_architecture -f $final_build_name -u $USERNAME -p $PASSWORD -d "$build_description"


#if [ "$BUILD_ENV" == "production" ]; then
	
	#if [ -e $final_build_name  ];then
		s3cmd put --acl-public $final_build_name s3://zaya-builds/test/$content_type/$build_architecture/englishduniya-$build_architecture-$content_type.apk
	#fi
#fi

# upload build end