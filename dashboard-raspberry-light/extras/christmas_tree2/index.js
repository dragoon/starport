function drawSVGPaths(_parentElement, _timeMin, _timeMax) {

    let paths = $(_parentElement).find('path');
    $.each( paths, function(i) {

        let totalLength = this.getTotalLength();

        //set paths to invisible
        $(this).css({
            'stroke-dashoffset': totalLength,
            'stroke-dasharray': totalLength + ' ' + totalLength
        });

        $(this).animate({
            'stroke-dashoffset': 0
        }, {
            duration: Math.floor(Math.random() * _timeMax) + _timeMin
        });
    });
}


function startSVGAnimation(parentElement) {
    drawSVGPaths(parentElement, 1000, 2000, 0);
}
 
startSVGAnimation($('svg'));
