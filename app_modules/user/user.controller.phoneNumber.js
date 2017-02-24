(function() {
    'use strict';
    angular
        .module('zaya-user')
        .controller('userPhoneNumberController', userPhoneNumberController);
    userPhoneNumberController.$inject = [
        'CONSTANT',
        '$scope',
        '$state',
        'User',
        '$log',
        '$ionicSlideBoxDelegate',
        'analytics',
        '$timeout',
        'audio'
    ];

    function userPhoneNumberController(
        CONSTANT,
        $scope,
        $state,
        User,
        $log,
        $ionicSlideBoxDelegate,
        analytics,
        $timeout,
        audio 
    ){

        var phoneCtrl = this;
        phoneCtrl.number = User.user.getPhoneNumber();
        phoneCtrl.numberErrorText = '';
        // phoneCtrl.isVerified = User.user.getDetails() ? User.user.getDetails().is_verified : false;
        phoneCtrl.isVerified = true;
        phoneCtrl.otp = '';
        phoneCtrl.otpErrorText = '';
        phoneCtrl.otpInterval = 90000;
        phoneCtrl.otpResendCount = 3;
        phoneCtrl.otpResendFlag = 0;
        phoneCtrl.resendOtp = resendOtp;
        phoneCtrl.submitNumber = submitPhoneNumber;
        phoneCtrl.disableSwipe = disableSwipe;
        phoneCtrl.verifyOtp = verifyOtp;
        phoneCtrl.nextSlide = nextSlide;
        phoneCtrl.playAudio = playAudio;
        phoneCtrl.exit = exitPhoneNumber;
        phoneCtrl.open = goToPhoneNumber;

        


        
        // $log.debug("ISVERIFIED",phoneCtrl.number.length < 10,phoneCtrl.number == User.user.getPhoneNumber(), phoneCtrl.isVerified)
        $log.debug("PHONE. changed number flag", $scope.changeNumberFlag);
        var tempCount = 1;

        function resetPhoneValues() {
            $log.warn('resetting phone values')
            phoneCtrl.number = User.user.getPhoneNumber();
            phoneCtrl.numberErrorText = '';
            // phoneCtrl.isVerified = User.user.getDetails() ? User.user.getDetails().is_verified : false;
            phoneCtrl.isVerified = true;
            phoneCtrl.otp = '';
            phoneCtrl.otpErrorText = '';
            phoneCtrl.number = User.user.getPhoneNumber();
            $scope.userDetails = User.user.getDetails();
            $scope.notifyPhone = User.user.getNotifyPhone();
            $scope.changeNumberFlag = User.user.getPhoneNumber()
        }

        function goToPhoneNumber() {
            if ($scope.profileScreen.isShown()) {
                $scope.profileScreen.hide()
            }
            $scope.phoneNumberScreen.show().then(function() {
                playAudio(-1);
                analytics.log({
                    name: 'PHONENUMBER',
                    type: 'OPEN',
                }, {
                    time: new Date(),
                }, User.getActiveProfileSync()._id);
            });
            // phoneCtrl.isVerified = User.user.getDetails().is_verified;
            // $log.debug("PHONE.is verified",phoneCtrl.isVerified);
            analytics.log({
                name: 'PHONENUMBER',
                type: $scope.changeNumberFlag == true ? 'TAP_CHANGE' : 'TAP_ADD',
                id: null
            }, {
                time: new Date()
            }, User.getActiveProfileSync()._id);
            User.user.setNotifyPhone(0);
        }

        function exitPhoneNumber() {
            // if ($scope.profileScreen.isShown()) {
                // $scope.profileScreen.hide()
            // }
            // $scope.phoneNumberScreen.hide().then(function() {
                analytics.log({
                    name: 'PHONENUMBER',
                    type: 'CLOSE'
                }, {
                    time: new Date()
                }, User.getActiveProfileSync()._id);
                $state.go('map.navigate')                

                // resetPhoneValues();
                // $ionicSlideBoxDelegate.slide(0);
                // phoneCtrl.otp = '';
                // phoneCtrl.otpErrorText = '';
                // tempCount = 1;
                // audio.loop('background');
            // });
        }

        function submitPhoneNumber(num) {
            if (num[0] != '9' && num[0] != '8' && num[0] != '7') {
                $log.debug("in rejection")
                phoneCtrl.numberErrorText = "Please enter a valid mobile number";
                return;
            }
            analytics.log({
                    name: 'PHONENUMBER',
                    type: 'NUMBER_SUBMIT'
                }, {
                    time: new Date(),
                    number: num
                }, User.getActiveProfileSync()._id)
                // $log.debug("not in rejection")
            phoneCtrl.numberErrorText = "";
            // if (!phoneCtrl.isVerified && phoneCtrl.number == User.user.getPhoneNumber()) {
            //     $log.debug('PHONE. asking for otp')
            //     resendOtp(num, phoneCtrl.otpInterval);
            //     var currentIndex = $ionicSlideBoxDelegate.$getByHandle('slide-phone').currentIndex();
            //     if (currentIndex == 0) {
            //         nextSlide(1);
            //     }
            // } else {
                $log.debug('PHONE. Patching phone')
                sendPhoneNumber(num);
            // }
        }

        function sendPhoneNumber(num) {
            // $log.debug(num[0]);
            // $log.debug(num[0] != '9',num[0] != '8',num[0] != '7');
            // $log.debug(num[0] != '9' && num[0] != '8' && num[0] != '7');
            User.user.patchPhoneNumber(num).then(function(response) {
                $log.debug("We successfully added the phone number. Requesting otp", response, num);
                // var currentIndex = $ionicSlideBoxDelegate.$getByHandle('slide-phone').currentIndex();
                // if (currentIndex == 0) {
                nextSlide(1);
                $timeout(function() {
                    $log.debug('FUNCKing execute this')
                    exitPhoneNumber();
                }, 1000);
                // }
                // resetResendFlag();
                User.user.updatePhoneLocal(response.data.phone_number);
                // User.user.setIsVerified(response.data.is_verified);
                // $scope.changeNumberFlag = User.user.getPhoneNumber() == '';
                analytics.log({
                    name: 'PHONENUMBER',
                    type: 'NUMBER_SUCCESS',
                }, {
                    time: new Date()
                }, User.getActiveProfileSync()._id);
            }, function(err) {
                if (err.status == 400) {
                    phoneCtrl.numberErrorText = err.data.details;
                } else {
                    phoneCtrl.numberErrorText = JSON.stringify(err.data);
                }
                analytics.log({
                    name: 'PHONENUMBER',
                    type: 'NUMBER_ERROR',
                }, {
                    time: new Date()
                }, User.getActiveProfileSync()._id);
            })
        }

        function resendOtp(num, interval) {
            $log.debug("Asking for otp again")
            User.user.resendOtp(num).then(function(response) {
                analytics.log({
                    name: 'PHONENUMBER',
                    type: 'OTP_RESEND',
                }, {
                    time: new Date()
                }, User.getActiveProfileSync()._id);
                $log.debug("Otp request was sent", response)
            })
            resetResendFlag();
        }

        function resetResendFlag() {
            $log.debug('disabling resend');
            phoneCtrl.otpResendFlag = 0
            if (tempCount > phoneCtrl.otpResendCount - 1) {
                return;
            }
            tempCount++;
            $timeout(function() {
                $log.debug('activating resend')
                phoneCtrl.otpResendFlag = 1;
            }, phoneCtrl.otpInterval);
        }
        // function askForOtpCycle(num, interval, count){
        //   var tempCount = 1;
        //   var lastOtpCycle;
        //   var otpCycle = $interval(function(){
        //     $log.debug("Asking for otp again")
        //     if($ionicSlideBoxDelegate.$getByHandle('slide-phone').currentIndex() != 1){
        //       $interval.cancel(otpCycle);
        //       $log.debug('Killed otp request cycle',$interval.cancel(otpCycle))
        //     }
        //     if (tempCount == count) {
        //       $log.debug("timeout inside interval")
        //       lastOtpCycle = $timeout(function() {
        //         $ionicPopup.alert({
        //           title: 'Sorry about that!',
        //           template: 'Hey, looks like some error occured with sms server. Please try later'
        //         }).then(function(){
        //           exitPhoneNumber();
        //         });
        //       }, interval);
        //     }
        //     tempCount++;
        //     // User.user.resendOtp(num).then(function(response){
        //     //   $log.debug("Otp request was sent",response)
        //     // })
        //   },interval,count);
        // }
        function verifyOtp(otp, successInterval) {
            analytics.log({
                name: 'PHONENUMBER',
                type: 'OTP_SUBMIT',
            }, {
                time: new Date(),
                otp: otp
            }, User.getActiveProfileSync()._id);
            User.user.verifyOtp(otp).then(function(response) {
                $log.debug("Verified otp", response);
                // $log.debug("Please cancel interval",$interval.cancel(otpCycle));
                User.user.setIsVerified(true);
                // phoneCtrl.isVerified = User.user.getDetails().is_verified
                var currentIndex = $ionicSlideBoxDelegate.$getByHandle('slide-phone').currentIndex();
                if (currentIndex == 0) {
                    nextSlide(2);
                }
                if (!successInterval) {
                    successInterval = 1000;
                }
                $log.debug("Before timeout")
                $timeout(function() {
                    $log.debug("In timeout")
                    exitPhoneNumber();
                }, successInterval);
                analytics.log({
                    name: 'PHONENUMBER',
                    type: 'OTP_SUCCESS',
                }, {
                    time: new Date(),
                    otp: otp
                }, User.getActiveProfileSync()._id);
            }, function(err) {
                if (err.status == 400) {
                    phoneCtrl.otpErrorText = err.data.details
                } else {
                    $log.error(err)
                }
                analytics.log({
                    name: 'PHONENUMBER',
                    type: 'OTP_ERROR',
                }, {
                    time: new Date(),
                    otp: otp
                }, User.getActiveProfileSync()._id);
            })
        }

        function disableSwipe() {
            $ionicSlideBoxDelegate.enableSlide(false);
        }

        function nextSlide(index) {
            $ionicSlideBoxDelegate.$getByHandle('slide-phone').slide(index);
        }

        function playAudio(index) {
            $log.error('INDEX', index)
            var src;
            if (index == -1) {
                src = CONSTANT.PATH.LOCALIZED_AUDIO + localized.audio.phone.EnterPhoneNumber.lang[User.getActiveProfileSync().data.profile.language];
            }
            // else if (index == 1) {
            //   src = CONSTANT.PATH.LOCALIZED_AUDIO + localized.audio.phone.EnterOtp.lang[User.getActiveProfileSync().data.profile.language];
            // }
            if (src) {
                audio.player.play(src);
            } else {
                audio.player.stop();
            }
        }

    }
})();
