/**
 * @fileoverview 잔디 커넥트 페이지 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnect', JndConnect);


  function JndConnect(jndPubSub) {
    this.show = show;
    this.hide = hide;

    /**
     * 커넥트 화면을 show 한다.
     */
    function show() {
      jndPubSub.pub('JndConnect:show');
    }

    /**
     * 커넥트 화면을 hide 한다.
     */
    function hide() {
      jndPubSub.pub('JndConnect:hide');
    }
  }
})();