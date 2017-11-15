/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

var tweetData = {
  "user": {
    "name": "Newton",
    "avatars": {
      "small":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_50.png",
      "regular": "https://vanillicon.com/788e533873e80d2002fa14e1412b4188.png",
      "large":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_200.png"
    },
    "handle": "@SirIsaac"
  },
  "content": {
    "text": "If I have seen further it is by standing on the shoulders of giants."
  },
  "created_at": 1461116232227
}

// Fake data taken from tweets.json
var data = [
  {
    "user": {
      "name": "Newton",
      "avatars": {
        "small":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_50.png",
        "regular": "https://vanillicon.com/788e533873e80d2002fa14e1412b4188.png",
        "large":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_200.png"
      },
      "handle": "@SirIsaac"
    },
    "content": {
      "text": "If I have seen further it is by standing on the shoulders of giants"
    },
    "created_at": 1461116232227
  },
  {
    "user": {
      "name": "Descartes",
      "avatars": {
        "small":   "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_50.png",
        "regular": "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc.png",
        "large":   "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_200.png"
      },
      "handle": "@rd" },
    "content": {
      "text": "Je pense , donc je suis"
    },
    "created_at": 1461113959088
  },
  {
    "user": {
      "name": "Johann von Goethe",
      "avatars": {
        "small":   "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_50.png",
        "regular": "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1.png",
        "large":   "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_200.png"
      },
      "handle": "@johann49"
    },
    "content": {
      "text": "Es ist nichts schrecklicher als eine tätige Unwissenheit."
    },
    "created_at": 1461113796368
  }
];


function createTweetElement(data){
	var $tweet = $('<article>').addClass('tweet');

	// make header
	var $tweetHeader = $('<header>');
	var $userAvater = $('<img>').attr('src', data.user.avatars.small)
														  .attr('alt', data.user.name)
														  .appendTo($tweetHeader);
	var $userName = $('<h3>').html(data.user.name).appendTo($tweetHeader);
	var $userHandle = $('<p>').html(data.user.handle).appendTo($tweetHeader);
	
	// make main body
	var $tweetMain = $('<main>');
	var $tweetContent = $('<p>').html(data.content.text)
															.appendTo($tweetMain);

	// make footer
	var icons = ['fa-flag', 'fa-retweet', 'fa-heart'];
	var dateCreated = new Date(data.created_at);
	var currentDate = new Date(Date.now());
	var timeStamp = ((currentDate - dateCreated)/1000)/86400
	if(timeStamp > 14){
		timeStamp = dateCreated.toDateString();
	}

	var $tweetFooter = $('<footer>');
	var $timeStamp = $('<p>').html(timeStamp).appendTo($tweetFooter);
	var $iconsSection = $('<section>').addClass('icons');
	icons.forEach(function(icon){
		$iconsSection.append($('<i>').attr('class', `fa ${icon}`).attr('aria-hidden', 'true'));
	});
	$tweetFooter.append($iconsSection);

	// combine them all
	return $tweet.append($tweetHeader).append($tweetMain).append($tweetFooter);
}

function renderTweets(tweets){
	for(var tweet in tweets){
		$('#tweets-container').append(createTweetElement(tweets[tweet]));
	}
}

var $tweet = createTweetElement(tweetData);

$(document).ready(function(){
	// Test / driver code (temporary)
	renderTweets(data);
});