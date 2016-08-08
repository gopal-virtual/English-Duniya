apt-get update

# # install openjdk
# apt-get -y install openjdk-7-jdk

# # download android sdk
# wget --directory-prefix=$PWD http://dl.google.com/android/android-sdk_r24.2-linux.tgz

# tar -xvf android-sdk_r24.2-linux.tgz
# cd android-sdk-linux/tools

# # install all sdk packages
# ./android update sdk --no-ui

# # set path
# vi ~/.zshrc << EOT

# export PATH=${PATH}:$HOME/sdk/android-sdk-linux/platform-tools:$HOME/sdk/android-sdk-linux/tools:$HOME/sdk/android-sdk-linux/build-tools/22.0.1/

# EOT

# source ~/.zshrc

# # adb
# apt-get -y install libc6:i386 libstdc++6:i386
# # aapt
# apt-get -y install zlib1g:i386

wget -qO- https://deb.nodesource.com/setup_4.x | sudo bash -


apt-get install -y nodejs
npm install -g cordova ionic gulp bower pouchdb-dump-cli pouchdb-server
npm install
bower install
ionic platform add android
ionic build android