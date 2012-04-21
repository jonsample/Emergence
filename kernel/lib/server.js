var http = require('http')
	,util = require('util')
	,fs = require('fs')
	,path = require('path')
	,_ = require('underscore')
	,util = require('util')
	,url = require('url')
	,static = require('node-static')
	,events = require('events');
	
exports.server = function(paths, options) {
	var me = this;
	
	// call events constructor
	events.EventEmitter.call(me);

	// initialize options and apply defaults
	me.paths = paths || {};
	me.options = options || {};
	me.options.host = me.options.host || '0.0.0.0';
	me.options.port = me.options.port || 1337;
	me.options.staticDir = me.options.staticDir || './www';
	
	// initialize state
}
util.inherits(exports.server, events.EventEmitter);


exports.server.prototype.start = function() {
	var me = this;

	// create static fileserver
	me.fileServer = new static.Server(me.options.staticDir);
	
	// start control server
	http.createServer(function(request, response) {
		request.content = '';
	
		request.addListener('data', function(chunk) {
			request.content += chunk;
		});
	
		request.addListener('end', function() {
			request.urlInfo = url.parse(request.url)
			request.path = request.urlInfo.pathname.substr(1).split('/');
			console.log(request.method+' '+JSON.stringify(request.urlInfo));
			
			if(me.paths.hasOwnProperty(request.path[0]))
			{
				var result = me.paths[request.path[0]].handleRequest(request, response, me);
				if(result===false)
				{
					response.writeHead(404);
					response.end();
				}
				else if(result !== true)
				{
					response.writeHead(200, {'Content-Type':'application/json'});
					response.end(JSON.stringify(result));
				}
			}
			else
			{
				me.fileServer.serve(request, response);
			}
		});
		
	}).listen(me.options.port, me.options.host);

};

exports.createServer = function(paths, options) {
	return new exports.server(paths, options);
};