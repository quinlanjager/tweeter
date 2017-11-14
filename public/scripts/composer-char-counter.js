/**
 * Count the characters of the tweet composer
 * @param  {object} event The event object from the listener that triggered the calculation
 * @return {undefined}     This function is called for it's side effects
 */
function countCharacters(event){
	var textArea = $(this);
	var counter = textArea.nextAll('.counter');
	var textAreaLength = textArea.val().length;
	var charsLeft = 140 - textAreaLength;
		
	counter.html(charsLeft);

	// check if the user has exceeded character limit
	if(charsLeft < 1){
		counter.addClass('red-text');
	} else {
		counter.removeClass('red-text');
	}
}

$(document).ready(function(){
	var composer = $('#composer');
	composer.keydown(countCharacters);
});