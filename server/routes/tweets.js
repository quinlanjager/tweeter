"use strict";

const userHelper    = require("../lib/util/user-helper");


const express       = require('express');
const tweetsRoutes  = express.Router();

module.exports = function(DataHelpers) {

  tweetsRoutes.get("/", function(req, res) {
    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        if(req.session.user_id){
          DataHelpers.getUser(req.session.user_id, (user) => {
            res.json({user, tweets});
          })
          return;
        }
        res.json({user: null, tweets});
      }
    });
  });

  tweetsRoutes.post("/", function(req, res) {
    if (!req.body.text) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }
    if(!req.session.user_id){
      res.send('You must be logged in to post a tweet.');
      return;
    }
    DataHelpers.getUser(req.session.user_id, (user) => {      
      const tweet = {
        user: user,
        content: {
          text: req.body.text
        },
        created_at: Date.now(),
        likes: []
      };

      DataHelpers.saveTweet(tweet, (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(201).send();
        }
      });
    })
  });

  tweetsRoutes.put("/:tweetID", function(req, res) {
    const {tweetID} = req.params;
    if(!req.session.user_id){
      res.send('You must be logged in to like a tweet.');
      return;
    }
    DataHelpers.getUser(req.session.user_id, (user) => {
      DataHelpers.like(tweetID, user.handle);
    })
  });

  tweetsRoutes.delete("/:tweetID", function(req, res) {
    const {tweetID} = req.params;
    if(!req.session.user_id){
      res.send('You must be logged in to do this.');
      return;
    }
    DataHelpers.unlike(tweetID, req.session.user_id);
  });

  return tweetsRoutes;

}
