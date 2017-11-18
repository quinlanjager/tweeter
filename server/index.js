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

	function getCollectionAsArray(collectionName, callback){
		db.collection(collectionName).find().toArray(callback);
	}
	
	if(err){
		console.log(err);
		throw err;
	}
	console.log('Connected to', MONGODB_URI);
	const DataHelpers = require("./lib/data-helpers.js")(db);
	
	// The `tweets-routes` module works similarly: we pass it the `DataHelpers` object
	// so it can define routes that use it to interact with the data layer.
	const tweetsRoutes = require("./routes/tweets")(DataHelpers);

	// Mount the tweets routes at the "/tweets" path prefix:
	app.use("/tweets", tweetsRoutes);

	app.post("/register", (req, res) => {
		const { password, name } = req.body
		const id = userHelper.generateRandomId();
		const handle = `@${req.body.handle}`;
		db.collection('users').find().toArray((err, users) => {
			for(let user of users){
				if(user.handle === handle){
					res.send(`<label>A user with this handle already exists</label>`)	
					return;
				}
			}
			bcrypt.hash(password, 10, (err, password) => {
				const avatarUrlPrefix = `https://vanillicon.com/${md5(handle)}`;
				const avatars = {
      		small:   `${avatarUrlPrefix}_50.png`,
      		regular: `${avatarUrlPrefix}.png`,
      		large:   `${avatarUrlPrefix}_200.png`
    		};
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
					console.log(req.session);
					req.session.user_id = id;
					res.redirect('/');
				});
			});
		});
	});

	app.post("/login", (req, res) => {
		const { password } = req.body;
		const handle = `@${req.body.handle}`
		console.log(handle);
		getCollectionAsArray('users', (err, users) => {
			for(let user of users){
				if(user.handle === handle){
					console.log('handle found');
					bcrypt.compare(password, user.password, (err, result) => {
						if(err){
							console.log(err);
							return;
						}
						console.log(result);
						if(result){
							req.session.user_id = user.id;
							res.redirect('/');
							return;
						}
						res.send('<label>Your handle or password could not be found</label>');
					});
					return;
				}
			}
			res.send('<label>Your handle or password could not be found</label>');
		});
	})

	app.post("/logout", (req, res) => {
		req.session.destroy(function(err) {
  		// cannot access session here
		})
		res.redirect('/');
	});

	app.get('/loggedIn', (req, res) => {

	})

	app.listen(PORT, () => {
	  console.log("Example app listening on port " + PORT);
	});
});

