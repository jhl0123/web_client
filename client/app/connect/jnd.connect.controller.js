(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectCtrl', JndConnectCtrl);

  /* @ngInject */
  function JndConnectCtrl($scope, $timeout, $filter, $q, JndConnect, EntityHandler, JndConnectApi, JndUtil, language,
                          Dialog, JndConnectUnionFormData, JndConnectUnion) {

    var UNION_DATA = {
      '1': {
        name: 'googleCalendar',
        imageUrl: '',
        title: $filter('translate')('@jnd-connect-5'),
        desc: $filter('translate')('@jnd-connect-6'),
        hasAuth: false,
        popover: $filter('translate')('@jnd-connect-24'),
        isOpen: false
      },
      //'2': {
      //  name: 'googleDrive',
      //  icon: '',
      //  title: 'Google Drive',
      //  desc: 'Google Drive 에 등록된 파일을 잔디로 공유할 수 있습니다.',
      //  hasAuth: false,
      //  popover: ''
      //},
      '3': {
        name: 'github',
        imageUrl: '',
        title: $filter('translate')('@jnd-connect-15'),
        desc: $filter('translate')('@jnd-connect-16'),
        hasAuth: false,
        popover: $filter('translate')('@jnd-connect-23'),
        isOpen: false
      },
      //'4': {
      //  name: 'dropbox',
      //  icon: '',
      //  title: 'Dropbox',
      //  desc: 'Dropbox에 공유된 파일을 손쉽게 잔디로 공유할 수 있습니다.',
      //  hasAuth: false,
      //  popover: ''
      //},
      '5': {
        name: 'jira',
        imageUrl: '',
        title: $filter('translate')('@jnd-connect-17'),
        desc: $filter('translate')('@jnd-connect-18'),
        hasAuth: true,
        popover: $filter('translate')('@jnd-connect-25'),
        isOpen: false
      },
      '6': {
        name: 'trello',
        title: $filter('translate')('@jnd-connect-19'),
        desc: $filter('translate')('@jnd-connect-20'),
        hasAuth: false,
        popover: $filter('translate')('@jnd-connect-26')
      },
      '7': {
        name: 'incoming',
        title: $filter('translate')('@jnd-connect-21'),
        desc: $filter('translate')('@jnd-connect-22'),
        hasAuth: true,
        popover: $filter('translate')('@jnd-connect-27'),
        isOpen: false
      }
    };

    //$scope.list = UNION_LIST;
    $scope.current = {
      union: null,
      connectId: null,
      isShowAuth: false
    };
    $scope.surveyUrl = 'https://jandi.typeform.com/to/OtcRfH';
    $scope.isClose = false;
    $scope.unions = [];
    $scope.isBannerShow = true;

    $scope.historyBack = historyBack;
    $scope.close = JndConnect.close;
    $scope.closeBanner = closeBanner;
    $scope.save = JndConnectUnion.notifySave;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.isBannerShow = JndConnect.isBannerShow();
      _attachEvents();
      _initSurveyUrl();
      _requestAll();
    }

    /**
     * 설문조사 url 을 설정한다.
     * @private
     */
    function _initSurveyUrl() {
      var surveyUrl = 'https://jandi.typeform.com/to/OtcRfH';
      switch (language.preferences.language) {
        case 'ko':
          surveyUrl = 'https://jandi.typeform.com/to/rVKGjd';
          break;
        case 'ja':
          surveyUrl = 'https://jandi.typeform.com/to/ckpPJg';
          break;
        case 'en_US':
          surveyUrl = 'https://jandi.typeform.com/to/OtcRfH';
          break;
        case 'zh_TW':
          surveyUrl = 'https://jandi.typeform.com/to/sN8BQm';
          break;
        case 'zh_CN':
          surveyUrl = 'https://jandi.typeform.com/to/wTrKSI';
          break;
      }
      $scope.surveyUrl = surveyUrl || $scope.surveyUrl;
    }

    /**
     * close banner
     */
    function closeBanner() {
      $scope.isBannerShow = false;
      JndConnect.setBannerStatus($scope.isBannerShow);
    }

    /**
     * Connect Setting 을 위한 기본 정보 조회
     * @private
     */
    function _requestAll() {
      var deferred = $q.defer();
      var promises = [];
      
      JndConnect.showLoading();
      
      promises.push(JndConnectApi.getList());
      promises.push(JndConnectApi.getAllAuth());
      promises.push(JndConnectApi.getConnectInfo());

      $q.all(promises)
        .then(_onSuccessRequestAll, _onErrorRequestAll);
    }

    /**
     * request 가 모두 성공했을 경우 이벤트 핸들러
     * @param {Array} results 모든 request 에 대한 response
     * @private
     */
    function _onSuccessRequestAll(results) {
      _onSuccessGetList(results[0].data);
      _onSuccessGetAllAuth(results[1].data);
      _onSuccessGetConnectionInfo(results[2].data);
      _initializeLanding();
      JndConnect.hideLoading();
    }

    /**
     * Center panel 등을 통해 직접 서비스 수정 페이지로 진입할 경우, landing 관련 정보를 설정한다.
     * @private
     */
    function _initializeLanding() {
      if ($scope.params) {
        _setCurrent($scope.params);
      }
      $scope.params = null;
    }

    /**
     * 모든 인증 정보 조회 콜백 
     * @param {Array} response
     * @private
     */
    function _onSuccessGetAllAuth(response) {
      var union;
      var createdList;
      _.forEach(response, function(info) {
        union = _getUnion(info.id);
        createdList = _.filter(info.datas, function(data) {
          return data.status === 'created';
        });
        union.hasAuth = createdList.length || 0;
      });
    }

    /**
     * 기타 정보 성공 콜백 (bot default image url 을 포함한)  
     * @param {Array} response
     * @private
     */
    function _onSuccessGetConnectionInfo(response) {
      _.forEach(response.connects, function(info) {
        var union = _getUnion(info.name);
        union.imageUrl = info.botThumbnail;
      });
    }

    /**
     * 오류 발생했을 경우 오류 alert 을 노출하고 Connect 를 닫는다.
     * @private
     */
    function _onErrorRequestAll(results) {
      var length = results.length;
      _.forEach(results, function(result, index) {
        if (JndConnectApi.handleError(result.data, result.status, true)) {
          return false;
        }
        if (index === length - 1) {
          JndUtil.alertUnknownError(result.data, result.status);
        }
      });
      JndConnect.close(true);
    }
    
    /**
     * event handler 를 바인딩 한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('connectCard:addPlug', _onAddPlug);
      $scope.$on('JndConnect:modify', _onModifyPlug);
      $scope.$on('JndConnect:reloadList', _onReloadList);
      $scope.$on('JndConnect:backToMain', _onBackToMain);
      $scope.$on('JndConnect:historyBack', historyBack);
      $scope.$on('JndConnect:startClose', _onStartClose);
    }

    /**
     * 플러그 추가시 핸들러
     * @param angularEvent
     * @param {object} [data=null] - 플러그 추가 화면 진입 시 필요한 데이터
     *  @param  {string} data.unionName - union 이름
     * @private
     */
    function _onAddPlug(angularEvent, data) {
      _setCurrent(data);
    }

    /**
     * 플러그 수정시 이벤트 핸들러
     * @param {object} angularEvent
     * @param {object} [data=null] - 수정 화면 진입 시 필요한 데이터
     *  @param  {string} data.unionName - union 이름
     *  @param  {number} data.connectId - connectId
     * @private
     */
    function _onModifyPlug(angularEvent, data) {
      _setCurrent(data);
    }

    /**
     * 현재 union 정보를 설정한다.
     * @param {object} [data=null] - 수정 화면 진입 시 필요한 데이터
     *  @param  {string} data.unionName - union 이름
     *  @param  {number} [data.connectId=null] - 존재하지 않을 경우 plug 추가로 간주한다.
     * @private
     */
    function _setCurrent(data) {
      data = data || {};
      var targetUnion = _getUnion(data.unionName);
      if (targetUnion) {
        $scope.current.union = targetUnion;
        $scope.current.connectId = data.connectId || null;
        $scope.current.isShowAuth = !!(!$scope.current.connectId && !$scope.current.union.hasAuth);
      } else {
        _resetCurrent();
      }
    }

    /**
     * current 정보를 초기화 한다. (main 화면 진입시 호출한다.)
     * @private
     */
    function _resetCurrent() {
      $scope.current.union = null;
      $scope.current.connectId = null;
      $scope.current.isShowAuth = false;
      _requestAll();
    }

    /**
     * refresh 이벤트 핸들러
     * @private
     */
    function _onReloadList() {
      if (!$scope.current.union) {
        _resetCurrent();
      }
    }

    /**
     * unionName 으로부터 union 데이터를 반환한다.
     * @param {string} unionName
     * @returns {*}
     * @private
     */
    function _getUnion(unionName) {
      return _.find($scope.unions, function(union) {
        return union.name === unionName;
      });
    }

    /**
     * back to main 이벤트 콜백
     * @param {object} angularEvent
     * @param {boolean} isSkipConfirm - 편집 상황에서 나갈 경우 노출하는 confirm 을 노출하지 않을지 여부
     * @private
     */
    function _onBackToMain(angularEvent, isSkipConfirm) {
      _backToMain(isSkipConfirm);
    }

    /**
     * main list 로 돌아간다.
     * @param {boolean} [isSkipConfirm] - 편집 상황에서 나갈 경우 노출하는 confirm 을 노출하지 않을지 여부
     * @private
     */
    function _backToMain(isSkipConfirm) {
      if (!isSkipConfirm && isEditing() && JndConnectUnionFormData.isChanged()) {
        _confirmStopEditing(_resetCurrent);
      } else {
        _resetCurrent();
      }
    }

    /**
     * 편집 취소하고 나갈 것인지 여부 확인하는 confirm 창을 노출한다.
     * @param {Function} okCallback - OK 버튼 클릭시 수행할 콜백
     * @private
     */
    function _confirmStopEditing(okCallback) {
      Dialog.confirm({
        body: $filter('translate')('@jnd-connect-227'),
        onClose: function (result) {
          if (result === 'okay' && _.isFunction(okCallback)) {
            okCallback();
          }
        }
      });
    }

    /**
     * 현재 connect 설정 편집 중인지 여부를 반환한다.
     * @returns {boolean}
     */
    function isEditing() {
      return !!$scope.current.union && !$scope.current.isShowAuth;
    }

    /**
     * fade out 이벤트 핸들러
     * @param {object} angularEvent
     * @param {boolean} isSkipConfirm
     * @private
     */
    function _onStartClose(angularEvent, isSkipConfirm) {
      if (!isSkipConfirm && isEditing() && JndConnectUnionFormData.isChanged()) {
        _confirmStopEditing(_fadeOut);
      } else {
        _fadeOut();
      }
    }

    /**
     * connect 를 close 하기 전 fadeout 한다.
     * @private
     */
    function _fadeOut() {
      JndUtil.safeApply($scope, function() {
        $scope.isClose = true;
        //fade out 을 CSS 에서 제어하기 때문에 fade out animation 이 완료되는 시점(300ms)까지 대기한다.
        $timeout(JndConnect.doClose, 300);
      });
    }

    /**
     * 돌아가기 버튼 클릭시 핸들러
     */
    function historyBack(angularEvent, isSkipConfirm) {
      JndUtil.safeApply($scope, function() {
        if ($scope.current.union) {
          _backToMain(isSkipConfirm);
        } else {
          JndConnect.close(isSkipConfirm);
        }
      });

    }

    /**
     * 연동된 data list 를 request 하여 가져온다.
     */
    function getList() {
      //TODO: request 로직
      //JndConnect.showLoading();
      JndConnectApi.getList().success(_onSuccessGetList);
    }

    /**
     * list 조회 success 핸들러
     * @private
     */
    function _onSuccessGetList(response) {
      var list = [];
      //var response = DUMMY.common.connectList;
      _.each(UNION_DATA, function(union) {
        list.push(_getUnionData(union, response[union.name]));
      });
      $scope.unions = list;
    }


    /**
     * server data 로 부터 UI 에 맞는 plug 데이터를 가공하여 반환한다.
     * @param {object} data
     * @returns {{user: *, room: *, isOn: boolean, raw: *}}
     * @private
     */
    function _getPlug(data) {
      return {
        sourceName: JndConnect.getPlugSourceName(data),
        user: EntityHandler.get(data.memberId),
        room: EntityHandler.get(data.roomId),
        isOn: data.status === 'enabled',
        raw: data
      }
    }

    /**
     * UI 에 적합한 Union 데이터를 가공하여 반환한다.
     * @param {Object} union - 최상단에 정의된 UNION 데이터
     * @param {Array} list
     * @returns {Object}
     * @private
     */
    function _getUnionData(union, list) {
      var item = union;
      item.plugs = [];
      _.forEach(list, function(data) {
        item.plugs.push(_getPlug(data));
      });
      return item;
    }
  }
})();
