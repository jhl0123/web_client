/**
 * @fileoverview member item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MemberItemRenderer', MemberItemRenderer);

  /* @ngInject */
  function MemberItemRenderer($filter, memberService, currentSessionHelper) {
    var _nameOnlyTemplate;
    var _nameWithExtTemplate;

    this.render = render;

    _init();

    function _init() {
      _nameOnlyTemplate = Handlebars.templates['modal.member.list.item'];
      _nameWithExtTemplate = Handlebars.templates['modal.member.list.ext.item'];
    }

    /**
     * topic item을 랜더링한다.
     * @param {object} data
     * @param {string} filterText
     * @returns {*}
     */
    function render(data, filterText) {
      data = _convertData(data);
      var isAdmin = _isAdmin(data.id);

      return _nameOnlyTemplate({
        text: {
          admin: $filter('translate')('@common-team-admin')
        },
        html: {
          userName: $filter('typeaheadHighlight')(data.name, filterText)
        },
        css: {
          admin: isAdmin ? 'admin' : '',
          memberItem: memberService.isJandiBot(data.id) ? 'jandi-bot' : ''
        },
        profileImage: memberService.getProfileImage(data.id, 'small'),
        starClass: data.isStarred ? 'icon-star-on' : '',
        isShowStar: !data.isDeactive && data.id !== memberService.getMemberId(),
        itemHeight: 44,
        isAdmin: isAdmin
      });
    }

    /**
     * render에서 사용가능한 data로 변환
     * @param {object} data
     * @returns {{id: *, name: *, isStarred: (*|boolean), isDeactive: isDeactivatedMember, query: *}}
     * @private
     */
    function _convertData(data) {
      return {
        id: data.id,
        name: data.name,
        isStarred: data.isStarred,
        isDeactive: memberService.isDeactivatedMember(data)
      };
    }

    /**
     * 해당 member 가 admin 인지 여부를 반환한다.
     * @param {number} memberId
     * @returns {boolean}
     * @private
     */
    function _isAdmin(memberId) {
      var admin = currentSessionHelper.getCurrentTeamAdmin();
      return memberId === admin.id;
    }
  }
})();
