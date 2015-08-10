/**
 * @fileoverview extract mention
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .service('MentionExtractor', MentionExtractor);

  /* @ngInject */
  function MentionExtractor() {
    var that = this;

    var regxLiveSearchTextMentionMarkDown = /(?:(?:^|\s)(?:[^\[]?)([@\uff20]((?:[^@\uff20]|[\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?\[\]\^_{|}~\$][^ ]){0,30})))$/;
    var rStrContSearchTextMentionMarkDown = '\\[(@([^\\[]|.[^\\[]{0,30}))\\]';

    that.getMentionOnCursor = getMentionOnCursor;
    that.getMentionAllForText = getMentionAllForText;
    /**
     * cursor �������� mention data�� ã�� ������.
     * @param {string} fullText
     * @param {number} begin - cursor ������
     * @returns {*}
     */
    function getMentionOnCursor(fullText, begin) {
      var preStr;
      var match;
      var mention;

      if (fullText != null) {

        // cursor ���� �տ� �Էµ� text�� check
        preStr = fullText.substring(0, begin);

        if (match = regxLiveSearchTextMentionMarkDown.exec(preStr)) {
          mention = {
            preStr: preStr,
            sufStr: fullText.substring(begin),
            match: match,
            offset: begin - match[1].length,
            length: match.length
          };
        }
      }

      return mention;
    }

    /**
     * text ��ü�� Ȯ���Ͽ� mention �Է��� object�� ������
     * @param {string} fullText
     * @param {object} mentionMap - mention ���� member name
     * @returns {{msg: string, mentions: Array}}
     */
    function getMentionAllForText(fullText, mentionMap) {
      var regxMention = new RegExp(rStrContSearchTextMentionMarkDown, 'g');
      var msg = '';
      var preStr;
      var match;
      var mentions = [];
      var data;
      var beginIndex = 0;
      var lastIndex;
      var offset = 0;

      // �Է°� trim
      fullText && (fullText = fullText.trim());

      while(match = regxMention.exec(fullText)) {
        if (mentionMap[match[0]]) {
          lastIndex = regxMention.lastIndex;

          preStr = fullText.substring(beginIndex, lastIndex).replace(match[0] , match[1]);
          msg = msg + preStr;

          beginIndex = lastIndex;
          data = {
            offset: lastIndex - match[0].length - offset,
            length: match[1].length
          };
          offset += match[0].length - match[1].length;

          if (match[2] === MENTION_ALL) {
            // ��� member���� mention

            data.id = parseInt(entityId, 10);
            data.type = 'room';
          } else {
            // Ư�� member���� mention

            data.id = parseInt(mentionMap[match[0]].id, 10);
            data.type = 'member';
          }

          mentions.push(data);
        }
      }

      if (mentions.length > 0) {
        return {
          msg: msg + fullText.substring(beginIndex),
          mentions: mentions
        };
      }
    }
  }
}());
