// Copyright 2017 Ishan Madhusanka

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//    http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override')

const mongoose = require('mongoose');
const config_db = require('./config');

const passport = require('passport');

const flash    = require('connect-flash');


const auth = require('./routes/auth');
const api = require('./routes/api');
const v1_api = require('./routes/v1');
const welcome = require('./routes/welcome');
const test = require('./routes/test');

const cors = require('cors')

var app = express();

app.use(cors())

console.log('process.env.NODE_ENV : ', process.env.NODE_ENV);
if(process.env.NODE_ENV == 'DEVELOPMENT') {
  mongoose.connect(config_db.url_dev);
  console.log('starting with DEV MongoDB base..');
} else {
  mongoose.connect(config_db.url);
  console.log('starting with PRODUCTION MongoDB base..')
}

// setup testAdmin if not present
let newAdmin = require('./controllers/newAdmin');
newAdmin()

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

app.use(session({ 
	secret: 'tra!n!ngportal!snosecret',
    resave: true,
    saveUninitialized: true
	})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', welcome);
app.use('/auth', auth);
// app.use('/api/v1', v1_api);
app.use('/api', api);
app.use('/test', test);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
