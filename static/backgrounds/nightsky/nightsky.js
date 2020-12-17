$(function() {
	var amount = 500;
	var sky = $('.sky');

	for (var i = 0 ; i < amount ; i++ ) {
		var s = $('<div class="star-blink"><div></div></div>');
		s.css({
			'top': Math.random() * 100 + '%',
			'left': Math.random() * 100 + '%',
			'animation': 'blinkAfter 15s infinite ' + Math.random() * 100 + 's ease-out',
			'width': Math.random() * 2 + 7 + 'px',
			'height': Math.random() * 2 + 7 + 'px',
			'opacity': Math.random() * 5 / 10 + 0.5
			});
		if (i % 8 === 0) {
			s.addClass('red');
		} else if (i % 10 === 6) {
			s.addClass('blue');
		}
		sky.append(s);
	}

});
