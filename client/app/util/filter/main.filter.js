'use strict';

var app = angular.module('jandiApp');
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
  };
});

// tobe no longer used
app.filter('parseUrl', function() {
  //URLs starting with http://, https://, or ftp://
  //var urls = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  var urls = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  var uris = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  //Change email addresses to mailto:: links.
  // var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
  // ref : http://blog.trojanhunter.com/2012/09/26/the-best-regex-to-validate-an-email-address/
  var emails = /[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/gim;

  return function(text) {

    // fix : JND-846
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

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
      // if <slide ..>www.tosslab.com, uriStr value is ;www.tosslab.com. so remove ; in uriStr
      uriStr = uriStr.substring(uriStr.indexOf('www'));
      var tempUriStr = '<a href="http://' + uriStr + '" target="_blank">' + uriStr + '</a>';
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
        returnArray.push(member);
      }
    });

    return returnArray;
  };
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
    };
  }
]);

app.filter('getUserStatusMessage', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getStatusMessage(member);
    };
  }
]);

app.filter('getUserDepartment', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getDepartment(member);
    };
  }
]);

app.filter('getUserPosition', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getPosition(member);
    };
  }
]);

app.filter('getUserPhoneNumber', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getPhoneNumber(member);
    };
  }
]);

app.filter('getUserEmail', ['memberService',
  function(memberService) {
    return function(member) {
      return memberService.getEmail(member);
    };
  }
]);

app.filter('getProfileImage', function(memberService) {
  return function(memberId, type) {
    return memberService.getProfileImage(memberId, type);
  };
});

app.filter('getSmallThumbnail', ['$filter', 'memberService', 'config', 'CoreUtil',
  function($filter, memberService, config, CoreUtil) {
    return function(member) {
      var url;
      var memberId;
      if (_.isObject(member)) {
        memberId = member.id;
        url = member && member.u_photoThumbnailUrl && member.smallThumbnailUrl || '';
      } else {
        memberId = member;
        url = memberService.getSmallThumbnailUrl(member);
      }
      url = url || memberService.getProfileImage(memberId);
      return $filter('getFileUrl')(url);
    };
  }
]);

app.filter('getMediumThumbnail', ['$filter', 'memberService', 'config',
  function($filter, memberService, config) {
    return function(member) {
      var url;
      if (_.isObject(member)) {
        url = member && member.u_photoThumbnailUrl && member.u_photoThumbnailUrl.mediumThumbnailUrl || '';
      } else {
        url = memberService.getSmallThumbnailUrl(member);
      }
      return $filter('getFileUrl')(url);
    };
  }
]);
app.filter('getlargeThumbnail', ['$filter', 'memberService', 'config',
  function($filter, memberService, config) {
    return function(member) {
      var url;
      if (_.isObject(member)) {
        url = member && member.u_photoThumbnailUrl && member.u_photoThumbnailUrl.largeThumbnailUrl || '';
      } else {
        url = memberService.getSmallThumbnailUrl(member);
      }
      return $filter('getFileUrl')(url);
    };
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
  };
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
    };
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
  };
});

app.filter('isDisabledMember', function(memberService) {
  return function(member) {
    return !memberService.isActiveMember(member);
  };
});


app.filter('getMemberList', function() {
  return function(members, status) {
    var enabledMembers = [];
    _.each(members, function(member) {
      if (member.status == status)
        enabledMembers.push(member);
    });

    return enabledMembers;
  };
});

/**
 * 프로토콜이 없을 경우 프로토콜을 붙여주는 fileUrl 필터
 */
app.filter('getFileUrl', ['config',
  function(config) {
      return function(url) {
          var hasProtocol = /^https?:/.test(url);
          //todo: config.file_address 로 추후 변경해야함
          return hasProtocol ? url : config.file_address + url;
        };
    }
]);

/**
 * control key 에 해당하는 text 를 반환한다.
 */
app.filter('ctrlKey', ['Browser',
  function(Browser) {
    return function() {
      return Browser.platform.isMac ? 'Cmd' : 'Ctrl';
    };
  }
]);

/**
 * 읽지 않은 badge count에 대한 filter
 */
app.filter('unreadBadgeCount', function() {
  return function(count) {
    return count > 999 ? '999+' : count;
  }
});
