const log = console.log;

document.addEventListener('DOMContentLoaded', function() {
    log("DOM is loaded.");

    // Load div containers
    const locationContainerA = document.getElementById('locationContainerA');

    // URLs
    const locationApi = "http://192.168.5.2:8080/searchLocation?location=";

    // Persistent Storage
    var apiLocations = "";

    function loadLocationContainerA() {
        return new Promise((resolve, reject) => {
          fetch("locationContainerA.html")
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status}`);
              }
              return response.text();
            })
            .then(componentHtml => {
                locationContainerA.innerHTML = componentHtml;
              resolve(); // Resolve the promise once the component is loaded
            })
            .catch(error => {
              console.error(error);
              reject(error);
            });
        });
    }

    function loadLocationContainerB() {
        return new Promise((resolve, reject) => {
          fetch("locationContainerB.html")
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status}`);
              }
              return response.text();
            })
            .then(componentHtml => {
                locationContainerB.innerHTML = componentHtml;
              resolve(); // Resolve the promise once the component is loaded
            })
            .catch(error => {
              console.error(error);
              reject(error);
            });
        });
    }

    function fetchApiLocations(location) {
        return new Promise((resolve, reject) => {
          fetch(locationApi + encodeURI(location))
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to load locations: ${response.status}`);
              }
              return response.text();
            })
            .then(componentHtml => {
                apiLocations = componentHtml;
              resolve(); // Resolve the promise once the component is loaded
            })
            .catch(error => {
              console.error(error);
              reject(error);
            });
        });
    }
          
    async function main() {
        await loadLocationContainerA(); // Wait for the component to finish loading

        const locationContainerA_textbox = document.getElementById('locationContainerA-textbox');
        var userLocation = "";
 
        document.getElementById('locationContainerA-search').addEventListener("click", async function(event) {
            log("검색중");

            // Hide locationContainerA
            //locationContainerA.style.opacity = '0';
            //setTimeout(function() { locationContainerA.innerHTML = ""; }, 500);
            locationContainerA.innerHTML = "";

            userLocation = locationContainerA_textbox.value;

            await fetchApiLocations(userLocation);
            apiLocations = JSON.parse(apiLocations);
            log(apiLocations);
            const locationCount = apiLocations["count"];
            log(locationCount)

            await loadLocationContainerB();

            const locationContainerB_form = document.getElementById('locationContainerB-form');

            for (let i = 0; i < locationCount; i++) {
                log('called');
                const newHtml = `<div class="locationContainerB-option">
                    <input type="radio" name="radioLocation" value="a">
                    <span>${apiLocations[i]["name"]}</span>
                </div>
                `
                log(newHtml)
                locationContainerB_form.insertAdjacentHTML('beforeend', newHtml);
            }
        });

        
    }

    main();
});
