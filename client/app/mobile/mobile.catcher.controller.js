(function() {
  angular
    .module('jandiApp')
    .controller('mobileCatcherController', mobileCatcherController);

  function mobileCatcherController($scope, $state, $rootScope, Browser, urlScheme, publicService) {
    /**
     * debug alert 을 노출하기 위해 필요한 touch count 수
     * @type {number}
     */
    var DEBUG_TOUCH_COUNT = 10;

    /**
     * debug alert 을 노출하기 위해 필요한 duration 정보
     * @type {number}
     */
    var DEBUG_TOUCH_DURATION = 2500;

    /**
     * touch queue
     * @type {Array}
     * @private
     */
    var _touchQueue = [];

    $scope.isSafari = Browser.safari;
    
    $scope.toMobileApplication = function() {
      urlScheme.urlScheme();
    };

    $scope.isLang = function(lang) {
      return $rootScope.language == lang;
    };
    $scope.hideDebug = hideDebug;
    
    _init();

    /**
     * 초기화
     * @private
     */
    function _init() {
      if(angular.isUndefined($rootScope.mobileStatus)) {
        $state.go('signin');
      } 
        
      $('.body').removeClass('full-screen');
      $('.mobile-view').height($(window).height());

      $('.signin-mobile-background-img').bind('load', function() {
        $('.mobile-view').css('opacity', 1);
      });

      publicService.hideDummyLayout();
      _attachScopeEvents();
      _attachDomEvents();
    }
    
    /**
     * scope 이벤트를 바인딩한다.
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * dom 이벤트를 바인딩 한다.
     * @private
     */
    function _attachDomEvents() {
      $('.mobile-view').on('click', _onClick);
    }

    /**
     * click 이벤트 핸들러
     * @private
     */
    function _onClick() {
      _enqueueTouch();
      if (_isDebugAlertActivate()) {
        _showDebug();
        _touchQueue = [];
      }
    }

    /**
     * debug 를 노출한다.
     * @private
     */
    function _showDebug() {
      var urlData = urlScheme.getUrlScheme();
      var jqDebug = $('._debug');
      jqDebug.find('.context').text(urlData.app);
      jqDebug.show();      
    }

    /**
     * debug 를 숨긴다.
     */
    function hideDebug() {
      $('._debug').hide();
    }
    
    /**
     * touch 정보를 enqueue 한다.
     * @private
     */
    function _enqueueTouch() {
      if (_touchQueue.length >= DEBUG_TOUCH_COUNT) {
        _touchQueue.shift();
      }
      _touchQueue.push(new Date());
    }

    /**
     * debug alert 을 노출할 지 여부를 반환한다.
     * @returns {boolean}
     * @private
     */
    function _isDebugAlertActivate() {
      var duration;
      if (_touchQueue.length === DEBUG_TOUCH_COUNT) {
        duration = _touchQueue[DEBUG_TOUCH_COUNT - 1] - _touchQueue[0];
      }
      return !!(duration && duration < DEBUG_TOUCH_DURATION);
    }

    /**
     * dom 이벤트를 detach 한다.
     * @private
     */
    function _detachDomEvents() {
      $('.mobile-view').off('click', _onClick);
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      _detachDomEvents();
    }
  }
})();
