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
		// if the tweet is already liked
		if($icon.data('liked') === true){
			$likes.text(tweetData.likes);

			$.ajax({
				url: '/tweets/' + tweetData._id + '/unlike',
				method: 'PUT'
			});
			$icon.removeData('liked');
			return;
		}
		$icon.setClass()
		$icon.data('liked', true);
		$likes.text(Number(tweetData.likes) + 1);
		$.ajax({
			url: '/tweets/' + tweetData._id + '/like',
			method: 'PUT'
		});
	};
}

/**
 * Build the tweet footer
 * @param  {number} timeTweetCreated [The date in milliseconds the tweet was created]
 * @return {object}      			 [Returns a jQuery object containing a completed footer.]
 *
 */
function makeFooter(tweetData){
	// icon class names from fontAwesome
	var icons = ['fa-flag', 'fa-retweet', 'fa-heart'];
	var $iconsSection = $('<section>').addClass('icons');
	var likes = tweetData.likes ? tweetData.likes : 0;
	// Meta information:
	var $details = $('<p>').html(makeTimeStamp(tweetData.created_at) + ' Likes: ');
			$details.append($('<span>').text(likes));

	// Append icons to the iconsSection
	icons.forEach(function(icon){
		var iconAttributes = {
			class: 'fa ' + icon,
			'aria-hidden': 'true'
		};
		var $iconElt = $('<i>').attr(iconAttributes);
		// Add click handler to the heart icon
		if(icon === 'fa-heart'){
			$iconElt.click(iconClickHandler(tweetData, $iconElt));
		}
		$iconsSection.append($iconElt);
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