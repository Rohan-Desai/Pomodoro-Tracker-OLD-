const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const {
	User,
	Task
} = require('./storage/schema.js');

const app = express();
const port = 8080;

mongoose.connect('mongodb://localhost:27017/PomodoroTracker', {
	useNewUrlParser: true
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("Connected to DB");
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
	secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
		clientID: '373889620044-slgl11ptcn23jrhgltpm6u0dokps41pd.apps.googleusercontent.com',
		clientSecret: 'IWIhU7FrGsOzvm3y6rzb3EYZ',
		callbackURL: 'http://localhost:8080/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		User.findOne({
			email: profile.emails[0].value
		}, function(err, user) {
			if (user == null) {
				let newUser = new User({
					name: profile.displayName,
					email: profile.emails[0].value
				}).save();
				done(null, newUser);
			} else {
				console.log(user);
				done(null, user);
			}
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
	passport.authenticate('google', {
		scope: ['profile', 'email']
	}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback',
	passport.authenticate('google', {
		failureRedirect: '/login'
	}),
	function(req, res) {
		res.redirect('/');
	});

app.post('/addTask', (req, res) => {
	if (req.user) {
		console.log("Found user");
		 new Task({
			description: req.body.description,
			userId: req.user.id,
			completed: false,
			timeSpent: 0,
			parentTask: null
		}).save((err, task) => {
			res.json(task);
		});
		
	}
	//TODO: Document error responses and user not signed in response.
});

app.post('/deleteTask', (req, res) => {
	if (req.user) {
		Task.findByIdAndDelete(req.taskId, (err, task) => {
			res.send(task);
		});
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
});