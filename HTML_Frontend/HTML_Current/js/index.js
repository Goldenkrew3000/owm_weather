//

//
import './vars.js';
import { loadContainer, loadAPI } from './functions.js';
import { URL_LocationApi } from './vars.js';
const log = console.log;

document.addEventListener('DOMContentLoaded', function () {
    // DOM is loaded
    log("DOM is loaded.");

    async function runWebsite() {
        //
        const container_locationContainerA = document.getElementById('locationContainerA');
        const container_locationContainerB = document.getElementById('locationContainerB');
        const container_weatherContainer = document.getElementById('weatherContainer');
        
        //
        const data_locationContainerA = await loadContainer("locationContainerA.html");
        container_locationContainerA.innerHTML = data_locationContainerA;

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

            //
            var URL_FormedLocation = URL_LocationApi + encodeURI(user_Location);
            const RES_LocationApi = await loadAPI(URL_FormedLocation);

            const JSON_LocationApi = JSON.parse(RES_LocationApi);
            if (JSON_LocationApi["code"] == 400) {
                // Location API Failed
                log("Location API Failed. Code 400");
            }

            // Beyond here, the Location API found locations
            const LocationApi_Count = JSON_LocationApi["count"];

            //
            const data_locationContainerB = await loadContainer("locationContainerB.html");
            container_locationContainerB.innerHTML = data_locationContainerB;

            //
            const object_locationContainerB_form = document.getElementById('locationContainerB-form');

            var locationListHtml = "";

            for (let i = 0; i < locationCount; i++) {
                locationListHtml = locationListHtml + `<div class="locationContainerB-option">
                    <input type="radio" name="radioLocation" value=${i}>
                    <span>${apiLocations[i]["name"]}</span>
                </div>
                `
            }
            locationContainerB_form.insertAdjacentHTML('afterbegin', locationListHtml);

            document.getElementById('locationContainerB-button').addEventListener("click", async function (event) {
                var selectedOption = document.querySelector('input[name="radioLocation"]:checked');
                if (selectedOption) {
                    var selectedValue = selectedOption.value;
                    console.log(selectedValue);
                    locationContainerB.innerHTML = "";
                    runMain(selectedValue);
                } else {
                    console.log("No option selected.");
                }
            });
        });


    }

    // Run main function
    runWebsite();
});



async function runMain(index) {
    log("Running main.");
    // Load weather component
    await loadWeatherComponent();

    // Load weather current
    await fetchWeatherCurrent(index);
    weatherCurrentRes = JSON.prse(weatherCurrentRes);
    var current_main = weatherCurrentRes["main"];
    var current_desc = weatherCurrentRes["description"];
}

var weatherCurrentRes = "";
var weatherCurrentUrl = "http://192.168.5.2:12000/weatherCurrent?index=";
function fetchWeatherCurrent(index) {
    return new Promise((resolve, reject) => {
        fetch(weatherCurrentUrl + index)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load weather current: ${response.status}`);
                }
                return response.text();
            })
            .then(componentHtml => {
                weatherCurrentRes = componentHtml;
                resolve(); // Resolve the promise once the component is loaded
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
}

function loadWeatherComponent() {
    return new Promise((resolve, reject) => {
        fetch("weather.html")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load component: ${response.status}`);
                }
                return response.text();
            })
            .then(componentHtml => {
                weatherContainer.innerHTML = componentHtml;
                resolve(); // Resolve the promise once the component is loaded
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
}
