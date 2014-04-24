'use strict';

describe('restForm', function () {
  var element, $compile, scope, $exceptionHandler, $compileProvider, resourceSpy, models;
  
  beforeEach(module('restform'));

  beforeEach(module(function(_$compileProvider_) {
    $compileProvider = _$compileProvider_;
  }));

  beforeEach(module(function($exceptionHandlerProvider) {
    $exceptionHandlerProvider.mode('log');
  }));

  // Provide mock resource service
  beforeEach(function () {

      models = [
          { id: 0, name: 'one', bar: 'bar' },
          { id: 1, name: 'two', bar: 'bar' },
        ];

      var resources = [
          { get: function() { return models[0]; } },
          { get: function() { return models[1]; } },
        ];

      var index = 0;
      resourceSpy = jasmine.createSpy('resource').and.callFake(function() {
        return resources[index++ % models.length];
      });

      module(function ($provide) {
          $provide.value('$resource', resourceSpy);
        });

    });

  beforeEach(inject(function(_$compile_, $rootScope, _$exceptionHandler_) {
    $compile = _$compile_;
    $exceptionHandler = _$exceptionHandler_;
    scope = $rootScope.$new();
  }));
  
  afterEach(function() {
    if ($exceptionHandler.errors.length) {
      dump(jasmine.getEnv().currentSpec.getFullName());
      dump('$exceptionHandler has errors');
      dump($exceptionHandler.errors);
      expect($exceptionHandler.errors).toBe([]);
    }
    //dealoc(element); // TODO see if we need to dealoc
  });
  
  it('keep the contents', function() {
    element = $compile(
      '<div rf-model="x at /api/endpoint">' +
        '<p>foo</p>' +
      '</div>')(scope);

    scope.$digest();
    expect(element.find('p').length).toEqual(1);
    expect(element.text()).toEqual('foo');
  });
  
  it('creates ngResource model on bootstrap and attaches it to the scope', function() {
    var url = '/api/resource';

    element = $compile(
      '<div rf-model="x at ' + url + '">' +
        '<p>foo</p>' +
      '</div>')(scope);
          
    scope.$digest();
    expect(resourceSpy).toHaveBeenCalled();
    expect(resourceSpy.calls.mostRecent().args.length).toBeGreaterThan(0);
    expect(resourceSpy.calls.mostRecent().args[0]).toBe(url);
    expect(scope.$$childHead.x).toBe(models[0]);
  });
  
  it('creates separate scopes for seperate instances', function() {
    var url1 = '/api/one',
      url2 = '/api/two';

    element = $compile(
      '<div rf-model="x at ' + url1 + '">' +
        '<h1>{{ x.name }}</h1>' +
      '</div>' +
      '<div rf-model="x at ' + url2 + '">' +
        '<h2>{{ x.name }}</h2>' +
      '</div>')(scope);
          
    scope.$digest();
    expect(resourceSpy).toHaveBeenCalled();
    expect(resourceSpy.calls.mostRecent().args.length).toBeGreaterThan(0);
    expect(resourceSpy.calls.mostRecent().args[0]).toBe(url2);
    expect(scope.$$childHead.x).toBe(models[0]);
    expect(scope.$$childHead.$$nextSibling.x).toBe(models[1]);
    expect(element.find('h1').text()).toBe('one');
    expect(element.find('h2').text()).toBe('two');
  });
  
  it('should work well together with forms', function() {
    element = $compile(
      '<form rf-model="x at /my/endpoint">' +
        '<input ng-model="x.name">' +
        '<button ng-click="x.$save()">save</button>' +
      '</form>')(scope);
          
    scope.$digest();
    expect(element.find('input').val()).toBe('one');
  });
  
  describe('throws errors if it', function() {
  
    it('is given no url', function() {
      expect($exceptionHandler.errors.length).toBe(0);
      element = $compile(
        '<div rf-model="abc">' +
          '<p>foo</p>' +
        '</div>')(scope);
      scope.$digest();
      expect($exceptionHandler.errors.length).toBeGreaterThan(0);
      expect($exceptionHandler.errors.shift()[0].message).toMatch(/^Expected expression in form "varname at url" but got /);
    });
    
    it('was given an expression not containing "at"', function() {
      element = $compile(
        '<div rf-model="abc foo http://example.com/">' +
          '<p>foo</p>' +
        '</div>')(scope);
      scope.$digest();
      expect($exceptionHandler.errors.length).toBeGreaterThan(0);
      expect($exceptionHandler.errors.shift()[0].message).toMatch(/^Expected expression in form "varname at url" but got /);
    });
  
  });
  
});
