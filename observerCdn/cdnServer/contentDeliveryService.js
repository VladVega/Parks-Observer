/**
 * Cdn Main Class.
 * @file: /cdnServer/contentDeliveryService.js
 * @author: Vladimir Bukhin
 * @Description: Handles all the content delivery on http request made to this server.
 */
Config=null;
gridDB= null;

(function(){
    console.log(__dirname);
    var server_root= __dirname + '/',
        node_env= process.env.NODE_ENV;
    Config = require(server_root+'Config.js')(server_root, node_env);

    gridDB= new (require(Config.serverRoot + 'database/GridFS.js'))();

    var http= require('http');

    gridDB.start(function(err){
        if(err){
            console.log('Grid db connection start error');
            console.dir(err);
            process.exit();
        }
        console.log('Grid db connection made');
        http.Server(function(req, res) {
                var cdnPathParts, len, strictlyDownload, fileId;
                cdnPathParts= req.url.split('/');
                len= cdnPathParts.length;
                if(len == 3){
                    fileId= cdnPathParts[1];
                }else{
                    console.log('Wrong url error: '+ req.url);
                    res.writeHead( 404, 'Error when trying to get file', {'Content-Type': 'text/plain'});
                    res.end();
                }
                gridDB.getReadStream(fileId, function(err, gridStream, contentType){
                        if(err){
                            console.log('Grid error: '+ req.url);
                            res.writeHead( 404, 'Error when trying to get file', {'Content-Type': 'text/plain'});
                            res.end();
                        }else{
                            var headers={'Content-Type': contentType};
                            res.writeHead(200, headers);
                            gridStream.pipe(res);
                        }
                    }
                );
        }).listen(Config.cdnPort, function(err){
                if(err){
                    console.log('Grid db connection start error');
                    console.dir(err);
                    process.exit();
                }
                console.log('CDN server started.');
            });

    });

})();
