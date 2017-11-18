"use strict";

// Basic express setup:

const PORT           = 8080;
const express        = require("express");
const bodyParser     = require("body-parser");
const app            = express();
const MongoClient 	 = require("mongodb").MongoClient;
const sassMiddleware = require("node-sass-middleware");
const path           = require("path");
const cookieParser   = require("cookie-parser");
const session        = require("express-session");
const bcrypt         = require("bcrypt");
const md5 = require('md5');

const MONGODB_URI 	 = "mongodb://localhost:27017/tweeter";
const saltRound      = 10;

app.use(cookieParser());

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
	
	// The `tweets-routes` module works similarly: we pass it the `DataHelpers` object
	// so it can define routes that use it to interact with the data layer.
	const tweetsRoutes = require("./routes/tweets")(DataHelpers);

	// Mount the tweets routes at the "/tweets" path prefix:
	app.use("/tweets", tweetsRoutes);

	app.post("/register", (req, res) => {
		const { password, name } = req.body
		const handle = `@${req.body.handle}`;
		db.collection('users').find().toArray((err, users) => {
			console.log(users);
			for(let user of users){
				console.log(user);
				if(user.handle === handle){
					res.send(`<label>A user with this handle already exists</label>`)	
					return;
				}
			}
			bcrypt.hash(password, 10, (err, password) => {
				console.log(password);
				const avatarUrlPrefix = `https://vanillicon.com/${md5(handle)}`;
				const avatars = {
      		small:   `${avatarUrlPrefix}_50.png`,
      		regular: `${avatarUrlPrefix}.png`,
      		large:   `${avatarUrlPrefix}_200.png`
    		};
				const user = {
					name,
					avatars,
					handle,
					password
				};
				db.collection('users').insert(user, () => {
					res.send(`<label>You've successfully registered</label>`);
				});
			});
		});
	});

	app.listen(PORT, () => {
	  console.log("Example app listening on port " + PORT);
	});
});

