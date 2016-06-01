/**
 * @fileoverview Webhook 타입 컨넥트 공통 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectWebhookCtrl', JndConnectWebhookCtrl);

  /* @ngInject */
  function JndConnectWebhookCtrl($scope, $filter, CoreUtil, JndConnectUnionApi, JndConnectUnion, JndConnectApi,
                                 JndConnectUnionFormData) {
    var TEMPLATE_BASE_PATH = 'app/connect/union/webhook/template/';
    $scope.isInitialized = false;
    $scope.isLoading = false;
    $scope.isUpdate = false;
    $scope.formData = {
      header: JndConnectUnion.getDefaultHeader($scope.current),
      roomId: null,
      token: null,
      footer: JndConnectUnion.getDefaultFooter($scope.current)
    };
    $scope.requestData = {};
    $scope.guideTemplateUrl = TEMPLATE_BASE_PATH + $filter('camelToDot')($scope.current.union.name) + '.html';
    $scope.footerOptions = {};

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.formData.header.hasAccount = false;
      $scope.isUpdate = !!$scope.current.connectId;
      //incoming 일 경우에는 language 설정 화면을 노출하지 않는다
      if ($scope.current.union.name === 'incoming') {
        $scope.footerOptions = {
          hasLang: false
        };
      }
      _attachEvents();
      _initialRequest();
    }

    /**
     * 이벤트 핸들러를 추가한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('JndConnectUnion:showLoading', _onShowLoading);
      $scope.$on('JndConnectUnion:hideLoading', _onHideLoading);
      $scope.$on('JndConnectUnion:save', _onSave);
      $scope.$on('$destroy', JndConnectUnionFormData.clear);
      $scope.$on('JndConnectUnionFormData:getCurrentFormData', _onGetCurrentFormData);
    }

    /**
     * getCurrentFormData 이벤트 콜백
     * @param {object} angularEvent
     * @param {Function} callback - formData 를 인자로 넘겨줄 콜백 함수
     * @private
     */
    function _onGetCurrentFormData(angularEvent, callback) {
      callback($scope.formData);
    }

    /**
     * 변경 여부 파악을 위해 초기 formData 를 저장한다.
     * @private
     */
    function _setOriginalFormData() {
      //custom selectbox 에서 기본 값으로 세팅한 이후 저장하기 위해 setTimeout 을 수행한다.
      setTimeout(function() {
        JndConnectUnionFormData.set($scope.formData);
      });
    }

    /**
     * show loading 이벤트 핸들러
     * @private
     */
    function _onShowLoading() {
      $scope.isLoading = true;
    }

    /**
     * hide loading 이벤트 핸들러
     * @private
     */
    function _onHideLoading() {
      $scope.isLoading = false;
    }

    /**
     * JIRA 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      var formData = $scope.formData;
      var current = $scope.current;
      var name = CoreUtil.pick(current, 'union', 'name');
      //update 모드일 경우 조회 API 를 콜한다.
      if ($scope.isUpdate) {
        JndConnectUnion.read({
          current: current,
          header: formData.header,
          footer: formData.footer
        }).success(_onSuccessGetSetting)
          .finally(_onInitialRequestEnd);
      } else {
        JndConnectUnionApi.getWebhookToken(name)
          .success(_onSuccessGetWebhookToken)
          .error(_onErrorGetWebhookToken)
          .finally(_onInitialRequestEnd);
      }
    }

    /**
     * 첫번째 request 완료 후 콜백
     * @private
     */
    function _onInitialRequestEnd() {
      $scope.isInitialized = true;
    }

    /**
     * 수정 모드일 경우 setting 값 조회 완료 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetSetting(response) {
      _.extend($scope.formData, {
        webhookUrl: response.webhookUrl,
        roomId: response.roomId
      });
    }

    /**
     * 웹훅 토큰 조회 성공시 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetWebhookToken(response) {
      $scope.formData.webhookToken = response.webhookToken;
      $scope.formData.webhookUrl = response.webhookUrl;
      //신규 생성일 경우, 항상 변경되었다고 간주하기 위하여 빈 object 를 설정한다.
      JndConnectUnionFormData.set({});
    }

    /**
     * 웹훅 토큰 조회 실패시 콜백
     * @param {object} err
     * @param {number} status
     * @private
     */
    function _onErrorGetWebhookToken(err, status) {
      if (!JndConnectApi.handleError(err, status)) {
        JndConnectUnion.handleCommonLoadError($scope.current, err, status);
      }
    }

    /**
     * create, update 를 위한 request 데이터를 생성한다.
     * @private
     */
    function _setRequestData() {
      var formData = $scope.formData;
      var footer = formData.footer;
      _.extend($scope.requestData, footer, {
        webhookToken: formData.webhookToken,
        roomId: formData.roomId
      });
    }

    /**
     * 저장 버튼 클릭시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      if (!$scope.isLoading) {
        $scope.isLoading = true;

        JndConnectUnion.save({
          current: $scope.current,
          data: $scope.requestData
        }).finally(_onSaveEnd);
      }
    }

    /**
     * 저장 완료시 finally callback
     * @private
     */
    function _onSaveEnd() {
      $scope.isLoading = false;
    }
  }
})();
