'use strict';

const AIRVISUAL_SEARCH_URL = 'http://api.airvisual.com/v2/city';
const AIRVISUAL_KEY = 'E3FYqJAMJhNcyS4ye';

const WEATHERBIT_SEARCH_URL = 'https://api.weatherbit.io/v2.0/forecast/daily';
const WEATHERBIT_KEY = '967524b9dfb34eea830cbfb0592b6cdd';

// user query
let city = '';
let state = '';

function getRequestAir(city, state, callback) {
    const airParams = {
        city: city,
        state: state,
        country: 'USA',
        key: AIRVISUAL_KEY,
    };
    $.getJSON(AIRVISUAL_SEARCH_URL, airParams, callback).fail(showErr);
}

function getRequestWeather(city, callback) {
    const weatherParams = {
        city: city,
        units: 'I', //Fahrenheit
        days: 5, // 5 day forecast
        key: WEATHERBIT_KEY,
    }
    $.getJSON(WEATHERBIT_SEARCH_URL, weatherParams, callback).fail(showErr);
}

function showErr(err) {
    const errorOutput = $('#js-result-section');
    const { status } = err;
    console.log(err)
    let errMsg;
    if (status === 404) {
        errMsg = `city or state cannot be found!`
    }
    if (status === 503) {
        errMsg = `server could not be reached!`
    }
    const errHTML = (
    `<div class="error col s12 m6 offset-m4">
      <p>${errMsg}<p>
    </div>`
    );
    errorOutput
      .empty()
      .append(errHTML)
}

function airQualitySentiment(aqi) {
    let sentiment = '';
    if (!aqi) {
        sentiment += 'help_outline'
    } else if (aqi <= 50) {
        sentiment += 'sentiment_very_satisfied';
    } else if (aqi <= 100) {
        sentiment += 'sentiment_satisfied';
    } else if (aqi <= 150) {
        sentiment += 'sentiment_neutral';
    } else if (aqi <= 200) {
        sentiment += 'sentiment_dissatisfied';
    } else if (aqi <= 300) {
        sentiment += 'sentiment_very_dissatisfied';
    } else {
        sentiment += 'block';
    }
    return sentiment;
}

function airQualityMessage(aqi) {
    let message = '';
    if (!aqi) {
        message += '<h5>Oh no!</h5><p>Data is currently unavailable.</p>'
    } else if (aqi <= 50) {
        message += `
        <h5>Good</h5>
        <p>Air quality is satisfactory.</p>
        <p>Air pollution poses little or no risk.</p>`;
    } else if (aqi <= 100) {
        message += `
        <h5>Moderate</h5>
        <p>Little or no risk for most people.</p>
        <p>People with unusual sensitivities to air pollutants may be at moderate risk.</p>`;
    } else if (aqi <= 150) {
        message += `
        <h5>Unhealthy for sensitive groups</h5>
        <p>little risk for most people</p>
        <p>Potential adverse health effects for people with health sensitivities.</p>`;
    } else if (aqi <= 200) {
        message += `
        <h5>Unhealthy</5>
        <p>Uh oh!Everyone may begin to experience health effects</p>
        <p>Sensitive people may experience more serious health effects.</p>`;
    } else if (aqi <= 300) {
        message += `
        <h5>Very Unhealthy</h5>
        <p>Oh no! Better stay inside.</p>
        <p>everyone may experience more serious health effects.</p>`;
    } else {
        message += `
        <h5>Hazordous</h5>
        <p>Warning: emergency conditions!</p>
        <p>The entire population is more likely to be affected. Protect yourself.</p>`;
    }
    return message;
}

function convertToCelcius(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5 / 9);
}

// make date from "2017-10-31" to "10/31"
function dateFormat(string) {
    let array = string.split("-");
    return `${array[1]}/${array[2]}`;
}

// make array of dates for tabs
function makeDateArray(weatherData, array){
    weatherData.data.forEach((item, index) => {
        Object.keys(item).forEach(key => {
            if(key === "datetime") {
                array.push(dateFormat(weatherData.data[index][key]));
                return array;
            }
        });
    });
}

// add dates to tabs
function addDateTabs(weatherData){
    let array = [];
    makeDateArray(weatherData, array);
    array.forEach((date, index) => {
        // tabs
        $('#js-card-tabs').append(`
            <li class="tab">
                <a href="#" id="js-tab-date${index}">${date}</a>
            </li>`);
    });
}

