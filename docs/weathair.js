'use strict';

const AIRVISUAL_SEARCH_URL = 'https://api.airvisual.com/v2/city';
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
    if (status === 'no_nearest_station') {
        errMsg = `no available data!`
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
function addTabs(weatherData, string){
    let array = [];
    makeDateArray(weatherData, array);
    array.forEach((date, index) => {
        $(`a[href='#js-date${index}']`).append(`${date}`);
    });
    $(`a[href='#js-${string}']`).append(`${string}`);
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
        $('#js-result-section div').find(`[id='js-date${index}']`).append(`
        <div class="col s10 offset-s1 m6 center" role="region" aria-label="weather summary">
            <img src="icons/${icon}.png" alt="weather icon">
            <p>${min_temp} / ${max_temp} &deg;F</p>
            <p>${min_tempCel} / ${max_tempCel} &deg;C</p>
            <p>${description}</p>
        </div>
        <div class="col s10 offset-s1 m6 center" role="region" aria-label="weather summary">
            <ul class="left-align" role="list" aria-label="detailed weather data">
                <li role="listitem"><strong>average cloud coverage:</strong> ${clouds} %</li>
                <li role="listitem"><strong>wind speed:</strong> ${wind_sp} m/s</li>
                <li role="listitem"><strong>wind direction:</strong> ${wind_cdir}</li>
                <li role="listitem"><strong>probability of precip:</strong> ${pop}%</li>
                <li role="listitem"><strong>visibility:</strong> ${vis} km</li>
                <li role="listitem"><strong>snow:</strong> ${snow} mm</li>
                <li role="listitem"><strong>snow depth:</strong> ${snow_depth} mm</li>
                <li role="listitem"><strong>daily max. UV (0-11+):</strong> ${uv}</li>
            </ul>
        </div>`);
    });
}

