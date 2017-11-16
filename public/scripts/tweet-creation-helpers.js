/**
 * Build the tweet header
 * @param  {object} user [A object containing tweeter user info]
 * @return {object}      [Returns a jQuery object containing a completed header.]
 * 
 */
function makeHeader(user) {
	var $header = $('<header>');
	var imgAttributes = {
		src : user.avatars.small,
		alt : user.name
	}
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
	timeTweetCreated = new Date(timeTweetCreated);
	var currentDate = Date.now();
	var timeStamp = Math.round((currentDate - timeTweetCreated)/86400000);
	// Formatting text based on age.
	if(timeStamp > 14){
		timeStamp = timeTweetCreated.toDateString();
	} else if (timeStamp === 0){
		timeStamp = timeTweetCreated.getHours() + ':' + timeTweetCreated.getMinutes() + ' today';
	} else {
		timeStamp = timeStamp + ' days ago.'
	}
	return timeStamp
}

/**
 * Build the tweet footer
 * @param  {number} timeTweetCreated [The date in milliseconds the tweet was created]
 * @return {object}      			 [Returns a jQuery object containing a completed footer.]
 * 
 */
function makeFooter(tweetData){
	// build section to hold icons
	var icons = ['fa-flag', 'fa-retweet', 'fa-heart']; // icon class names from fontAwesome 
	var $iconsSection = $('<section>').addClass('icons');
	icons.forEach(function(icon){
		var iAttr = {
			class : 'fa ' + icon,
			'aria-hidden' : 'true'
		}
		$iconsSection.append($('<i>').attr(iAttr));
	});

	return $('<footer>').append($('<p>').text(makeTimeStamp(tweetData.created_at)))
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
  return $tweet.append(makeHeader(data.user)) // from ./tweet-helpers
               .append($main)
               .append(makeFooter(data)); // from ./tweet-helpers
}