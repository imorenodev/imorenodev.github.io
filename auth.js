import { initFirebaseAuth, googleLogin, logout } from './firebase-auth.js';

function setView(showView) {
const views = [ '.signed-in', '#signed-out', '#no-config' ]
views.forEach(view => {
    if (view === showView) {
    $(view).show();
    } else {
    $(view).hide();
    }
})
}

const initAuth = (settings) => {
    try {
        initFirebaseAuth({
        ...settings,
        loggedIn: (user, token) => {
            setView('.signed-in');
        },
        loggedOut: () => {
            setView('#signed-out');
        }
        });
    } catch (err)  {
        console.error(err);
        $('#error').text(err.message).show();
    }
}

// helper to support parsing of config from firebase console such as { apiKey: ".." }
const looseJsonParse = (jsonLikeString) => {
    return Function('"use strict";return (' + jsonLikeString + ')')();
}

const configure = () => {
    fetch('firebase-config.json')
    .then(response => response.json())
    .then(settings => {
        localStorage.setItem('settings', JSON.stringify(settings));
        initAuth(settings);
    })
    .catch(error => console.error('Error loading settings:', error));
};

setView('#no-config');
try {
    let settingsFromLS = localStorage.getItem('settings');
    if (!settingsFromLS) {
        configure();
        settingsFromLS = localStorage.getItem('settings');
    }
    let settings = JSON.parse(settingsFromLS);
    if (settings && settings.projectId)
        initAuth(settings);
} catch (error) {
    console.log(err);
}


$('#login').click(() => {
    googleLogin();
});
$('#logout').click(() => {
    logout();
    $('#navbarSupportedContent15').collapse('hide');
});
$('#configure').click(() => configure());
$('#clear-settings').click(() => {
    localStorage.clear();
    location.reload();
});

// Open the logout modal when user clicks the username
$('#user-name').on('click', function() {
    $('#logout-modal').modal('show');
});

// Handle logout button click
$('#logout-button').on('click', function() {
    // Perform logout actions here
    logout();
    // For demonstration purposes, we'll just close the modal
    $('#logout-modal').modal('hide');
});