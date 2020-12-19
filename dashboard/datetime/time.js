function currentTime() {
  const date = new Date(); /* creating object of Date class */
  let hour = date.getHours();
  let min = date.getMinutes();
  let sec = date.getSeconds();
  hour = updateTime(hour);
  min = updateTime(min);
  sec = updateTime(sec);
  $(".datetime-container .time").text(hour + ":" + min);
  $(".datetime-container .date").text(date.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' }));
  setTimeout(function(){ currentTime() }, 1000); /* setting timer */
}

function updateTime(k) {
  if (k < 10) {
    return "0" + k;
  }
  else {
    return k;
  }
}

$(function () {
    currentTime();
});