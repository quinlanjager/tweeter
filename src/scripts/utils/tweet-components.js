	
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