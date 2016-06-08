/**
 * @fileoverview Constant 서비스. Analytics Module내에서 사용되는 모든 Constant를 관리하는 서비스 
 *               Event와 Property들의 무결성을 보장하기 위해 사용한다.(=오타방지)
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsConstant', AnalyticsConstant);

  /* @ngInject */
  function AnalyticsConstant() {
    
    this.LOG = {
      EVENT: 'ev',
      IDENTIFY: 'id',
      PROPERTIES: 'pr',
      PLATFORM: 'pl'
    };
    
    this.LANGUAGE_MAP = {
      'en_US': 'en',
      'ko': 'kr',
      'jp': 'ja',
      'zh_CN': 'zh-cn',
      'zh_TW': 'zh-tw'
    };

    this.PLATFORM = {
      WEB: 'web',
      WIN_APP: 'winapp',
      MAC_APP: 'macapp'
    };

    this.CHANNEL = 'app';
    this.LOCAL_STORAGE_KEY = '_jd_.analytics';
    this.SESSION_STORAGE_KEY = '_jd_.analytics_session';

    this.DEFAULT_PROPERTY = {
      WINDOW_HEIGHT: 'windowHeight',
      WINDOW_WIDTH: 'windowWidth',
      REPOSITORY: 'repository',
      LANGUAGE: 'language'
    };


    this.PROPERTY = {
      CHANNEL: 'p0',
      BROWSER_HEIGHT: 'p1',
      BROWSER_WIDTH: 'p2',
      BROWSER_LANGUAGE: 'p3',
      LANGUAGE: 'p4',
      SYSTEM_HEIGHT: 'p5',
      SYSTEM_WIDTH: 'p6',
      USER_AGENT: 'p7',
      REFERRER: 'p8',
      PAGE: 'p9',
      BUTTON_NAME: 'p10',
      PREVIOUS_LANGUAGE: 'p11',
      CURRENT_LANGUAGE: 'p12',
      RESPONSE_SUCCESS: 'p13',
      ERROR_CODE: 'p14',
      CAMPAIGN_NAME: 'p15',
      CAMPAIGN_SOURCE: 'p16',
      CAMPAIGN_MEDIUM: 'p17',
      PROMOTION_CODE: 'p18',
      EMAIL: 'p19',
      TEAM_ID: 'p20',
      MEMBER_ID: 'p21',
      TOPIC_ID: 'p22',
      FILE_ID: 'p23',
      SEARCH_KEYWORD: 'p24', 
      AUTO_SIGN_IN: 'p25',
      MESSAGE_ID: 'p26',
      MEMBER_COUNT: 'p39',
      BUTTON_POSITION: 'p44',
      KEY_UP_RESULT: 'p45'
    };

    this.IDENTIFY = {
      ACCOUNT_ID: 'a',
      SESSION: 's',
      TOKEN: 't',
      MEMBER_ID: 'm'
    };

    this.PAGE = {
      'topic/public': 21,
      'topic/private': 22,
      'directmessage': 23,
      'files/files' : 24,
      'files/messages': 25,
      'profile': 26,
      'invite': 27,
      'switchteams': 28,
      'currentmembers': 29,
      'disabledmembers': 30,
      'notifications': 31,
      'topic/invite': 32,
      'files/detail': 33,
      'files/share': 34,
      'files/upload': 35,
      'topic/browse': 36,
      'topic/create': 37,
      'terms/service': 38,
      'private/policy': 39,
      'topic/profile': 40,
      'signin': 41
    };

    //TODO: Event 명 다 바뀔 예정
    this.EVENT = {
      PAGE_VIEWED: 'e0',
      BUTTON_CLICK: 'e1',
      SESSION_START: 'e2',
      WINDOW_FOCUS: 'e3',
      WINDOW_BLUR: 'e4',
      WINDOW_CLOSE: 'e52',
      LANGUAGE_CHANGE: 'e5',
      SIGN_IN: 'e6',
      SIGN_OUT: 'e12',
      TOPIC_CREATE: 'e31',
      TOPIC_MEMBER_INVITE: 'e32',
      TOPIC_STAR: 'e33',
      TOPIC_UNSTAR: 'e34',
      TOPIC_NAME_CHANGE: 'e35',
      TOPIC_LEAVE: 'e36',
      TOPIC_DELETE: 'e37',
      FILE_UPLOAD: 'e38',
      FILE_DOWNLOAD: 'e39',
      FILE_SHARE: 'e40',
      FILE_UNSHARE: 'e41',
      FILE_DELETE: 'e42',
      FILE_KEYWORD_SEARCH: 'e43',
      MESSAGE_POST: 'e44',
      MESSAGE_KEYWORD_SEARCH: 'e45',
      MESSAGE_DELETE: 'e46',
      TOPIC_JOIN: 'e49',
      KEY_UP: 'e58',
      TOPIC_ENTER: 'e59'
    };
  }
})();
