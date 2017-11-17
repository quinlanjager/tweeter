$(function(){
  var timeOfLastLoad = Date.now(); 

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
   * Loads up tweets via an AJAX call.
   * 
   */
  function loadTweets(){
    $.ajax({
      url: '/tweets',
      method: 'GET',
    }).done(function(data){
      var newData = data.filter(checkIfNewTweet);
      // only render new tweets if this isn't the first time running are new tweets.
      if(newData.length){
        data = newData;
      }
      renderTweets(data);
      timeOfLastLoad = Date.now();
    })
  }

  /**
   * For each tweet in an array of tweet, generates a jQuery element object then prepends it to the tweet container.
   * @param  {array} tweets   An array of tweet objects
   * 
   */
  function renderTweets(tweets){
    tweets.forEach(function(tweet){
      $('#tweets-container').prepend(compileTweetElement(tweet)); // prepend to show 'newest first', from tweet-creation-helpers
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
    
    // ajax call
    $.ajax({
      url: '/tweets',
      method: 'POST',
      data: $tweetComposer.serialize(),
      beforeSend: function(){
        $('.new-tweet form label.red-text').remove(); // if there is a warning label, remove it
      }
    }).done(function(data){
        $('.new-tweet form textarea').val(''); // clear tweet composer (reset it)
        loadTweets();
      });
  }

  var $composerTextArea = $('#composer');
  var $form = $('.new-tweet form');
  var $composerButton = $('#nav-bar .nav-buttons button');
  loadTweets();
  
  // handles form submission
  $form.submit(formSubmissionHandler);

  // Toggle form field to slide down then focus on the composer
  $composerButton.click(function(){
    $('.new-tweet').slideToggle()
    $('.new-tweet form textarea').focus();
   })

  $('#tweets-container ')

  // character counting
  keyupanddown($composerTextArea, countCharacters); // from ./composer-char-counter
});