function displayWeather(weatherData) {
    const { data } = weatherData;
    data.forEach((item, index) => {
        const {
            max_temp,
            min_temp,
            weather,
            clouds,
            wind_sp,
            wind_cdir,
            pop,
            vis,
            snow,
            snow_depth,
            uv,
        }  = item;
        const {
            icon,
            description,
        } = weather;
        let max_tempCel = convertToCelcius(max_temp);
        let min_tempCel = convertToCelcius(min_temp);
    $('#js-data').append(`
        <div class="col s12 m6 center" id="js-date${index}">
            <img src="icons/${icon}.png" alt="weather icon">
            <p>${min_temp} / ${max_temp} &deg;F</p>
            <p>${min_tempCel} / ${max_tempCel} &deg;C</p>
            <p>${description}</p>
        </div>`);
    $('#js-data').append(`
        <div class="col s12 m6 center" id="js-date${index}-detail">
            <ul class="collection" id="js-weather-detail">
                <li class="collection-item">cloud coverage: ${clouds} %</li>
                <li class="collection-item">wind sp: ${wind_sp} m/s</li>
                <li class="collection-item">wind direct: ${wind_cdir}</li>
                <li class="collection-item">prob. precip: ${pop}%</li>
                <li class="collection-item">visibility: ${vis} km</li>
                <li class="collection-item">snow: ${snow} mm</li>
                <li class="collection-item">snow dep: ${snow_depth} mm</li>
                <li class="collection-item">daily max. UV: ${uv}</li>
            </ul>
        </div>`);
    });
}

function renderAir(airData) {
    let aqi = airData.data.current.pollution.aqius;
    // get google sentiment icon for air quality
    let sentiment = airQualitySentiment(aqi);
    let message = airQualityMessage(aqi);
    $('#js-data').append(`
        <div class="col s12 m6 center" id="js-aqi-data">
            <i class="material-icons md-64">${sentiment}</i>
            <h5>AQI: ${aqi}<a href="https://airnow.gov/index.cfm?action=aqibasics.aqi" target="_blank" rel="noopener noreferrer" title="EPA explanation on AQI"><sup><i class="material-icons md-16">info_outline</i></sup></a></h5>
        </div>
        <div class="col s12 m6 center" id="js-aqi-msg">
            ${message}
        </div>`);
}

function displayCityState(city, state) {
    $('#js-city-state').append(`<h5>${city}, ${state}</h5>`);
}

function renderWeather(weatherData) {
    addDateTabs(weatherData);
    displayWeather(weatherData);
}

// handleSubmit; get city and state
function handleSubmit() {
    $('#js-search-section').submit((e) => {
        e.preventDefault();
        city = $('#js-city-entry').val();
        state = $('#js-state-entry').val();
        $('#js-city-entry').val('');
        $('#js-state-entry').val('');
        displayCityState(city, state);
        getRequestAir(city, state, renderAir);
        getRequestWeather(city, renderWeather);
        $('#js-card').not('#js-date0, #js-date0-detail, #js-date1, #js-date1-detail, #js-date2, #js-date2-detail, #js-date3, #js-date3-detail, #js-date4, #js-date4-detail').show();
    });
}
// handle tab clicking
function handleAirTabClick() {
    $('#js-air').click((e) => {
        e.preventDefault();
        alert('clicked');
        // everything including js-aqi-data and js-aqi-msg shows
        $('#js-card').not('#js-date0, #js-date0-detail, #js-date1, #js-date1-detail, #js-date2, #js-date2-detail, #js-date3, #js-date3-detail, #js-date4, #js-date4-detail').show();
    });
}
function handleDate0TabClick() {
    $('#js-tab-date0').click((e) => {
        e.preventDefault();
        alert('clicked');
        $('#js-card').not('#js-aqi-data, #js-aqi-msg, #js-date0-detail, #js-date1, #js-date1-detail, #js-date2, #js-date2-detail, #js-date3, #js-date3-detail, #js-date4, #js-date4-detail').show();
    });
}

function handleDate1TabClick() {
    $('#js-tab-date0').click((e) => {
        e.preventDefault();
        alert('clicked');
        $('#js-date1, #js-date1-detail').show();
        // hide the rest
        $('#js-aqi-data, #js-aqi-msg, #js-date0, #js-date0-detail, #js-date2, #js-date2-detail, #js-date3, #js-date3-detail, #js-date4, #js-date4-detail').hide();
    });
}

function handleDate2TabClick() {
    $('#js-tab-date0').click((e) => {
        e.preventDefault();
        alert('clicked');
        $('#js-date2, #js-date2-detail').show();
        // hide the rest
        $('#js-aqi-data, #js-aqi-msg, #js-date0, #js-date0-detail, #js-date2, #js-date2-detail, #js-date3, #js-date3-detail, #js-date4, #js-date4-detail').hide();
    });
}

$(document).ready(() => {
    handleSubmit();
    handleAirTabClick();
    handleDate0TabClick();
});
