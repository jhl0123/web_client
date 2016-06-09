/**
 * @fileoverview sound stream service
 * 참조: https://developer.mozilla.org/ko/docs/Web/HTML/Element/audio
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .service('NotificationStream', NotificationStream);
  
  function NotificationStream() {
    var Stream = {};

    /**
     * 생성자
     * @param {string} url
     * @param {object} options
     * @returns {init}
     */
    function init(url, options) {
      var that = this;
      that.audio = new Audio();

      that.playing = false;

      _.extend(that.options = {}, options);

      that._on();
      that.load(url);

      return that;
    }

    /**
     * 스트림 객체 삭제
     */
    function destroy() {
      var that = this;
      that.audio = null;

      that.playing = false;

      that._off();
    }

    /**
     * 특정 url에 있는 sound load함
     * @param url
     */
    function load(url) {
      var that = this;
      var audio = that.audio;

      audio.src = url;
      audio.preload = that.options.preload ? 'auto' : 'none';
      if (that.options.preload) {
        audio.load();
      }
    }

    /**
     * play
     */
    function play() {
      var that = this;
      var audio = that.audio;

      if (that.options.multiple || !that.playing) {
        that.playing = true;

        try {
          audio.currentTime = 0;
          audio.play();
        } catch (e) {}
      }
    }

    /**
     * on events
     * @private
     */
    function _on() {
      var that = this;
      that.audio.addEventListener('ended', that._onEnded.bind(that), false);
      that.audio.addEventListener('loadeddata', that._onLoadedData.bind(that), false);
    }

    /**
     * off events
     * @private
     */
    function _off() {
      var that = this;
      that.audio.removeEventListener('ended', that._onEnded.bind(that), false);
      that.audio.removeEventListener('loadeddata', that._onLoadedData.bind(that), false);
    }

    /**
     * audio ended event handler
     * @private
     */
    function _onEnded() {
      var that = this;

      that.playing = false;
      that.audio.pause();
    }

    /**
     * audio loaded event handler
     * @private
     */
    function _onLoadedData() {
      var that = this;

      if (that.options.preload) {
        that.options.ready && that.options.ready();
      }
    }

    Stream.init = init;
    Stream.destroy = destroy;
    Stream.load = load;
    Stream.play = play;

    Stream._on = _on;
    Stream._off = _off;
    Stream._onEnded = _onEnded;
    Stream._onLoadedData = _onLoadedData;

    return  {
      getInstance: function(url, options) {
        return Object.create(Stream).init(url, options);
      }
    };
  }
})();
