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
      fake_device_uuid = CONSTANT.FAKE_DEVICE_ID;
    }

    var devicePropeties = {
      "uuid": CONSTANT.FAKE_LOGIN ?  fake_device_uuid : ionic.Platform.device().uuid,
      "model": CONSTANT.FAKE_DEVICE ? 'fake_model' : window.device.model,
      "platform": CONSTANT.FAKE_DEVICE ? 'fake_platform' : window.device.platform,
      "version": CONSTANT.FAKE_DEVICE ? 'fake_version' : window.device.version,
      "serial": CONSTANT.FAKE_DEVICE ? 'fake_serial' : window.device.serial,
      "manufacturer": CONSTANT.FAKE_DEVICE ? 'fake_manufacturer' : window.device.manufacturer
    };
    return devicePropeties;

  }
})();
