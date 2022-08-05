// Generated by LiveScript 1.6.0
(function(){
  var base;
  base = {
    hostname: function(req){
      return req.hostname;
    },
    ip: function(req){
      return req.header('cf-connecting-ip') || req.header('x-real-ip') || req.ip || (req.header('x-forwarded-for') || '').split(',').pop().trim() || req.socket.remoteAddress || req.connection.remoteAddress || 'unknown-ip';
    },
    autocatch: function(handler, silence){
      silence == null && (silence = false);
      return function(req, res, next){
        var ret;
        ret = handler(req, res, next);
        if (!(ret instanceof Promise)) {
          if (silence) {
            return;
          }
          return next(new Error('autocatch is used yet return value of callback is not a Promise.'));
        } else {
          return ret['catch'](function(it){
            return next(it);
          });
        }
      };
    },
    routecatch: function(route){
      ['get', 'post', 'put', 'delete'].map(function(n){
        route["_" + n] = route[n];
        return route[n] = function(){
          var args, res$, i$, to$;
          res$ = [];
          for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
            res$.push(arguments[i$]);
          }
          args = res$;
          args = args.map(function(d, i){
            if (d instanceof Function && i === args.length - 1) {
              return base.autocatch(d, true);
            } else {
              return d;
            }
          });
          return this["_" + n].apply(this, args);
        };
      });
      return route;
    },
    signedin: function(req, res, next){
      var ref$;
      if (req.user && req.user.key && req.user.username) {
        return next();
      }
      return next((ref$ = new Error(), ref$.name = 'lderror', ref$.id = 1000, ref$.redirect = "/auth/?nexturl=" + req.originalUrl, ref$));
    },
    reject: function(code, msg){
      var ref$;
      code == null && (code = 403);
      msg == null && (msg = "");
      return Promise.reject((ref$ = new Error(typeof msg === typeof {} ? JSON.stringify(msg) : msg), ref$.code = code, ref$.name = 'lderror', ref$));
    },
    isAdmin: function(req, res, next){
      var ref$;
      return req.user && req.user.staff === 1
        ? next()
        : next((ref$ = new Error(), ref$.name = 'lderror', ref$.id = 404, ref$));
    },
    validateKey: function(req, res, next){
      var val;
      if ((val = req.params.key) && !isNaN(val) && val > 0) {
        return next();
      }
      return next(new lderror(400));
    },
    clearCookie: function(req, res){
      var domain, i$, to$, i, d;
      domain = (req.hostname + "").split('.').filter(function(it){
        return it;
      });
      for (i$ = 0, to$ = domain.length - 1; i$ < to$; ++i$) {
        i = i$;
        d = domain.slice(i).join('.');
        res.clearCookie('connect.sid', {
          path: '/',
          domain: d
        });
        res.clearCookie('global', {
          path: '/',
          domain: d
        });
        res.clearCookie('connect.sid', {
          path: '/',
          domain: "." + d
        });
        res.clearCookie('global', {
          path: '/',
          domain: "." + d
        });
        res.clearCookie('connect.sid', {
          path: '/',
          domain: "www." + d
        });
        res.clearCookie('global', {
          path: '/',
          domain: "www." + d
        });
      }
      res.clearCookie('connect.sid', {
        path: '/'
      });
      return res.clearCookie('global', {
        path: '/'
      });
    }
  };
  module.exports = base;
}).call(this);
