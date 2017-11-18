"use strict";

// Basic express setup:

const PORT           = 8080;
const userHelper     = require('./lib/util/user-helper')
const express        = require("express");
const bodyParser     = require("body-parser");
const app            = express();
const MongoClient 	 = require("mongodb").MongoClient;
const sassMiddleware = require("node-sass-middleware");
const path           = require("path");
const session        = require("express-session");
const bcrypt         = require("bcrypt");
const md5            = require('md5');

const MONGODB_URI 	 = "mongodb://localhost:27017/tweeter";
const saltRound      = 10;

app.use(session({ 
		secret: 'cookie monster',
		saveUninitialized: false,
		resave: false
	}));

// handle the sass
app.use('/styles', sassMiddleware({
	src: path.join( __dirname, '..', '/src', '/styles'),
	dest: path.join(__dirname, '..', '/public', '/styles')
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



MongoClient.connect(MONGODB_URI, (err, db) => {

	if(err){
		console.log(err);
		throw err;
	}
	console.log('Connected to', MONGODB_URI);

	const DataHelpers = require("./lib/data-helpers.js")(db);	
	const tweetsRoutes = require("./routes/tweets")(DataHelpers);

	// Mount the tweets routes at the "/tweets" path prefix:
	app.use("/tweets", tweetsRoutes);

	/**
	 * Tweeter registration function.
	 */
	app.post("/register", (req, res) => {
		const { password, name } = req.body
		// random userID to easily pass around.
		const id = userHelper.generateRandomId(); 
		const handle = `@${req.body.handle}`;
		db.collection('users').findOne({'handle': handle}, (err, user) => {
			// verify that there is no user with this handle
			if(user){
				res.send(`<label>A user with this handle already exists</label>`)	
					return;
			}
			const avatarUrlPrefix = `https://vanillicon.com/${md5(handle)}`;
			const avatars = {
    		small:   `${avatarUrlPrefix}_50.png`,
    		regular: `${avatarUrlPrefix}.png`,
    		large:   `${avatarUrlPrefix}_200.png`
  		};
			// make the password
			bcrypt.hash(password, 10, (err, password) => {
				const user = {
					id,
					name,
					avatars,
					handle,
					password
				};
				db.collection('users').insert(user, (err) => {
					if(err){
						console.log(err);
						return;
					}
					req.session.user_id = id;
					res.redirect('/');
				});
			});
		});
	});

	// login handling
	app.post("/login", (req, res) => {
		const { password } = req.body;
		const handle = `@${req.body.handle}`
		db.collection('users').findOne({'handle': handle}, (err, user) => {
			if(err){
				console.log(err);
				return;
			}
			if(!user){
				res.send('<label>Your handle or password could not be found</label>');
				return;
			}
			bcrypt.compare(password, user.password, (err, result) => {
				if(err){
					console.log(err);
					return;
				}
				if(result){
					req.session.user_id = user.id;
					res.redirect('/');
					return;
				}
				// add more appropriate error message
				res.send('<label>Your handle or password could not be found</label>');
			});
		});
	});

	app.post("/logout", (req, res) => {
		req.session.destroy();
		res.redirect('/');
	});

	app.listen(PORT, () => {
	  console.log("Example app listening on port " + PORT);
	});
});

