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