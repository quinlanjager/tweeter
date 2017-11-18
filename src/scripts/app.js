// importing functions and assigning them
var timeOfLastLoad = Date.now();
var composerCharCounter = require('./utils/composer-char-counter');

var countCharacters = composerCharCounter.countCharacters;
var keyupanddown = composerCharCounter.keyupanddown;

/**
 * Generate an error message label to be appended to the tweet composer form
 * @param  {string} message The message you'd like to communicate
 *
 */
function generateTweetErrorMessage(message){
  // if label aready exists, just replace the text
  var $errorLabel = $('.new-tweet form label');
  if($errorLabel.text().length){
    $errorLabel.text(message);
  } else{
    $('<label>').text(message).addClass('red-text').appendTo($('.new-tweet form'));
  }
}

/**
 * Check if argument tweet was created after the last time tweets were loaded.
 * @param  {object} tweet   An individual tweet object from an array of tweets.
 * @return {boolean}        A coerced truthy of falsey value depending on when the tweet was created
 */
function checkIfNewTweet(tweet){
  return tweet.created_at > timeOfLastLoad;
}

/**
 * For each tweet in an array of tweet, generates a jQuery element object then prepends it to the tweet container.
 * @param  {array} tweets   An array of tweet objects
 *
 */
function renderTweets(tweets, TweetComponents){
  tweets.forEach(function(tweet){
    // prepend to show 'newest first', from tweet-creation-helpers
    var $tweet = $('<article>').addClass('tweet');
    var $main = $('<main>').append($('<p>').text(tweet.content.text));
    $tweet.append(TweetComponents.makeHeader(tweet.user))
                 .append($main)
                 .append(TweetComponents.makeFooter(tweet));
    console.log($tweet);
    $('#tweets-container').prepend($tweet);
  })
}


/**Load up tweets with AJAX.*/
function loadTweets(){
  $.ajax({
    url: '/tweets',
    method: 'GET'
  }).done(function(data){
    console.log(data);
    var newTweetsOnly = data.tweets.filter(checkIfNewTweet);
    var tweetData = data.tweets;
    // only render new tweets if this isn't the first time running are new tweets.
    if(newTweetsOnly.length){
      tweetData = newTweetsOnly;
    }
    var TweetComponents = require('./utils/tweet-components')(data.user);
    renderTweets(tweetData, TweetComponents);
    timeOfLastLoad = Date.now();
  });
}


/**
 * Provides an error message if the form is invalid. Else submits the form via AJAX and loads up the new tweets.
 * @param  {object} event  The event object passed by the event listener.
 *
 */
function formSubmissionHandler(event){
  event.preventDefault();
  var $tweetComposer = $('.new-tweet form textarea');
  var tweet = $tweetComposer.val();

  // form validation
  if(tweet.length === 0){
    generateTweetErrorMessage('Please input text before submitting.');
    return;
  }
  if(tweet.length > 140){
    generateTweetErrorMessage('Sorry, your tweet is too long.');
    return;
  }
  
  // Make ajax call
  $.ajax({
    url: '/tweets',
    method: 'POST',
    data: $tweetComposer.serialize(),
    beforeSend: function(){
      // if there is a warning label, remove it
      $('.new-tweet form label.red-text').remove();
    }
  }).done(function(err){
      // if an error message is received
      if(err){
        generateTweetErrorMessage(err);
        return;
      }
      // clear tweet composer (reset it)
      $('.new-tweet form textarea').val('');
      loadTweets();
    });
}

/** Initialization */
$(function(){
  loadTweets();

  var $composerTextArea = $('#composer');
  var $form = $('.new-tweet form');
  var $composerButton = $('#compose');
  var $loginButton = $('#login');
  console.log($loginButton);
  
  // handles form submission
  $form.submit(formSubmissionHandler);

  // Toggle form field to slide down then focus on the composer
  $composerButton.click(function(){
    $('.new-tweet').slideToggle();
    $('.new-tweet form textarea').focus();
  });
  $loginButton.click(function(){
    $('#nav-bar .nav-login').toggleClass('hide');
  });

  // character counting
  keyupanddown($composerTextArea, countCharacters);
});