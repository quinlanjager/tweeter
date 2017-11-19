var timeOfLastLoad = Date.now();
var ComposerCharCounter = require('./utils/composer-char-counter');

// Generate an error message label to be appended to the tweet composer form.
function generateTweetErrorMessage(message){
  // if label aready exists, just replace the text.
  var $errorLabel = $('.new-tweet form label');
  if($errorLabel.text().length){
    $errorLabel.text(message);
  } else{
    $('<label>').text(message).addClass('red-text').appendTo($('.new-tweet form'));
  }
}

// Load up tweets with AJAX.
function initializeApp(appTasks){
  $.getJSON('/tweets', function(data) {
    var tweetData = data.tweets;
    var newTweetsOnly = tweetData.filter((tweet) => tweet.created_at > timeOfLastLoad);
    // set the time of last load to now.
    timeOfLastLoad = Date.now();

    // only render new tweets.
    if(newTweetsOnly.length){
      appTasks(data.user, newTweetsOnly);
      return;
    }
    appTasks(data.user, tweetData);
  });
}

// Initialization
$(function(){
  initializeApp(function(USER_DATA, TWEET_DATA){
    // renderTweet helper
    var renderTweets = require('./utils/render-tweets');
    
    var $composerTextArea = $('#composer');
    var $tweetForm = $('.new-tweet form');
    var $logInForm = $('#loginForm');
    var $registerForm = $('#register');

    // buttons
    var $composerButton = $('#composeButton');
    var $logInButton = $('#loginButton');
    var $logOutButton = $('#logoutButton');
    var $registerLink = $('a.register-link');
    var $loginLink = $('a.login-link');

    // Registration/login form handler
    function initializeFormHandlerOn(formId){
      formId.submit(function(event){
        event.preventDefault();
        var $form = $(formId);
        var inputs = $form.find('input');
        var body = "";
        for(var i = 0; i < inputs.length; i++){
          if(i === 0){
            body += $(inputs[i]).attr('name') + "=" + $(inputs[i]).val();
            continue;
          }
          body += '&' + $(inputs[i]).attr('name') + '=' + $(inputs[i]).val();
        }
        console.log(body);
        $.post($(this).attr('action'), encodeURI(body), function(result){
          if(result === 'OK'){
            location.reload(true);
            return;
          } 
          // delete existing warning label
          $form.find('label.red-text').remove();
          var errorMessage = $('<label>').addClass('red-text').text(result);
          $form.find('p').before(errorMessage);
        });
      })
    }

    // tweet submission form handler
    function tweetFormSubmission(event){
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
        initializeApp(renderTweets);
      });
    }

    // render initial batch of tweets
    renderTweets(USER_DATA, TWEET_DATA);
    
    // Form submission events
    initializeFormHandlerOn($logInForm);
    initializeFormHandlerOn($registerForm);
    $tweetForm.submit(tweetFormSubmission);

    // Changing interface if the user is logged in.
    if(USER_DATA){
      $('.container').prepend($('<h2>').text('Welcome, ' + USER_DATA.handle));
      $logInButton.addClass('hide');
      $logOutButton.removeClass('hide');
    }

    // button events
    // 'Compose' button
    $composerButton.click(function(){
      $('.new-tweet').slideToggle();
      $('.new-tweet form textarea').focus();
    });

    // 'Login' button
    $logInButton.click(function(event){
      event.preventDefault();
      $('#nav-bar .nav-login').toggleClass('hide');
    });

    // 'Register now' link
    $registerLink.click(function(event){
      event.preventDefault();
      $('#loginForm').toggleClass('hide');
    });

    // 'Already have an account? login' link
    $loginLink.click(function(event){
      event.preventDefault();
      $('#loginForm').toggleClass('hide');
    })

    // character counting
    ComposerCharCounter.keyupanddown($composerTextArea);
  });
});