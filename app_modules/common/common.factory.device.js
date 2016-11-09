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
      fake_device_uuid = parseInt(Math.random(1, 9) * 10000000).toString();
    }

    var devicePropeties = {
      "uuid": CONSTANT.FAKE_LOGIN ? fake_device_uuid : ionic.Platform.device().uuid,
      "model": CONSTANT.FAKE_DEVICE ? 'fake_model' : window.device.model,
      "platform": CONSTANT.FAKE_DEVICE ? 'fake_platform' : window.device.platform,
      "version": CONSTANT.FAKE_DEVICE ? 'fake_version' : window.device.version,
      "serial": CONSTANT.FAKE_DEVICE ? 'fake_serial' : window.device.serial,
      "manufacturer": CONSTANT.FAKE_DEVICE ? 'fake_manufacturer' : window.device.manufacturer
    };
    $log.debug("THIS IS THE DEVICE ID",devicePropeties.uuid);
    return devicePropeties;

  }
})();
