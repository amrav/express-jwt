var jwt = require('jsonwebtoken');
var assert = require('assert');

var restifyjwt = require('../lib');
var restify = require('restify');

describe('extra_load_function', function(){
  var req = {};
  var res = {};

  it('should load extra data values if enhancedLoadFunction is set', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    var extraLoadCallback = function(decoded, cb){
      decoded.extraFoo = 'foobar';
      cb(null, decoded);
    };

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    restifyjwt({secret: secret, enhancedLoadFunction: extraLoadCallback})(req, res, function() {
      assert.equal('foobar', req.user.extraFoo);
    });
  });

  it('should allow enhancedLoadFunction to indicate session expired', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign({foo: 'bar'}, secret);

    var extraLoadCallback = function(decoded, cb){
      cb(new restify.errors.UnauthorizedError('The token has been revoked.'), {});
    };

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    restifyjwt({secret: secret, enhancedLoadFunction: extraLoadCallback})(req, res, function(err, decoded) {
      assert.ok(err);
      assert.equal(err.body.code, 'UnauthorizedError');
      assert.equal(err.message, 'The token has been revoked.');
    });
  });

});
