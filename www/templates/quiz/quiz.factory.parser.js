(function() {
  'use strict';
  angular
    .module('zaya-quiz')
    .factory('widgetParser', widgetParser)
  widgetParser.$inject = ['CONSTANT', '$log','mediaManager'];

  function widgetParser(CONSTANT, $log, mediaManager) {
    var soundIdRegex = /(?:\[\[)(?:sound)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    var imageTagRegex = /(?:\[\[)(?:img)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    return {
      getSoundId: getSoundId,
      getImageId: getImageId,
      getImageSrc: getImageSrc,
      parseToDisplay: parseToDisplay,
      replaceImageTag: replaceImageTag,
      removeSoundTag: removeSoundTag,
      removeImageTag: removeImageTag,
      getLayout: getLayout,
      getOptionsFontSize: getOptionsFontSize
    }

    function getSoundId(string) {
      if (soundIdRegex.exec(string))
      {
        return soundIdRegex.exec(string)[1];
    }

    function getImageId(string) {
      if (imageTagRegex.exec(string))
      {
        return imageTagRegex.exec(string)[1];
    }

    function getImageSrc(id, index, quiz) {
      $log.debug(quiz.objects[index],index,id,quiz.objects[index].node.type.content.widgets.images[id])
      return mediaManager.getPath(quiz.objects[index].node.type.content.widgets.images[id]);
    }

    function parseToDisplay(string, index, quiz) {
        $log.debug(string,index);
        var text = this.removeSoundTag(string, index);
        if(this.getImageId(text))
        {
          text = this.replaceImageTag(text, index, quiz);
        }
      return text.trim().length > 0 ? text.trim() : CONSTANT.WIDGETS.SPEAKER_IMAGE;

    }

    function removeSoundTag(string) {
      return string.replace(soundIdRegex, "");
    }
    function removeImageTag(string) {
      return string.replace(imageTagRegex, "");
    }
    function replaceImageTag(string, index, quiz) {
      $log.debug(string,index);
      return string.replace(imageTagRegex, "<img class='content-image' src='" +
        this.getImageSrc(this.getImageId(string), index, quiz) + "'>");
    }

    function getLayout(question, index, quiz) {
      $log.debug("getting layout")
      var layout = CONSTANT.WIDGETS.LAYOUT.LIST;
      angular.forEach(question.node.type.content.options, function(option) {
        if(this.getImageId(option.option) || this.getSoundId(option.option)){
          layout =  CONSTANT.WIDGETS.LAYOUT.GRID;
        }
        // var text = this.removeImageTag(this.removeSoundTag(option.option));
        // text = text.trim();
        // if (text.length >= CONSTANT.WIDGETS.OPTIONS.LAYOUT_THRESHOLD) {
        //   layout =  CONSTANT.WIDGETS.LAYOUT.LIST;
        // }
      }, this, CONSTANT);
      $log.debug(layout)
      return layout;
    }

    function getOptionsFontSize(options){
      var size = 'font-lg'
      angular.forEach(options,function(option){
        if(option.widgetHtml.length > CONSTANT.WIDGETS.OPTIONS.FONT_SIZE_THRESHOLD){
          size = 'font-md'
        }
      })
      return size;
    }
  }
})();
