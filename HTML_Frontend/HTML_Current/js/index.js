//

//
import './vars.js';
import { loadContainer, loadAPI } from './functions.js';
import { URL_LocationApi, URL_WeatherCurrentApi } from './vars.js';
const log = console.log;

//
var current_main = "";
var current_description = "";
var current_temp = "";
var current_temp_feelslike = "";
var current_pressure = "";
var current_humidity = "";
var current_visibility = "";
var current_wind_speed = "";
var current_wind_deg = "";
var current_wind_gust = "";
var current_clouds = "";
var current_rain_1h = "";
var current_rain_3h = "";
var current_snow_1h = "";
var current_snow_3h = "";
var current_calctime = "";
var current_sunrise = "";
var current_sunset = "";

document.addEventListener('DOMContentLoaded', function () {
    // DOM is loaded
    log("DOM is loaded.");

    async function runWebsite() {
        // Make objects from the main div's in the root container
        const container_locationContainerA = document.getElementById('locationContainerA');
        const container_locationContainerB = document.getElementById('locationContainerB');
        
        // Load locationContainerA
        const data_locationContainerA = await loadContainer("locationContainerA.html");
        container_locationContainerA.innerHTML = data_locationContainerA;

        // Make object from locationContainerA textbox (User Location)
        const object_locationContainerA_textbox = document.getElementById('locationContainerA-textbox');

        document.getElementById('locationContainerA-search').addEventListener("click", async function (event) {
            // Search button pressed
            log("검색버튼을 사용해.");

            /* Example code to fade an entire div
            //locationContainerA.style.opacity = '0';
            //setTimeout(function() { locationContainerA.innerHTML = ""; }, 500);
            */

            // Get location from textbox
            const user_Location = object_locationContainerA_textbox.value;

            // Delete locationContainerA
            container_locationContainerA.innerHTML = "";

            // Form Location API URL, and perform HTTP GET
            const URL_FormedLocation = URL_LocationApi + encodeURI(user_Location);
            const RES_LocationApi = await loadAPI(URL_FormedLocation);

            // Parse Location API response, and check if it failed to find a location
            const JSON_LocationApi = JSON.parse(RES_LocationApi);
            if (JSON_LocationApi["code"] == 400) {
                // Location API Failed
                log("Location API Failed. Code 400");
            }

            // Beyond here, the Location API found locations
            const LocationApi_Count = JSON_LocationApi["count"];

            // Load locationContainerB
            const data_locationContainerB = await loadContainer("locationContainerB.html");
            container_locationContainerB.innerHTML = data_locationContainerB;

            // Make object from locationContainerB form (The location list)
            const object_locationContainerB_form = document.getElementById('locationContainerB-form');

            // Make and apply the dynamic list of locations
            var locationContainerB_DynamicList = "";
            for (let i = 0; i < LocationApi_Count; i++) {
                locationContainerB_DynamicList = locationContainerB_DynamicList +
                `<div class="locationContainerB-option">
                    <input type="radio" name="radioLocation" value=${i}>
                    <span>${JSON_LocationApi[i]["name"]}</span>
                </div>
                `;
            }
            object_locationContainerB_form.insertAdjacentHTML('afterbegin', locationContainerB_DynamicList);

            document.getElementById('locationContainerB-button').addEventListener("click", async function (event) {
                // OK button pressed
                log("확인버튼 사용해.");

                // Get the index of which location was selected
                var locationRadioList = document.querySelector('input[name="radioLocation"]:checked');
                if (locationRadioList) {
                    var selectedLocation = locationRadioList.value;

                    // Delete locationContainerB
                    container_locationContainerB.innerHTML = "";

                    // Done initial setup, move to a separate function for the main page
                    runMainPage(selectedLocation);
                } else {
                    // No location selected
                }
            });
        });
    }

    // Run main function
    runWebsite();
});

async function runMainPage(index) {
    // Finished initial setup
    
    // Load weatherContainer
    const container_weatherContainer = document.getElementById('weatherContainer');
    const data_weatherContainer = await loadContainer("weatherContainer.html");
    container_weatherContainer.innerHTML = data_weatherContainer;

    //
    const URL_FormedWeatherCurrent = URL_WeatherCurrentApi + index;
    const RES_WeatherCurrent = await loadAPI(URL_FormedWeatherCurrent);

    //
    const JSON_WeatherCurrent = JSON.parse(RES_WeatherCurrent);

    //
    current_main = JSON_WeatherCurrent[0]["main"];
    current_description = JSON_WeatherCurrent[0]["description"];
    current_temp = JSON_WeatherCurrent[0]["temp"];
    current_temp_feelslike = JSON_WeatherCurrent[0]["temp_feelslike"];
    current_pressure = JSON_WeatherCurrent[0]["pressure"];
    current_humidity = JSON_WeatherCurrent[0]["humidity"];
    current_visibility = JSON_WeatherCurrent[0]["visibility"];
    current_wind_speed = JSON_WeatherCurrent[0]["wind_speed"];
    current_wind_deg = JSON_WeatherCurrent[0]["wind_deg"];
    current_wind_gust = JSON_WeatherCurrent[0]["wind_gust"];
    current_clouds = JSON_WeatherCurrent[0]["clouds"];
    current_rain_1h = JSON_WeatherCurrent[0]["rain_1h"];
    current_rain_3h = JSON_WeatherCurrent[0]["rain_3h"];
    current_snow_1h = JSON_WeatherCurrent[0]["snow_1h"];
    current_snow_3h = JSON_WeatherCurrent[0]["snow_3h"];
    current_calctime = JSON_WeatherCurrent[0]["calctime"];
    current_sunrise = JSON_WeatherCurrent[0]["sunrise"];
    current_sunset = JSON_WeatherCurrent[0]["sunset"];

    //
    log(`Current Weather Debug:
    main: ${current_main}
    description: ${current_description}
    temp: ${current_temp}
    temp_feelslike: ${current_temp_feelslike}
    pressure: ${current_pressure}
    humidity: ${current_humidity}
    visibility: ${current_visibility}
    wind_speed: ${current_wind_speed}
    wind_deg: ${current_wind_deg}
    wind_gust: ${current_wind_gust}
    clouds: ${current_clouds}
    rain_1h: ${current_rain_1h}
    rain_3h: ${current_rain_3h}
    snow_1h: ${current_snow_1h}
    snow_3h: ${current_snow_3h}
    calctime: ${current_calctime}
    sunrise: ${current_sunrise}
    sunset: ${current_sunset}
    `)

    //



    log("done");
}
