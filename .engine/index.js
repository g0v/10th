// Generated by LiveScript 1.6.0
(function(){
  var express, colors, path, pino, lderror, pinoHttp, redis, util, bodyParser, csurf, i18nextHttpMiddleware, srcbuild, pug, errorHandler, route, redisNode, auth, i18n, aux, postgresql, secret, defaultConfig, backend;
  express = require('express');
  colors = require('colors');
  path = require('path');
  pino = require('pino');
  lderror = require('lderror');
  pinoHttp = require('pino-http');
  redis = require('redis');
  util = require('util');
  bodyParser = require('body-parser');
  csurf = require('csurf');
  i18nextHttpMiddleware = require('i18next-http-middleware');
  srcbuild = require('@plotdb/srcbuild');
  pug = require('@plotdb/srcbuild/dist/view/pug');
  errorHandler = require('./error-handler');
  route = require('./route');
  redisNode = require('./redis-node');
  auth = require('./module/auth');
  i18n = require('./module/i18n');
  aux = require('./module/aux');
  postgresql = require('./module/db/postgresql');
  secret = require('../config/private/secret');
  defaultConfig = {
    limit: '10mb',
    port: 3000
  };
  backend = function(opt){
    opt == null && (opt = {});
    this.opt = opt;
    import$(this, {
      mode: process.env.NODE_ENV,
      production: process.env.NODE_ENVT === 'production',
      middleware: {},
      config: import$(import$({}, defaultConfig), opt.config),
      server: null,
      app: null,
      log: null,
      route: {},
      store: {}
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
          return server.listen(this$.config.port, function(e){
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
      return srcbuild.lsp((ref$ = this.config.build || {}, ref$.logger = logger, ref$.i18n = i18n, ref$.base = '.', ref$.bundle = {
        configFile: 'config/bundle.json'
      }, ref$));
    },
    start: function(){
      var this$ = this;
      return Promise.resolve().then(function(){
        var logLevel, ref$, log;
        logLevel = ((ref$ = this$.config).log || (ref$.log = {})).level || (this$.production ? 'info' : 'debug');
        if (!(logLevel === 'silent' || logLevel === 'trace' || logLevel === 'debug' || logLevel === 'info' || logLevel === 'warn' || logLevel === 'error' || logLevel === 'fatal')) {
          return Promise.reject(new Error("pino log level incorrect. please fix secret.ls: log.level"));
        }
        this$.log = log = pino({
          level: logLevel
        });
        this$.logServer = log.child({
          module: 'server'
        });
        this$.logBuild = log.child({
          module: 'build'
        });
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
        return i18n(this$.config.i18n || {});
      }).then(function(it){
        return this$.i18n = it;
      }).then(function(){
        var app, api;
        this$.db = new postgresql(this$);
        this$.app = this$.route.app = app = express();
        this$.store = new redisNode();
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
        app.use(i18nextHttpMiddleware.handle(this$.i18n, {
          ignoreRoutes: []
        }));
        app.engine('pug', pug({
          logger: this$.log.child({
            module: 'view'
          }),
          i18n: this$.i18n,
          viewdir: '.view',
          srcdir: 'src/pug'
        }));
        app.set('view engine', 'pug');
        app.set('views', path.join(__dirname, '../src/pug/'));
        app.locals.basedir = app.get('views');
        this$.route.extapi = express.Router({
          mergeParams: true
        });
        this$.route.api = api = express.Router({
          mergeParams: true
        });
        this$.route.auth = express.Router({
          mergeParams: true
        });
        auth(this$);
        app.use('/extapi/', this$.route.extapi);
        app.use(this$.middleware.csrf = csurf());
        app.use('/api', this$.route.api);
        app.use('/api/auth', this$.route.auth);
        route(this$);
        app.use('/', express['static'](path.join(__dirname, '../static')));
        app.use(function(req, res, next){
          return next(new lderror(404));
        });
        app.use(errorHandler);
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
