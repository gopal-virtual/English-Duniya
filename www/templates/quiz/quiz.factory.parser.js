(function() {
  'use strict';
  angular
    .module('zaya-quiz')
    .factory('widgetParser', widgetParser)
  widgetParser.$inject = ['CONSTANT', '$log'];

  function widgetParser( CONSTANT, $log) {
    var soundIdRegex = /(?:\[\[)(?:sound)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    var imageTagRegex = /(?:\[\[)(?:img)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    return {
      getSoundId: getSoundId,
      getImageId: getImageId,
      getImageSrc: getImageSrc,
      parseToDisplay: parseToDisplay,
      replaceImageTag: replaceImageTag,
      removeSoundTag: removeSoundTag,
      getLayout: getLayout
    }

    function getSoundId(string) {
      if (soundIdRegex.exec(string))
        return soundIdRegex.exec(string)[1];
    }

    function getImageId(string) {
      if (imageTagRegex.exec(string))
        return imageTagRegex.exec(string)[1];
    }

    function getImageSrc(id, index, quiz) {
        return quiz.objects[index].node.type.content.widgets.images[id];
    }

    function parseToDisplay(string, index, quiz) {
      var text = this.replaceImageTag(this.removeSoundTag(string, index), index, quiz);
      return text.trim().length > 0? text.trim() : CONSTANT.WIDGETS.SPEAKER_IMAGE;

    }

    function removeSoundTag(string) {
      return string.replace(soundIdRegex, "");
    }

    function replaceImageTag(string, index, quiz) {
      return string.replace(imageTagRegex, "<img class='content-image' src='" +
        CONSTANT.RESOURCE_SERVER + this.getImageSrc(this.getImageId(string), index , quiz) + "'></img>");
    }

    function getLayout(question,index,quiz) {
      angular.forEach(question.node.type.content.options, function(option) {
        var text = this.replaceImageTag(this.removeSoundTag(option.option),index,quiz);
        text = text.trim();
        if (text.length >= CONSTANT.WIDGETS.OPTIONS_LAYOUT_THRESHOLD) {
          return CONSTANT.WIDGETS.LAYOUT.LIST;
        }
      },this,CONSTANT)
      return CONSTANT.WIDGETS.LAYOUT.GRID;
    }

  }
})();
