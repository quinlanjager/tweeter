(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


/**Load up tweets with AJAX.*/
function initializeApp(appTasks){
  $.getJSON('/tweets', function(data) {
    var TweetComponents = require('./utils/tweet-components')(data.user);
    var tweetData = data.tweets;
    var newTweetsOnly = tweetData.filter((tweet) => tweet.created_at > timeOfLastLoad);
    // set the time of last loast to now
    timeOfLastLoad = Date.now();

    // only render new tweets.
    if(newTweetsOnly.length){
      renderTweets(newTweetsOnly, TweetComponents);
      return;
    }
    
    renderTweets(tweetData, TweetComponents);
    appTasks(data.user);
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

/** Initialization */
$(function(){
  initializeApp(function(USER_DATA){
    var $composerTextArea = $('#composer');
    var $tweetForm = $('.new-tweet form');
    var $logInForm = $('#loginForm');
    // buttons
    var $composerButton = $('#composeButton');
    var $logInButton = $('#loginButton');
    var $logOutButton = $('#logoutButton');
    var $registerLink = $('a.register-link');
    var $loginLink = $('a.login-link');


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
},{"./utils/composer-char-counter":2,"./utils/tweet-components":3}],2:[function(require,module,exports){
/**
 * Count the characters of the tweet composer
 * @param  {object} event The event object from the listener that triggered the calculation
 *
 */
function countCharacters(event){
	var textArea = $(this);
	var counter = textArea.nextAll('.counter');
	var textAreaLength = textArea.val().length;
	var charsLeft = 140 - textAreaLength;
		
	counter.text(charsLeft);

	// check if the user has exceeded character limit
	if(charsLeft < 1){
		counter.addClass('red-text');
	} else {
		counter.removeClass('red-text');
	}
}

/**
 * Listens for key up and down. Calls callback when either one occurs
 * @param  {Function} callback A valid function to handle the keyup and keydown events
 *
 */
function keyupanddown(element){
	element.keydown(countCharacters);
  element.keyup(countCharacters);
}

module.exports = {
	keyupanddown: keyupanddown,
};
},{}],3:[function(require,module,exports){
	
module.exports = function(user_data){
	
	function addPadding (num){
		var str = num.toString();
		while(str.length !== 2){
			str = '0' + str;
		}
		return str;
	}

	/**
	 * Checks if the tweet is liked by the currently logged in user.
	 */
	function likedByUser(tweet){
		var liked = false;
		tweet.likes.forEach(function(liker){
			if(liker === user_data.handle){
				liked = true;
			}
		});
		return liked;
	}

	/**
	 * Handles click event for the 'heart icon'. Makes an ajax call to update the number of likes than updates the html accordingly.
	 * @param  {object} $icon The jQuery object representing the icon we're changing.
	*/
	function iconClickHandler($heartIcon, tweet){
		return function(event){
			event.stopPropagation();
			// error handling
			if(!user_data){
				$heartIcon.closest('footer').find('p').append('<span>').addClass('red-text').text('You must be loggedIn to like tweets.');
				return;
			}
			if(user_data.handle === tweet.user.handle){
				$heartIcon.closest('footer').find('p').append('<span>').addClass('red-text').text('You can\'t like your own tweets');
				return;
			}

			var $likesContainer = $heartIcon.closest('footer').find('p span');
			var numberOfLikes = tweet.likes.length;
			$heartIcon.toggleClass('red-text');
			
			// if the tweet is already liked
			if($heartIcon.data('liked') === true){
				$likesContainer.text(numberOfLikes);
				$heartIcon.removeData('liked');
				$.ajax({
					url: '/tweets/' + tweet._id,
					method: 'DELETE'
				});
				return;
			}

			$heartIcon.data('liked', true);
			$likesContainer.text(numberOfLikes + 1);
			$.ajax({
				url: '/tweets/' + tweet._id,
				method: 'PUT'
			});
		};
	}

	/**
	 * Creates a time stamp based on how much time has passed since the last tweet.
	 */
	function makeTimeStamp (timeTweetCreated){
		var timeTweetCreatedDate = new Date(timeTweetCreated);
		var currentDate = Date.now();
		var timeStamp = Math.round((currentDate - timeTweetCreatedDate) / 86400000);
		// Formatting text based on age.
		if(timeStamp > 14){
			timeStamp = timeTweetCreatedDate.toDateString();
		} if (timeStamp === 0){
			timeStamp = addPadding(timeTweetCreatedDate.getHours()) + ':' + addPadding(timeTweetCreatedDate.getMinutes()) + ' today';
		} else {
			var days = timeStamp === 1 ? ' day' : ' days';
			timeStamp = timeStamp + days + ' ago.';
		}
		return timeStamp;
	}


	/**
	 * A factory function for the heart icon.
	 * 
	 */
	function makeHeartIcon($heartIcon, tweet){
		$heartIcon.click(iconClickHandler($heartIcon, tweet));
		// if the tweet has been liked before, the heart will appear red on login.
		if(user_data){
			if(likedByUser(tweet)){
				$heartIcon.toggleClass('red-text');
				$heartIcon.data('liked', true);
			}
		}
		return $heartIcon;
	}

	var TweetComponents = {};
	// interface functions for assembling header and footer
	TweetComponents.makeHeader = function (user) {
		var $header = $('<header>');
		var imgAttributes = {
			src: user.avatars.small,
			alt: user.name
		};
		// build header
		return $header.append($('<img>').attr(imgAttributes))
									.append($('<h3>').text(user.name))
									.append($('<p>').text(user.handle));
	};

	TweetComponents.makeFooter = function (tweet){
		var numberOfLikes = tweet.likes.length;
		var $details = $('<p>').html(makeTimeStamp(tweet.created_at) + ' Likes: ');
				$details.append($('<span>').text(numberOfLikes));

		// icon class names from fontAwesome
		var icons = ['fa-flag', 'fa-retweet', 'fa-heart'];
		var $iconsSection = $('<section>').addClass('icons');

		icons.forEach(function(icon){
			var iconAttributes = {
				class: 'fa ' + icon,
				'aria-hidden': 'true'
			};
			var $iconElt = $('<i>').attr(iconAttributes);
			if(icon === 'fa-heart'){
				$iconsSection.append(makeHeartIcon($iconElt, tweet, user_data));
				return;
			}
			$iconsSection.append($iconElt);
		});

		return $('<footer>').append($details)
												.append($iconsSection);
	};
	return TweetComponents;
}
},{}]},{},[1]);
