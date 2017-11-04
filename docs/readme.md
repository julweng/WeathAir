# WeathAir [Thinkful](https://www.thinkful.com/) first capstone project - a responsive air and weather forecast app.

## Introduction  
WeathAir allows users to look up current air quality and 5-day weather conditions in the queried US city.  
![Screenshot: search field](/WeathAir_screenshot1?raw=true "search field screenshot")  
![Screenshot: result](/WeathAir_screenshot2?raw=true "example of search result")  

## Use Case  
This web application is designed for users to enter a US city and state to look up the current air quality and weather conditions, helping them plan for their outdoor activities. While some existing applications provide detailed measurements, the information may be too extensive, too confusing to navigate, or the significance of the given information may not be explained in a user-friendly way. This app organizes the data in easily understandable format and extracts the most important information, such as precipitation, wind direction, and wind speed, to help runners, joggers, and cyclists determine if it is a good day to workout outside.  

## Technology and data
This web application is responsive, adapting for mobile, table and desktop viewports, and is built with:  
1. HTML, CSS, JavaScript, and jQuery  
2. [Materialize CSS](http://materializecss.com/) was utilized for framework on tabs, card, responsive grids and autocomplete function with some customizations on styles and features.  
3. The rainy SVG on the header is implemented from [amCharts](https://www.amcharts.com/free-animated-svg-weather-icons/).  
4. The sentiment icons reflecting the air quality index is implemented from [Material Icons](https://material.io/icons/).
5. Explanation for the significance of the detected air quality index is adapted from [AirNow](https://www.airnow.gov/).
6. Data are fetched from [Airvisual](https://airvisual.com/) and [Weatherbit](https://www.weatherbit.io/) through [Airvisual community API](https://airvisual.com/api) and [Weatherbit free API](https://www.weatherbit.io/api).
7. Lists of US cities and states were imported from [Wikipedia](https://www.wikipedia.org/), made into .csv file, and built into JSON format in R, such that they can be used as a list of citie and state matches for the autocomplete feature in the search field.  
