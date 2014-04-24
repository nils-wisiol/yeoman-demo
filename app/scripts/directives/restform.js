'use strict';

angular.module('restform', ['ngResource'])
  .directive('rfModel', function($resource) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {
        var expr = attrs.rfModel;
        var match = expr.match(/^\s*([\s\S]+?)\s+at\s+([\s\S]+?)\s*$/),
          varname, url;
        
        if (!match) {
          throw new Error('Expected expression in form "varname at url" but got "' + expr + '".');
        }
        
        varname = match[1];
        url = match[2];
        
        scope[varname] = $resource(url);
      }
    };
  });

