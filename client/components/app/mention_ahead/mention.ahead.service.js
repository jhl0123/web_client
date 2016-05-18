/**
 * @fileoverview extract mention
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .service('Mentionahead', Mentionahead);

  /* @ngInject */
  function Mentionahead($filter, memberService, EntityHandler, configuration, jndKeyCode, RoomTopicList, UserList,
                        BotList) {
    var that = this;

    var regxLiveSearchTextMentionMarkDown = /(?:(?:^|\s)(?:[^\[]?)([@\uff20]((?:[^@\uff20]|[\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?\[\]\^_{|}~\$][^ ]){0,30})))$/;
    var rStrContSearchTextMentionMarkDown = '\\[(@([^\\[]|.[^\\[]{0,30}))\\]';
    var regxKr = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    that.MENTION_WITH_CHAR = 'mentionWithChar';
    that.OPEN = 'open';
    that.CLOSE = 'close';

    that.MENTION_ALL = 'all';
    that.MENTION_ALL_ITEM_TEXT = $filter('translate')('@mention-all');

    that.getMentionOnCursor = getMentionOnCursor;
    that.getMentionAllForText = getMentionAllForText;
    that.getSingleMentionItems = getSingleMentionItems;
    that.getMentionListForTopic = getMentionListForTopic;
    that.getMentionListForFile = getMentionListForFile;
    that.getMentionListForUploading = getMentionListForUploading;

    that.isOpen = isOpen;

    /**
     * cursor 기준으로 mention data를 찾아 전달함.
     * @param {object} event
     * @param {string} fullText
     * @param {number} begin - cursor 시작점
     * @returns {*}
     */
    function getMentionOnCursor(event, fullText, begin) {
      var preStr;
      var match;
      var mention;
      var nextChar;

      if (fullText != null) {

        // keyup 이벤트로 값 입력시 cursor의 다음 문자가 한글이라면 cursor 값을 1증가 시킴.
        // 한글은 '@박현' 입력시 '박'자와 '현'자 사이에 cursor가 위치하므로 올바른 mention list를
        // 출력하지 못하기 때문에 따로 처리함.
        if (event.type === 'keyup' &&
            !(jndKeyCode.match('LEFT_ARROW', event.which) || jndKeyCode.match('UP_ARROW', event.which) ||  jndKeyCode.match('RIGHT_ARROW', event.which) ||  jndKeyCode.match('DOWN_ARROW', event.which))) {
          nextChar = fullText.substring(begin, begin + 1);
          if (regxKr.test(nextChar)) {
            begin += 1;
          }
        }

        // cursor 기준 앞에 입력된 text를 check
        preStr = fullText.substring(0, begin);

        if (match = regxLiveSearchTextMentionMarkDown.exec(preStr)) {
          mention = {
            preStr: preStr,
            sufStr: fullText.substring(begin),
            match: match,
            offset: begin - match[1].length,
            length: match[1].length
          };
        }
      }

      return mention;
    }

    /**
     * text 전체를 확인하여 mention 입력인 object를 전달함
     * @param {string} fullText
     * @param {object} mentionMap - mention 가능 member name
     * @param {number} entityId
     * @returns {{msg: string, mentions: Array}}
     */
    function getMentionAllForText(fullText, mentionMap, entityId) {
      var regxMention = new RegExp(rStrContSearchTextMentionMarkDown, 'g');
      var msg = '';
      var str;
      var match;
      var mentions = [];
      var data;
      var beginIndex = 0;
      var lastIndex = 0;
      var offset = 0;

      // 입력값 trim
      fullText && (fullText = fullText.trim());

      while(match = regxMention.exec(fullText)) {
        beginIndex = lastIndex;
        lastIndex = regxMention.lastIndex;

        if (mentionMap[match[0]]) {
          str = fullText.substring(beginIndex, lastIndex).replace(match[0] , match[1]);
          msg = msg + str;

          beginIndex = lastIndex;
          data = {
            offset: lastIndex - match[0].length - offset,
            length: match[1].length
          };
          offset += match[0].length - match[1].length;

          if (match[2] === that.MENTION_ALL) {
            // 모든 member에게 mention

            data.id = parseInt(entityId, 10);
            data.type = 'room';
          } else {
            // 특정 member에게 mention

            data.id = parseInt(mentionMap[match[0]].id, 10);
            data.type = 'member';
          }

          mentions.push(data);
        } else {
          msg = msg + fullText.substring(beginIndex, lastIndex);
        }
      }

      if (mentions.length > 0) {
        return {
          msg: msg + fullText.substring(beginIndex),
          mentions: mentions
        };
      }
    }

    /**
     * mention list에 user name이 중복되지 않는 memtion item을 선별하여 mention map을 전달함.
     * @param {array} mentionList
     * @private
     */
    function getSingleMentionItems(mentionList) {
      var mentionMap = {};
      var duplicateNameMentions = [];
      var mentionItem;
      var i;
      var len;

      for (i = 0, len = mentionList.length; i < len; ++i) {
        mentionItem = mentionList[i];
        if (duplicateNameMentions.indexOf(mentionItem.extViewName) < 0) {
          mentionMap[mentionItem.extViewName] = mentionItem;
          duplicateNameMentions.push(mentionItem.extViewName);
        } else {
          delete mentionMap[mentionItem.extViewName];
        }
      }

      return mentionMap;
    }

    /**
     * topic에서 mention 가능한 list를 전달한다.
     * @param {array} members
     * @param {number} entityId
     * @returns {Array}
     */
    function getMentionListForTopic(entityId) {
      var mentionList = _getMentionList(entityId);

      _addJandiBot(mentionList);

      mentionList.unshift({
        // mention item 출력용 text
        name: that.MENTION_ALL_ITEM_TEXT,
        // mention target에 출력용 text
        extViewName : '[@' + that.MENTION_ALL + ']',
        // mention search text
        extSearchName: 'all',
        extProfileImage: configuration.assets_url + 'assets/images/mention_profile_all.png',
        extIsMentionAll: true,
        id: entityId,
        type: 'room'
      });

      return mentionList;
    }

    /**
     * file에서 mention 가능한 list를 전달한다.
     * @param {object} file
     * @returns {Array}
     */
    function getMentionListForFile(file) {
      var mentionList = [];
      var sharedEntities;

      var hasTopic;

      if (file) {
        sharedEntities = file.shareEntities;

        // 공유된 room 마다 mention 가능한 member를 설정함
        _.each(sharedEntities, function (sharedEntity) {
          if (RoomTopicList.isExist(sharedEntity)) {
            hasTopic = true;

            mentionList = _getMentionList(sharedEntity, mentionList);
          }
        });

        mentionList = _getUniqList(mentionList);

        if (hasTopic) {
          // file이 공유된 곳 중 topic이 존재하지 않는다면 jandi bot을 추가하지 않는다.

          _addJandiBot(mentionList);
        }
      }

      return mentionList;
    }

    /**
     * 업로드할 파일에 대해 mention 가능한 list를 전달
     * @param {number} entityId
     * @returns {*}
     * @private
     */
    function getMentionListForUploading(entityId) {
      var mentionList = _getMentionList(entityId);

      mentionList = _getUniqList(mentionList);

      _addJandiBot(mentionList);

      return mentionList;
    }

    /**
     * mention list 전달
     * @param {number} entityId
     * @param {array} mentionList
     * @returns {*|Array}
     * @private
     */
    function _getMentionList(entityId, mentionList) {
      var entity = EntityHandler.get(entityId);
      var users;
      var user;

      mentionList = mentionList || [];
      if (entity && /channels|privategroups/.test(entity.type)) {
        users = RoomTopicList.getUserIdList(entity.id);
        _.each(users, function (userId) {
          user = UserList.get(userId);
          if (_isMentionableUser(user)) {
            user.extViewName = '[@' + user.name + ']';
            user.extSearchName = user.name;
            user.extProfileImage = memberService.getProfileImage(user.id);
            mentionList.push(user);
          }
        });
      }

      return mentionList;
    }

    /**
     * mention 가능한 user 인지 여부를 반환한다.
     * @param user
     * @returns {*|boolean}
     * @private
     */
    function _isMentionableUser(user) {
      var currentMemberId = memberService.getMemberId();
      return !!(user && currentMemberId !== user.id &&
      (user.status === 'enabled' || user.status === 'inactive'));
    }

    /**
     * uniq 처리된 mention list 전달
     * @param {array} mentionList
     * @returns {*}
     * @private
     */
    function _getUniqList(mentionList) {
      return _.uniq(mentionList, 'id');
    }

    /**
     * jandi bot을 mention list에 추가한다.
     * @param {array} mentionList
     * @private
     */
    function _addJandiBot(mentionList) {
      var jandiBot = BotList.getJandiBot();

      if (jandiBot) {
        mentionList.unshift({
          name: jandiBot.name,
          extViewName: '[@' + jandiBot.name + ']',
          extSearchName: jandiBot.name,
          extProfileImage: memberService.getProfileImage(jandiBot.id),
          extIsJandiBot: true,
          id: jandiBot.id,
          type: 'member'
        });
      }
    }

    /**
     * mentionahead 열림 여부
     * @param {string} status
     * @returns {boolean}
     */
    function isOpen(status) {
      return status === that.MENTION_WITH_CHAR || status === that.OPEN;
    }
  }
}());
