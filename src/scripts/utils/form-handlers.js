/**
 * Provides an error message if the form is invalid. Else submits the form via AJAX and loads up the new tweets.
 *
 */
function tweetFormSubmission(event){
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

module.exports = {
}
