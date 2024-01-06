var searchInput = $("#search-input");
var searchButton = $("#search-button");
var searchHistory = JSON.parse(localStorage.getItem("input")) || [];


searchButton.on("click", function (e) {
  e.preventDefault();
  var searchInputValue = searchInput.val().trim();

  // call weather data
  fetchWeatherData(searchInputValue);

  // call news
  fetchNYTimesData();

  // to see the saved search
  saveHistory();

  // history
  init();
});

// to save search in the local storage
function saveHistory() {
  var historyValue = $("#search-input").val();
  searchHistory.push(historyValue);
  localStorage.setItem("input", JSON.stringify(searchHistory));
}

function init() {
  $("#history").empty();
  var recentHistory = [...searchHistory].reverse();
  for (let i = 0; i < recentHistory.length; i++) {
    if (i < 5) {
      var cityButton = $(
        `<button class= " btn btn-secondary m-1 btn-sm col-auto"> ${recentHistory[i]} </button>`
      );
      $("#history").append(cityButton);

      cityButton.attr("data-cityname", recentHistory[i]);
    }
  }
  // to display clicked saved history buttons
  $("#history").on("click", ["data-cityname"], function (e) {
    var cityData = e.target.dataset.cityname;
    var queryURL =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      cityData +
      "&appid=5623fb7d8675d169764d733cafc79bab&units=metric";
    fetch(queryURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // console.log(data);

        var cityName = data.city.name;
        var now = dayjs().format("DD/MM/YYYY");
        // console.log(now);
        var temperature = data.list[0].main.temp;
        var icon =
          "https://openweathermap.org/img/w/" +
          data.list[0].weather[0].icon +
          ".png";
        // console.log(icon);
        var humidity = data.list[0].main.humidity;
        var wind = data.list[0].wind.speed;

        var display = $(`<div class= "display m-3" >
        <h3>${cityName} (${now})</h2>
        <img src="${icon}" alt="Weather Icon">
        <p> Temperature: ${temperature}°c</p>
        <p> Humidity: ${humidity}%</p>
        <p> Wind Speed: ${wind}Mph</p>
        </div>`);

        // display.append(cityName, now, temperature, icon, humidity, wind)
        $("#today").empty();
        $("#today").append(display);
      });
    });
  };


// get weather data
function fetchWeatherData(city) {
  var queryURL =
    "http://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&appid=5623fb7d8675d169764d733cafc79bab&units=metric";
  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("weather data:", data);
      displayWeatherData(data);
    });
}

// to display weather in the page
function displayWeatherData(data) {
  var cityName = data.city.name;
  var now = dayjs().format("DD/MM/YYYY");
  var temperature = Math.round(data.list[0].main.temp);
  var icon =
    "https://openweathermap.org/img/w/" + data.list[0].weather[0].icon + ".png";
  var humidity = data.list[0].main.humidity;
  var wind = data.list[0].wind.speed;

  var display = $(`<div class= "display m-3">
    <h4>${cityName} ${now}</h4>
    <img src="${icon}" alt="Weather Icon">
    <p> Temperature: ${temperature}°c</p>
    <p> Humidity: ${humidity}%</p>
    <p> Wind Speed: ${wind}Mph</p>
  </div>`);
  
  $("#today").empty();
  $("#today").addClass("card");
  $("#today").append(display);

  var showForecastButton = $(
    `<button class="btn btn-primary my-2" data-bs-toggle="modal" data-bs-target="#forecastModal">Show Forecast</button>`
  );
  display.append(showForecastButton);

  showForecastButton.on("click", function () {
    displayForecastModal(data);
  });
}

// get modal
function displayForecastModal(data) {
  var forecastModalContent = $("#forecast-modal-content");
  forecastModalContent.empty();

  var table = $(
    '<table class="table"><thead><tr><th>Date</th><th>Icon</th><th>Temp (°C)</th><th>Humidity (%)</th><th>Wind Speed (Mph)</th></tr></thead><tbody></tbody></table>'
  );
  var tbody = table.find("tbody");

  // to get 5days forecast as weather API provides every 3hours
  for (let i = 7; i < data.list.length; i += 8) {
    temperature = Math.round(data.list[i].main.temp);
    icon =
      "https://openweathermap.org/img/w/" +
      data.list[i].weather[0].icon +
      ".png";
    humidity = data.list[i].main.humidity;
    wind = data.list[i].wind.speed;
    var dateTime = data.list[i].dt_txt;
    var date = dateTime.split(" ")[0];

    var row = $(`
      <tr>
        <td>${date}</td>
        <td><img src="${icon}" alt="Weather Icon" class="weather-icon"></td>
        <td>${temperature}°c</td>
        <td>${humidity}%</td>
        <td>${wind}Mph</td>
      </tr>
    `);
    tbody.append(row);
  }
  forecastModalContent.append(table);
}

//get News data
function fetchNYTimesData() {
  const url =
    "https://api.nytimes.com/svc/topstories/v2/world.json?api-key=2HZO8Nm92mvAlS6mdyq3WMnEmGUgQ81F";
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("NY Times data:", data);
      displayNYTimesData(data);
    })
}

// display the news in the page
function displayNYTimesData(data) {
  var nyTimesContainer = $("#nytimes-container");
  nyTimesContainer.empty();

  for (var index = 0; index < data.results.length; index++) {
    var article = data.results[index];

    if (index > 0 && index <= 6) {
      var imageUrl = "";
      var imageElement = "";

      if (article.multimedia && article.multimedia.length > 0) {
        imageUrl = article.multimedia[0].url;
        imageElement = `<img src="${imageUrl}" class="card-img-top nytimes-img" alt="${article.title}">`;
      }

      var articleElement = $(`<div class="card m-3 bg-light">
        <div class="row no-gutters">
          <div class="col-md-4">
            ${imageElement}
          </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${article.title}</h5>
            <p class="card-text">${article.abstract}</p>
            <a href="${article.url}" class="btn btn-primary" target="_blank">Read More</a>
          </div>
        </div>
      </div>
    </div>`);
    nyTimesContainer.append(articleElement);
    }
  }
}
