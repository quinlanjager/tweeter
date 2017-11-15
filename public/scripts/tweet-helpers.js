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
 * Build the tweet footer
 * @param  {number} created_at [The date in milliseconds the tweet was created]
 * @return {object}      			 [Returns a jQuery object containing a completed footer.]
 * 
 */
function makeFooter(created_at){

	// adding time stamp
	created_at = new Date(created_at);
	var currentDate = Date.now();
	var timeStamp = Math.round((currentDate - created_at)/86400000);
	if(timeStamp > 14){
		timeStamp = created_at.toDateString();
	} else if (timeStamp === 0){
		timeStamp = created_at.getHours() + ':' + created_at.getMinutes() + ' today';
	} else {
		timeStamp = timeStamp + ' days ago.'
	}
	
	// build section to hold icons
	var icons = ['fa-flag', 'fa-retweet', 'fa-heart']; // icon class names for fontAwesome 
	var $iconsSection = $('<section>').addClass('icons');
	icons.forEach(function(icon){
		var iAttr = {
			class : 'fa ' + icon,
			'aria-hidden' : 'true'
		}
		$iconsSection.append($('<i>').attr(iAttr));
	});

	return $('<footer>').append($('<p>').text(timeStamp))
											.append($iconsSection);
}