// Generated by LiveScript 1.6.0
(function(){
  var crypto, lderror, throttle;
  crypto = require('crypto');
  lderror = require('lderror');
  throttle = require('@servebase/backend/throttle');
  (function(f){
    return module.exports = function(it){
      return f(it);
    };
  })(function(backend){
    var db, config, route, mdw;
    db = backend.db, config = backend.config, route = backend.route;
    mdw = {
      throttle: throttle.kit.login,
      captcha: backend.middleware.captcha
    };
    route.auth.post('/passwd/reset/:token', mdw.throttle, mdw.captcha, function(req, res){
      var token, password;
      token = req.params.token;
      password = {
        plain: req.body.password
      };
      return db.userStore.hashing(password.plain, true, true).then(function(ret){
        password.hashed = ret;
        return db.query(["select users.key from users,pwresettoken", "where pwresettoken.token=$1 and users.key=pwresettoken.owner"].join(" "), [token]);
      }).then(function(r){
        var user;
        r == null && (r = {});
        if (!(r.rows || (r.rows = [])).length) {
          return lderror.reject(403);
        }
        user = r.rows[0];
        user.password = password.hashed;
        return db.query("update users set (password,method) = ($2,$3) where key = $1", [user.key, user.password, 'local']);
      }).then(function(){
        return db.query("delete from pwresettoken where pwresettoken.token=$1", [token]);
      }).then(function(){
        return res.send();
      });
    });
    route.app.get('/auth/passwd/reset/:token', mdw.throttle, function(req, res){
      var token;
      token = req.params.token;
      if (!token) {
        return lderror.reject(400);
      }
      return db.query("select owner,time from pwresettoken where token = $1", [token]).then(function(r){
        var obj;
        r == null && (r = {});
        if (!(r.rows || (r.rows = [])).length) {
          return lderror.reject(403);
        }
        obj = r.rows[0];
        if (new Date().getTime() - new Date(obj.time).getTime() > 1000 * 600) {
          return res.redirect('/auth/passwd/reset/expire/');
        }
        res.cookie("password-reset-token", token);
        return res.redirect("/auth/passwd/reset/change/");
      });
    });
    return route.auth.post('/passwd/reset', mdw.throttle, mdw.captcha, function(req, res){
      var email, obj;
      email = (req.body.email + "").trim();
      if (!email) {
        return lderror.reject(400);
      }
      obj = {};
      return db.query("select key from users where username = $1", [email]).then(function(r){
        var time;
        r == null && (r = {});
        if ((r.rows || (r.rows = [])).length === 0) {
          return lderror.reject(404);
        }
        time = new Date();
        obj.key = r.rows[0].key;
        obj.hex = (r.rows[0].key + "") + crypto.randomBytes(30).toString('hex');
        obj.time = time;
        return db.query("delete from pwresettoken where owner=$1", [obj.key]);
      }).then(function(){
        return db.query("insert into pwresettoken (owner,token,time) values ($1,$2,$3)", [obj.key, obj.hex, obj.time]);
      }).then(function(){
        return backend.mailQueue.byTemplate('reset-password', email, {
          token: obj.hex
        }, {
          now: true
        });
      }).then(function(){
        return res.send('');
      });
    });
  });
}).call(this);
