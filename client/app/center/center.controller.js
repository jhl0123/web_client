'use strict';

var app = angular.module('jandiApp');

app.controller('centerpanelController', function($scope, $rootScope, $state, $filter, $timeout, $q, $sce, $modal, entityheaderAPIservice, messageAPIservice, fileAPIservice, entityAPIservice, userAPIservice, analyticsService, leftpanelAPIservice, memberService, publicService, desktopNotificationService) {

  //console.info('[enter] centerpanelController');

  var CURRENT_ENTITY_ARCHIVED = 2002;
  var INVALID_SECURITY_TOKEN  = 2000;

  var entityType = $state.params.entityType;
  var entityId = $state.params.entityId;

  // TODO: REFACTOR | TO entityAPIservice - WHOLE BLOCK WITH MEANINGFUL NAME.
  // CALL FUNCTION INSTEAD OF LINES OF CODE
  // Check entityType first.
  if (entityType.slice(-1) != 's') {
    // If entitytype doesn't contain 's' at the end, do nothing about it.
    // Let router handle this case.
    // Router will redirect user to same entityType with 's' at the end.
    return;
  }

  if (entityId == $rootScope.member.id) {
    $rootScope.toDefault = true;
  }

  var updateInterval = 2000;

  $scope.lastMessage = null;

  $scope.messageUpdateCount = 20;

  $scope.loadMoreCounter = 0;

  $scope.entityId = entityId;
  $scope.entityType = entityType;
  $scope.messages = [];

  // configuration for message loading
  $scope.msgLoadStatus = {
    loading: false,
    loaded: false,
    firstLoadedId: -1,
    lastUpdatedId: -1,
    isFirst: false,
    loadingTimer : true,
    isInitialLoadingCompleted : false
  };

  $rootScope.isIE9 = false;

  if (angular.isDefined(FileAPI.support)) {
    if (!FileAPI.support.html5)
      $rootScope.isIE9 = true;
  }

  $scope.isPosting = false;

  $scope.isOwner = function() {

    return ($rootScope.currentEntity.ch_creatorId || $rootScope.currentEntity.pg_creatorId) == memberService.getMemberId();
  };
  $scope.isDefaultTopic = function() {
    return $rootScope.team.t_defaultChannelId == $rootScope.currentEntity.id;
  };

  $scope.onLeaveClick = function() {
    log('-- leaving')

    entityheaderAPIservice.leaveEntity($scope.currentEntity.type, $scope.currentEntity.id)
      .success(function(response) {
        log('-- good')
        // analytics
        var entity_type = analyticsService.getEntityType($scope.currentEntity.type);

        analyticsService.mixpanelTrack( "Entity Leave", { "type": entity_type } );
        updateLeftPanel();
      })
      .error(function(error) {
        alert(error.msg);
      })
  };

  $scope.onDeleteClick = function() {
    entityheaderAPIservice.deleteEntity($scope.currentEntity.type, $scope.currentEntity.id)
      .success(function() {
        // analytics
        var entity_type = analyticsService.getEntityType($scope.currentEntity.type);
        analyticsService.mixpanelTrack( "Entity Delete", { "type": entity_type } );

        updateLeftPanel();
        fileAPIservice.broadcastChangeShared();
      })
      .error(function(error) {
        alert(error.msg);
      });
  };

  $scope.onMeesageLeaveClick = function(entityId) {
    $rootScope.$broadcast('leaveCurrentChat', entityId);
  };
  function updateLeftPanel() {
    $scope.updateLeftPanelCaller();
    $rootScope.toDefault = true;
  }

  //  END OF PANEL HEADER FUNCTIONS


  //  default loadingTimer
  $timeout(function() {
    $scope.msgLoadStatus.loadingTimer = false;
  }, 1000);

  var prev = null;

  $scope.updateScroll = function(lastMessage) {

    disableScroll();

    if (prev != null){
      prev.removeClass('last');
    }

    if (!angular.isUndefined(lastMessage) && !_.isNull(lastMessage) && lastMessage.position().top > 0) {
      lastMessage.addClass('last');
      $('.msgs').scrollTop(lastMessage.position().top - 13);
    }

    prev = lastMessage;

    $timeout(function() {
      if (prev != null) prev.removeClass('last');
      enableScroll();
    }, 800)
  };

  function disableScroll() {
    $('body').bind('mousewheel', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  function enableScroll() {
    $('body').unbind('mousewheel');
  }

  var groupByDate = function() {
    // 중복 메세지 제거 (TODO 매번 모든 리스트를 다 돌리는게 비효율적이지만 일단...)
    $scope.messages = _.uniq($scope.messages);

    //console.log($scope.messages)
    for (var i in $scope.messages) {
      var msg = $scope.messages[i];

      var prev = (i == 0) ? null : $scope.messages[i-1];
      // comment continuous check
      if ( msg.message.contentType === 'comment' ) {

        msg.message.commentOption = { isTitle: false, isContinue: false };

        if (i == 0) {
          msg.message.commentOption.isTitle = true;
        }
        else {
          // 파일 아래 바로 해당 파일의 코멘트
          // 같은 파일에 대한 연속 코멘트
          if (prev.messageId == msg.feedbackId || prev.feedbackId === msg.feedbackId) {
            msg.message.commentOption.isContinue = true;
          }
          else {
            msg.message.commentOption.isTitle = true;

          }
        }
      } else if (msg.message.contentType === 'file') {
        msg.message.isFile = true;
      } else if (msg.message.contentType === 'text') {
        msg.message.isText = true;
      }
      $scope.messages[i] = msg;
    }
    $scope.groupMsgs = [];
    $scope.groupMsgs = _.groupBy($scope.messages, function(msg) {
      return $filter('ordinalDate')(msg.time, "yyyyMMddEEEE, MMMM doo, yyyy");
    });
  };

  $scope.loadMore = function() {
    var deferred = $q.defer();

    if ($scope.msgLoadStatus.isFirst) return;

    if (!$scope.msgLoadStatus.loading && !$scope.isPosting) {

      $scope.msgLoadStatus.loading = true;

      log('-- loadMore');

      // simulate an ajax request
      $timeout(function() {
        // 엔티티 메세지 리스트 목록 얻기
        messageAPIservice.getMessages(entityType, entityId, $scope.msgLoadStatus.firstLoadedId, $scope.messageUpdateCount)
          .success(function(response) {

            log('-- loadMore success');

            //  lastUpdatedId 갱신
            $scope.msgLoadStatus.lastUpdatedId = response.lastLinkId;

            if (response.messageCount) {

              //  marker 설정
              updateMessageMarker();

              for (var i in response.messages.reverse()) {

                var msg = response.messages[i];

                // jihoon
                if (msg.status == 'event') {
                  msg = eventMsgHandler(msg);
                  $scope.messages.unshift(msg);
                  continue;
                }

                // shared entities 가 있을 경우
                if ( (msg.status === 'shared' || msg.status === 'unshared') && msg.message.shareEntities.length) {
                  // shareEntities 중복 제거 & 각각 상세 entity 정보 주입
                  msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
                }

                // parse HTML, URL code
                var safeBody = msg.message.content.body;
                if (safeBody != undefined && safeBody != "") {
                  safeBody = $filter('parseUrl')(safeBody);
                }
                msg.message.content.body = $sce.trustAsHtml(safeBody);

                $scope.messages.unshift(msg);
                // console.log("msg", i, msg);
              }

              $scope.messageUpdateCount = response.messageCount;

              groupByDate();
            }

            // 추후 로딩을 위한 status 설정
            $scope.msgLoadStatus.firstLoadedId = response.firstIdOfReceivedList;
            $scope.msgLoadStatus.isFirst = response.isFirst;
            $scope.msgLoadStatus.loading = false;
            $scope.msgLoadStatus.loaded = ($scope.messages.length > 0);

            // auto focus to textarea
            $scope.focusPostMessage = true;
            $scope.loadMoreCounter++;
          })
          .error(function(response) {
            onHttpRequestError(response);
          });
        deferred.resolve();
      });
    } else {
      deferred.reject();
    }
    return deferred.promise;
  };

  $scope.loadMore();

  // 주기적으로 업데이트 메세지 리스트 얻기 (polling)
  // TODO: [건의사항] 웹에서는 polling 보다는 websocket이 더 효과적일듯

  $scope.promise = null;
  var currentLast = -1;
  var updateList = function() {

    log('-- updateList');

    //  when 'updateList' gets called, there may be a situation where 'getMessages' is still in progress.
    //  In such case, don't update list and just return it.
    if ($scope.msgLoadStatus.loading) {
      $scope.promise = $timeout(updateList, updateInterval);
      return;
    }

    //  if code gets to this point, 'getMessages' has been done at least once.
    $scope.msgLoadStatus.isInitialLoadingCompleted = true;

    log('-- calling getUpdatedMessages');

    messageAPIservice.getUpdatedMessages(entityType, entityId, $scope.msgLoadStatus.lastUpdatedId)
      .success(function (response) {

        log('-- getUpdatedMessages success');

        // jihoon
        if (response.alarm.alarmCount != 0) updateAlarmHandler(response.alarm);
        if (response.event.eventCount != 0) updateEventHandler(response.event);

        // lastUpdatedId 갱신
        $scope.msgLoadStatus.lastUpdatedId = response.lastLinkId;


        response = response.updateInfo;

        if (response.messageCount) {

          //  marker 설정
          updateMessageMarker();

          // Update message marker first and the update message list!!
          // Update message list
          $rootScope.$broadcast('updateMessageList');


          // 업데이트 된 메세지 처리
          for (var i in response.messages) {
            var msg = response.messages[i];
//                        console.log("[ updated", msg.id, " and last at ", currentLast,  "]");

            if ($scope.isPosting)
              $scope.isPosting = false;

            //  return if old msg was returned from server.
            //  'currentLast' indicates a link id of last message rendered on screen.
            if (msg.id <= currentLast)
              return;
            else
              currentLast = msg.id;


            // auto focus to textarea
            $scope.focusPostMessage = true;

            if ( msg.status == 'event' ) {
              msg = eventMsgHandler(msg);

              $scope.messages.push(msg);
              continue;
            }
            // parse HTML, URL code
            var safeBody = msg.message.content.body;
            if (safeBody != undefined && safeBody !== "") {
              safeBody = $filter('parseUrl')(safeBody);
            }

            msg.message.content.body = $sce.trustAsHtml(safeBody);

            switch (msg.status) {
              case 'created':
                $scope.messages.push(msg);
                break;
              case 'edited':
                var target = _.find($scope.messages, function(m) {
                  return m.messageId === msg.messageId;
                });
                if (!_.isUndefined(target)) {
                  var targetIdx = $scope.messages.indexOf(target);
                  $scope.messages.splice(targetIdx, 1);
                  $scope.messages.push(msg);
                }
                break;
              case 'archived':
                var target = _.find($scope.messages, function(m) {
                  return m.messageId === msg.messageId;
                });
                if (!_.isUndefined(target)) {
                  var targetIdx = $scope.messages.indexOf(target);
                  $scope.messages.splice(targetIdx, 1);
                }
                break;
              case 'shared':
                msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
                $scope.messages.push(msg);
                break;
              case 'unshared':
                var target = _.find($scope.messages.reverse(), function(m) {
                  return m.messageId === msg.messageId;
                });
                if (!_.isUndefined(target)) {
                  // 기존 shared message 제거
                  var targetIdx = $scope.messages.indexOf(target);
                  $scope.messages.splice(targetIdx, 1);
                  // shareEntities 중복 제거 & 각각 상세 entity 정보 주입
                  msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
                  $scope.messages.push(msg);
                }
                break;
              default:
                console.error("!!! unfiltered message", msg);
                break;
            }
          }

          $scope.messageUpdateCount = response.messageCount;

          groupByDate();
        }

      })
      .error(function (response) {
        onHttpRequestError(response);
      });

    // TODO: async 호출이 보다 안정적이므로 callback에서 추후 처리 필요
    $scope.promise = $timeout(updateList, updateInterval);
  };

  $scope.promise = $timeout(updateList, updateInterval);

  $scope.message = {};

  $scope.postMessage = function() {
    if (!$scope.message.content) return;

    log('-- posting message');

    // prevent duplicate request
//        $scope.msgLoadStatus.loading = true;
    $scope.isPosting = true;
    var msg = $scope.message.content;
    $scope.message.content = "";

    //if (msg === 'stop') {
    //    console.log('stoping polling')
    //    $timeout.cancel($scope.promise);
    //    return;
    //}
    $timeout.cancel($scope.promise);

    messageAPIservice.postMessage(entityType, entityId, {'content': msg})
      .success(function(response) {
        log('-- posting message success');
        updateList();
        //  reseting position of msgs
        $('.msgs').css('margin-bottom', 0);
      })
      .error(function(response) {
        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.postMessage"});
      });
  };

  $scope.editMessage = function(messageId, updateContent) {
    if (updateContent === "") return "";

    var message = {"content": updateContent};
    messageAPIservice.editMessage(entityType, entityId, messageId, message)
      .success(function(response) {
        $timeout.cancel($scope.promise);
        updateList();
      })
      .error(function(response) {
        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.editMessage"});
      });
  };

  $scope.deleteMessage = function(message) {
    //console.log("delete: ", message.messageId);
    messageAPIservice.deleteMessage(entityType, entityId, message.messageId)
      .success(function(response) {
        $timeout.cancel($scope.promise);
        updateList();
      })
      .error(function(response) {
        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.deleteMessage"});
      });
  };

  $scope.openModal = function(selector) {
    // OPENING JOIN MODAL VIEW
    if (selector == 'file') {
      $modal.open({
        scope       : $scope,
        templateUrl : 'app/modal/upload.html',
        controller  : 'fileUploadModalCtrl',
        size        : 'lg'
      });
    }
    else if (selector == 'rename') {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/rename.html',
        controller  :   'renameModalCtrl',
        size        :   'lg'
      });
    }
    else if (selector == 'invite') {
      publicService.openInviteToCurrentEntityModal($scope);
    }
    else if (selector == 'inviteUserToChannel') {
      publicService.openInviteToJoinedEntityModal($scope);
    }
    else if (select == 'share') {

    }
  };


  /*
   *  $scope.messages 중 shared entity 변화가 일어난 경우 추가/삭제 처리
   */
  $scope.$on('onChangeShared', function(event, data) {
    // 파일업로드인 경우엔 어차피 polling시 패널을 갱신하기 때문에 예외 처리
    if (_.isNull(data)) return;
    // share / unshare 경우
    _.each($scope.messages, function(msg) {
      if (msg.messageId === data.messageId) {
        // TODO 변경된 shareEntities를 얻기 위해 일단 파일 상세정보를 모두 가져옴
        fileAPIservice.getFileDetail(msg.messageId).success(function(response) {
          for (var i in response.messageDetails) {
            var item = response.messageDetails[i];
            if (item.contentType === 'file') {
              msg.message.shared = fileAPIservice.getSharedEntities(item);
            }
          }
        });
      }
    });
  });

  // TODO rightpanelController 로직 중복 해결 필요
  $scope.onClickSharedEntity = function(entityId) {
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
  };

  $scope.onClickUnshare = function(message, entity) {
    fileAPIservice.unShareEntity(message.id, entity.id)
      .success(function() {
        var share_target = analyticsService.getEntityType($scope.currentEntity.type);

        var file_meta = (message.content.type).split("/");
        var share_data = {
          "entity type"   : share_target,
          "category"      : file_meta[0],
          "extension"     : message.content.ext,
          "mime type"     : message.content.type,
          "size"          : message.content.size
        };
        analyticsService.mixpanelTrack( "File Unshare", share_data );

        fileAPIservice.broadcastChangeShared(message.id);
      })
      .error(function(err) {
        alert(err.msg);
      });
  };


  // Listen to file delete event.
  // Find deleted file id from current list($scope.messages).
  // If current list contains deleted file, change its status to 'archived'.
  $scope.$on('onFileDeleted', function(event, deletedFileId) {
    _.forEach($scope.messages, function(message) {
      var file;
      console.log('hi', deletedFileId);
      console.log(message.message);

      //msg.message.contentType === 'systemEvent
      //msg.message.commentOption.isTitle }}
  //<div ng-if="!msg.message.commentOption.isTitle">
  //{{ msg.feedback.status}}


      // Is it file?
      if (message.message.contentType == 'file')
        file = message.message;
      else if (message.message.contentType == 'comment') {
        file = message.feedback;
      }

      // If not, continue to next message.
      if (angular.isUndefined(file)) return;

      // If this file deleted?
      if (file.id == deletedFileId) {
        file.status = 'archived';
      }
    });

  });

  $scope.onSmallThumbnailClick = function($event, message) {

    //  checking type first.
    //  file upload but not image -> return
    if (message.message.contentType === 'file')
      if (message.message.content.type.indexOf('image') < 0)
        return;

    // comment but not to image file -> return
    if (message.message.contentType === 'comment'){
      if (message.feedback.content.type.indexOf('image') < 0 || message.feedback.status == 'archived') {
        return;
      }
    }

    // Image is long but not wide. There may be a white space on each side of an image.
    // When user clicks on white(blank) space of image, it will do nothing and return.
    if (angular.isDefined(angular.element($event.target).children('#large-thumbnail').attr('id'))) {
      return;
    }

    // checking where event came from.
    var targetDom;                                      //  Will be small image thumbnail dom element.
    var tempTarget = angular.element($event.target);    //  dom element that just sent an event.

    var tempTargetClass = tempTarget.attr('class');

    if (tempTargetClass.indexOf('msg-file-body__img') > -1) {
      //  Small thumbnail of file type clicked.
      targetDom = tempTarget;
    }
    else if (tempTargetClass.indexOf('msg-file-body-float') > -1 ) {
      //  Small image thumbnail clicked but its parent(.msg-file-body-float) is sending event.
      //  Its parent is sending an event because of opac overlay layer on top of small thumbnail.
      targetDom = tempTarget.children('.msg-file-body__img');
    }
    else if (tempTargetClass.indexOf('image_wrapper') > -1) {
      targetDom = tempTarget.children('.msg-file-body__img');
    }
    else if (tempTargetClass.indexOf('fa-comment') > -1) {
      //  Comment image clicked on small image thumbnail.
      targetDom = tempTarget.siblings('.image_wrapper').children('.msg-file-body__img');
    }
    else
      return;

    //if (angular.isUndefined(targetDom)) {
    //    return;
    //}

    var newThumbnail;   // large thumbnail address
    var fullUrl;        // it could be file, too.

    if (message.message.contentType === 'comment') {
      newThumbnail = $scope.server_uploaded + message.feedback.content.extraInfo.largeThumbnailUrl;
      fullUrl = $scope.server_uploaded + message.feedback.content.fileUrl;
    }
    else {
      newThumbnail = $scope.server_uploaded + message.message.content.extraInfo.largeThumbnailUrl;
      fullUrl = $scope.server_uploaded + message.message.content.fileUrl;
    }



    //  new DOM element for full screen image toggler.
    // TODO: CONTROLLER IS NOT SUPPOSED TO MANUPLATE DOM ELEMENTS. FIND BETTER WAY TO ADD DOM ELEMENT!!!!!
    var fullScreenToggler = angular.element('<div class="large-thumbnail-full-screen"><i class="fa fa-arrows-alt"></i></i></div>');

    //  bind click event handler to full screen toggler.
    fullScreenToggler.bind('click', function() {
      //  opening full image modal used in file controller.
      //  passing photo url of image that needs to be displayed in full screen.
      $modal.open({
        scope       :   $scope,
        controller  :   'fullImageCtrl',
        templateUrl :   'app/modal/fullimage.html',
        windowClass :   'modal-full',
        resolve     :   {
          photoUrl    : function() {
            return fullUrl;
          }
        }
      });
    });



    // get transform information from original image.
    // if image was rotated according to its orientation from exif data, there must be transform value.
    var transform = getTransformValue(targetDom[0].style);

    //  new DOM element for large thumbnail image.
    var mirrorDom = angular.element('<img id="large-thumbnail" class="large-thumbnail cursor_pointer image-background" src="'+newThumbnail+'"/>');

    // copy and paste of old 'transform' css property from small to large thumbnail.
    mirrorDom[0].setAttribute('style', transform);

    //  bind click event handler to large thumbnail image.
    mirrorDom.bind('click', function() {
      // opening full screen image modal.
      onLargeThumbnailClick(fullScreenToggler, mirrorDom, targetDom);
    });


    //  hide small thumbnail image.
    targetDom.css('display', 'none');

    //  append new dom elements to parent of small thumbnail(original dom).
    var parent = targetDom.parent().parent();

    if (angular.isDefined(parent.children('#large-thumbnail').attr('id'))) {
      //  preventing adding multiple large thumbnail dom element to parent.
      //  if parent already has a child whose id is 'large-thumbnail' which is 'mirrorDom', don't append it and just return.
      return;
    }

    parent.append(mirrorDom);
    parent.append(fullScreenToggler);

    //  change parent's css properties.
    parent.addClass('large-thumbnail-parent').removeClass('pull-left');
    parent.parent().addClass('large-thumbnail-grand-parent');
  };


  // get all style attributes of targetDom
  // and pick correct 'transform' arrtibute.
  // and return exact same property.
  function getTransformValue(targetDomStyle) {
    var transform;

    if (targetDomStyle.getPropertyValue('-webkit-transform')) {
      // webkit
      transform = '-webkit-transform:' + targetDomStyle.getPropertyValue('-webkit-transform');
    }
    else if (targetDomStyle.getPropertyValue('-moz-transform')) {
      // firefox
      transform = '-moz-transform:' + targetDomStyle.getPropertyValue('-moz-transform');
    }
    else if (targetDomStyle.getPropertyValue('-o-transform')) {
      // safari
      transform = '-o-transform:' + targetDomStyle.getPropertyValue('-o-transform');
    }
    else {
      // ie
      transform = '-ms-transform:' + targetDomStyle.getPropertyValue('-ms-transform');
    }

    return transform;
  }

  //  when large thumbnail image is clicked, delete large thumbnail and show original(small thumbnail image).
  function onLargeThumbnailClick(fullScreenToggler, mirrorDom, originalDom) {
    originalDom.css('display', 'block');
    mirrorDom.parent().removeClass('large-thumbnail-parent').addClass('pull-left');
    mirrorDom.parent().parent().removeClass('large-thumbnail-grand-parent');
    mirrorDom.remove();
    fullScreenToggler.remove();
  }


  //  right controller is listening to 'updateFileWriterId'.
  $scope.onFileListClick = function(userId) {
    if ($state.current.name != 'messages.detail.files')
      $state.go('messages.detail.files');
    $scope.$emit('updateFileWriterId', userId);
  };

  // SYSTEM EVENT.
  //  'event' field if not empty when,
  //      1. create channel
  //      2. leave channel
  //      3. archive(delete) channel
  //      4. invite someone to channel
  function updateEventHandler(event) {
    if (event.eventCount == 0) return;

    var eventTable = event.eventTable;

    //  true, if left panel must be updated.
    //  otherwise, false.
    var mustUpdateLeftPanel = false;

//        console.log('There are some system events');
//        console.log('There are ' + event.eventCount)
//        console.log(eventTable);

    _.find(eventTable, function(event, index, list) {
//            console.log(event);
      if (event.info.eventType == 'invite') {
        //  'INVITE' event.
        //  ASSUMPTION 1. YOU CAN ONLY INVITE TO ONE CHANNEL. -> toEntity can have only one element.
        //  ASSUMPTION 2. YOU CAN'T INVITE SOMEONE TO DIRECT MESSAGE.  -> toEntity must be id of either channel or privateGroup.

        //  someone invited 'ME' to some channel.
        if (_.contains(event.info.inviteUsers, $scope.member.id)) {
//                    console.log('someone invited me')
          mustUpdateLeftPanel = true;
          return;
        }

        //  I invited someone.
        //  If I invited someone on web, it doesn't really matter.
        //  But if I invited someone from different device(mobile), I need to update leftPanel on web.
        if (event.info.invitorId == $scope.member.id) {
//                    console.log('I invited someone')
          mustUpdateLeftPanel = true;
          return;
        }

        var updateEntity = entityAPIservice.getEntityFromListById($rootScope.joinedEntities, event.toEntity[0]);

        if (updateEntity) {
//                    console.log('someone invited someone to some channel that I am in');
          mustUpdateLeftPanel = true;
          return;
        }
      }
      else if (event.info.eventType == 'join' || event.info.eventType == 'leave') {
        //  'JOIN' event
        var isJoin = event.info.eventType == 'join' ? true : false;

        //  I joined some channel from mobile.  Web needs to UPDATE left Panel.
        if (event.fromEntity == $scope.member.id) {

          //  leave event of myself cannot get here!
//                    console.log('I joined something');

          mustUpdateLeftPanel = true;
          return;
        }

        var updateEntity = entityAPIservice.getEntityFromListById($rootScope.joinedEntities, event.toEntity[0]);
        if (updateEntity) {
          //if (isJoin) console.log('Someone joined to related entity')
          //else console.log('Someone left related entity')

          mustUpdateLeftPanel = true;
          return;
        }
      }
      else if (event.info.eventType == 'create') {
        //  'CREATE' event
        //  Someone created channel 'a',
        //  I should be able to see channel 'a' as one of available channels
        //  when attempting to join other channel.
        //  No matter who created what, just update left panel.

//                console.log('create')
        if (event.fromEntity == $scope.member.id) {
//                    console.log('I created channel')
        }
        else {
//                    console.log('someone created channel')
        }
        mustUpdateLeftPanel = true;
        return;
      }
      else if (event.info.eventType == 'archive') {
        //  'ARCHIVE' event
        //  ASSUMPTION 1. YOU CAN ARCHIVE ONLY ONE ENTITY AT A TIME.
        //  Same reason as 'archive' situation, just update left panel.
        //  TODO: HANDLE SITUATION WHEN SOMEONE ARCHIVED CURRENT ENTITY
        //  TODO: ERROR HANDLER WILL HANDLE ABOVE SITUATION.

        mustUpdateLeftPanel = true;

        if (event.toEntity[0] == $scope.currentEntity.id) {
//                    $timeout.cancel($scope.promise);
//
//                    console.log('someone archived current channel')
//                    $state.go('messages');
          return;
        }
        else {
//                    console.log('someone archived some channel')
        }
        return;
      }
      else {
        console.error(event);
      }

      return mustUpdateLeftPanel;
    });

    if (mustUpdateLeftPanel) {
      $scope.$emit('updateLeftPanelCaller');
    }

  }


  // NEW MESSAGE
  //  if 'alarm' Field in response from update call is not empty,
  //  we need to handle alarm.
  //  'alarm' field is not empty when
  //      1. someone posts new messages in any other channels including 'not joined' channel.
  //      2. someone shares/comment on file.
  function updateAlarmHandler(alarm) {
    if (alarm.alarmCount == 0) return;

    var alarmTable = alarm.alarmTable;

    _.each(alarmTable, function(element, index, list) {
      //  Alarm is from me.  Don't worry about this.
      if (element.fromEntity == $scope.member.id) return;

      var updateEntity;

      // Alarm is to me --> DIRECT MESSAGE TO ME.
      // When new message came in through DM to me, update 'fromEntity'.
      if (element.toEntity[0] === ($scope.member.id) ) {
        //  DIRECT MESSAGE with fromEntity is already open, so DON'T WORRY ABOUT IT.
        if(element.fromEntity == $scope.currentEntity.id) {
          // Still needs to update meesage list on left bottom.
          $rootScope.$broadcast('updateMessageList');

          return;
        }

        updateEntity = entityAPIservice.getEntityFromListById($scope.memberList, element.fromEntity);
        var toEntity = entityAPIservice.getEntityFromListById($scope.totalEntities, element.toEntity[0]);

        $rootScope.$broadcast('updateMessageList');
        desktopNotificationService.addNotification(updateEntity, toEntity);
      }
      else  {
        //  'toEntity' may be an array.
        _.each(element.toEntity, function(toEntityElement, index, list) {
          updateEntity = entityAPIservice.getEntityFromListById($scope.joinEntities, element.toEntity[0]);

          //  updateEntity is archived || I don't care about updateEntity.
          if (angular.isUndefined(updateEntity)) return;

          var toEntity = entityAPIservice.getEntityFromListById($scope.totalEntities, element.fromEntity);

          //  If 'toEntity' is an entity that I'm currently looking at, check browser's visibility state.
          /*
           TODO: CURRENT ISSUE - CHROME ON MAC/LINUX returns
           'visible' for 'document.webkitVisibilityState', and
           'false' for 'document.webkitHidden' when window is minimized.
           */
          if (updateEntity.id == $scope.currentEntity.id) {
            if (document.hidden || !$scope.hasFocus) {
              // User has current entity open in jandi.com but not watching it!
              desktopNotificationService.addNotification(toEntity, updateEntity);
            }
            return;
          }


          desktopNotificationService.addNotification(toEntity, updateEntity);
          entityAPIservice.updateBadgeValue(updateEntity, -1);
        });
      }

    });
  }

  function eventMsgHandler(msg) {
    var newMsg = msg;
    newMsg.eventType = '/' + msg.info.eventType;

    newMsg.message = {};
    newMsg.message.contentType = 'systemEvent';
    newMsg.message.content = {};
    newMsg.message.writer = msg.fromEntity;
    var action = '';

    switch(msg.info.eventType) {
      case 'invite':
        action = $filter('translate')('@msg-invited');
        newMsg.message.invites = [];
        _.each(msg.info.inviteUsers, function(element, index, list) {
          var entity = entityAPIservice.getEntityFromListById($rootScope.memberList, element);
          newMsg.message.invites.push(entity)
        });
        break;
      case 'join' :
        action = $filter('translate')('@msg-joined');
        break;
      case 'leave' :
        action = $filter('translate')('@msg-left');
        break;
      case 'create' :
        if (msg.info.entityType == 'channel') {
          action = $filter('translate')('@msg-create-ch');
        } else {
          action = $filter('translate')('@msg-create-pg');
        }
        break;
    }

    newMsg.message.content.actionOwner = memberService.getName(msg.fromEntity);
    newMsg.message.content.body = action;

    return newMsg;
  }

  //  Updating message marker for current entity.
  function updateMessageMarker() {
    messageAPIservice.updateMessageMarker(entityId, entityType, $scope.msgLoadStatus.lastUpdatedId)
      .success(function(response) {
        //console.log('----------- successfully updated message marker for entity id ' + $scope.currentEntity.id + ' to ' + $scope.msgLoadStatus.lastUpdatedId + ' with ' + $scope.currentEntity.type)
      })
      .error(function(response) {
        console.log('message marker not updated for ' + $scope.currentEntity.id);
      });
  }

  function onHttpRequestError(response) {
    //  SOMEONE OR ME FROM OTHER DEVICE DELETED CURRENT ENTITY.
    if (response.code == CURRENT_ENTITY_ARCHIVED) {
      //console.log('okay channel archived');
      $scope.updateLeftPanelCaller();
      $rootScope.toDefault = true;
      return;
    }

    if (response.code == INVALID_SECURITY_TOKEN) {
      //console.debug('INVALID SECURITY TOKEN.');
      $state.go('signin');
      return;
    }

    if (response === 'Unauthorized') {
      //console.debug('logged out');
      leftpanelAPIservice.toSignin();
    }
  }


  // scope 소멸시(전환시) update polling 해제
  $scope.$on('$destroy', function(){
    $timeout.cancel($scope.promise);
  });

  function log(string) {
//        console.log(string);
  }

  //  when textarea gets resized, msd-elastic -> adjust function emits 'elastic:resize'.
  //  listening to 'elastic:resize' and move msg-holder to right position.
  $scope.$on('elastic:resize', function() {
    $('.msgs').css('margin-bottom', $('#message-input').outerHeight() - 30);
  });

  $scope.setCommentFocus = function(file) {
    if ($state.params.itemId != file.id) {
      $rootScope.setFileDetailCommentFocus = true;

      $state.go('files', {
        userName    : file.writer.name,
        itemId      : file.id
      });
    }
    else {
      fileAPIservice.broadcastCommentFocus();
    }
  };

  $scope.$on('onStageLoadedToCenter', function() {
    $('#file-detail-comment-input').focus();
  });


  $scope.onShareClick = function(file) {
    fileAPIservice.broadcastFileShare(file);
  };


  // Callback when window loses its focus.
  window.onblur = function() {
    $scope.hasFocus = false;
  }
  // Callback when window gets focused.
  window.onfocus = function() {
    $scope.hasFocus = true;
  }
});
