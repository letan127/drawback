var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var engines = require('consolidate');

var draw = require('./routes/draw.ts');
var login = require('./routes/login.ts');
var app = express();


app.set('view engine', 'html');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));


app.use('/', draw);
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/login', login);

app.get('/rooms/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
