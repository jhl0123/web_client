/**
 * @fileoverview mention ahead controller
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .controller('MentionaheadCtrl', MentionaheadCtrl);

  /* @ngInject */
  function MentionaheadCtrl($scope, $state, $filter, RoomTopicList, currentSessionHelper,
                            Mentionahead, Dialog, jndPubSub, JndUtil) {
    var that = this;

    var $originScope;
    var $model;

    that.init = init;

    that.getValue = getValue;
    that.setValue = setValue;

    that.clearMention = clearMention;
    that.setMentionOnLive = setMentionOnLive;
    that.showMentionahead = showMentionahead;

    function init(options) {
      $originScope = options.originScope;
      $originScope.getMentions = getMentions;

      $model = options.mentionModel;
      $scope.jqEle = options.jqEle;

      $scope.onSelect = onSelect;
      $scope.onMatches = onMatches;

      $scope.hasOn = false;
      $scope.on = options.on;

      _attachScopeEvents();

      // message를 submit하는 method
      if (options.attrs.messageSubmit) {
        _hookMessageSubmit(options.attrs, options.attrs.messageSubmit);
      }
    }

    /**
     * attach events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$watch('status', _onStatusChanged);
      $scope.$watch('list', _onListChanged);
    }

    /**
     * status change 이벤트 핸들러
     * @param {string} status
     * @private
     */
    function _onStatusChanged(status) {
      if (status === Mentionahead.MENTION_WITH_CHAR) {
        _showMentionahead();
      }
    }

    /**
     * list change 이벤트 핸들러
     * @param {array} list
     * @private
     */
    function _onListChanged(list) {
      _setMentions(list);
    }

    /**
     * show mention ahead
     * @private
     */
    function _showMentionahead() {
      var selection = _getSelection();
      var value = $scope.jqEle.val();
      var prefixValue = value.substring(0, selection.begin);
      var mentionWord = '@';
      var suffixValue = value.substring(selection.end);
      var count = 0;

      // prefix value의 마지막 값이 mention word가 아니라면 해당 selection에 mention word를 추가한다.
      if (!/([\s]@$)|(^@$)/.test(prefixValue)) {
        if (prefixValue !== '' && !/\s$/.test(prefixValue)) {
          mentionWord = ' ' + mentionWord;
          count += 2;
        } else {
          count++;
        }

        if (suffixValue !== '' && !/^\s/.test(suffixValue)) {
          mentionWord = mentionWord + ' ';
        }

        value = prefixValue + mentionWord + suffixValue;
      }

      $scope.jqEle.val(value).focus();
      _setSelection(selection.begin + count);
      $scope.jqEle.trigger('input').trigger('keyup');
    }

    /**
     * mention ahead list 설정함.
     * @param mentionList
     * @private
     */
    function _setMentions(mentionList) {
      $scope.mentionList = mentionList;

      // 중복 user name에 대한 처리
      $scope._mentionMap = Mentionahead.getSingleMentionItems(mentionList);

      if (!$scope.hasOn && mentionList.length > 0) {
        // mention ahead에 출력할 item이 존재하고 event listener가 연결되지 않았다면 연결함
        $scope.hasOn = true;
        $scope.on();
      }
    }

    /**
     * mention 입력인지 처리할 value를 전달함.
     * @returns {*}
     */
    function getValue() {
      return $scope._value;
    }

    /**
     * mention 입력인지 처리할 value를 설정함.
     * @param {string} value
     */
    function setValue(value) {
      $scope._value = value;
    }

    /**
     * element의 cursor 기준으로 mention을 설정함.
     * @param {object} event
     */
    function setMentionOnLive(event) {
      var value = getValue();
      var selectionBegin = _getSelection().begin;
      var mention = $scope.mention = Mentionahead.getMentionOnCursor(event, value, selectionBegin);

      if (mention) {
        $model.$setViewValue(mention.match[2]);
      } else {
        clearMention();
      }
    }

    /**
     * text 전체를 확인하여 mention 입력인 object를 전달함
     * @returns {{msg: string, mentions: Array}}
     */
    function getMentions() {
      var entityId = $state.params.entityId;
      var value = getValue();

      return Mentionahead.getMentionAllForText(value, $scope._mentionMap, entityId);
    }

    /**
     * mentionahead를 출력함
     */
    function showMentionahead() {
      $scope.status = Mentionahead.OPEN;
    }

    /**
     * mentionahead를 숨김
     */
    function _hideMentionahead() {
      $scope.status = Mentionahead.CLOSE;
    }

    /**
     * mention 입력을 clear함.
     */
    function clearMention() {
      if ($model.$viewValue != null) {
        $model.$setViewValue(null);
      }

      _hideMentionahead();
    }

    /**
     * element의 selection을 전달함.
     * @returns {{begin: Number, end: Number}}
     * @private
     */
    function _getSelection() {
      var ele = $scope.jqEle[0];

      return {
        begin: ele.selectionStart,
        end : ele.selectionEnd
      };
    }

    /**
     * element의 slection을 설정함.
     * @param {string|number} begin
     * @param {string|number} end
     * @private
     */
    function _setSelection(begin, end) {
      var ele = $scope.jqEle[0];

      end == null && (end = begin);
      ele.setSelectionRange(begin, end);
    }

    /**
     * mentionahead에서 특정 mention 선택 event callback
     * @param {object} $item
     */
    function onSelect($item) {
      var currentEntity;
      var count;
      var msg;

      if ($item.name === Mentionahead.MENTION_ALL_ITEM_TEXT) {
        // 모든 member에게 mention

        currentEntity = currentSessionHelper.getCurrentEntity();
        count = RoomTopicList.getUserLength(currentEntity.id) - 1;

        if (count > 0) {
          msg = $filter('translate')('@mention-all-toast');

          msg = msg
            .replace('{{topicName}}', '\'' + currentEntity.name + '\'')
            .replace('{{topicParticipantsCount}}', count);

          Dialog.warning({
            title: msg
          });
        }

        _onSelect($item);
      } else {
        _onSelect($item);
      }
    }

    /**
     * mentionahead에서 특정 mention 선택 event callback
     * @param {object} $item
     * @param {boolean} [confirm=true]
     * @private
     */
    function _onSelect($item, confirm) {
      var mention = $scope.mention;
      var mentionTarget = $item.extViewName;
      var extraText = ' ';
      var text;
      var selection;

      if (confirm === false) {
        // mention 입력 취소
        text = mention.preStr + mention.sufStr;
        selection = mention.offset + mention.length;
      } else {
        // mention 입력 후 text 재설정
        text = mention.preStr.replace(new RegExp(mention.match[1] + '$'), mentionTarget) + extraText + mention.sufStr;
        selection = mention.offset + mentionTarget.length + extraText.length;
      }

      $scope.jqEle.val(text);
      setValue(text);

      // mention 입력 후 element selection 위치 설정
      setTimeout(function() {
        _setSelection(selection);
      }, 10);

      // mention clear
      clearMention();
    }

    /**
     * mentionahead중 입력한 값과 match event callback
     * @param {array} matches
     */
    function onMatches(matches) {
      if (!matches.length) {
        // 입력값에 match 되는 item이 존재하지 않는다면 mention clear
        clearMention();
      }
    }

    /**
     * hook message 전달 함수
     * message 입력하는 element에서 입력한 값을 mention ahead에서 처리하므로
     * mention 입력하는 동안에는 message submit 수행되지 않도록 함.
     * @param {object} attrs
     * @param {function} originMessageSubmit
     * @private
     */
    function _hookMessageSubmit(attrs, originMessageSubmit) {
      attrs.messageSubmit = function() {
        if ($scope.status === Mentionahead.CLOSE || !$scope.hasOn) {
          $originScope.$eval(originMessageSubmit);

          // submit 후 value 초기화
          setValue(null);
        }
      };
    }
  }
}());
