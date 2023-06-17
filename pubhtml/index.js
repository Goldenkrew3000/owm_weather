const log = console.log;

document.addEventListener('DOMContentLoaded', function() {
    log("DOM is loaded");

    const formContainer = document.getElementById('formContainer');
    const container = document.getElementById('container');
    const containerSelect = document.getElementById('containerSelect');
    const externalComponent = document.getElementById('externalComponent');

    // Import external component
    fetch("component.html")
        .then(response => response.text())
        .then(data => {
            log(data)
            externalComponent.innerHTML = data;
        })
        .catch(error => log(error))

    document.getElementById("wipeButton").addEventListener("click", function(event) {
        log("Wipe button pressed");
        formContainer.innerHTML = "";
    })

    document.getElementById("locationForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Stops the submit button refreshing the page
        log("Form submit pressed");

        //containerSelect.style.opacity = '0';

        container.innerHTML = "";

        const formData = new FormData(this);
        const location = formData.get("location");
        log(`Location: ${location}`);

        this.reset();

        const loadingElement = document.createElement('p');
        loadingElement.textContent = '준비중...';
        container.appendChild(loadingElement);

        const url = "http://192.168.5.120:8080/searchLocation?location=" + encodeURI(location);
        log(url);
        const httpGet = new XMLHttpRequest();
        httpGet.open('GET', url, true);
        var data = "";
        httpGet.onload = function() {
            if (httpGet.status == 200) {
                log("Got data");
                data = JSON.parse(httpGet.responseText);
                log(data);

                for (let i = 0; i < data["count"]; i++) {
                    var locationString = "Location found: " + data[i]["name"] + " ///// " + data[i]["lat"] + " ///// " + data[i]["lon"];
                    log(locationString);
                    var locationElement = document.createElement('p');
                    locationElement.textContent = locationString;
                    container.appendChild(locationElement)
                }
            } else {
                log("Error");
            }
        };
        httpGet.send(null);
    });
});


