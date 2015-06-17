(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('fileUploadedCtrl', fileUploadedCtrl);

  /* @ngInject */
  function fileUploadedCtrl($scope, $filter, fileAPIservice, centerService,
                            modalHelper, ImagesHelper, $compile, FileUploaded,
                            $state, entityheaderAPIservice, entityAPIservice) {

    // 현재 컨틀롤러가 가지고 있는 최상위 돔 엘레멘트
    var jqRootElement;
    // 현재 컨트롤러가 관리하고 있는 file content
    var content;

    // small thumbnail 을 가지고 있는 dom element
    var jqSmallThumbnail;
    // large thumbnail 을 가지고 있는 dom element
    var jqLargeThumbnail;

    var jqFullScreenToggleButton;

    var jqThumbnailParent;

    // 서버 주
    var serverUploaded = $scope.server_uploaded;

    $scope.onSmallThumbnailClick = onSmallThumbnailClick;
    $scope.onLargeThumbnailClick = onLargeThumbnailClick;
    $scope.onFullScreenImageButtonClick = onFullScreenImageButtonClick;
    $scope.onClickSharedEntity = onClickSharedEntity;

    init();

    function init() {
      jqRootElement = $(document.getElementById($scope.msg.id));

      content = _isCommentType($scope.msg.message) ? $scope.msg.feedback.content : $scope.msg.message.content;

      if ($filter('hasPreview')(content)) {
        // content 가 preview 를 지원 할 경우 -> 이미지.
        $scope.imageUrlToBeLoaded = serverUploaded  + FileUploaded.getSmallThumbnailUrl(content);
      }

      // integration file 이면 download를 표기하지 않음
      $scope.isIntegrateFile = fileAPIservice.isIntegrateFile(content.serverUrl);
    }


    /**
     * small thumbnail 이 클릭되었을때 불려진다.
     */
    function onSmallThumbnailClick() {
      jqSmallThumbnail = $(document.getElementById($scope.msg.id + '-image-preview-small'));

      if (!jqThumbnailParent) {
        jqThumbnailParent = jqSmallThumbnail.parent();
      }

      if (!jqLargeThumbnail) {
        jqLargeThumbnail = _getLargeThumbnailImageLoaderElement();
      }


      jqThumbnailParent.prepend(jqLargeThumbnail);

      _compileNewDomElement(jqLargeThumbnail, $scope);

      _addFullScreenImageViewButton(jqThumbnailParent);

      jqSmallThumbnail.remove();
      _togglePullLeft();
    }

    /**
     * full screen image 를 볼 수 있는 모달창을 여는 버튼을 jqElement 에 추가한다.
     * @param {jqElement} jqElement - 버튼을 추가할 parent element
     * @private
     */
    function _addFullScreenImageViewButton(jqElement) {
      if (!jqFullScreenToggleButton) {
        jqFullScreenToggleButton = angular.element('<div class="large-thumbnail-full-screen" ng-click="onFullScreenImageButtonClick();"><i class="fa fa-arrows-alt"></i></i></div>');
      }

      _compileNewDomElement(jqFullScreenToggleButton, $scope);

      jqElement.append(jqFullScreenToggleButton);
    }

    /**
     * large thumbnail 을 가지고 있는 dom element 를 생성해서 return 한다.
     * @returns {jqElement} jqImageLoaderContainer - large thumbnail을 가지고 있는 컨테이너 엘레멘트
     * @private
     */
    function _getLargeThumbnailImageLoaderElement() {
      var jqImageLoaderContainer;
      var imageLoaderMarkUp = ImagesHelper.getImageLoaderElement(serverUploaded  + FileUploaded.getLargeThumbnailUrl(content));

      imageLoaderMarkUp.addClass('large-thumbnail');
      imageLoaderMarkUp.attr({
        //'image-fit-to-width': true,
        'image-max-width': 700,
        'ng-click': 'onLargeThumbnailClick();',
        'id': $scope.msg.id + '-image-preview-large'
      });

      jqImageLoaderContainer = angular.element(imageLoaderMarkUp);
      return jqImageLoaderContainer;
    }

    /**
     * 현재 컨트롤러가 가지고 있는 element 의 자식중 'preview-container' 클래스를 가진 eleement 를 찾아서
     * 'pull-left' 를 toggle 시킨다.
     * @private
     */
    function _togglePullLeft() {
      var jqPreviewContainer = angular.element(jqRootElement.find('.preview-container'));
      jqPreviewContainer.toggleClass('pull-left');
    }

    /**
     * large thumbnail 엘레멘트가 클릭되어졌을 때 불려진다.
     */
    function onLargeThumbnailClick() {
      _compileNewDomElement(jqSmallThumbnail, $scope);

      jqThumbnailParent.append(jqSmallThumbnail);
      jqLargeThumbnail.remove();
      jqFullScreenToggleButton.remove();
      _togglePullLeft();
    }

    function onFullScreenImageButtonClick() {
      var fullFileUrl = serverUploaded + content.fileUrl;
      modalHelper.openFullScreenImageModal($scope, fullFileUrl);
    }

    /**
     * 엘레멘트와 스코프를 다시 바인딩 시켜준다.
     * @param {jqElement} jqElement - 바인딩 시킬 엘레멘트
     * @param {scope} scope - 바인딩 시킬 스코프
     * @private
     */
    function _compileNewDomElement(jqElement, scope) {
      $compile(jqElement)(scope);
    }

    /**
     * content type 이 코멘트인지 확인한다.
     * @param {string} contentType
     * @returns {boolean}
     * @private
     */
    function _isCommentType(contentType) {
      return centerService.isCommentType(contentType);
    }
    $scope.$on('onChangeShared', function(event, data) {
      // shared 갱신
      $scope.msg.message.shared = fileAPIservice.updateShared($scope.msg.message);
    });

    // integration file 이면 download를 표기하지 않음
    $scope.isIntegrateFile = fileAPIservice.isIntegrateFile(content.serverUrl);



    /**
     * shared entity 클릭시 이벤트 핸들러
     * @param {string} entityId
     */
    function onClickSharedEntity(entityId, entityType) {
      // TODO: File detail controller 에도 중복 로직이 있음.
      if (entityType === 'users') {
        $state.go('archives', {entityType: entityType, entityId: entityId});

      } else {

        var targetEntity = entityAPIservice.getEntityFromListById($scope.joinedEntities, entityId);

        // If 'targetEntity' is defined, it means I had it on my 'joinedEntities'.  So just go!
        if (angular.isDefined(targetEntity)) {
          $state.go('archives', { entityType: targetEntity.type, entityId: targetEntity.id });
        }
        else {
          // Undefined targetEntity means it's an entity that I'm joined.
          // Join topic first and go!
          entityheaderAPIservice.joinChannel(entityId)
            .success(function(response) {
              analyticsService.mixpanelTrack( "topic Join" );
              $rootScope.$emit('updateLeftPanelCaller');
              $state.go('archives', {entityType: 'channels',  entityId: entityId });
            })
            .error(function(err) {
              alert(err.msg);
            });
        }
      }
    }
  }
}());
