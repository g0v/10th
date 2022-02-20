// Generated by LiveScript 1.6.0
(function(){
  ldc.register('core', [], function(){
    return {
      init: proxise.once(function(){
        var err, this$ = this;
        this.global = {};
        this.user = {};
        this.zmgr = new zmgr({
          init: 1000
        });
        this.manager = new block.manager({
          registry: function(arg$){
            var name, version, path, type;
            name = arg$.name, version = arg$.version, path = arg$.path, type = arg$.type;
            return "/assets/lib/" + name + "/" + (version || 'main') + "/" + (path || (type === 'block' ? 'index.html' : 'index.min.js'));
          }
        });
        this.auth = new auth({
          manager: this.manager
        });
        this.loader = new ldloader({
          className: "ldld full",
          zmgr: this.zmgr
        });
        this.captcha = new captcha({
          manager: this.manager
        });
        this.ldcvmgr = new ldcvmgr({
          manager: this.manager
        });
        ldc.action('ldcvmgr', this.ldcvmgr);
        err = new lderror.handler({
          handler: function(it){
            return this$.ldcvmgr.get("error/" + it);
          }
        });
        this.error = function(e){
          return err(e);
        };
        this.update = function(g){
          return this.global = g, this.user = g.user || {}, this;
        };
        return this.manager.init().then(function(){
          return i18next.init({
            supportedLng: ['en', 'zh-TW'],
            fallbackLng: 'zh-TW'
          });
        }).then(function(){
          return block.i18n.use(i18next);
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
      })
    };
  });
}).call(this);
