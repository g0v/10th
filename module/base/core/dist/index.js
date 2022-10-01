// Generated by LiveScript 1.6.0
(function(){
  var servebase;
  servebase = {
    corectx: function(cb){
      return new Promise(function(res, rej){
        var ret;
        ret = ldc.register(['core'], function(o){
          return o.core.init().then(function(){
            return cb.apply(o.core, [o]);
          }).then(res)['catch'](rej);
        });
        return ldc.init(ret);
      });
    },
    config: function(o){
      o == null && (o = {});
      if (this._inited) {
        console.warn("[@servebase/core] `servebase.config` is called after `@servebase/core` is initialized.\n[@servebase/core] This may lead to inconsistent behavior.");
      }
      return this._cfg = o;
    },
    _init: function(o){
      var i18n, err, this$ = this;
      servebase._inited = true;
      if (o != null) {
        servebase._cfg = o;
      }
      this._cfg = servebase._cfg || {};
      if (typeof this._cfg === 'function') {
        this._cfg = this._cfg();
      }
      this.global = {};
      this.user = {};
      this.zmgr = new zmgr();
      this.manager = this._cfg.manager || new block.manager({
        registry: function(arg$){
          var ns, name, version, path, type;
          ns = arg$.ns, name = arg$.name, version = arg$.version, path = arg$.path, type = arg$.type;
          path = path || (type === 'block'
            ? 'index.html'
            : type ? "index.min." + type : 'index.min.js');
          if (ns === 'local') {
            if (name === 'error' || name === 'cover') {
              return "/modules/" + name + "/" + (path || 'index.html');
            }
            return "/modules/block/" + name + "/" + (path || 'index.html');
          }
          return "/assets/lib/" + name + "/" + (version || 'main') + "/" + path;
        }
      });
      ldcover.zmgr(this.zmgr);
      this.loader = new ldloader({
        className: "ldld full",
        autoZ: true,
        baseZ: null,
        zmgr: this.zmgr.scope(zmgr.splash)
      });
      this.captcha = new captcha({
        manager: this.manager,
        zmgr: this.zmgr.scope(zmgr.splash)
      });
      this.ldcvmgr = new ldcvmgr({
        manager: this.manager,
        errorCover: {
          ns: 'local',
          name: "error",
          path: "0.html"
        }
      });
      this.i18n = i18n = this._cfg.i18n || (typeof i18next != 'undefined' && i18next !== null ? i18next : undefined);
      err = new lderror.handler({
        handler: function(n, e){
          return this$.ldcvmgr.get({
            ns: 'local',
            name: 'error',
            path: n + ".html"
          }, e);
        }
      });
      this.error = function(e){
        return err(e);
      };
      this.auth = new auth({
        manager: this.manager,
        zmgr: this.zmgr,
        loader: this.loader
      });
      this.erratum = new erratum({
        handler: err
      });
      if (typeof ldc != 'undefined' && ldc !== null) {
        ldc.action('ldcvmgr', this.ldcvmgr);
      }
      this.update = function(g){
        return this.global = g, this.user = g.user || {}, this;
      };
      this.auth.on('server-down', this.error);
      this.auth.on('logout', function(){
        return window.location.replace('/');
      });
      return this.manager.init().then(function(){
        if (i18n == null) {
          return;
        }
        return Promise.resolve().then(function(){
          return i18n.init({
            supportedLng: ['en', 'zh-TW'],
            fallbackLng: 'zh-TW',
            fallbackNS: '',
            defaultNS: ''
          });
        }).then(function(){
          if (typeof i18nextBrowserLanguageDetector != 'undefined' && i18nextBrowserLanguageDetector !== null) {
            return i18n.use(i18nextBrowserLanguageDetector);
          }
        }).then(function(){
          var lng;
          lng = (typeof httputil != 'undefined' && httputil !== null ? httputil.qs('lng') || httputil.cookie('lng') : null) || navigator.language || navigator.userLanguage;
          console.log("use language: ", lng);
          return i18n.changeLanguage(lng);
        }).then(function(){
          return block.i18n.use(i18n);
        });
      }).then(function(){
        return this$.auth.get();
      }).then(function(g){
        this$.global = g;
        this$.user = g.user;
        return this$.captcha.init(g.captcha);
      }).then(function(){
        this$.auth.on('change', function(g){
          return this$.update(g);
        });
        return this$;
      });
    }
  };
  ldc.register('core', ['corecfg'], function(arg$){
    var corecfg;
    corecfg = arg$.corecfg;
    if (corecfg != null) {
      servebase.config(corecfg);
    }
    return {
      init: proxise.once(function(o){
        return servebase._init.apply(this, [o]);
      })
    };
  });
  if (typeof module != 'undefined' && module !== null) {
    module.exports = servebase;
  } else if (typeof window != 'undefined' && window !== null) {
    window.servebase = servebase;
  }
}).call(this);
