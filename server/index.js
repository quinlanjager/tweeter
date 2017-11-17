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
const MONGODB_URI 	 = "mongodb://localhost:27017/tweeter";

app.use(cookieParser());
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

	app.listen(PORT, () => {
	  console.log("Example app listening on port " + PORT);
	});
});

