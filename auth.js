import { initFirebaseAuth, googleLogin, logout } from './firebase-auth.js';

function setView(showView) {
const views = [ '#signed-in', '#signed-out', '#no-config' ]
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
            setView('#signed-in');
        },
        loggedOut: () => {
            setView('#signed-out');
        }
        });
    } catch (err)  {
        console.err(err);
        $('#error').text(err.message).show();
    }
}

// helper to support parsing of config from firebase console such as { apiKey: ".." }
const looseJsonParse = (jsonLikeString) => {
    return Function('"use strict";return (' + jsonLikeString + ')')();
}

setView('#no-config');
try {
    const settings = JSON.parse(localStorage.getItem('settings'))
    if (settings && settings.projectId)
        initAuth(settings);
} catch (err) {
    console.log(err);
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