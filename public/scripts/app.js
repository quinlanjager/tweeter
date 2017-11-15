/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

function loadTweets(){
  $.ajax({
    url: '/tweets',
    method: 'GET',
  }).done(function(data){
    renderTweets(data);
  })
}

function generateTweetErrorMessage(message){
  if($('.new-tweet form label').text().length){
    $('.new-tweet form label').text(message);
  } else{
    console.log('in else');
    $('<label>').text(message).addClass('red-text').appendTo($('.new-tweet form')); 
  }
}

/**
 * [createTweetElement description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function createTweetElement(data){
  var $tweet = $('<article>').addClass('tweet');
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
    $('#tweets-container').append(createTweetElement(tweet));
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
});