"use strict";

let ObjectID = require('mongodb').ObjectID

// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // Saves a tweet to `db`
    saveTweet: function(newTweet, callback) {
      db.collection('tweets').insert(newTweet, (err, result) =>{
        if(err) throw err;
        callback(null, true);
      })
    },

    // Get all tweets in `db`, sorted by newest first
    getTweets: function(callback) {
      const sortNewestFirst = (a, b) => a.created_at - b.created_at;
      let tweets;
      db.collection('tweets').find().toArray((err, tweets) => {
        // sortNewestFirst
        tweets = tweets.sort(sortNewestFirst);
        callback(null, tweets);
      })
    },

    // add a like
    
    addLikeTo: function(id, userID, callback){
      let tweetId = new ObjectID(id);
      db.collection('tweets').updateOne({_id: tweetId}, {$addToSet: {likes : userID}}, (err, tweet) => {
        if(err){
          console.log(err);
          return;
        }
        db.collection('tweets').findOne({_id: tweetId}, (err, tweet) => {
          callback(tweet);
        })
      })
    }
  };
}
