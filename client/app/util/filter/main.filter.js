'use strict';

var app = angular.module('jandiApp');

/*
 *  @filter     : date formatting especially append ordinal suffix of day
 *  @usage      : "oo"
 *  @example    : doo, ddoo
 */
app.filter('ordinalDate', function($filter) {
    var suffixes = ["th", "st", "nd", "rd"];
    return function(input, format) {
        if (isNaN(input)) return false;
        var dtfilter = $filter('date')(input, format);
        var day = parseInt($filter('date')(input, 'dd'));
        var relevantDigits = (day < 30) ? day % 20 : day % 30;
        var suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
        return dtfilter.replace('oo', suffix);
    };
});

/*
 *  @filter     : byte formatting
 */
app.filter('bytes', function() {
    return function(bytes, precision) {
        if (bytes === 0) return '0 bytes';
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 0;
        var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + units[number];
    }
});

app.filter('parseUrl', function() {
    //URLs starting with http://, https://, or ftp://
    //var urls = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    var urls = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    var uris = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    //Change email addresses to mailto:: links.
    var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;

    return function(text) {

        var urlStrs = text.match(urls);
        _.forEach(urlStrs, function(urlStr) {
            var tempUrlStr = '<a href="' + urlStr + '" target="_blank">' + urlStr + '</a>';
            try {
                tempUrlStr = decodeURI(tempUrlStr);
            }
            catch(err) {
//                console.error(err);
            }
            text = text.replace(urlStr, tempUrlStr);
        });

        var uriStrs = text.match(uris);
        _.forEach(uriStrs, function(uriStr) {
            var tempUriStr = '<a href="' + uriStr + '" target="_blank">' + uriStr + '</a>';
            try {
                tempUriStr = decodeURI(tempUriStr);
            }
            catch(err) {
//                console.error(err);
            }
            text = text.replace(uriStr, tempUriStr);
        });



        var emailStrs = text.match(emails);
        _.forEach(emailStrs, function(emailStr) {
            var tempEmailStr = '<a href="mailto:' + emailStr + '">' + emailStr + '</a>';
            try {
                tempEmailStr = decodeURI(tempEmailStr);
            }
            catch(err) {
//                console.error(err);
            }
            text = text.replace(emailStr, tempEmailStr);
        });

        return text;
    };

});

/*
 used in 'inviteFromChannelModal.tpl.html'
 */
app.filter('userByName', ['$rootScope', function($rootScope) {
    return function(input, name) {
        if (name === undefined)
            return input;

        name = name.toLowerCase();

        var returnArray = [];

        _.each(input, function(member) {
            var fullName = member.name.toLowerCase();

            if(fullName.indexOf(name) > -1) {
                returnArray.push(member)
            }
        });

        return returnArray;
    }
}
]);

app.filter('getName', ['memberService',
    function(memberService) {
        return function(input) {
            if (angular.isUndefined(input)) return '';

            if (angular.isNumber(input))
                return memberService.getNameById(input);

            if (input.type != 'user') return input.name;

            return memberService.getName(input);
        }
    }
]);

app.filter('getUserStatusMessage', ['memberService',
    function(memberService) {
        return function(member) {
            return memberService.getStatusMessage(member);
        }
    }
]);

app.filter('getUserDepartment', ['memberService',
    function(memberService) {
        return function(member) {
            return memberService.getDepartment(member);
        }
    }
]);

app.filter('getUserPosition', ['memberService',
    function(memberService) {
        return function(member) {
            return memberService.getPosition(member);
        }
    }
]);

app.filter('getUserPhoneNumber', ['memberService',
    function(memberService) {
        return function(member) {
            return memberService.getPhoneNumber(member);
        }
    }
]);

app.filter('getUserEmail', ['memberService',
    function(memberService) {
        return function(member) {
            return memberService.getEmail(member);
        }
    }
]);

app.filter('getSmallThumbnail', ['$rootScope',
    function($rootScope) {
        return function(member) {
            return $rootScope.server_uploaded + (member.u_photoThumbnailUrl.smallThumbnailUrl || member.u_photoUrl);
        }
    }
]);
app.filter('getMediumThumbnail', ['$rootScope',
    function($rootScope) {
        return function(member) {
            return $rootScope.server_uploaded + (member.u_photoThumbnailUrl.mediumThumbnailUrl || member.u_photoUrl);
        }
    }
]);
app.filter('getlargeThumbnail', ['$rootScope',
    function($rootScope) {
        return function(member) {
            return $rootScope.server_uploaded + (member.u_photoThumbnailUrl.largeThumbnailUrl || member.u_photoUrl);
        }
    }
]);


/*

 */
/*
 used in file type dropdown.
 */
app.filter('upperFirstCharacter', function() {
    return function(input) {
        if (angular.isUndefined(input) || input.isNumber ) return input;
        if (input === 'pdf') return 'PDF';

        var newChar = input.charAt(0).toUpperCase() + input.slice(1, input.length);

        return newChar;
    }
});

/*/
 used in 'rpanel-header-toolbar'
 */
app.filter('getNameInFileResult', ['userAPIservice', '$rootScope',
    function(userAPIservice, $rootScope) {
        return function(input) {
            if ( input === 'all') return input;
            if ( input === $rootScope.user.id || input === 'mine' ) return 'you';

            return userAPIservice.getNameFromUserId(input);
        }
    }
]);

/**
 *
 */

app.filter('getMixPanelFormat', function() {
    return function(input) {
        input = input.toLowerCase();

        // replacing all space with '_'.
        input = input.replace(/ /g, "_");
        return input;
    }
});