/**
 * @fileoverview member item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MemberItemRenderer', MemberItemRenderer);

  /* @ngInject */
  function MemberItemRenderer($filter, memberService, currentSessionHelper, SearchTypeUser) {
    var _translate = $filter('translate');

    var _template;

    this.render = render;

    _init();

    function _init() {
      _template = Handlebars.templates['modal.member.list.item'];
    }

    /**
     * member item을 랜더링한다.
     * @param {object} data
     * @param {string} filterText
     * @param {string} filterType
     * @returns {*}
     */
    function render(data, filterText, filterType) {
      data = _convertData(data);
      var isAdmin = _isAdmin(data.id);
      var isInactive = data.isInactive;

      return _template({
        text: {
          admin: _translate('@common-team-admin'),
          invitationResend: _translate('@dummy-invitation-resend')
        },
        html: _getHtml(data, filterText, filterType),
        css: {
          admin: isAdmin ? 'admin' : '',
          memberItem: memberService.isJandiBot(data.id) ? 'jandi-bot' : '',
          memberName: isInactive || isAdmin ? 'short' : ''
        },
        profileImage: memberService.getProfileImage(data.id, 'small'),
        starClass: data.isStarred ? 'icon-star-on' : '',
        isShowStar: !data.isDeactive && data.id !== memberService.getMemberId(),
        itemHeight: 68,
        isAdmin: isAdmin,
        isInactive: isInactive
      });
    }

    /**
     * template에서 사용항 html 전달
     * @param {object} data
     * @param {string} filterText
     * @param {string} filterType
     * @returns {{userName: *, extraText: *}}
     * @private
     */
    function _getHtml(data, filterText, filterType) {
      var userName;
      var extraText;
      
      if (SearchTypeUser.isName(filterType)) {
        userName = $filter('typeaheadHighlight')(data.name, filterText);
        extraText = $filter('htmlEncode')(data.position) || '';
      } else {
        userName = data.name;
        extraText = $filter('typeaheadHighlight')($filter('htmlEncode')(data[filterType]), filterText) || '';
      }

      return {
        userName: userName,
        extraText: extraText
      };
    }

    /**
     * render에서 사용가능한 data로 변환
     * @param {object} data
     * @returns {{id: *, name: *, isStarred: (*|boolean), isDeactive: isDeactivatedMember, query: *}}
     * @private
     */
    function _convertData(data) {
      var value = {
        id: data.id,
        name: data.extEncodedName,
        email: data.u_email,
        status: data.u_statusMessage,
        isStarred: data.isStarred,
        isDeactive: memberService.isDeactivatedMember(data),
        isInactive: memberService.isInactiveUser(data)
      };

      if (data.u_extraData) {
        value.department = data.u_extraData.department;
        value.position = data.u_extraData.position;
        value.phone = data.u_extraData.phoneNumber;
      } else if (memberService.isJandiBot(data.id)) {
        value.status = _translate('@jandi-bot-status');
      }

      return value;
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
