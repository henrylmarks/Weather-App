
$("#errorMessage").hide();
$("#unitList").hide();
let currentUnit = "metric";
let error = false;
let url;
let chosenLon;
let chosenLat;
let timeZoneDifference = 0;
let chosenCity = "London";
const displayedCity = document.getElementById("displayCity"); 
const displayedTime = document.getElementById("time");
const displayedTemp = document.getElementById("tempValue");
const displayedIcon = document.getElementById("tempIcon");
const displayedDescription = document.getElementById("weatherDescription");

function getWeather(placeName) { //function to make an API request for the current weather of the searched City. Also returns the long and lat coordinates used for the forecast function.
  url = "https://api.openweathermap.org/data/2.5/weather?q=" + placeName + "&appid=03c18020c62927311884117d2879a3d1&units=" + currentUnit; //insert the users choices into the API call

  fetch(url)
    .then((response) => {
      if (response.ok) {
        $("#errorMessage").hide();
        return response.json();
      } else {
        console.log("error");
        $("#errorMessage").show(); //tell the user there was an error, and don't return the data so the rest of the function does not execute
      }
    })

    .then((data) => {
      timeZoneDifference = data.timezone / 3600; //timezone data is returned as seconds difference from UTC. converted into hours, to be inserted into the timer as appropriate
      let weatherIcon = "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
      displayedIcon.innerHTML = "<img src =" + weatherIcon + ">"; //insert image of the weather icon, and the temperature/description values provided by the request
      displayedTemp.innerHTML = data.main.temp;
      displayedDescription.innerHTML = data.weather[0].main;
      placeName = placeName.toLowerCase();
      displayedCity.innerHTML = placeName[0].toUpperCase() + placeName.substring(1); //standardised display of the city name regardless of how the user has typed it in, always only the first letter capitalised
      calculateTime();
      chosenLon = data.coord.lon; //store coordinates, execute a forecasting function with them. Needs to be in two seperate functions, as the forecasting url needs exact coordinates  - this way, rather than needing the user to input coordinates, the user can easily search for a city by name, and the coordinates are found for the second function within the data from the first funciton.
      chosenLat = data.coord.lat;
      forecastWeather(chosenLon, chosenLat);
      return chosenLon, chosenLat;
    });
}