function renderAir(airData) {
    let aqi = airData.data.current.pollution.aqius;
    // get google sentiment icon for air quality
    let sentiment = airQualitySentiment(aqi);
    let message = airQualityMessage(aqi);
    $('#js-Air').append(`
        <div class="col s10 offset-s1 m6 center" role="region" aria-label="air quality data">
            <i class="material-icons md-64">${sentiment}</i>
            <h5>AQI: ${aqi}<a href="https://airnow.gov/index.cfm?action=aqibasics.aqi" target="_blank" rel="noopener noreferrer" title="EPA explanation on AQI"><sup><i class="material-icons md-16">info_outline</i></sup></a></h5>
        </div>
        <div class="col s10 offset-s1 m6 center">
            <p>${message}</p>
        </div>
        `);
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function displayCityState(city, state) {
    city = capitalize(city);
    state = capitalize(state);
    $('#js-city-state').append(`<h5>${city}, ${state}</h5>`);
}

function renderWeather(weatherData) {
    addTabs(weatherData, 'Air');
    displayWeather(weatherData);
}

//clear data display
function clear() {
    $('div.card-content div').empty();
    $('li.tab a').empty();
}

function autocompleteState() {
    $('#js-state-entry').autocomplete({
    data: {
        'Alabama': null,
        'Alaska': null,
        'American Samoa': null,
        'Arizona': null,
        'Arkansas': null,
        'California': null,
        'Colorado': null,
        'Connecticut': null,
        'Delaware': null,
        'District Of Columbia': null,
        'Federated States Of Micronesia': null,
        'Florida': null,
        'Georgia': null,
        'Guam': null,
        'Hawaii': null,
        'Idaho': null,
        'Illinois': null,
        'Indiana': null,
        'Iowa': null,
        'Kansas': null,
        'Kentucky': null,
        'Louisiana': null,
        'Maine': null,
        'Marshall Islands': null,
        'Maryland': null,
        'Massachusetts': null,
        'Michigan': null,
        'Minnesota': null,
        'Missouri': null,
        'Northern Mariana Islands': null,
        'Mississippi': null,
        'Montana': null,
        'Nebraska': null,
        'Nevada': null,
        'New Hampshire': null,
        'New Jersey': null,
        'New Mexico': null,
        'New York': null,
        'North Carolina': null,
        'North Dakota': null,
        'Ohio': null,
        'Oklahoma': null,
        'Oregon': null,
        'Palau': null,
        'Pennsylvania': null,
        'Puerto Rico': null,
        'Rhode Island': null,
        'South Carolina': null,
        'South Dakota': null,
        'Tennessee': null,
        'Texas': null,
        'Utah': null,
        'Vermont': null,
        'Virgin Islands': null,
        'Virginia': null,
        'Washington': null,
        'West Virginia': null,
        'Wisconsin': null,
        'Wyoming': null,
    },
      limit: 10,
      onAutocomplete: null,
      minLength: 2,
    });
}

function autocompleteCity() {
    $('#js-city-entry').autocomplete({
    data: {
    'New York': null,
    'Los Angeles': null,
    'Chicago': null,
    'Houston': null,
    'Philadelphia': null,
    'Phoenix': null,
    'San Antonio': null,
    'San Diego': null,
    'Dallas': null,
    'San Jose': null,
    'Austin': null,
    'Jacksonville': null,
    'Indianapolis': null,
    'San Francisco': null,
    'Columbus': null,
    'Fort Worth': null,
    'Charlotte': null,
    'Detroit': null,
    'El Paso': null,
    'Memphis': null,
    'Boston': null,
    'Seattle': null,
    'Denver': null,
    'Washington': null,
    'Nashville': null,
    'Baltimore': null,
    'Louisville': null,
    'Portland': null,
    'Oklahoma City': null,
    'Milwaukee': null,
    'Las Vegas': null,
    'Albuquerque': null,
    'Tucson': null,
    'Fresno': null,
    'Sacramento': null,
    'Long Beach': null,
    'Kansas City': null,
    'Mesa': null,
    'Virginia Beach': null,
    'Atlanta': null,
    'Colorado Springs': null,
    'Raleigh': null,
    'Omaha': null,
    'Miami': null,
    'Oakland': null,
    'Tulsa': null,
    'Minneapolis': null,
    'Cleveland': null,
    'Arlington': null,
    'New Orleans': null,
    'Bakersfield': null,
    'Tampa': null,
    'Honolulu': null,
    'Anaheim': null,
    'Santa Ana': null,
    'St. Louis': null,
    'Riverside': null,
    'Corpus Christi': null,
    'Pittsburgh': null,
    'Lexington': null,
    'Anchorage': null,
    'Stockton': null,
    'Cincinnati': null,
    'Saint Paul': null,
    'Toledo': null,
    'Newark': null,
    'Greensboro': null,
    'Plano': null,
    'Henderson': null,
    'Lincoln': null,
    'Buffalo': null,
    'Fort Wayne': null,
    'Jersey City': null,
    'Chula Vista': null,
    'Orlando': null,
    'St. Petersburg': null,
    'Norfolk': null,
    'Chandler': null,
    'Laredo': null,
    'Madison': null,
    'Durham': null,
    'Lubbock': null,
    'Winston-Salem': null,
    'Garland': null,
    'Glendale': null,
    'Hialeah': null,
    'Reno': null,
    'Baton Rouge': null,
    'Irvine': null,
    'Chesapeake': null,
    'Irving': null,
    'Scottsdale': null,
    'North Las Vegas': null,
    'Fremont': null,
    'Gilbert': null,
    'San Bernardino': null,
    'Boise': null,
    'Birmingham': null,
    'Rochester': null,
    'Richmond': null,
    'Spokane': null,
    'Des Moines': null,
    'Montgomery': null,
    'Modesto': null,
    'Fayetteville': null,
    'Tacoma': null,
    'Shreveport': null,
    'Fontana': null,
    'Oxnard': null,
    'Aurora': null,
    'Moreno Valley': null,
    'Akron': null,
    'Yonkers': null,
    'Columbus': null,
    'Augusta': null,
    'Little Rock': null,
    'Amarillo': null,
    'Mobile': null,
    'Huntington Beach': null,
    'Glendale': null,
    'Grand Rapids': null,
    'Salt Lake City': null,
    'Tallahassee': null,
    'Huntsville': null,
    'Worcester': null,
    'Knoxville': null,
    'Grand Prairie': null,
    'Newport News': null,
    'Brownsville': null,
    'Santa Clarita': null,
    'Overland Park': null,
    'Providence': null,
    'Jackson': null,
    'Garden Grove': null,
    'Oceanside': null,
    'Chattanooga': null,
    'Fort Lauderdale': null,
    'Rancho Cucamonga': null,
    'Santa Rosa': null,
    'Port St. Lucie': null,
    'Ontario': null,
    'Tempe': null,
    'Vancouver': null,
    'Springfield': null,
    'Cape Coral': null,
    'Pembroke Pines': null,
    'Sioux Falls': null,
    'Lancaster': null,
    'Elk Grove': null,
    'Corona': null,
    'Eugene': null,
    'Salem': null,
    'Palmdale': null,
    'Salinas': null,
    'Pasadena': null,
    'Rockford': null,
    'Pomona': null,
    'Hayward': null,
    'Fort Collins': null,
    'Joliet': null,
    'Escondido': null,
    'Torrance': null,
    'Bridgeport': null,
    'Alexandria': null,
    'Sunnyvale': null,
    'Cary': null,
    'Lakewood': null,
    'Hollywood': null,
    'Paterson': null,
    'Syracuse': null,
    'Naperville': null,
    'McKinney': null,
    'Mesquite': null,
    'Clarksville': null,
    'Savannah': null,
    'Dayton': null,
    'Orange': null,
    'Fullerton': null,
    'Hampton': null,
    'McAllen': null,
    'Killeen': null,
    'Warren': null,
    'West Valley City': null,
    'Columbia': null,
    'New Haven': null,
    'Sterling Heights': null,
    'Olathe': null,
    'Miramar': null,
    'Thousand Oaks': null,
    'Frisco': null,
    'Cedar Rapids': null,
    'Topeka': null,
    'Visalia': null,
    'Waco': null,
    'Elizabeth': null,
    'Bellevue': null,
    'Gainesville': null,
    'Simi Valley': null,
    'Carrollton': null,
    'Coral Springs': null,
    'Stamford': null,
    'Hartford': null,
    'Concord': null,
    'Roseville': null,
    'Thornton': null,
    'Kent': null,
    'Lafayette': null,
    'Surprise': null,
    'Denton': null,
    'Victorville': null,
    'Evansville': null,
    'Midland': null,
    'Santa Clara': null,
    'Athens': null,
    'Allentown': null,
    'Abilene': null,
    'Beaumont': null,
    'Vallejo': null,
    'Independence': null,
    'Ann Arbor': null,
    'Provo': null,
    'Peoria': null,
    'Norman': null,
    'Berkeley': null,
    'El Monte': null,
    'Murfreesboro': null,
    'Lansing': null,
    'Columbia': null,
    'Downey': null,
    'Costa Mesa': null,
    'Inglewood': null,
    'Miami Gardens': null,
    'Manchester': null,
    'Elgin': null,
    'Wilmington': null,
    'Waterbury': null,
    'Fargo': null,
    'Arvada': null,
    'Carlsbad': null,
    'Westminster': null,
    'Rochester': null,
    'Gresham': null,
    'Clearwater': null,
    'Lowell': null,
    'West Jordan': null,
    'Pueblo': null,
    'San Buenaventura (Ventura)': null,
    'Fairfield': null,
    'West Covina': null,
    'Billings': null,
    'Murrieta': null,
    'High Point': null,
    'Round Rock': null,
    'Richmond': null,
    'Cambridge': null,
    'Norwalk': null,
    'Odessa': null,
    'Antioch': null,
    'Temecula': null,
    'Green Bay': null,
    'Everett': null,
    'Wichita Falls': null,
    'Burbank': null,
    'Palm Bay': null,
    'Centennial': null,
    'Daly City': null,
    'Richardson': null,
    'Pompano Beach': null,
    'Broken Arrow': null,
    'North Charleston': null,
    'West Palm Beach': null,
    'Boulder': null,
    'Rialto': null,
    'Santa Maria': null,
    'El Cajon': null,
    'Davenport': null,
    'Erie': null,
    'Las Cruces': null,
    'South Bend': null,
    'Flint': null,
    'Kenosha': null,
    'Sitka': null,
    'Juneau': null,
    'Wrangell': null,
    'Anaconda': null,
    'Butte': null,
    'Suffolk': null,
    'Buckeye': null,
    'Valdez': null,
    'Goodyear': null,
    'Hibbing': null,
    'Boulder City': null,
    'California City': null,
    'Sierra Vista': null,
    'Georgetown': null,
    'Carson City': null,
    'Bunnell': null,
    'Fernley': null,
    'Marana': null,
    'Yuma': null,
    'Hartsville': null,
    'Tampa': null,
    'Unalaska': null,
    'Eloy': null,
    'Jackson': null,
    'Casa Grande': null,
    'Babbitt': null,
    'Rio Rancho': null,
    'North Port': null,
    'St. Marys': null,
    'Nightmute': null,
    'Palm Springs': null,
    'Palm Coast': null,
    'Dothan': null,
    'Oak Ridge': null,
    'Edmond': null,
    'Lawton': null,
    'Jonesboro': null,
    'Ellsworth': null,
    'Caribou': null,
    'El Reno': null,
    'Port Arthur': null,
    'Presque Isle': null,
    },
      limit: 10,
      onAutocomplete: null,
      minLength: 3,
    });
}

// handleSubmit; get city and state
function handleSubmit() {
    $('#js-search-section').submit((e) => {
        e.preventDefault();
        clear();
        city = $('#js-city-entry').val();
        state = $('#js-state-entry').val();
        $('#js-city-entry').val('');
        $('#js-state-entry').val('');
        displayCityState(city, state);
        getRequestAir(city, state, renderAir);
        getRequestWeather(city, renderWeather);
        $('#js-result-section').fadeIn(3000);
    });
}

$(document).ready(() => {
    $('#js-result-section').prop('hidden', true);
    autocompleteCity();
    autocompleteState();
    handleSubmit();
});
