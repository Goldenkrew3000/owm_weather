//

const log = console.log;

export function loadContainer(componentFile) {
    log(`Loading component ${componentFile}`);

    return new Promise((resolve, reject) => {
        fetch(componentFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load component: ${response.status}`);
                }
                return response.text();
            })
            .then(componentHtml => {
                resolve(componentHtml);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
}

export function loadAPI(url) {
    log(`Loading API ${url}`)

    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load api: ${response.status}`);
                }
                return response.text();
            })
            .then(componentHtml => {
                resolve(componentHtml);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
}
