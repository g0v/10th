// Generated by LiveScript 1.6.0
(function(){
  var fs, fsExtra, path, crypto, isogit, http;
  fs = require('fs');
  fsExtra = require('fs-extra');
  path = require('path');
  crypto = require('crypto');
  isogit = require("isomorphic-git");
  http = require("isomorphic-git/http/node");
  (function(it){
    return module.exports = it;
  })(function(backend){
    var db, config, ref$, api, app, hmacDigest, deploy, webroot;
    db = backend.db, config = backend.config, ref$ = backend.route, api = ref$.api, app = ref$.app;
    hmacDigest = function(sig, content, key){
      var v1, v2, e;
      try {
        v1 = Buffer.from(sig);
        v2 = Buffer.from("sha1=" + crypto.createHmac('sha1', key).update(content).digest('hex'));
        if (crypto.timingSafeEqual(v1, v2)) {
          return true;
        }
      } catch (e$) {
        e = e$;
        return false;
      }
      return false;
    };
    deploy = function(arg$){
      var root, url, branch, username, password, opt;
      root = arg$.root, url = arg$.url, branch = arg$.branch, username = arg$.username, password = arg$.password;
      fsExtra.removeSync(root);
      opt = {
        fs: fs,
        http: http,
        dir: root,
        url: url,
        ref: branch || 'gh-pages',
        depth: 1,
        singleBranch: true,
        onAuth: function(){
          return {
            username: username,
            password: password
          };
        }
      };
      return isogit.clone(opt);
    };
    webroot = path.join(process.cwd(), 'frontend/web/static');
    return backend.route.extapi.post('/deploy', function(req, res){
      var url, ref$, branch;
      url = ((ref$ = req.body || (req.body = {})).repository || (ref$.repository = {})).html_url;
      branch = (/^refs\/heads\/(.+)$/.exec(req.body.ref || '') || [])[1];
      res.send({});
      if (!(url && branch)) {
        return;
      }
      return ((ref$ = config.webhook || (config.webhook = {})).list || (ref$.list = [])).map(function(d){
        var root, ref$;
        if (!hmacDigest(req.headers['x-hub-signature'], req.rawBody, d.secret)) {
          return;
        }
        if (!d.path) {
          return;
        }
        root = path.resolve(path.join(webroot, path.resolve(path.join('/', d.path))));
        console.log("[deploy] " + url + ": fetch to " + root + " ...");
        return deploy((ref$ = {
          root: root
        }, ref$.url = d.url, ref$.branch = d.branch, ref$.username = d.username, ref$.password = d.password, ref$)).then(function(){
          return console.log("[deploy] " + url + ": done.");
        });
      });
    });
  });
}).call(this);
