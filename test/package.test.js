/* global describe, it */

var expect = require('chai').expect;


describe('nodex-login-mfa-authy', function() {
  
  describe('package.json', function() {
    var json = require('../package.json');
    
    it('should have assembly metadata', function() {
      expect(json.assembly.namespace).to.equal('mfa/authy');
      
      expect(json.assembly.components).to.have.length(9);
      expect(json.assembly.components).to.include('oob/verify');
    });
  });
  
  it('should throw if required', function() {
    expect(function() {
      var pkg = require('..');
    }).to.throw(Error).with.property('code', 'MODULE_NOT_FOUND');
  });
  
});
