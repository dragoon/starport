

function addExtras(extras) {
    document.querySelectorAll("iframe").forEach(e => e.remove());
    extras.forEach(e => {
        document.body.insertAdjacentHTML( 'afterbegin', `<iframe id="${e}" src="extras/${e}"></iframe>` );
    });
}