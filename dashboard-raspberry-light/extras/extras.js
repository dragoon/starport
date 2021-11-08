

function addExtras(extras) {
    extras.forEach(e => {
        document.body.insertAdjacentHTML( 'afterbegin', `<iframe id="${e}" src="extras/${e}"></iframe>` );
    });
}