sudo apt-get update

# # install openjdk
sudo apt-get -y install openjdk-7-jdk

# # download android sdk
wget --directory-prefix=/home/ http://dl.google.com/android/android-sdk_r24.2-linux.tgz
cd /home
tar -xvf android-sdk_r24.2-linux.tgz
cd android-sdk-linux/tools

# # install all sdk packages
./android update sdk --no-ui

# # set path
# vim ~/.bashrc
# export PATH=${PATH}:/home/android-sdk-linux/platform-tools:/home/android-sdk-linux/tools:/home/android-sdk-linux/build-tools/22.0.1/
# source ~/.bashrc

# android list sdk
# sudo android update sdk -u -a -t <package number>

# # adb
sudo apt-get -y install libc6:i386 libstdc++6:i386 zlib1g:i386

wget -qO- https://deb.nodesource.com/setup_4.x | sudo bash -
sudo apt-get install -y nodejs
sudo npm install -g cordova ionic gulp bower pouchdb-dump-cli pouchdb-server
sudo npm install
bower install
gulp
ionic state restore
