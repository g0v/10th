// Generated by LiveScript 1.3.1
(function(){
  var lderror;
  lderror = require('lderror');
  (function(it){
    return module.exports = it;
  })(function(backend){
    var db, ref$, api, app, autocatch;
    db = backend.db;
    ref$ = backend.route, api = ref$.api, app = ref$.app;
    autocatch = function(handler){
      return function(req, res, next){
        return handler(req, res, next)['catch'](function(it){
          return next(it);
        });
      };
    };
    app.get('/', autocatch(function(req, res, next){
      return db.query("select count(key) as count from users").then(function(r){
        var count;
        r == null && (r = {});
        count = ((r.rows || (r.rows = []))[0] || {
          count: 0
        }).count;
        return res.render('index.pug', {
          count: count
        });
      });
    }));
    api.get('/x', function(req, res, next){
      req.log.info('hi');
      return next(new lderror(1005));
    });
    return app.get('/x', function(req, res, next){
      return next(new Error());
    });
  });
}).call(this);