// we wait for window load because __zuul makes ajax requests itself
// otherwise we intercept them too
window.addEventListener('load', run);

function run() {

  var support = require('../lib/support');

  if (support.hasXDomainRequest) {
    require('./XDomainRequest/');
  }

  if (support.hasXMLHttpRequest) {
    require('./XMLHttpRequest/');
  }

  var test = require('tape');
  var fauxJax = require('../');

  if (support.hasXMLHttpRequest) {
    test('nothing gets intercepted by default', function(t) {
      t.plan(2);
      var xhr = new XMLHttpRequest();
      xhr.open('GET', location.pathname);
      xhr.send();
      if (support.addEventListener) {
        t.pass('We used addEventListener');
        xhr.addEventListener('load', function() {
          t.ok(
            /faux\-jax/.test(xhr.responseText),
            'We got the current location content with ajax'
          );
        });
      } else {
        xhr.onload = function() {
          t.pass('We used onload=');
          t.ok(
            /faux\-jax/.test(xhr.responseText),
            'We got the current location content with ajax'
          );
        };
      }
    });

    test('fauxJax intercepts XMLHttpRequests', function(t) {
      fauxJax.install();
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/fo1pf1');
      xhr.send();
      xhr.respond(200, {}, 'WO!');
      t.equal(1, fauxJax.requests.length, 'We intercepted one xhr');
      t.equal('WO!', xhr.responseText, 'xhr.respond() call worked');
      fauxJax.restore();
      t.equal(0, fauxJax.requests.length, 'fauxJax.restore() resets fauxJax.requests to []');
      t.end();
    });
  }

  if (support.hasXDomainRequest) {
    test('fauxJax intercepts XDomainRequests', function(t) {
      fauxJax.install();
      var xdr = new XDomainRequest();
      xdr.open('GET', '/fo1pf1');
      xdr.send();
      xdr.respond(200, {}, 'WO!');
      t.equal(1, fauxJax.requests.length, 'We intercepted one xdr');
      t.equal('WO!', xdr.responseText, 'xdr.respond() call worked');
      fauxJax.restore();
      t.equal(0, fauxJax.requests.length, 'fauxJax.restore() resets fauxJax.requests to []');
      t.end();
    });
  }
}