/**
 * @fileoverview topic item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicItemRenderer', TopicItemRenderer);

  /* @ngInject */
  function TopicItemRenderer($filter, RoomTopicList) {
    var _template;

    this.render = render;

    _init();

    function _init() {
      _template = Handlebars.templates['modal.topic.list.item'];
    }

    /**
     * topic item을 랜더링한다.
     * @param {object} data
     * @param {string} filterText
     * @returns {*}
     */
    function render(data, filterText) {
      data = _convertData(data);

      return _template({
        css: {
          topicIcon: data.isPublic ? 'icon-topic' : 'icon-lock'
        },
        html: {
          topicName: $filter('typeaheadHighlight')(data.name, filterText)
        },
        createTime: data.createTime,
        topicDescription: data.topicDescription,
        creatorName: data.creatorName,
        userCount: data.userCount,
        commonJoinedMessage: $filter('translate')('@common-joined'),
        itemHeight: !!data.topicDescription ? 130 : 77
      });
    }

    /**
     * render에서 사용가능한 data로 변환
     * @param {object} data
     * @returns {{type: *, id: *, name: *, status: status, profileImage: *, count: (string|number|*)}}
     * @private
     */
    function _convertData(data) {
      var isPublic = RoomTopicList.isPublic(data.id);
      var createTime = isPublic ? data.ch_createTime : data.pg_createTime;
      var creatorId = isPublic ? data.ch_creatorId : data.pg_creatorId;

      return {
        name: data.name,
        createTime: $filter('getyyyyMMddformat')(createTime),
        topicDescription: data.description,
        creatorName: $filter('getName')(creatorId),
        userCount: RoomTopicList.getUserLength(data.id),
        isPublic: isPublic
      };
    }
  }
})();
