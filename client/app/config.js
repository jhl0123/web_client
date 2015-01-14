'use strict';

angular.module('services.config', [])
    .constant('configuration', {
        name            : 'local',
        api_address     : 'http://www.jandi.io/',
        api_version     : '2',
        ga_token        : 'UA-54051037-1',
        ga_token_global : 'UA-54051037-4',
        mp_token        : '081e1e9730e547f43bdbf59be36a4e31',
        base_url        : '.jandi.io',
        base_protocol   : 'http://',
        main_address    : 'http://www.jandi.io/main/#/'
    }
);
