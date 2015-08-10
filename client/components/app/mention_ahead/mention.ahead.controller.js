/**
 * @fileoverview mention ahead controller
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .controller('MentionParser', MentionaheadCtrl);

  /* @ngInject */
  function MentionaheadCtrl($state, $parse, $filter, $window, entityAPIservice, memberService, currentSessionHelper, configuration, MentionExtractor) {
    var that = this;

    var MENTION_ALL = 'all';
    var MENTION_ALL_ITEM_TEXT = $filter('translate')('@mention-all');
    var entityId = $state.params.entityId;

    var $originScope;
    var $scope;
    var $model;

    that.init = init;

    that.getValue = getValue;
    that.setValue = setValue;

    that.setMentions = setMentions;
    that.clearMention = clearMention;

    that.setMentionOnLive = setMentionOnLive;

    that.isInputMention = isInputMention;
    that.isShowMentionahead = isShowMentionahead;
    that.showMentionahead = showMentionahead;

    function init(options) {
      var fn;

      $originScope = options.originScope;
      $originScope.getMentions = getMentions;

      $scope = options.mentionScope;
      $model = options.mentionModel;
      $scope.jqEle = options.jqEle;

      $scope.onSelect = onSelect;
      $scope.onMatches = onMatches;

      $scope.hasOn = false;
      $scope.on = options.on;

      // mention list�� ���� option
      fn = options.attrs.mentionaheadData && $parse(options.attrs.mentionaheadData);

      if (fn) {
        $scope.mentionList = fn($originScope, {
          $mentionScope: $scope,
          $mentionCtrl: that
        });
      } else {
        // current entity change event handler���� �ѹ� mention list ����
        $scope.$on('onCurrentEntityChanged', function(event, param) {
          _setMentionList(param);
        });

        _setMentionList();
      }

      // message�� submit�ϴ� method
      if (options.attrs.messageSubmit) {
        _hookMessageSubmit(options.attrs, options.attrs.messageSubmit);
      }
    }

    /**
     * default mention list ������.
     * @private
     */
    function _setMentionList() {
      var currentEntity = currentSessionHelper.getCurrentEntity();
      var members = entityAPIservice.getMemberList(currentEntity);
      var currentMemberId = memberService.getMemberId();
      var mentionList = [];
      var member;
      var i;
      var len;

      if (members) {
        // ���� topic�� members

        for (i = 0, len = members.length; i < len; i++) {
          member = _getCurrentTopicMember(members[i]);
          if (member && currentMemberId !== member.id && member.status === 'enabled') {
            // mention �Է½� text �Է� ȭ�鿡 �������� �� text
            member.exViewName = '[@' + member.name + ']';

            // member �˻��� ���� text
            member.exSearchName = member.name;
            mentionList.push(member);
          }
        }

        if (mentionList && mentionList.length > 1) {
          // mention ������ ������ member�� 2�� �̻��̶��
          // 2���̻��� member ��ü���� mention �ϴ� all�� ������

          mentionList = _.sortBy(mentionList, 'exSearchName');

          mentionList.unshift({
            // mention item ��¿� text
            name: MENTION_ALL_ITEM_TEXT,
            // mention target�� ��¿� text
            exViewName : '[@' + MENTION_ALL + ']',
            // mention search text
            exSearchName: 'topic',
            u_photoThumbnailUrl: {
              smallThumbnailUrl: configuration.assets_url + 'assets/images/mention_profile_all.png'
            },
            id: entityId,
            type: 'room'
          });
        }

        setMentions(mentionList);
      }
    }

    /**
     * mention ahead list ������.
     * @param mentionList
     */
    function setMentions(mentionList) {
      var mentionMap = {};

      // �ߺ� user name�� ���� ó��
      _removeDuplicateMentionItem(mentionList, mentionMap);

      $scope.mentionList = mentionList;
      $scope._mentionMap = mentionMap;

      if (!$scope.hasOn && mentionList.length > 0) {
        // mention ahead�� ����� item�� �����ϰ� event listener�� ������� �ʾҴٸ� ������
        $scope.hasOn = true;
        $scope.on();
      }
    }

    /**
     * mention list�� user name�� �ߺ��Ǵ� member�� �����Ѵٸ� mention list������ ����������
     * mention�� �������� �ʵ��� mention map���� ������.
     * @param mentionList
     * @param mentionMap
     * @private
     */
    function _removeDuplicateMentionItem(mentionList, mentionMap) {
      var duplicateNameMentions = [];
      var mentionItem;
      var i;
      var len;

      for (i = 0, len = mentionList.length; i < len; ++i) {
        mentionItem = mentionList[i];
        if (duplicateNameMentions.indexOf(mentionItem.exViewName) < 0) {
          mentionMap[mentionItem.exViewName] = mentionItem;
          duplicateNameMentions.push(mentionItem.exViewName);
        } else {
          delete mentionMap[mentionItem.exViewName];
        }
      }
    }

    /**
     * ���� topic�� member object�� ������.
     * @param {number} memberId
     * @returns {*}
     * @private
     */
    function _getCurrentTopicMember(memberId) {
      return entityAPIservice.getEntityFromListById($originScope.totalEntities, memberId);
    }

    /**
     * mention �Է����� ó���� value�� ������.
     * @returns {*}
     */
    function getValue() {
      return $scope._value;
    }

    /**
     * mention �Է����� ó���� value�� ������.
     * @param {string} value
     */
    function setValue(value) {
      $scope._value = value;
    }

    /**
     * mention ahead�� ��������� ����.
     * @returns {boolean}
     */
    function isShowMentionahead() {
      return $model.$viewValue !== null;
    }

    /**
     * element�� cursor �������� mention�� ������.
     */
    function setMentionOnLive() {
      var value = getValue();
      var selectionBegin = _getSelection().begin;

      $scope.mention = MentionExtractor.getMentionOnCursor(value, selectionBegin);
    }

    /**
     * text ��ü�� Ȯ���Ͽ� mention �Է��� object�� ������
     * @returns {{msg: string, mentions: Array}}
     */
    function getMentions() {
      var value = getValue();

      return MentionExtractor.getMentionAllForText(value, $scope._mentionMap);
    }

    /**
     * mention �Է����� ����
     * @returns {boolean}
     */
    function isInputMention() {
      return $model.$viewValue !== null;
    }

    /**
     * mentionahead�� �����
     */
    function showMentionahead() {
      var mention = $scope.mention;

      if (mention) {
        $model.$setViewValue(mention.match[2]);
      } else {
        // mention�� �������� �ʴ´ٸ� mentionahead�� ������� ����
        clearMention();
      }
    }

    /**
     * mention �Է��� clear��.
     */
    function clearMention() {
      $model.$setViewValue(null);
    }

    /**
     * element�� selection�� ������.
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
     * element�� slection�� ������.
     * @param {string|number} begin
     * @param {string|number} end
     * @private
     */
    function _setSelection(begin, end) {
      var ele = $scope.jqEle[0];

      end === null && (end = begin);
      ele.setSelectionRange(begin, end);
    }



    /**
     * mentionahead���� Ư�� mention ���� event callback
     * @param {object} $item
     */
    function onSelect($item) {
      var currentEntity;
      var msg;

      if ($item.name === MENTION_ALL_ITEM_TEXT) {
        // ��� member���� mention

        currentEntity = currentSessionHelper.getCurrentEntity();
        msg = $filter('translate')('@mention-all-confirm');

        msg = msg
          .replace('{{topicName}}', '\'' + currentEntity.name + '\'')
          .replace('{{topicParticipantsCount}}', entityAPIservice.getMemberLength(currentEntity));

        if ($window.confirm(msg)) {
          _onSelect($item);
        }
      } else {
        _onSelect($item);
      }
    }

    /**
     * mentionahead���� Ư�� mention ���� event callback
     * @param {object} $item
     * @private
     */
    function _onSelect($item) {
      var mention = $scope.mention;
      var mentionTarget = $item.exViewName;
      var extraText = ' ';
      var text;
      var selection;

      // mention �Է� �� text �缳��
      text = mention.preStr.replace(new RegExp(mention.match[1] + '$'), mentionTarget) + extraText + mention.sufStr;
      $scope.jqEle.val(text);
      setValue(text);

      selection = mention.offset + mentionTarget.length + extraText.length;

      // mention �Է� �� element selection ��ġ ����
      setTimeout(function() {
        _setSelection(selection);
      }, 10);

      // mention clear
      clearMention();
    }

    /**
     * mentionahead�� �Է��� ���� match event callback
     * @param matches
     */
    function onMatches(matches) {
      if (!matches.length) {
        // �Է°��� match �Ǵ� item�� �������� �ʴ´ٸ� mention clear
        clearMention();
      }
    }

    /**
     * hook message ���� �Լ�
     * message �Է��ϴ� element���� �Է��� ���� mention ahead���� ó���ϹǷ�
     * mention �Է��ϴ� ���ȿ��� message submit ������� �ʵ��� ��.
     * @param attrs
     * @param originMessageSubmit
     * @private
     */
    function _hookMessageSubmit(attrs, originMessageSubmit) {
      attrs.messageSubmit = function() {
        if (!that.isInputMention() || !$scope.hasOn) {
          $originScope.$eval(originMessageSubmit);
        }
      };
    }
  }
}());
