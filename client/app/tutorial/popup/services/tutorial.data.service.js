/**
 * @fileoverview Tutorial 에 필요한 데이터를 담는 저장소. account 정보도 저장한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialData', TutorialData);

  /* @ngInject */
  function TutorialData() {
    var _data;
    var _account;

    this.get = get;
    this.set = set;
    this.getAccount = getAccount;
    this.setAccount = setAccount;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      reset();
    }


    /**
     * 값을 초기화 한다.
     */
    function reset() {
      _data = {};
    }

    function getAccount() {
      return _account;
    }

    function setAccount(accountData) {
      console.log(accountData)
      _account = accountData;
    }

    /**
     *
     * @param key
     * @returns {*}
     */
    function get(key) {
      if (_.isString(key)) {
        return _data[key];
      } else {
        return _data;
      }
    }

    /**
     * query 를 설정한다.
     * @param {string|object} key
     * @param {string|number} value
     */
    function set(key, value) {
      if (_.isObject(key)) {
        _.each(key, function(value, property) {
          set(property, value);
        });
      } else if (_.isString(key)) {
        _data[key] = value;
      }
    }
  }
})();
