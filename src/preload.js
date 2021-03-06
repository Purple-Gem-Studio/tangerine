const Spork = require('./spork');
const { uninstallSpork, uninstallTangerine } = require('./uninstall');

function getPort() {
    const urlParams = getURLParams();

    return urlParams.get('port');
}

function getPublicKey() {
    const port = getPort();

    const publicKey = Spork.publicKeys[port];

    return typeof publicKey === 'string' ?
        publicKey :
        null;
}

function getURLParams() {
    const queryString = window.location.search;
    return new URLSearchParams(queryString);
}

function shouldDisconnect() {
    return getURLParams().get('disconnect') === 1;
}

function shouldStop() {
    return getURLParams().get('stop') === 1;
}

const port = getPort();
const publicKey = getPublicKey();
const url = window.location.toString();

// HACK: Find a better way to determine which page they're currently on
if (url.includes('assets/pages/host/index.html')) {
    if (shouldStop()) {
        Spork.unbind(port);
    }
} else if (url.includes('assets/pages/hosting/index.html')) {
    // Reverse-proxy bind the port
    Spork.bind(port);

    console.log(window.publicKey);

    window.onload = function () {
        // Update the port display text
        const portElement = document.getElementById('port');    
        portElement.innerText = "Port: " + getPort();

        // Get the public key and update the display text to reflect it
        const publicKeyElement = document.getElementById('publicKey');

        var intervalId = window.setInterval(() => {
            const publicKey = getPublicKey();

            // If the public key has been obtained, update the public key
            if (publicKey !== null) {
                publicKeyElement.innerText = "Public key: " + publicKey;

                window.clearInterval(intervalId);
            }
        }, 1000);
    }
} else if (url.includes('assets/pages/join/index.html')) {
    if (shouldDisconnect()) {
        Spork.unbind(port);
    }
} else if (url.includes('assets/pages/joining/index.html')) {
    window.onload = function () {
        // Update the port and public-key display text
        const portElement = document.getElementById('port');
        const publicKeyElement = document.getElementById('publicKey');

        const urlParams = getURLParams();
        const pubkey = urlParams.get('pubkey');

        portElement.innerText = "Port: " + getPort();
        publicKeyElement.innerText = "Public key: " + pubkey;

        // Forward-proxy bind the port
        Spork.bind(port, pubkey);

        var intervalId = window.setInterval(() => {
            const publicKey = getPublicKey();
            
            if (publicKey !== null) {
                window.clearInterval(intervalId);
            }
        }, 1000);
    }
} else if (url.includes('assets/pages/uninstall_spork/index.html')) {
    uninstallSpork();
} else if (url.includes('assets/pages/uninstall_tangerine/index.html')) {
    uninstallTangerine();
}
