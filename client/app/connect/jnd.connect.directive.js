/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnect', jndConnect);

  function jndConnect($timeout, JndConnect) {
    return {
      restrict: 'E',
      scope: {
        params: '=jndDataParams'
      },
      controller: 'JndConnectCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/jnd.connect.html'
    };

    function link(scope, el, attrs) {
      scope.isLoading = true;

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        scope.$on('JndConnect:hideLoading', _onHideLoading);
        scope.$on('JndConnect:showLoading', _onShowLoading);
        
        scope.$on('jndConnectScroll:showHeaderNav', _showHeaderNav);
        scope.$on('jndConnectScroll:hideHeaderNav', _hideHeaderNav);
        $timeout(_initializeElements);
      }

      /**
       * loading show 이벤트 핸들러
       * @private
       */
      function _onShowLoading() {
        if (!scope.isLoading) {
          scope.isLoading = true;
          _setElementLoadingPosition();
        }
      }


      /**
       * 데이터를 받아온 후 hide loading 이벤트 핸들러가 수행되었을 때 콜백.
       * 이벤트를 바로 받은 직후에는 element 가 랜더링 되기 전일 수 있기 때문에 $timeout 을 사용한다.
       * @private
       */
      function _onHideLoading() {
        $timeout(_doHideLoading);
      }

      /**
       * loading hide 를 수행한다.
       * @private
       */
      function _doHideLoading() {
        if (scope.isLoading) {
          scope.isLoading = false;
         _startAnimation();
        }
      }

      /**
       * animation 을 start 한다.
       * @private
       */
      function _startAnimation() {
        _animateSubmenu();
        _animateBanner();
        _animateCards();
      }

      /**
       * animation 을 적용하기 위해 element 를 초기화 한다.
       * @private
       */
      function _initializeElements() {
        el.find('._backBtn').css({
          'opacity': 0,
          'margin-left': '20px'
        });
        _setElementLoadingPosition();
        el.addClass('opac-in');
      }

      /**
       * header navigation 을 노출한다.
       * @private
       */
      function _showHeaderNav() {
        var jqHeader = el.find('._header');
        jqHeader.addClass('show-sub-header');
      }

      /**
       * header navigation 을 감춘다.
       * @private
       */
      function _hideHeaderNav() {
        var jqHeader = el.find('._header');
        jqHeader.removeClass('show-sub-header');
      }

      /**
       * 초기화 이후 loading 에 필요한 element 속성 설정 한다.
       * @private
       */
      function _setElementLoadingPosition() {
        el.find('._card').css('opacity', 0);
        el.find('._bannerTop').css('opacity', 0);
        el.find('._submenu').css('opacity', 0);
      }

      /**
       * 배너를 animate 한다
       * @private
       */
      function _animateBanner() {
        el.find('._bannerTop').css({
          opacity: 0,
          marginTop: '30px'
        }).animate({
          marginTop: 0,
          opacity: 1
        }, 500);
      }

      /**
       * 카드를 animate 한다
       * @private
       */
      function _animateCards() {
        var jqCards = el.find('._card');
        if (jqCards.length) {
          jqCards.each(function(count) {
            var callback = (count === 1) ? _animateBackButton : null;
            $(this).css({
              opacity: 0
            });
            setTimeout(_.bind(_slideUpAndFadeIn, this, $(this), callback), 100 * count);
          });
        } else {
          _animateBackButton();
        }
      }

      /**
       * back 버튼을 animate 한다.
       * @private
       */
      function _animateBackButton() {
        el.find('._backBtn').animate({
          opacity: 1,
          marginLeft: 0
        }, 200);
      }

      /**
       * 좌측 submenu 의 animation 을 담당한다.
       * @private
       */
      function _animateSubmenu() {
        el.find('._submenu')
          .css({
            opacity: 0
          }).animate({
          opacity: 1
        }, 500);
      }

      /**
       * slide & fade in 하는 animation 함수
       * @param el
       * @param callback
       * @private
       */
      function _slideUpAndFadeIn(el, callback) {
        el.css({
          marginTop: '30px',
          opacity: 0
        }).animate({
          marginTop: 0,
          opacity: 1
        }, 500, callback);
      }

    }
  }
})();
