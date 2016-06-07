/**
 * @fileoverview 잔디 커넥트 union 공통 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectUnion', JndConnectUnion);


  function JndConnectUnion($filter, memberService, JndConnectUnionApi, JndConnect, JndUtil, Dialog, language, jndPubSub,
                           JndConnectApi, CoreUtil) {
    var LANGUAGE_MAP = {
      ko: 'ko',
      ja: 'ja',
      en_US: 'en',
      zh_TW: 'zh-tw',
      zh_CN: 'zh-cn'
    };
    this.getDefaultHeader = getDefaultHeader;
    this.getDefaultFooter = getDefaultFooter;
    this.notifySave = notifySave;
    this.save = save;
    this.read = read;
    this.showLoading = showLoading;
    this.hideLoading = hideLoading;
    this.handleCommonLoadError = handleCommonLoadError;
    this.setHeaderAccountData = setHeaderAccountData;

    /**
     * loading 을 보인다.
     */
    function showLoading() {
      jndPubSub.pub('JndConnectUnion:showLoading');
    }

    /**
     * loading 을 감춘다.
     */
    function hideLoading() {
      jndPubSub.pub('JndConnectUnion:hideLoading');
    }

    /**
     * header default 데이터를 반환한다.
     * @param {object} current - current union 객체
     */
    function getDefaultHeader(current) {
      return {
        isAccountLoaded: false,
        accountId: null,
        accounts: [],
        current: current,
        memberId: memberService.getMemberId(),
        createdAt: null,
        isActive: false
      };
    }

    /**
     * footer default 데이터를 반환한다.
     * @param {object} current - current union 객체
     */
    function getDefaultFooter(current) {
      var botName = CoreUtil.pick(current, 'union', 'title');
      return {
        botThumbnailFile: CoreUtil.pick(current, 'union', 'imageUrl'),
        botName: botName,
        defaultBotName: botName,
        lang: LANGUAGE_MAP[language.preferences.language]
      };
    }

    /**
     * 저장된 커넥트 정보를 조회한다.
     * @param {object} options
     *    @param {string} options.current - current union 객체
     *    @param {object} [options.header]  - 공통 header 데이터 object
     *    @param {object} [options.footer]  - 공통 footer 데이터 object
     * @returns {*}
     */
    function read(options) {
      var name = CoreUtil.pick(options, 'current', 'union', 'name');
      var connectId = CoreUtil.pick(options, 'current', 'connectId');
      return JndConnectUnionApi.read(name, connectId)
        .success(_.bind(_onSuccessRead, this, options))
        .error(_.bind(_onErrorRead, this, options));
    }

    /**
     * read 실패시 핸들러
     * @param {object} options
     *    @param {string} options.current - current union 객체
     *    @param {object} [options.header]  - 공통 header 데이터 object
     *    @param {object} [options.footer]  - 공통 footer 데이터 object
     * @param {object} err
     * @param {number} status
     * @private
     */
    function _onErrorRead(options, err, status) {
      if (!JndConnectApi.handleError(err, status)) {
        handleCommonLoadError(options.current, err, status);
      }
    }

    /**
     * Loading 시 일반적인 오류 처리
     * @param {object} current
     * @param {object} err
     * @param {number} status - http status
     */
    function handleCommonLoadError(current, err, status) {
      var body;
      var serviceName = CoreUtil.pick(current, 'union', 'title');
      var code = CoreUtil.pick(err, 'code');
      JndConnect.backToMain(true);
      if (code === 50001) {
        body = $filter('translate')('@jnd-connect-215')
          .replace('{{serviceName}}', serviceName);
        Dialog.alert({
          allowHtml: true,
          body: body
        });
      } else {
        _onErrorCommon(err, status);
      }
    }

    /**
     * 커넥트를 저장한다.
     * @param {object} options
     *    @param {string} options.current - current union 객체
     *    @param {object} options.data - request 할 데이터
     * @returns {*}
     */
    function save(options) {
      var promise;
      var name = CoreUtil.pick(options, 'current', 'union', 'name');
      var connectId = CoreUtil.pick(options, 'current', 'connectId');
      var isUpdate = !!connectId;
      var data = _.extend(options.data, {
        connectId: connectId
      });

      if (isUpdate) {
        promise = JndConnectUnionApi.update(name, data)
          .success(_onSuccessUpdate)
          .error(_onErrorCommon);
      } else {
        promise = JndConnectUnionApi.create(name, data)
          .success(_onSuccessCreate)
          .error(_onErrorCreate);
      }
      return promise;
    }

    /**
     * read 성공 콜백
     * @param {object} options
     *    @param {object} [options.header]  - 공통 header 데이터 object
     *    @param {object} [options.footer]  - 공통 footer 데이터 object
     * @param {object} response
     * @private
     */
    function _onSuccessRead(options, response) {
      var header = options.header;
      var footer = options.footer;
      if (header) {
        if (response.authenticationName && response.authenticationId) {
          setHeaderAccountData(header, {
            accountList: [response],
            isAccountLoaded: false
          });
        }

        _.extend(header, {
          createdAt: response.createdAt,
          isActive: response.status === 'enabled'
        });
      }
      if (footer) {
        _.extend(footer, {
          botName: response.botName,
          botThumbnailFile: response.botThumbnailUrl,
          lang: response.lang
        });
      }
    }

    /**
     * 공통 header 데이터에서 account 관련 데이터를 주입 한다.
     * @param {object} header - 공통 header
     * @param {object} options
     *    @param {array} options.accountList - 계정 리스트
     *      @param {string} options.accountList[].authenticationName - 노출할 계정 정보
     *      @param {number|string} options.accountList[].authenticationId - 계정의 키값
     *    @param {string} [options.accountValue] - 선택할 계정 값
     *    @param {string} [options.isAccountLoaded=true] - 로드 되었다고 표시할지 여부
     *
     */
    function setHeaderAccountData(header, options) {
      var accounts;
      var index;
      var accountList = options.accountList;
      var accountValue = options.accountValue;
      var isAccountLoaded = _.isBoolean(options.isAccountLoaded) ? options.isAccountLoaded : true;

      if (header) {
        accounts = _.map(accountList, function(account) {
          return {
            text: account.authenticationName,
            value: account.authenticationId,
            connectCount: account.connectCount || 0
          };
        });

        if (accountValue != null) {
          index = _.findIndex(accounts, 'text', accountValue);
        }
        index = index || 0;

        _.extend(header, {
          isAccountLoaded: isAccountLoaded,
          accountId: CoreUtil.pick(accountList, index, 'authenticationId'),
          accounts: accounts
        });
      }
    }

    /**
     * 오류 콜백
     * @param {object} err
     * @param {number} status
     * @private
     */
    function _onErrorCommon(err, status) {
      if (!JndConnectApi.handleError(err, status)) {
        JndUtil.alertUnknownError(err, status);
      }
    }

    /**
     * 업데이트 성공 콜백
     * @private
     */
    function _onSuccessUpdate() {
      Dialog.success({
        body: $filter('translate')('@jnd-connect-208'),
        allowHtml: true
      });
      JndConnect.backToMain(true);
    }

    /**
     * 생성 성공 콜백
     * @private
     */
    function _onSuccessCreate() {
      Dialog.success({
        body: $filter('translate')('@jnd-connect-186'),
        allowHtml: true
      });
      JndConnect.backToMain(true);
    }

    /**
     * 생성 오류 콜백
     * @param {object} err
     * @param {number} status
     * @private
     */
    function _onErrorCreate(err, status) {
      if (!JndConnectApi.handleError(err, status)) {
        //connect 100개 이상 추가시 오류
        if (err.code === 40305) {
          Dialog.error({
            body: $filter('translate')('@jnd-connect-183'),
            allowHtml: true
          });
        } else {
          _onErrorCommon(err, status);
        }
      }
    }

    /**
     * 설정을 저장한다.
     */
    function notifySave() {
      jndPubSub.pub('JndConnectUnion:save');
    }
  }
})();
