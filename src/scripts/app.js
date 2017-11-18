var timeOfLastLoad = Date.now();
var ComposerCharCounter = require('./utils/composer-char-counter');

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
 * For each tweet in an array of tweet, generates a jQuery element object then prepends it to the tweet container.
 * @param  {array} tweets   An array of tweet objects
 *
 */
function renderTweets(tweets, TweetComponents){
  tweets.forEach(function(tweet){
    var $tweet = $('<article>').addClass('tweet');
    var $main = $('<main>').append($('<p>').text(tweet.content.text));
    $tweet.append(TweetComponents.makeHeader(tweet.user))
          .append($main)
          .append(TweetComponents.makeFooter(tweet));
    // prepend to show 'newest first'
    $('#tweets-container').prepend($tweet);
  });
}

/**
 * Provides an error message if the form is invalid. Else submits the form via AJAX and loads up the new tweets.
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
  
  var ajaxOptions = {
    url: '/tweets',
    method: 'POST',
    data: $tweetComposer.serialize(),
    beforeSend: function(){
      // if there is a warning label, remove it
      $('.new-tweet form label.red-text').remove();
    }
  };

  // Make ajax call
  $.ajax(ajaxOptions).done(function(err){
    if(err){
      generateTweetErrorMessage(err);
      return;
    }
    // clear tweet composer (reset it)
    $('.new-tweet form textarea').val('');
    loadTweets();
  });
}

/**Load up tweets with AJAX.*/
function initializeApp(appTasks){
  $.getJSON('/tweets', function(data) {
    var tweetData = data.tweets;
    var newTweetsOnly = tweetData.filter((tweet) => tweet.created_at > timeOfLastLoad);
    // set the time of last loast to now
    timeOfLastLoad = Date.now();

    // only render new tweets.
    if(newTweetsOnly.length){
      appTasks(data.user, newTweetsOnly);
      return;
    }
    appTasks(data.user, tweetData);
  });
}



/** Initialization */
$(function(){
  initializeApp(function(USER_DATA, TWEET_DATA){
    var TweetComponents = require('./utils/tweet-components')(USER_DATA);
    
    var $composerTextArea = $('#composer');
    var $tweetForm = $('.new-tweet form');
    var $logInForm = $('#loginForm');
    // buttons
    var $composerButton = $('#composeButton');
    var $logInButton = $('#loginButton');
    var $logOutButton = $('#logoutButton');
    var $registerLink = $('a.register-link');
    var $loginLink = $('a.login-link');

    renderTweets(TWEET_DATA, TweetComponents);

    if(USER_DATA){
      $('.container').prepend($('<h2>').text('Welcome, ' + USER_DATA.handle));
      $logInButton.addClass('hide');
      $logOutButton.removeClass('hide');
    }
    
    // Form submission events
    $tweetForm.submit(formSubmissionHandler);
    // button events
    $composerButton.click(function(){
      $('.new-tweet').slideToggle();
      $('.new-tweet form textarea').focus();
    });
    $logInButton.click(function(event){
      event.preventDefault();
      $('#nav-bar .nav-login').toggleClass('hide');
    });
    $registerLink.click(function(event){
      event.preventDefault();
      $('#loginForm').toggleClass('hide');
    });
    $loginLink.click(function(event){
      event.preventDefault();
      $('#loginForm').toggleClass('hide');
    })

    // character counting
    ComposerCharCounter.keyupanddown($composerTextArea);
  });
});