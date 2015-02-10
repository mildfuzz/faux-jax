var test = require('tape');

var FauxJax = require('../');

test('open throws when method not a string', function(t) {
  var xhr = new FauxJax();
  t.throws(xhr.open.bind(xhr, 421), SyntaxError, 'Bad method type throws SyntaxError');
  t.end();
});

test('open throws when method unknown', function(t) {
  var xhr = new FauxJax();
  t.throws(xhr.open.bind(xhr, 'PLURK'), SyntaxError, 'Bad method name throws SyntaxError');
  t.end();
});

test('open accepts uppercase methods', function(t) {
  var methods = ['GET', 'HEAD', 'POST', 'DELETE', 'OPTIONS', 'PUT', 'CONNECT', 'TRACE', 'TRACK'];
  t.plan(methods.length);

  methods.forEach(function(method) {
    var xhr = new FauxJax();
    t.doesNotThrow(xhr.open.bind(xhr, method), 'Uppercase accepted methods does not throws');
  });
});

test('open normalizes lowercase methods', function(t) {
  var methods = ['get', 'head', 'post', 'delete', 'options', 'put'];
  t.plan(methods.length * 2);

  methods.forEach(function(method) {
    var xhr = new FauxJax();
    t.doesNotThrow(xhr.open.bind(xhr, method), 'Lowercased accepted methods does not throws');
    t.equal(xhr.method, method.toUpperCase(), 'Method name was');
  });
});

test('open throws on no-uppercase forbidden methods (no auto normalization)', function(t) {
  var methods = ['connect', 'trace', 'track'];

  t.plan(methods.length);

  methods.forEach(function(method) {
    var xhr = new FauxJax();
    t.throws(xhr.open.bind(xhr, method), Error);
  });
});

test('open initialize properties', function(t) {
  var xhr = new FauxJax();
  xhr.open('poSt', '/lol.gif');

  t.equal(xhr.method, 'POST');
  t.equal(xhr.async, true);
  t.equal(xhr.url, '/lol.gif');
  t.equal(xhr.username, undefined);
  t.equal(xhr.password, undefined);

  t.end();
});

test('open fires a `readystatechange` event', function(t) {
  t.plan(2);
  var sinon = require('sinon');

  var clock = sinon.useFakeTimers();
  clock.tick(500);

  var xhr = new FauxJax();

  var expectedEvent = {
    bubbles: false,
    cancelable: false,
    currentTarget: xhr,
    eventPhase: 0,
    target: xhr,
    timestamp: 500,
    type: 'readystatechange'
  };

  xhr.onreadystatechange = function(e) {
    t.deepEqual(e, expectedEvent, 'Received an event through onreadystatechange=fn listener');
  };

  xhr.addEventListener('readystatechange', function(e) {
    t.deepEqual(e, expectedEvent, 'Received an event through addEventListener interface');
  });

  xhr.open('GET', '/google.gif');

  clock.restore();
});
