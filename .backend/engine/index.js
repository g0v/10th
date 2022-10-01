// Generated by LiveScript 1.6.0
(function(){
  var fs, yargs, express, colors, path, pino, lderror, pinoHttp, util, bodyParser, csurf, i18nextHttpMiddleware, srcbuild, pug, errorHandler, redisNode, mailQueue, i18n, aux, postgresql, auth, consent, captcha, libdir, rootdir, routes, argv, cfgName, secret, e, withDefault, defaultConfig, backend;
  fs = require('fs');
  yargs = require('yargs');
  express = require('express');
  colors = require('@plotdb/colors');
  path = require('path');
  pino = require('pino');
  lderror = require('lderror');
  pinoHttp = require('pino-http');
  util = require('util');
  bodyParser = require('body-parser');
  csurf = require('csurf');
  i18nextHttpMiddleware = require('i18next-http-middleware');
  srcbuild = require('@plotdb/srcbuild');
  pug = require('@plotdb/srcbuild/dist/view/pug');
  errorHandler = require('./error-handler');
  redisNode = require('./redis-node');
  mailQueue = require('./mail-queue');
  i18n = require('./i18n');
  aux = require('./aux');
  postgresql = require('./db/postgresql');
  auth = require('@servebase/auth');
  consent = require('@servebase/consent');
  captcha = require('@servebase/captcha');
  libdir = path.dirname(fs.realpathSync(__filename.replace(/\(js\)$/, '')));
  rootdir = path.join(libdir, '../..');
  routes = fs.readdirSync(path.join(libdir, '..')).filter(function(it){
    return !(it === 'engine' || it === 'README.md');
  }).map(function(it){
    return path.join(libdir, '..', it);
  }).map(function(it){
    return require(it);
  });
  argv = yargs.option('config-name', {
    alias: 'c',
    description: "config file name. `secret` if omitted. for accessing `config/private/[config].ls`",
    type: 'string'
  }).help('help').alias('help', 'h').check(function(argv, options){
    return true;
  }).argv;
  cfgName = argv.c;
  try {
    secret = require("../../config/private/" + (cfgName || 'secret'));
  } catch (e$) {
    e = e$;
    console.log(("failed to load config file `config/private/" + (cfgName || 'secret') + "`.").red);
    console.log("if this file doesn't exist, you should add one. check config/private/demo.ls for reference");
    process.exit(-1);
  }
  withDefault = function(cfg, defcfg){
    var _;
    cfg == null && (cfg = {});
    defcfg == null && (defcfg = {});
    defcfg = JSON.parse(JSON.stringify(defcfg));
    _ = function(cfg, defcfg){
      var k, v;
      for (k in defcfg) {
        v = defcfg[k];
        if (!(cfg[k] != null)) {
          cfg[k] = v;
        } else if (typeof cfg[k] === 'object' && typeof v === 'object') {
          withDefault(cfg[k], defcfg[k]);
        }
      }
      return cfg;
    };
    return _(cfg, defcfg);
  };
  defaultConfig = {
    limit: '10mb',
    port: 3000,
    session: {
      maxAge: 365 * 86400 * 1000
    }
  };
  backend = function(opt){
    var logLevel, ref$;
    opt == null && (opt = {});
    this.opt = opt;
    import$(this, {
      mode: process.env.NODE_ENV,
      production: process.env.NODE_ENV === 'production',
      middleware: {},
      config: withDefault(opt.config, defaultConfig),
      feroot: opt.config.base ? "frontend/" + opt.config.base : 'frontend/base',
      root: rootdir,
      base: opt.config.base || 'base',
      server: null,
      app: null,
      log: null,
      mailQueue: null,
      route: {},
      store: {},
      session: {}
    });
    logLevel = ((ref$ = this.config).log || (ref$.log = {})).level || (this.production ? 'info' : 'debug');
    if (!(logLevel === 'silent' || logLevel === 'trace' || logLevel === 'debug' || logLevel === 'info' || logLevel === 'warn' || logLevel === 'error' || logLevel === 'fatal')) {
      throw new Error("pino log level incorrect. please fix secret.ls: log.level");
    }
    this.log = pino({
      level: logLevel
    });
    return this;
  };
  import$(backend, {
    create: function(opt){
      var b;
      opt == null && (opt = {});
      b = new backend(opt);
      return b.start().then(function(){
        return b;
      });
    }
  });
  backend.prototype = import$(Object.create(Object.prototype), {
    listen: function(){
      var this$ = this;
      return new Promise(function(res, rej){
        if (!this$.server) {
          return this$.server = this$.app.listen(this$.config.port, function(e){
            if (e) {
              return rej(e);
            } else {
              return res(this$.server);
            }
          });
        } else {
          return this$.server.listen(this$.config.port, function(e){
            if (e) {
              return rej(e);
            } else {
              return res(this.server);
            }
          });
        }
      });
    },
    watch: function(arg$){
      var logger, i18n, ref$;
      logger = arg$.logger, i18n = arg$.i18n;
      if (!(this.config.build && this.config.build.enabled)) {
        return;
      }
      return srcbuild.lsp((ref$ = this.config.build || {}, ref$.logger = logger, ref$.i18n = i18n, ref$.base = Array.from(new Set([this.feroot].concat(this.config.srcbuild || []))), ref$.bundle = {
        configFile: path.join(this.feroot, 'bundle.json'),
        relativePath: true
      }, ref$.asset = {
        srcdir: 'src/pug',
        desdir: 'static'
      }, ref$));
    },
    start: function(){
      var this$ = this;
      return Promise.resolve().then(function(){
        var i18nEnabled, ref$;
        this$.logError = this$.log.child({
          module: 'error'
        });
        this$.logServer = this$.log.child({
          module: 'server'
        });
        this$.logBuild = this$.log.child({
          module: 'build'
        });
        this$.logMail = this$.log.child({
          module: 'mail'
        });
        this$.logI18n = this$.log.child({
          module: 'i18n'
        });
        if (this$.config.mail) {
          this$.mailQueue = new mailQueue(import$({
            logger: this$.logMail,
            base: this$.config.base
          }, this$.config.mail || {}));
        }
        process.on('uncaughtException', function(err, origin){
          this$.logServer.error({
            err: err
          }, "uncaught exception ocurred, outside express routes".red);
          this$.logServer.error("terminate process to reset server status".red);
          return process.exit(-1);
        });
        process.on('unhandledRejection', function(err){
          this$.logServer.error({
            err: err
          }, "unhandled rejection ocurred".red);
          this$.logServer.error("terminate process to reset server status".red);
          return process.exit(-1);
        });
        i18nEnabled = this$.config.i18n && (this$.config.i18n.enabled || !(this$.config.i18n.enabled != null));
        ((ref$ = this$.config).i18n || (ref$.i18n = {})).enabled = i18nEnabled;
        return i18n.apply(this$, [this$.config.i18n]);
      }).then(function(it){
        return this$.i18n = it;
      }).then(function(){
        if (!(this$.config.redis && this$.config.redis.enabled)) {
          return;
        }
        this$.logServer.info("initialize redis connection ...".cyan);
        this$.store = new redisNode({
          url: this$.config.redis.url
        });
        return this$.store.init();
      }).then(function(){
        var app, api;
        this$.db = new postgresql(this$);
        this$.app = app = express();
        this$.logServer.info(("initializing backend in " + app.get('env') + " mode").cyan);
        app.disable('x-powered-by');
        app.set('trust proxy', '127.0.0.1');
        app.use(pinoHttp({
          useLevel: this$.production ? 'info' : 'debug',
          logger: this$.log.child({
            module: 'route'
          }),
          autoLogging: !this$.production
        }));
        app.use(bodyParser.json({
          limit: this$.config.limit,
          verify: function(req, res, buf, encoding){
            if (req.headers["x-hub-signature"]) {
              return req.rawBody = buf.toString();
            }
          }
        }));
        app.use(bodyParser.urlencoded({
          extended: true,
          limit: this$.config.limit
        }));
        if (app.get('env') !== 'development') {
          app.enable('view cache');
        }
        if (this$.config.i18n.enabled) {
          app.use(i18nextHttpMiddleware.handle(this$.i18n, {
            ignoreRoutes: []
          }));
        }
        this$.middleware.captcha = new captcha(this$.config.captcha).middleware;
        app.engine('pug', pug({
          logger: this$.log.child({
            module: 'view'
          }),
          i18n: this$.i18n,
          viewdir: '.view',
          srcdir: 'src/pug',
          desdir: 'static',
          base: this$.feroot
        }));
        app.set('view engine', 'pug');
        app.set('views', path.join(__dirname, '../..', this$.feroot, 'src/pug'));
        app.locals.basedir = app.get('views');
        this$.route.app = aux.routecatch(app);
        this$.route.extapi = aux.routecatch(express.Router({
          mergeParams: true
        }));
        this$.route.api = api = aux.routecatch(express.Router({
          mergeParams: true
        }));
        this$.route.auth = aux.routecatch(express.Router({
          mergeParams: true
        }));
        this$.route.consent = aux.routecatch(express.Router({
          mergeParams: true
        }));
        auth(this$);
        app.use('/extapi/', this$.route.extapi);
        app.use(this$.middleware.csrf = csurf());
        app.use('/api', this$.route.api);
        app.use('/api/auth', this$.route.auth);
        app.use('/api/consent', this$.route.consent);
        consent(this$);
        routes.map(function(it){
          return it(this$);
        });
        app.use('/', express['static'](path.join(__dirname, '../..', this$.feroot, 'static')));
        app.use(function(req, res, next){
          return next(new lderror(404));
        });
        app.use(errorHandler(this$));
        return this$.listen();
      }).then(function(){
        this$.logServer.info(("listening on port " + this$.server.address().port).cyan);
        return this$.watch({
          logger: this$.logBuild,
          i18n: this$.i18n
        });
      })['catch'](function(err){
        var e;
        try {
          this$.logServer.error({
            err: err
          }, "failed to start server. ".red);
        } catch (e$) {
          e = e$;
          console.log("log failed: ".red, e);
          console.log("original error - failed to start server: ".red, err);
        }
        return process.exit(-1);
      });
    }
  });
  if (require.main === module) {
    backend.create({
      config: secret
    });
  }
  module.exports = backend;
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