let hours = 0;
let hoursSentToForecast = 0;
function calculateTime() {
  var date = new Date();
  hours = date.getHours();

  hoursSentToForecast = hours + timeZoneDifference;
  if (hoursSentToForecast>23){hoursSentToForecast= hoursSentToForecast-24} //needed tracking in a seperate variable. adding the "0" in front of the hours value for consistincey of display would mess with the functioning later on in the forecasting calculations
  hours = hours + timeZoneDifference;

  if (hours > 23) { //allows for the added hours of a time zone not to be set as any number higher than 24, instead approximating it as hours into the next day
    hours = hours - 24;
  }
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  if (hours < 10) {
    hours = "0" + hours;
  } 
  if (minutes < 10) {
    minutes = "0" + minutes;  //keep display consistent to always having 2 digits across hours, minutes and seconds
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  let finalTime = hours + ":" + minutes + ":" + seconds;

  displayedTime.innerHTML = finalTime;

  setTimeout(calculateTime, 1000); //repeats and updates itself to act as a running clock
}





$("#goButton").click(function () {
  chosenCity = document.getElementById("cityName").value;
  getWeather(chosenCity);
  document.getElementById("cityName").value = ""; //reset the input box
  return chosenCity;
});

$(document).on("keypress", function (event) { //Same as go button, allows user to execute searches by pressing enter, as long as there is something in the input box
  if (event.keyCode == 13) {
    if (document.getElementById("cityName").value != "") {
      chosenCity = document.getElementById("cityName").value;
      getWeather(chosenCity);
      document.getElementById("cityName").value = ""; 
      return chosenCity;
    }
  }
});
$("#dropButton").click(function () { //show the unit options
  $("#unitList").toggle();
});

$(".unitOption").click(function () {
  currentUnit = this.id; //api takes default, metric or imperial as a unit measurement. These are stored in the id of the clicked option
  unitToDisplay = this.innerHTML; //change the displayed unit based on the label of the clicked option
  getWeather(chosenCity); //resend the request, as the unit for temperature has changed in the api url
  document.getElementById("tempUnits").innerHTML = unitToDisplay;
  $("#unitList").toggle(); //hide the options again
});


let forecasturl = "https://api.openweathermap.org/data/2.5/onecall?lat=50.619751&lon=-3.413410&appid=03c18020c62927311884117d2879a3d1&units=metric"; 
let i = 1;
let valueToChange;
let timeToChange;
let forecastValue;
let forecastHour;
let forecastTime;
let retrievedUnixTime;
let weekForecastDayName;
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
let weekFCDate;
let weekForecastDay;
let weekForecastValue;
let wfcdbox;
let wfcvbox;

function forecastWeather(lon, lat) {
  forecasturl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat +"&lon=" + lon + "&appid=03c18020c62927311884117d2879a3d1&units=" + currentUnit;
  
  fetch(forecasturl)
    .then((response) => {
      if (response.ok) {
        $("#errorMessage").hide();
        return response.json();
      } else {
        console.log("error");
        $("#errorMessage").show();
      }
    })

    .then((data) => {
      forecastTime;
      while (i < 25) { //hour forecast section. Loop finding the time and hour, setting them into the appropriate div in the grid.
        valueToChange = "hourFCvalue" + i;
        timeToChange = "hourFCTime" + i;
        forecastTime = hoursSentToForecast + i; //hoursSentToForecast will be the current hour of the converted time. Add 1 to it as we start at the next hour (current hour data is already on screen in the main section), and show data for 24 hours from there
        if (forecastTime > 23) {
          forecastTime = forecastTime-24;
        }
        if (forecastTime < 10) {
          forecastTime = "0" + forecastTime;
        }
        forecastTime = forecastTime + ":00";

        forecastValue = data.hourly[i].temp + "°";
        document.getElementById(valueToChange).innerHTML = forecastValue;
        document.getElementById(timeToChange).innerHTML = forecastTime;
        if (i < 8) { //week forecast section. Finds each day after the current day and displays the date, icon and day temp.
          weekFCDate = new Date(data.daily[i].dt * 1000); //convert the unix time provided from the data into something that can be interpreted as a date.
          weekForecastDate = weekFCDate.getDate(); //get the number for what day of the month it is
          weekForecastDayName = dayNames[weekFCDate.getDay()]; //getDay is returned as a number, pick out the appropriate day from an array with Sunday as 0
          weekForecastMonth = weekFCDate.getMonth() + 1;
          weekForecastValue = data.daily[i].temp.day + "°";
          wfcdbox = "weekFCDay" + i;
          wfcvbox = "weekFCValue" + i; //select the appropriate boxes
          wfcibox = "weekFCIcon" + i;
          weatherIcon = "<img src = http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png></img>";
          document.getElementById(wfcdbox).innerHTML = weekForecastDayName + " " + weekForecastDate + "/" + weekForecastMonth;
          document.getElementById(wfcvbox).innerHTML = weekForecastValue 
          document.getElementById(wfcibox).innerHTML = weatherIcon;
        }
        i++;
      }

      i = 1;
      
    });
}




function loadup() { //get the users current coordinates, execute a weather search using them.
  navigator.geolocation.getCurrentPosition(loadUserWeather);
}

function loadUserWeather(position) {
  userLat = position.coords.latitude;
  userLon = position.coords.longitude;
  getUserWeather(userLon, userLat); //seperate function needed as the inputs are different.
}

function getUserWeather(lon, lat) { //this uses a different url again. It is a request for the current weather, as above, but searched for with the users coordinates instead of a city name, so that it can be done automatically . The name is then grabbed from this request to display back to the user, and the rest of the function is the same. 
  Userurl = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=03c18020c62927311884117d2879a3d1&units=" +currentUnit;

  fetch(Userurl)
    .then((response) => {
      if (response.ok) {
        $("#errorMessage").hide();
        console.log("fine");
        return response.json();
      } else {
        console.log("error");
        $("#errorMessage").show();
      }
    })

    .then((data) => {
      timeZoneDifference = data.timezone / 3600; //timezone data is returned as seconds difference from UTC. converted into hours, to be inserted into the timer as appropriate
      let weatherIcon =
        "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";

      displayedIcon.innerHTML = "<img src =" + weatherIcon + ">";
      displayedTemp.innerHTML = data.main.temp;
      displayedDescription.innerHTML = data.weather[0].main;
      chosenCity = data.name; //import for if the temp units are changed for the users location before any new city is selected
      displayedCity.innerHTML = data.name;

      calculateTime();
      chosenLon = data.coord.lon;
      chosenLat = data.coord.lat;
      forecastWeather(chosenLon, chosenLat);
      return chosenLon, chosenLat;
    });
}




getWeather("London"); //a default search for london is executed so that if the location cannot be found from the user, there will be info on screen on loading.
loadup();
