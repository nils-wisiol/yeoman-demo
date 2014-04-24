'use strict';

/**
 * The restform module provides the rf-model directive.
 * 
 * The rf-model directive creates a child scope on an element and provides
 * data loaded from a RESTful interface to this scope.
 *
 * Usage:
 * <ANY rf-model="myVar at /my/api/endpoint"> ... </ANY>
 * 
 * This provides the variable myVar to the child scope of the element and
 * populates it with the data loaded from /my/api/endpoint.
 * 
 * Example:
 * Assume GET /api/sensors/1 returns JSON like
 * { name: "Temperature Sensor", value: 26.4, unit: "C" }
 *
 * <form rf-model="sensor at /api/sensors/1">
 *   <h1>Sensor 1</h1>
 *   Name: <input type="text" ng-model="sensor.name">
 *   <button ng-click="sensor.$save()">Save</button>
 * </form>
 *
 * On clicking the save button, angular will POST to /api/sensors/1 the modified
 * JSON.
 * 
 */
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
        
        scope[varname] = $resource(url).get();
      }
    };
  });

