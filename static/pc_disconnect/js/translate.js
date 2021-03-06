/**
 * @fileoverview L10N 설정 파일
 */
'use strict';
(function() {
  var JND = window.JND = window.JND || {};
  var L10N = {
    'en_US': {
      'common-network-disconnect-header': 'It seems you are not connected to the Internet.',
      'common-network-disconnect-body': 'JANDI will automatically reconnect when it\'s available.',
      'common-retry': 'Retry'
    },
    'ko': {
      'common-network-disconnect-header': '현재 네트워크에 접속되지 않은 것으로 보입니다.',
      'common-network-disconnect-body': '네트워크가 복구되면 자동으로 잔디에 접속됩니다.',
      'common-network-connect': '네트워크가 복구되면 자동으로 잔디에 접속됩니다.',
      'common-retry': '재시도'
    },
    'zh_CN': {
      'common-network-disconnect-header': '目前为无网络状态 JANDI会于连上网络后， ',
      'common-network-disconnect-body': '自动重新链接',
      'common-retry': '重试'
    },
    'zh_TW': {
      'common-network-disconnect-header': '目前為無網路狀態 JANDI會於連上網路後，',
      'common-network-disconnect-body': '自動重新連結',
      'common-retry': '重试'
    },
    'ja': {
      'common-network-disconnect-header': '現在ネットワークに接続されていません。',
      'common-network-disconnect-body': 'ネットワークが復元されると、自動的にジヤンでィーに接続されます',
      'common-retry': '再試圖'
    }
  };
  JND.L10N = L10N;
})();
