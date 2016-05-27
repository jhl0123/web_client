(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerScroll', centerScroll);

  function centerScroll(jndPubSub) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, elm, attr) {
      var threshold = 700;
      var raw = elm[0];
      var _lastScrollTop = null;
      var position = 0;
      var messageContainer = angular.element(document.getElementById('msgs-container'));

      elm.on('scroll', function(event) {
        var scrollTop;
        var scrollDiff;
        var direction = 'old';
        scrollTop = raw.scrollTop;
        scrollDiff =  raw.scrollHeight - (scrollTop + messageContainer.outerHeight());

        if (_lastScrollTop === null) {
          _lastScrollTop = scrollTop;
        } else if (scrollTop > _lastScrollTop) {
          direction = 'new';
        } else {
          direction = 'old';
        }
        //zoom 추가로 인해 scrollDiff === 0 인 조건을 5 이하로 수정
        if (scrollDiff < 5) {
          if (scope.isInitializeRender) {
            scope.clearNewMessageAlerts();
          }
        } else if (scope.hasMoreNewMessageToLoad()) {
          scope.hasScrollToBottom = true;
        } else {
          if (scrollDiff < threshold) {
            scope.hasScrollToBottom = false;
          } else {
            scope.hasScrollToBottom = true;
          }
        }

        if (scope.status.isInitialized) {
          if (direction === 'new') {
            if (scrollDiff < 2000) {
              if (scope.loadNewMessages()) {
                jndPubSub.pub('hide:center-file-dropdown');
                jndPubSub.pub('hide:center-item-dropdown');
              }
            } else if (scrollDiff < 5) {
              // browser zoom 이 설정되어 있을 경우 scrollDiff 값 0 이상으로 오차가 발생하기 때문에
              // 5 이하 이면 최 하단으로 scroll 된 것으로 간주한다.
              scope.updateMessageMarker();
            }
          } else if (direction === 'old' && scrollTop < 2000) {
            if (scope.loadOldMessages()) {
              jndPubSub.pub('hide:center-file-dropdown');
              jndPubSub.pub('hide:center-item-dropdown');
            }
          }
        }
      });
    }
  }


})();
