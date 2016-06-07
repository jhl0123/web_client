/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGithubCtrl', JndConnectGithubCtrl);

  /* @ngInject */
  function JndConnectGithubCtrl($scope, $filter, Dialog, JndConnectApi, JndConnectGithubApi, CoreUtil,
                                JndConnectUnion, JndConnectUnionFormData) {
    var _originalRepos;
    var _createdRoomId = null;
    var _hookRepoId = null;

    $scope.isInitialized = false;
    $scope.isLoading = false;
    $scope.isRepoLoaded = false;

    $scope.requestData = {
      mode: 'authed',
      authenticationId: null
    };
    $scope.repositories = [
      {
        text: '',
        value: ''
      }
    ];

    $scope.formData = {
      header: JndConnectUnion.getDefaultHeader($scope.current),
      roomId: null,
      hookRepoId: null,
      branches: '',
      hookEvent: {
        'push': true,
        'commit_comment': true,
        'pull_request': true,
        'pull_request_review_comment': true,
        'issues': true,
        'issue_comment': true,
        'create': false
      },
      footer: JndConnectUnion.getDefaultFooter($scope.current)
    };

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.isUpdate = !!$scope.current.connectId;
      _attachEvents();
      _initialRequest();
    }

    /**
     * github 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      JndConnectGithubApi.getRepos()
        .success(_onSuccessGetRepo)
        .error(_onErrorRepo);

      //update 모드가 아닐 경우 바로 view 를 노출한다.
      if (!$scope.isUpdate) {
        $scope.isInitialized = true;
        //신규 생성일 경우, 항상 변경되었다고 간주하기 위하여 빈 object 를 설정한다.
        JndConnectUnionFormData.set({});
      } else {
        JndConnectUnion.read({
          current: $scope.current,
          header: $scope.formData.header,
          footer: $scope.formData.footer
        }).success(_onSuccessGetSetting);
      }
    }

    /**
     * repository 보 조회 실패시 콜백
     * @param {object} err
     * @param {number} status
     * @private
     */
    function _onErrorRepo(err, status) {
      if (!JndConnectApi.handleError(err, status)) {
        JndConnectUnion.handleCommonLoadError($scope.current, err, status);
      }
    }

    /**
     * setting 조회 성공 시 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetSetting(response) {
      var formData = $scope.formData;

      formData.roomId = response.roomId;
      formData.hookRepoId = _hookRepoId = response.hookRepoId;

      //branches
      formData.branches = response.hookBranch.join(',');

      //init events
      _.forEach(formData.hookEvent, function(value, eventName) {
        formData.hookEvent[eventName] = false;
      });
      //hookEvent
      _.forEach(response.hookEvent, function(eventName) {
        formData.hookEvent[eventName] = !_.isUndefined(formData.hookEvent[eventName]);
      });
      $scope.isInitialized = true;
      _setOriginalFormData();
    }

    /**
     * 레포지토리 정보 조회 성공 시 이벤트 핸들러
     * @private
     */
    function _onSuccessGetRepo(response) {
      _originalRepos = response.repos;
      $scope.requestData.authenticationId = response.authenticationId;
      $scope.repositories =_getSelectboxRepos(response.repos);
      $scope.isRepoLoaded = true;
      $scope.isInitialized = true;
      $scope.formData.hookRepoId = _hookRepoId;

      JndConnectUnion.setHeaderAccountData($scope.formData.header, {
        accountList: [response]
      });

      //원본 formData 의 정보를 업데이트 한다.
      JndConnectUnionFormData.extend({
        hookRepoId: _hookRepoId || ''
      });
    }

    /**
     * selectbox 에 전달하기 위한 repository 데이터
     * @param {Array} repos
     * @returns {Array}
     * @private
     */
    function _getSelectboxRepos(repos) {
      var groupList = [];
      var list;
      var isDisabled;
      groupList.push({
        text: $filter('translate')('@jnd-connect-138'),
        value: ''
      });
      _.forEach(repos, function(group) {
        list = [];
        _.forEach(group.lists, function(repo) {
          isDisabled = CoreUtil.pick(repo, 'permissions', 'admin') === false;
          list.push({
            text: repo.name,
            value: repo.id,
            isDisabled: isDisabled
          });
        });
        groupList.push({
          groupName: group.owner,
          groupList: list
        });
      });
      return groupList;
    }

    /**
     * 이벤트 핸들러를 바인딩한다.
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
     * 설정 저장하기 버튼 클릭 시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      var key;
      var invalidField = _getInvalidField();

      if (!$scope.isLoading) {
        $scope.isLoading = true;

        if (!invalidField) {
          JndConnectUnion.save({
            current: $scope.current,
            data: $scope.requestData
          }).finally(_onSaveEnd);
        } else {
          switch (invalidField) {
            case 'hookRepoId':
              key = '@jnd-connect-217';
              break;
            case 'hookEvent':
              key = '@jnd-connect-219';
              break;
            default:
              key = invalidField;
          }
          _onSaveEnd();
          Dialog.warning({
            'title': $filter('translate')(key)
          });
        }
      }
    }

    /**
     * 저장 완료 이후 반드시 수행되는 콜백
     * @private
     */
    function _onSaveEnd() {
      $scope.isLoading = false;
    }

    /**
     * request 데이터를 가공한다.
     * @private
     */
    function _setRequestData() {
      var hookEvent = [];
      var formData = $scope.formData;
      var requestData = $scope.requestData;
      var footer = formData.footer;
      _.each(formData.hookEvent, function(value, key) {
        if (value) {
          hookEvent.push(key);
          if (key === 'create') {
            hookEvent.push('delete');
          }
        }
      });
      _.extend(requestData, footer, {
        roomId: formData.roomId,
        hookRepoId: formData.hookRepoId,
        hookRepoName: CoreUtil.pick(_getRepoData(formData.hookRepoId), 'full_name'),
        hookEvent: hookEvent.join(','),
        hookBranch: _getBranches()
      });
    }

    /**
     * 서버 포멧에 맞춘 branch 배열을 반환한다.
     * @returns {String}
     * @private
     */
    function _getBranches() {
      var text = _.trim($scope.formData.branches);
      var results = [];
      var branches = _.trim($scope.formData.branches).split(',');
      if (text) {
        _.forEach(branches, function(branch) {
          branch = _.trim(branch);
          if (branch) {
            results.push(branch);
          }
        });
      }
      return results.join(',');
    }

    /**
     * repository ID 를 이용하여 실제 저장소 데이터를 반환한다.
     * @param {number} repoId
     * @returns {*}
     * @private
     */
    function _getRepoData(repoId) {
      var repoData;
      _.forEach(_originalRepos, function(group) {
        if (repoData) {
          return false;
        }
        _.forEach(group.lists, function(repo) {
          if (repo.id === repoId) {
            repoData = repo;
            return false;
          }
        });
      });
      return repoData;
    }

    /**
     * invalid field 를 반환한다.
     * @returns {*}
     * @private
     */
    function _getInvalidField() {
      var invalidField = null;
      var requiredList = [
        'roomId',
        'hookRepoId',
        'hookEvent',
        'botName',
        'lang'
      ];

      _.forEach(requiredList, function(fieldName) {
        if (!$scope.requestData[fieldName]) {
          invalidField = fieldName;
          return false;
        }
      });

      return invalidField;
    }
  }
})();
