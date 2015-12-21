/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGithubCtrl', JndConnectGithubCtrl);

  /* @ngInject */
  function JndConnectGithubCtrl($scope, $q, Dialog, JndConnectGithubApi, JndConnectUnionApi, JndConnect, JndUtil) {
    var _originalRepos;

    $scope.requestData = {
      mode: 'authed',
      authenticationId: null
    };

    $scope.isInitialized = false;
    $scope.repositories = [
      {
        text: '@불러오는중',
        value: ''
      }
    ];

    $scope.formData = {
      roomId: null,
      hookRepoId: null,
      branches: '',
      header: {},
      hookEvent: {
        'push': false,
        'commit_comment': false,
        'pull_request': false,
        'pull_request_review_comment': false,
        'issues': false,
        'issue_comment': false,
        'create': false
      },
      footer: {
        botThumbnailFile: $scope.current.union.botThumbnailUrl,
        botName: 'Github',
        lang: 'ko'
      }
    };

    $scope.isRepoLoaded = false;

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
      var deferred = $q.defer();
      var promises = [];

      promises.push(JndConnectGithubApi.getRepos());

      //update 모드가 아닐 경우 바로 view 를 노출한다.
      if (!$scope.isUpdate) {
        $scope.isInitialized = true;
      } else {
        promises.push(JndConnectGithubApi.get($scope.current.connectId));
      }

      $q.all(promises)
        .then(_onSuccessInitialRequest, _onErrorInitialRequest);
    }

    /**
     * initial  request 성공 시 이벤트 핸들러
     * @param {array} results
     * @private
     */
    function _onSuccessInitialRequest(results) {
      _onSuccessGetRepo(results[0].data);
      if ($scope.isUpdate) {
        _onSuccessGetSetting(results[1].data);
      }
    }

    /**
     * initial request 실패 시 이벤트 핸들러
     * @param results
     * @private
     */
    function _onErrorInitialRequest(results) {
      JndUtil.alertUnknownError(results);
    }

    /**
     * update 모드일 경우 formData 에 해당하는 데이터들을 설정한다.
     * @param {object} response
     * @private
     */
    function _setFormDataFromResponse(response) {
      var formData = $scope.formData;
      formData.roomId = response.roomId;
      formData.hookRepoId = response.hookRepoId;

      //branches
      formData.branches = response.hookBranch.join(',');

      //hookEvent
      _.forEach(response.hookEvent, function(eventName) {
        if (!_.isUndefined(formData.hookEvent[eventName])) {
          formData.hookEvent[eventName] = true;
        }
      });

      //footers
      formData.footer.botName = response.botName;
      formData.footer.botThumbnailFile = response.botThumbnailUrl;
      formData.footer.lang = response.lang;
    }

    /**
     * setting 조회 성공 시 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetSetting(response) {
      _setFormDataFromResponse(response);
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
        text: '@선택하세요',
        value: ''
      });
      _.forEach(repos, function(group) {
        list = [];
        _.forEach(group.lists, function(repo) {
          isDisabled = repo.permissions && repo.permissions.admin === false;
          list.push({
            text: repo.name,
            value: repo.id,
            isDisabled: isDisabled
          });
        });
        groupList.push({
          name: group.owner,
          list: list
        });
      });
      return groupList;
    }

    /**
     * 이벤트 핸들러를 바인딩한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('unionFooter:save', _onSave);
    }

    /**
     * 설정 저장하기 버튼 클릭 시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      if ($scope.isUpdate) {
        JndConnectUnionApi.update('github', $scope.requestData)
          .success(_onSuccessUpdate)
          .error(_onErrorUpdate);
      } else {
        JndConnectUnionApi.create('github', $scope.requestData)
          .success(_onSuccessCreate)
          .error(_onErrorCreate);
      }
    }

    /**
     * update request 성공 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessUpdate(response) {
      Dialog.success({
        body:  '업데이트 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    /**
     * 생성 성공 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessCreate(response) {
      Dialog.success({
        body:  '생성 성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
      JndConnect.backToMain();
    }

    /**
     * update 오류 콜백
     * @param {object} response
     * @private
     */
    function _onErrorUpdate(response) {
      JndUtil.alertUnknownError(response);
    }

    /**
     * create 오류 콜백
     * @param {object} response
     * @private
     */
    function _onErrorCreate(response) {
      JndUtil.alertUnknownError(response);
    }

    /**
     * request 데이터를 가공한다.
     * @private
     */
    function _setRequestData() {
      var hookEvent = [];
      var formData = $scope.formData;
      var footer = formData.footer;
      _.each($scope.formData.hookEvent, function(value, key) {
        if (value) {
          hookEvent.push(key);
          if (key === 'create') {
            hookEvent.push('delete');
          }
        }
      });
      _.extend($scope.requestData, {
        roomId: formData.roomId,
        hookRepoId: formData.hookRepoId,
        hookRepoName: _getRepoData(formData.hookRepoId).full_name,
        hookEvent: hookEvent.join(','),
        hookBranch: _getBranches(),
        botName: footer.botName,
        botThumbnailFile: footer.botThumbnailFile,
        connectId: $scope.current.connectId,
        lang: footer.lang
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
  }
})();
