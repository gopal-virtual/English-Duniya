(function () {
  'use strict';
  angular
    .module('common')
    .factory('device', device);
  device.$inject = [
    'CONSTANT',
    '$log'
  ];

  function device(CONSTANT,
                  $log) {

    var fake_device_uuid;
    if (CONSTANT.FAKE_LOGIN) {
      // fake_device_uuid = '73243248840563244324236708826';
      fake_device_uuid = CONSTANT.FAKE_ID_DEVICE;
    }

    var devicePropeties = {
      "uuid": CONSTANT.FAKE_LOGIN ?  fake_device_uuid : ionic.Platform.device().uuid,
      "model": CONSTANT.FAKE_DEVICE ? 'fake_model' :  window && window.device ? window.device.model : 'na',
      "platform": CONSTANT.FAKE_DEVICE ? 'fake_platform' : window && window.device ? window.device.platform : 'na',
      "version": CONSTANT.FAKE_DEVICE ? 'fake_version' : window && window.device ? window.device.version : 'na',
      "serial": CONSTANT.FAKE_DEVICE ? 'fake_serial' : window && window.device ? window.device.serial : 'na',
      "manufacturer": CONSTANT.FAKE_DEVICE ? 'fake_manufacturer' : window && window.device ? window.device.manufacturer : 'na'
    };
    $log.debug("THIS IS THE DEVICE PROPERTIES",devicePropeties);
    return devicePropeties;

  }
})();
