// My SocketStream 0.3 app

var http = require('http'),
    ss = require('socketstream'),
    request = require('request'),
    jquery = require('jquery');

// Define a single-page client called 'main'
ss.client.define('main', {
  view: 'app.html',
  css:  ['app.styl', 'libs/nv.d3.css', 'libs/bootstrap.min.css'],
  code: ['libs/jquery.min.js', 'libs/d3.v2.min.js', 'libs/nvd3/nv.d3.min.js', 'libs/spin.min.js', 'app'],
  tmpl: '*'
});

// Serve this client on the root URL
ss.http.route('/', function(req, res){
  res.serveClient('main');
});

// Code Formatters
ss.client.formatters.add(require('ss-stylus'));

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production') ss.client.packAssets();

// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);

// Start SocketStream
ss.start(server);