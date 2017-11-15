/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

var timeLastChecked = Date.now();

function checkIfNewTweet(tweet){
  return tweet.created_at > timeLastChecked;
}

function loadTweets(){
  $.ajax({
    url: '/tweets',
    method: 'GET',
  }).done(function(data){
    filteredData = data.filter(checkIfNewTweet);
    if(filteredData.length){
      data = filteredData;
    }
    renderTweets(data);
  })
}

function generateTweetErrorMessage(message){
  if($('.new-tweet form label').text().length){
    $('.new-tweet form label').text(message);
  } else{
    $('<label>').text(message).addClass('red-text').appendTo($('.new-tweet form')); 
  }
}

/**
 * [createTweetElement description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function createTweetElement(data){
  var $tweet = $('<article>').addClass('tweet').addClass('fade-in');
  var $main = $('<main>').append($('<p>').text(data.content.text)); 
  return $tweet.append(makeHeader(data.user))
               .append($main)
               .append(makeFooter(data.created_at));
}

/**
 * [renderTweets description]
 * @param  {[type]} tweets [description]
 * @return {[type]}        [description]
 */
function renderTweets(tweets){
  tweets.forEach(function(tweet){
    $('#tweets-container').prepend(createTweetElement(tweet));
  });
}


$(document).ready(function(){
  loadTweets();
  
  // handles form submission
  $('.new-tweet form').submit(function(event){
    event.preventDefault();
    var $tweetComposer = $('.new-tweet form textarea');
    var tweet = $('.new-tweet form textarea').val();
    if(tweet.length === 0){
      generateTweetErrorMessage('Please input text before submitting.');
      return;
    }
    if(tweet.length > 140){
      generateTweetErrorMessage('Sorry, your tweet is too long.');
      return;
    }
    $.ajax({
      url: '/tweets',
      method: 'POST',
      data: $tweetComposer.serialize(),
    }).done(function(data){
      loadTweets();
    });
  });

  $('#nav-bar .nav-buttons').on('click', 'button', function(){
    $('.new-tweet').slideToggle();
   })
});