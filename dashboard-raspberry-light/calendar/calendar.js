function daysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
}

function adjustToEuropean(firstDay) {
    if (firstDay === 0) {
        return 6;
    }
    return firstDay - 1;
}

function renderCalendar() {

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let firstDay = adjustToEuropean((new Date(currentYear, currentMonth)).getDay());

    let calTable = document.getElementById("calendar").lastElementChild; // tbody of the calendar table

    // clearing all previous cells
    calTable.innerHTML = "";

    // creating all cells
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                let cell = document.createElement("td");
                let cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            else if (date > daysInMonth(currentMonth, currentYear)) {
                break;
            }

            else {
                let cell = document.createElement("td");
                let cellText = document.createTextNode(date);
                if (date === today.getDate() && currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
                    cell.classList.add("current-day");
                } // color today's date
                cell.appendChild(cellText);
                row.appendChild(cell);
                date++;
            }
        }
        calTable.appendChild(row); // appending each row into calendar body.
    }
    setTimeout(function () {
        renderCalendar()
    }, 60*60000); /* setting timer */

}

renderCalendar();
