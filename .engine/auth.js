// Generated by LiveScript 1.3.1
(function(){
  var expressSession, passport, passportLocal, passportFacebook, passportGoogleOauth20, lderror, ret;
  expressSession = require('express-session');
  passport = require('passport');
  passportLocal = require('passport-local');
  passportFacebook = require('passport-facebook');
  passportGoogleOauth20 = require('passport-google-oauth20');
  lderror = require('lderror');
  ret = function(backend){
    var db, app, config, route, getUser, sessionStore, session, x$, this$ = this;
    db = backend.db, app = backend.app, config = backend.config, route = backend.route;
    getUser = function(arg$){
      var username, password, method, detail, create, done;
      username = arg$.username, password = arg$.password, method = arg$.method, detail = arg$.detail, create = arg$.create, done = arg$.done;
      return db.auth.user.get({
        username: username,
        password: password,
        method: method,
        detail: detail,
        create: create
      }).then(function(user){
        done(null, user);
      })['catch'](function(){
        done(new lderror(1012), null, {
          message: ''
        });
      });
    };
    passport.use(new passportLocal.Strategy({
      usernameField: 'email',
      passwordField: 'password'
    }, function(username, password, done){
      return getUser({
        username: username,
        password: password,
        method: 'local',
        detail: null,
        create: false,
        done: done
      });
    }));
    passport.serializeUser(function(u, done){
      db.auth.user.serialize(u).then(function(v){
        done(null, v);
      });
    });
    passport.deserializeUser(function(v, done){
      db.auth.user.deserialize(v).then(function(u){
        u == null && (u = {});
        done(null, u);
      });
    });
    sessionStore = function(){
      return import$(this, db.auth.session);
    };
    sessionStore.prototype = expressSession.Store.prototype;
    app.use(session = expressSession({
      secret: config.session.secret,
      resave: true,
      saveUninitialized: true,
      store: new sessionStore(),
      proxy: true,
      cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 86400000 * 30 * 12
      }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    x$ = route.auth;
    x$.post('/signup', function(req, res, next){
      var ref$, username, displayname, password, config;
      ref$ = {
        username: (ref$ = req.body).username,
        displayname: ref$.displayname,
        password: ref$.password,
        config: ref$.config
      }, username = ref$.username, displayname = ref$.displayname, password = ref$.password, config = ref$.config;
      if (!username || !displayname || password.length < 8) {
        return next(new lderror(400));
      }
      return db.auth.user.create({
        username: username,
        password: password,
        method: 'local',
        detail: {
          displayname: displayname
        },
        config: config || {}
      }).then(function(user){
        req.logIn(user, function(){
          res.send();
        });
      })['catch'](function(){
        next(new lderror(403));
      });
    });
    x$.post('/login', function(req, res, next){
      return passport.authenticate('local', function(err, user, info){
        if (err || !user) {
          return next(err || new lderror(1000));
        }
        return req.logIn(user, function(err){
          if (err) {
            next(err);
          } else {
            res.send();
          }
        });
      })(req, res, next);
    });
    x$.post('/logout', function(req, res){
      req.logout();
      return res.send();
    });
    return x$;
  };
  module.exports = ret;
  /*
  
  passport.use new passport-google-oauth20.Strategy(
    do
      clientID: config.google.clientID
      clientSecret: config.google.clientSecret
      callbackURL: "/dash/api/u/auth/google/callback"
      passReqToCallback: true
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
      profileFields: ['id', 'displayName', 'link', 'emails']
    , (request, access-token, refresh-token, profile, done) ~>
      if !profile.emails =>
        done null, false, do
          message: "We can't get email address from your Google account. Please try signing up with email."
        return null
      get-user profile.emails.0.value, null, false, profile, true, done
  )
  
  passport.use new passport-facebook.Strategy(
    do
      clientID: config.facebook.clientID
      clientSecret: config.facebook.clientSecret
      callbackURL: "/dash/api/u/auth/facebook/callback"
      profileFields: ['id', 'displayName', 'link', 'emails']
    , (access-token, refresh-token, profile, done) ~>
      if !profile.emails =>
        done null, false, do
          message: "We can't get email address from your Facebook account. Please try signing up with email."
        return null
      get-user profile.emails.0.value, null, false, profile, true, done
  )
  */
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);