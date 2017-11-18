(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    console.log('Event is working');
    $('#nav-bar .nav-login').toggleClass('hide');
  });

  // character counting
  keyupanddown($composerTextArea, countCharacters);
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
function keyupanddown(element, callback){
	element.keydown(callback);
  element.keyup(callback);
}

module.exports = {
	countCharacters: countCharacters,
	keyupanddown: keyupanddown
};
},{}],3:[function(require,module,exports){
module.exports = function(user_data){

	var TweetComponents = {};
	/**
	 * Handles click event for the 'heart icon'. Makes an ajax call to update the number of likes than updates the html accordingly.
	 * @param  {object} $icon The jQuery object representing the icon we're changing.
	*/
	function iconClickHandler($heartIcon, tweet){
		return function(event){
			//isolate the click event
			event.stopPropagation();

			var $likes = $heartIcon.closest('footer').find('p span');
			var likesNumber = tweet.likes.length;

			// error handling
			if(!user_data){
				$heartIcon.closest('footer').find('p').append('<span>').addClass('red-text').text('You must be loggedIn to like tweets.');
				return;
			}
			if(user_data.handle === tweet.user.handle){
				$heartIcon.closest('footer').find('p').append('<span>').addClass('red-text').text('You can\'t like your own tweets');
				return;
			}

			$heartIcon.toggleClass('red-text');
			
			// if the tweet is already liked
			if($heartIcon.data('liked') === true){
				$likes.text(likesNumber);
				$.ajax({
					url: '/tweets/' + tweet._id,
					method: 'DELETE'
				});
				$heartIcon.removeData('liked');
				return;
			}

			// If the tweet hasn't been liked.
			$heartIcon.data('liked', true);
			$likes.text(likesNumber + 1);
			$.ajax({
				url: '/tweets/' + tweet._id,
				method: 'PUT'
			}).done(function(res){
				console.log(res);
			});
		};
	}

	/**
	 * Adds zero padding to single digit numbers. Made for the time stamp
	 */
	function addPadding (num){
		var str = num.toString();
		while(str.length !== 2){
			str = '0' + str;
		}
		return str;
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
		} else if (timeStamp === 0){
			timeStamp = addPadding(timeTweetCreatedDate.getHours()) + ':' + addPadding(timeTweetCreatedDate.getMinutes()) + ' today';
		} else {
			var days = timeStamp === 1 ? ' day' : ' days';
			timeStamp = timeStamp + days + ' ago.';
		}
		return timeStamp;
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
	 * A factory function for the heart icon.
	 * @param  {[type]} $heartIcon [description]
	 * @param  {[type]} tweet      [description]
	 * @return {[type]}            [description]
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
		// icon class names from fontAwesome
		var icons = ['fa-flag', 'fa-retweet', 'fa-heart'];
		var $iconsSection = $('<section>').addClass('icons');
		var likes = tweet.likes.length;
		// Meta information:
		var $details = $('<p>').html(makeTimeStamp(tweet.created_at) + ' Likes: ');
				$details.append($('<span>').text(likes));

		// AppendS icons to the iconsSection
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
