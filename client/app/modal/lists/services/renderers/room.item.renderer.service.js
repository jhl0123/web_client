/**
 * @fileoverview room item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RoomItemRenderer', RoomItemRenderer);

  /* @ngInject */
  function RoomItemRenderer($filter, memberService) {
    var that = this;
    var unjoinedChannelMsg = $filter('translate')('@quick-launcher-unjoin-topic');
    var _template;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _template = Handlebars.templates['modal.room.list.item'];

      that.render = render;
    }

    /**
     * room item을 랜더링한다.
     * @param {object} data
     * @returns {*}
     */
    function render(data, filterText) {
      data = _convertData(data);

      return _template({
        html: {
          roomTypeImage: _getRoomTypeImage(data),
          content: $filter('typeaheadHighlight')(data.name, filterText),
          unjoinedChannel: unjoinedChannelMsg
        },
        css: {
          roomItem: memberService.isJandiBot(data.id) ? 'jandi-bot' : '',
          unjoinedChannel: data.isUnjoinedChannel ? 'unjoined-channel-name' : ''
        },
        isUnjoinedChannel: data.isUnjoinedChannel,
        hasCount: _.isNumber(data.count) && data.count > 0,
        count: data.count,
        itemHeight: 44
      });
    }

    /**
     * room type을 표현하는 image를 전달한다.
     * @param {object} data
     * @returns {*}
     * @private
     */
    function _getRoomTypeImage(data) {
      var roomTypeImage;
      switch(data.type) {
        case 'users':
        case 'bots':
          roomTypeImage = '<img class="room-type-image" src="' + data.profileImage + '" />';
          break;
        case 'channels':
          roomTypeImage = '<i class="icon-topic room-type-image"></i>';
          break;
        case 'privategroups':
          roomTypeImage = '<i class="icon-lock room-type-image"></i>';
          break;
      }

      return roomTypeImage;
    }

    /**
     * render에서 사용가능한 data로 변환
     * @param {object} data
     * @returns {{type: *, id: *, name: *, status: status, profileImage: *, count: (string|number|*)}}
     * @private
     */
    function _convertData(data) {
      return {
        type: data.type,
        id: data.id,
        name: data.extEncodedName,
        status: data.status,
        profileImage: memberService.getProfileImage(data.id),
        count: data.count || data.alarmCnt,
        isUnjoinedChannel: !!data.isUnjoinedChannel
      };
    }
  }
})();
