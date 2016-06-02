/**
 * @fileoverview 해당 계정으로 다수 컴포넌트의 "다시 보지 않기" 설정을 조회하고 기록하는 서비스
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('AccountHasSeen', AccountHasSeen);

  /* @ngInject */
  function AccountHasSeen($http, configuration, accountService) {
    /*
      naming 규칙:
        가이드  - GUIDE_XXX_XXX
        공지   - NOTICE_XXX_XXX
     */
    var KEY_MAP = {
      'GUIDE_TOPIC_FOLDER': 0,
      'GUIDE_CONNECT': 1,
      'TUTORIAL_VER3_WELCOME': 2,
      'TUTORIAL_VER3_POPOVER': 3,
      'STICKER_DINGO': 4
    };

    this.get = get;
    this.set = set;
    var server_address = configuration.server_address;

    /**
     * key 에 해당하는 정보를 가져온다.
     * @param {string} key - KEY_MAP 에 정의된 키 스트링 : 'GUIDE_TOPIC_FOLDER'
     * @returns {boolean}
     */
    function get(key) {
      var index = _getIndex(key);
      var account = accountService.getAccount();
      var flagStr;
      var flags;

      if (!_.isUndefined(index)) {
        flagStr =  account.hasSeenFlags || '';
        flags = flagStr.split(',');
        return flags[index] === '1';
      } else {
        return false;
      }
    }

    /**
     * key 에 정보를 기록한다.
     * @param {string} key - KEY_MAP 에 정의된 키 스트링 : 'GUIDE_TOPIC_FOLDER'
     * @param {boolean} isHasSeen - 설정값
     */
    function set(key, isHasSeen) {
      var index = _getIndex(key);
      var account = accountService.getAccount();
      var flagStr;
      var flags;

      if (!_.isUndefined(index)) {
        flagStr =  account.hasSeenFlags || '';
        flags = flagStr.split(',');
        flags[index] = isHasSeen ? 1 : 0;
        _.forEach(flags, function(flag, i) {
          flags[i] = parseInt(flag, 10) === 1 ? '1' : '0';
        });
        flagStr = flags.join(',');
        account.hasSeenFlags = flagStr;
        $http({
          method: 'PUT',
          url: server_address + 'settings/hasSeenFlags',
          data: {
            flags: flagStr
          }
        });
      }
    }

    /**
     * key 값에 해당하는 index 를 반환한다.
     * @param {string} key - KEY_MAP 에 정의된 키 스트링 : 'GUIDE_TOPIC_FOLDER'
     * @returns {number}
     * @private
     */
    function _getIndex(key) {
      return KEY_MAP[key];
    }
  }
})();
