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
    like: function(id, user_handle){
      let tweetId = new ObjectID(id);
      db.collection('tweets').updateOne({_id: tweetId}, {$addToSet: {likes: user_handle}}, (err, cResult) => {
        if(err){
          console.log(err);
          return;
        }
      });
    },

    unlike: function(id, userID){
      let tweetId = new ObjectID(id);
      db.collection('tweets').find({_id: tweetId}).toArray( (err, tweet) => {
        let newLikes = tweet[0].likes.filter((liker) => {
          if(liker !== userID){
            return liker;
          }
        });
        db.collection('tweets').updateOne({_id: tweetId}, {$set: {likes: newLikes}}, (err, result) => {
          if(err){
            console.log(err);
            return;
          }
        });
      });
    },

    getUser: function(user_id, callback){
      db.collection('users').findOne({"id": user_id}, (err, doc) => {
        const {name, handle, avatars} = doc;
        // remove sensitive info
        let user = {
          name,
          handle,
          avatars
        }
        callback(user);
      });    
    },

    isUserTweet: function(id, callback){
      let tweetId = new ObjectID(id);
      db.collection('tweets').findOne({_id: tweetId}, (err, tweet) => {
        if(err){
          console.log(err);
          return;
        }
        callback(tweet);
      })
    }

  }
};

