/**
 * App Server Class
 * @file: /application/private/server/AppServer.js
 * @author: Vladimir Bukhin
 * @Description: Sets up and starts the express server while also managing data-manager logins.
 */

var Express= require('express');

var AppServer = {
    setup:function(callback){
      var app = this.configure();
      this.openIndexPath(app);
      this.openManagerPaths(app);
      this.start(app, callback);
    },

    configure: function(app){
        var app = Express.createServer();

        app.use(Express.bodyParser({uploadDir: Config.tempStorage}));
        app.use(Express.static(Config.serverRoot + '/public'));
        app.use(Express.cookieParser('secretK'));//signed cookie
        if(Config.expressLoggerFormat){
            app.use(Express.logger());
        }

        app.set('view engine', 'ejs');
        app.set('view options', { layout: false });
        app.set('views', Config.serverRoot + '/private/view/ejs');
        return app;
    },

    openIndexPath: function(app){
        app.get('/', function (req, res, next) {
            var cookies= req.cookies;
            Config.manager = (cookies && cookies['observersid'] == 'authed' ) ? true : false;
            res.render('index',Config, function(err, html){
                if(err){
                    next(err);
                    return;
                }
                res.send(html);
            });
        });
    },

    openManagerPaths: function(app){
        app.post('/manage/login', function (req, res, next) {
            var login= req.body;
            if( login){
                var credentialList= Config.managers.credentials;
                if(credentialList[login.username] && credentialList[login.username]== login.password){
                    res.cookie('observersid', 'authed', { signed: true, path:'/' });
                }
            }
            res.redirect('/#/manage/');

        });

        app.post('/manage/logout', function (req, res, next) {
            res.clearCookie('observersid',{ signed: true, path:'/' });
            res.redirect('/#/manage/');
        });
    },

    start: function(app, callback){
        app.listen(Config.serverPort, function(err){
            HandleError.init( err, 'Express' );

            console.log('Express listening on port: '+Config.serverPort);
            callback(app);
        });
    }
};

module.exports = AppServer;