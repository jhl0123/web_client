/**
 * @fileoverview mention ahead directive
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .directive('mentionahead', mentionahead);

  /* @ngInject */
  function mentionahead($compile, $timeout, $position, JndUtil) {

    return {
      restrict: 'A',
      scope: {
        status: '=mentionaheadStatus',
        list: '=mentionaheadList'
      },
      require: ['mentionahead'],
      controller: 'MentionaheadCtrl',
      compile: function() {
        var mentionahead = $compile(
          '<div type="text" style="position: absolute; top: 0; left: 0; width: 100%;" ' +
          'jandi-typeahead="mention.name for mention in mentionList' +
                           ' | getMatchedList: \'extSearchName\':mention.match[2]' +
                           ' | orderByQueryIndex: \'extSearchName\':mention.match[2]:mentionOrderBy" ' +
          'jandi-typeahead-prevent-default-placement="true" ' +
          'jandi-typeahead-on-select="onSelect($item)" ' +
          'jandi-typeahead-on-matches="onMatches($matches)" ' +
          'jandi-typeahead-template-name="jandi-mentionahead-popup" ' +
          'jandi-typeahead-min-Length="0" ' +
          'ng-model="mentionModel" ></div>'
        );

        return function(scope, el, attrs, ctrls) {
          var LIVE_SEARCH_DELAY = 0;
          var timerLiveSearch;

          var mentionCtrl;
          var jqMentionahead;

          mentionCtrl = ctrls[0];
          scope.eventCatcher = el;

          scope.mentionOrderBy = mentionOrderBy;

          jqMentionahead = mentionahead(scope, function (jqMentionahead) {
            el.parent().append(jqMentionahead);
          });

          mentionCtrl
            .init({
              originScope: scope.$parent,
              mentionModel: jqMentionahead.data('$ngModelController'),
              jqEle: el,
              attrs: attrs,
              on: function() {
                el
                  .on('input', _onChangeHandler)
                  .on('click', _onLiveSearchHandler)
                  .on('blur', function() {
                    JndUtil.safeApply(scope, function() {
                      mentionCtrl.clearMention();
                    });
                  })
                  .on('keyup', _onLiveSearchHandler);
              }
            });

          /**
           * text change event handler
           * @param {object} event
           */
          function _onChangeHandler(event) {
            var value = event.target.value;

            if (value !== mentionCtrl.getValue()) {
              mentionCtrl.setValue(value);
            }
          }

          /**
           * 실시간 mention 입력 확인
           * @param {object} event
           */
          function _onLiveSearchHandler(event) {
            $timeout.cancel(timerLiveSearch);
            timerLiveSearch = $timeout(_.bind(_liveSearchHandler, null, event), LIVE_SEARCH_DELAY);
          }

          /**
           * 실시간 mention 입력 확인
           * @param {object} event
           * @private
           */
          function _liveSearchHandler(event) {
            var jqPopup = jqMentionahead.next();
            var css;

            mentionCtrl.setMentionOnLive(event);
            if (_isOpenMentionaheadMenu()) {
              mentionCtrl.showMentionahead();
            }

            // mention ahead position
            css = $position.positionElements(jqMentionahead, jqPopup, 'top-left', false);
            jqPopup.css(css);
          }

          /**
           * mentionahead menu가 열려 있는지 여부
           * @returns {boolean}
           * @private
           */
          function _isOpenMentionaheadMenu() {
            return jqMentionahead.attr('aria-expanded') === 'true';
          }

          /**
           * mention order by
           * @param {object} item
           * @param {array} desc
           * @returns {Array.<*>}
           */
          function mentionOrderBy(item, desc) {
            // mention all이 첫번째로 그리고 jandibot이 두번째로 오도록 한다.
            return [!item.extIsMentionAll, !item.extIsJandiBot].concat(desc);
          }
        }
      }
    };
  }
}());
