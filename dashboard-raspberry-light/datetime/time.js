class DateService {
    #date;

    constructor(date = null) {
        this.#date = date;
    }

    getDate() {
        if (this.#date == null) {
            return new Date();
        } else {
            return this.#date;
        }
    }

    getTimestampSeconds() {
        return this.getDate().getTime() / 1000;
    }
}

let dateService = new DateService();


function currentTime() {
    const date = dateService.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    hour = updateTime(hour);
    min = updateTime(min);
    document.querySelector(".datetime-container .time").innerHTML = hour + ":" + min;
    setTimeout(function () {
        currentTime()
    }, 60000); /* setting timer */
}

function updateTime(k) {
    if (k < 10) {
        return "0" + k;
    } else {
        return k;
    }
}

currentTime();