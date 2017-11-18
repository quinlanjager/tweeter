(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// importing functions and assigning them
var timeOfLastLoad = Date.now();
var composerCharCounter = require('./composer-char-counter');
var tweetCreationHelpers = require('./tweet-creation-helpers');


var countCharacters = composerCharCounter.countCharacters;
var keyupanddown = composerCharCounter.keyupanddown;

var addPadding = tweetCreationHelpers.addPadding;
var makeHeader = tweetCreationHelpers.makeHeader;
var makeTimeStamp = tweetCreationHelpers.makeTimeStamp;
var iconClickHandler = tweetCreationHelpers.iconClickHandler;
var makeFooter = tweetCreationHelpers.makeFooter;
var compileTweetElement = tweetCreationHelpers.compileTweetElement;

$(function(){

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
  function renderTweets(tweets){
    tweets.forEach(function(tweet){
      // prepend to show 'newest first', from tweet-creation-helpers
      $('#tweets-container').prepend(compileTweetElement(tweet));
    });
  }

  /**
   * Loads up tweets via an AJAX call.
   *
   */
  function loadTweets(){
    $.ajax({
      url: '/tweets',
      method: 'GET'
    }).done(function(data){
      if(!data.loggedIn){
        $('#nav-bar .nav-login').removeClass('hide');
      }
      var newTweetsOnly = data.tweets.filter(checkIfNewTweet);
      var tweetData = data.tweets;
      // only render new tweets if this isn't the first time running are new tweets.
      if(newTweetsOnly.length){
        tweetData = newTweetsOnly;
      }
      renderTweets(tweetData);
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
    
    // ajax call
    $.ajax({
      url: '/tweets',
      method: 'POST',
      data: $tweetComposer.serialize(),
      beforeSend: function(){
        // if there is a warning label, remove it
        $('.new-tweet form label.red-text').remove();
      }
    }).done(function(err){
        if(err === 'You must be logged in to post a tweet.'){
          generateTweetErrorMessage(err);
          return;
        }
        // clear tweet composer (reset it)
        $('.new-tweet form textarea').val('');
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
    $('.new-tweet').slideToggle();
    $('.new-tweet form textarea').focus();
  });

  // character counting
  keyupanddown($composerTextArea, countCharacters);
});
},{"./composer-char-counter":2,"./tweet-creation-helpers":3}],2:[function(require,module,exports){
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
/**
 * Tweet creation functions.
 */

function addPadding(num){
	var str = num.toString();
	while(str.length !== 2){
		str = '0' + str;
	}
	return str;
}

/**
 * Build the tweet header
 * @param  {object} user [A object containing tweeter user info]
 * @return {object}      [Returns a jQuery object containing a completed header.]
 *
 */
function makeHeader(user) {
	var $header = $('<header>');
	var imgAttributes = {
		src: user.avatars.small,
		alt: user.name
	};
	// build header
	return $header.append($('<img>').attr(imgAttributes))
								.append($('<h3>').text(user.name))
								.append($('<p>').text(user.handle));
}

/**
 * Generates a time stamp based on when a tweet was created
 * @param  {number} timeTweetCreated The time a tweet was created.
 * @return {string} A string indicating when a tweet was created.
 *
 */
function makeTimeStamp(timeTweetCreated){
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
 * Handles click event for the 'heart icon'. Makes an ajax call to update the number of likes than updates the html accordingly.
 * @param  {object} tweetData  The tweet data object
 * @param  {object} $icon 		 The jQuery object representing the icon we're changing.
 *
 */
function iconClickHandler(tweetData, $icon){
	return function(event){
		//isolate the click event
		event.stopPropagation();
		var $likes = $icon.closest('footer').find('p span');
		var likesNumber = tweetData.likes.length;
		// if the tweet is already liked
		if($icon.data('liked') === true){
			$likes.text(likesNumber);
			$.ajax({
				url: '/tweets/' + tweetData._id,
				method: 'DELETE'
			});
			$icon.removeData('liked');
			return;
		}
			$icon.toggleClass('red-text');
			$icon.data('liked', true);
			$likes.text(likesNumber + 1);
		$.ajax({
			url: '/tweets/' + tweetData._id,
			method: 'PUT'
		}).done((err) => {
			// if there is an error message
			if(err){
				$likes.text(likesNumber);
				$icon.toggleClass('red-text');
				$icon.removeData('liked', true);
				$icon.closest('footer').find('p').append('<span>').addClass('red-text').text(result);
			}
			// close connection here.
		});
	};
}

/**
 * Handles adding functionality to the heart icon.
 * @param  {object} $icon  jQuery object representing the icon object. 
 * @param  {object} tweetData An object representing the tweet.     
 */
function addHeartClickHandler($icon, tweetData){
	var cookieSlicePoint = document.cookie.indexOf('=') + 1;
	var userID = document.cookie.slice(cookieSlicePoint);
	tweetData.likes.forEach(function(liker){
		if(decodeURIComponent(userID) === liker){
			$icon.data('liked', true);
			$icon.toggleClass('red-text');
		}
	});
	$icon.click(iconClickHandler(tweetData, $icon));
}

/**
 * Handles making the icons for the tweet footer.
 * @param  {string} icon 	a string representing the icon name.
 * @return {object}       returns a jQuery element object.
 */
function makeIcon(icon, tweetData){
	var iconAttributes = {
		class: 'fa ' + icon,
		'aria-hidden': 'true'
	};
	var $iconElt = $('<i>').attr(iconAttributes);
	if(icon === 'fa-heart'){
		addHeartClickHandler($iconElt, tweetData);
	}
	return $iconElt;
}

/**
 * Build the tweet footer
 * @param  {number} timeTweetCreated [The date in milliseconds the tweet was created]
 * @return {object}      			 [Returns a jQuery object containing a completed footer.]
 */
function makeFooter(tweetData){
	// icon class names from fontAwesome
	var icons = ['fa-flag', 'fa-retweet', 'fa-heart'];
	var $iconsSection = $('<section>').addClass('icons');
	var likes = tweetData.likes.length;
	// Meta information:
	var $details = $('<p>').html(makeTimeStamp(tweetData.created_at) + ' Likes: ');
			$details.append($('<span>').text(likes));

	// Append icons to the iconsSection
	icons.forEach(function(icon){
		$iconsSection.append(makeIcon(icon, tweetData));
	});

	return $('<footer>').append($details)
											.append($iconsSection);
}

/**
 * Create a new tweet jQuery element
 * @param  {object} data  An individual tweet object from an array of tweets.
 * @return {object}       Returns a jQuery element object representing a tweet.
 *
 */
function compileTweetElement(data){
  var $tweet = $('<article>').addClass('tweet');
  var $main = $('<main>').append($('<p>').text(data.content.text));
  return $tweet.append(makeHeader(data.user))
               .append($main)
               .append(makeFooter(data));
}

module.exports = {
	addPadding: addPadding,
	makeHeader: makeHeader,
	makeTimeStamp: makeTimeStamp,
	iconClickHandler: iconClickHandler,
	makeFooter: makeFooter,
	compileTweetElement: compileTweetElement
};
},{}]},{},[1]);
