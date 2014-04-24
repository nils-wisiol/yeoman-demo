'use strict';

describe('restForm', function () {
  var element, $compile, scope, $exceptionHandler, $compileProvider, resourceSpy, model;
  
  beforeEach(module('restform'));

  beforeEach(module(function(_$compileProvider_) {
    $compileProvider = _$compileProvider_;
  }));

  beforeEach(module(function($exceptionHandlerProvider) {
    $exceptionHandlerProvider.mode('log');
  }));

  // Provide mock resource service
  beforeEach(function () {

      model = { foo: 'foo', bar: 'bar' };

      resourceSpy = jasmine.createSpy('resource').and.returnValue(model);

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
    expect(scope.$$childHead.x).toBe(model);
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
