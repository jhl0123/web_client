/**
 * @fileoverview Auth API 서비스
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('AuthApi', AuthApi);

  function AuthApi($http, $rootScope, $state, storageAPIservice, accountService, publicService) {
    var authAPI = {};
    var _isRefreshTokenLock = false;

    authAPI.signIn = function(userdata) {
      return $http({
        method: "POST",
        url: $rootScope.server_address + 'token',
        data: userdata
      });
    };

    authAPI.requestPasswordEmail = function(email) {
      return $http({
        method: 'POST',
        url: $rootScope.server_address + 'accounts/password/resetToken',
        data: {
          email: email,
          lang: accountService.getAccountLanguage()
        }
      });
    };

    authAPI.validatePasswordToken = function(teamId, token) {
      return $http({
        method  : 'POST',
        url     : $rootScope.server_address + 'validation/passwordResetToken',
        data    : {
          'teamId'    : parseInt(teamId),
          'token'     : token
        }
      });
    };

    authAPI.resetPassword = function(token, password) {
      return $http({
        method  : 'PUT',
        url     : $rootScope.server_address + 'accounts/password',
        data    : {
          token: token,
          password: password,
          lang: accountService.getAccountLanguage()
        }
      });
    };

    /**
     * When signed out, account variable under $rootScope gets deleted.
     * Thus, when there is account under $rootScope, it means user stays signed in.
     *
     * @returns {boolean}
     */
    authAPI.isSignedIn = function() {
      return accountService.hasAccount();
    };


    /**
     * refresh token 으로 access token 을 조회한다.
     */
    authAPI.requestAccessTokenWithRefreshToken = function() {
      var refreshToken = storageAPIservice.getRefreshToken();

      if (!_isRefreshTokenLock) {
        _isRefreshTokenLock = true;
        if (!refreshToken) {
          publicService.signOut();
        } else {
          $http({
            method  : "POST",
            url     : $rootScope.server_address + 'token',
            data    : {
              'grant_type'    : 'refresh_token',
              'refresh_token' : refreshToken
            }
          }).success(_.bind(_onSuccessAccessTokenWithRefreshToken, this, refreshToken))
            .error(publicService.signOut)
            .finally(function() {
            _isRefreshTokenLock = false;
          });
        }
      }
    };

    /**
     * refresh token 성공 콜백
     * @param {string} refreshToken
     * @param {object} response
     * @private
     */
    function _onSuccessAccessTokenWithRefreshToken(refreshToken, response) {
      var hash = window.location.hash;

      response.refresh_token = refreshToken;
      storageAPIservice.setTokenCookie(response);

      //현 시점에 $state 에 저장된 정보가 없기 때문에 hash 정보 변경 이벤트를 강제로 발생하여 routing 로직이 재실행 되도록 한다.
      if (!hash || hash !== '#/') {
        window.location.hash = '#/';
        //angular ui router 에서 hash change 이벤트 핸들러 수행 후 hash 값을 원본으로 변경하기 위해 setTimeout 을 사용한다.
        setTimeout(function() {
          window.location.hash = hash;
        });
      } else {
        //hash 값이 없다면 default topic 으로 이동해야 하는 경우 이므로 messages.home 으로 routing 한다.
        $state.go('messages.home');
      }
    }


    function DeleteToken() {
      return $http({
        method: 'DELETE',
        url: $rootScope.server_address + 'token',
        data: {
          refresh_token: storageAPIservice.getRefreshTokenLocal() || storageAPIservice.getRefreshTokenSession()
        },
        headers : { "Content-Type": "application/json;charset=utf-8" }

      });
    }


    authAPI.handleConstructionErr = function() {
      $state.go('503');
    };

    authAPI.on40300Err = function() {
      $state.go('messages.home');
    };

    return authAPI;
  }
})();