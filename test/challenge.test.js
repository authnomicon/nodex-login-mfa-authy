/* global describe, it, expect */

var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../lib/challenge');


describe('challenge', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@implements']).to.have.length(2);
    expect(factory['@implements'][0]).to.equal('http://schemas.authnomicon.org/js/login/mfa/challenge');
    expect(factory['@implements'][1]).to.equal('http://schemas.authnomicon.org/js/login/mfa/opt/authy/challenge');
    expect(factory['@singleton']).to.equal(true);
  });
  
  describe('challenge', function() {
    var client = {
      request_sms: function(){},
      request_call: function(){}
    };
  
    
    describe('a typical authenticator', function() {
      var params;
      
      before(function() {
        var result = {
          message: 'Ignored: SMS is not needed for smartphones. Pass force=true if you want to actually send it anyway.',
          cellphone: '+1-XXX-XXX-XX34',
          device: 'iphone',
          ignored: true,
          success: true
        };
        
        sinon.stub(client, 'request_sms').yields(null, result);
      });
    
      after(function() {
        client.request_sms.restore();
      });
      
      before(function(done) {
        var challenge = factory(client);
        var user = { id: '1', username: 'johndoe' };
        var authenticator = {
          id: '0',
          type: [ 'otp', 'oob' ],
          _userID: 123456
        }
        
        challenge(authenticator, function(_err, _params) {
          if (_err) { return done(_err); }
          params = _params;
          done();
        });
      });
    
      it('should signal authenticator', function() {
        expect(client.request_sms).to.have.been.calledOnce;
        var call = client.request_sms.getCall(0);
        expect(call.args[0]).to.equal(123456);
        expect(call.args[1]).to.be.a('function')
      });
      
      it('should not yield params', function() {
        expect(params).to.be.undefined;
      });
      
    }); // a typical authenticator
    
    describe('an authenticator as out-of-band device', function() {
      var params;
      
      before(function() {
        var result = {
          success: true,
          message: 'SMS token was sent',
          cellphone: '+1-XXX-XXX-XX34'
        };
        
        sinon.stub(client, 'request_sms').yields(null, result);
      });
    
      after(function() {
        client.request_sms.restore();
      });
      
      before(function(done) {
        var challenge = factory(client);
        var user = { id: '1', username: 'johndoe' };
        var authenticator = {
          id: '0',
          type: [ 'otp', 'oob' ],
          _userID: 123456
        }
        
        challenge(authenticator, { type: 'oob' }, function(_err, _params) {
          if (_err) { return done(_err); }
          params = _params;
          done();
        });
      });
    
      it('should request OTP via SMS', function() {
        expect(client.request_sms).to.have.been.calledOnce;
        var call = client.request_sms.getCall(0);
        expect(call.args[0]).to.equal(123456);
        expect(call.args[1]).to.equal(true);
      });
      
      it('should yield params', function() {
        expect(params).to.deep.equal({
          type: 'oob',
          confirmation: {
            channel: 'primary'
          }
        });
      });
      
    }); // an authenticator as out-of-band device
    
    describe('an authenticator as out-of-band device via telephone channel', function() {
      var params;
      
      before(function() {
        var result = {
          success: true,
          message: 'Call started...',
          cellphone: '+1-XXX-XXX-XX34'
        };
        
        sinon.stub(client, 'request_call').yields(null, result);
      });
    
      after(function() {
        client.request_call.restore();
      });
      
      before(function(done) {
        var challenge = factory(client);
        var user = { id: '1', username: 'johndoe' };
        var authenticator = {
          id: '0',
          type: [ 'otp', 'oob' ],
          _userID: 123456
        }
        
        challenge(authenticator, { type: 'oob', channel: 'tel' }, function(_err, _params) {
          if (_err) { return done(_err); }
          params = _params;
          done();
        });
      });
    
      it('should request OTP via phone call', function() {
        expect(client.request_call).to.have.been.calledOnce;
        var call = client.request_call.getCall(0);
        expect(call.args[0]).to.equal(123456);
        expect(call.args[1]).to.equal(true);
      });
      
      it('should yield params', function() {
        expect(params).to.deep.equal({
          type: 'oob',
          confirmation: {
            channel: 'primary'
          }
        });
      });
      
    }); // an authenticator as out-of-band device via telephone channel
    
  }); // challenge
  
});
