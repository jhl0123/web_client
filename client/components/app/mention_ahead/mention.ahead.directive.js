/**
 * @fileoverview mention ahead directive
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .directive('mentionahead', mentionahead);

  /* @ngInject */
  function mentionahead($compile, $timeout, $position, currentSessionHelper, JndUtil, memberService) {

    return {
      restrict: 'A',
      scope: {
        isOpen: '=mentionaheadIsOpen',
        list: '=mentionaheadList'
      },
      require: ['mentionahead'],
      controller: 'MentionaheadCtrl',
      compile: function() {
        var mentionahead;

        mentionahead = $compile(
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
          var mentionaheadType = attrs.mentionaheadType;

          var mentionCtrl;
          var jqMentionahead;

          if (_isMentionaheadAvailable(mentionaheadType)) {
            // center에 사용되는 mention ahead이 아니거나 center가 dm이 아닐경우에만 mention ahead를 사용한다.

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
                  var LIVE_SEARCH_DELAY = 0;
                  var timerLiveSearch;

                  // text change event handling
                  function changeHandler(event) {
                    var value = event.target.value;

                    if (value !== mentionCtrl.getValue()) {
                      mentionCtrl.setValue(value);
                    }
                  }

                  // 실시간 mention 입력 확인
                  function liveSearchHandler(event) {
                    $timeout.cancel(timerLiveSearch);
                    timerLiveSearch = $timeout(function() {
                      var jqPopup = jqMentionahead.next();
                      var css;

                      mentionCtrl.setMentionOnLive(event);
                      if (_isOpenMentionaheadMenu()) {
                        mentionCtrl.showMentionahead();
                      }

                      // mention ahead position
                      css = $position.positionElements(jqMentionahead, jqPopup, 'top-left', false);
                      jqPopup.css(css);
                    }, LIVE_SEARCH_DELAY);
                  }

                  el
                    .on('input', changeHandler)
                    .on('click', liveSearchHandler)
                    .on('blur', function() {
                      JndUtil.safeApply(scope, function() {
                        mentionCtrl.clearMention();
                      });
                    })
                    .on('keyup', liveSearchHandler);
                }
              });
          }

          /**
           * mention ahead avaliable
           * @param {string} mentionaheadType
           * @returns {*|boolean}
           * @private
           */
          function _isMentionaheadAvailable(mentionaheadType) {
            var currentEntity = currentSessionHelper.getCurrentEntity();
            return currentEntity && (mentionaheadType !== 'message' || !memberService.isMember(currentEntity.id));
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
