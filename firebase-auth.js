let Games = [];

function initFirebaseAuth(config) {
  if (!config.projectId) throw Error('Missing projectId');
  if (!config.apiKey) throw Error('Missing apiKey');
  if (!config.authDomain) throw Error('Missing authDomain');

  const firebaseConfig = {
    apiKey: config.apiKey,
    projectId: config.projectId,
    authDomain: config.authDomain
  }
  firebase.initializeApp(firebaseConfig);

  firebase.auth().onAuthStateChanged(async function(user) {
    if (!user && config.loggedOut) {
      config.loggedOut();
      return;
    }
    if (!config.loggedIn) return;
    const token = await user.getIdToken();
    const userName = user.displayName;
    if (userName) {
      $('#user-name').text(userName);
    }

    readUserData();
    config.loggedIn(user, token);
  });
}

function logout() {
  firebase.auth().signOut();
}

function handleAuthError(error, onError) {
  if (error.code === "auth/unauthorized-domain") {
      const authDomain = firebase.auth().app.options.authDomain;
      const projectName = authDomain.replace('.firebaseapp.com', '');
      onError(new Error(`Looks like your domain isn't valid for this project. Please check your Firebase Auth domain configuration. https://console.firebase.google.com/u/0/project/${projectName}/authentication/providers`));
  } else {
    onError(error)
  }
}

function googleLogin(onError) {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
  .then((result) => {
  /** @type {firebase.auth.OAuthCredential} */
  var credential = result.credential;

  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  // IdP data available in result.additionalUserInfo.profile.
    // ...
  }).then(() => {}, (error) => handleAuthError(error, onError));
}

function readUserData() {
  firebase.database().ref('players/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
    try {
      let player = snapshot.val().metadata;
      console.log('Player retrieved:', player);
    } catch(error) {
      saveUserMetadata({
          email: firebase.auth().currentUser.email,
          username: firebase.auth().currentUser.displayName
      });
      return;
    }
    if (snapshot.val().games) {
      Games = snapshot.val().games;
    }
    console.log('Games retrieved:', Games);
  }).catch(function(error) {
    console.error('Error retrieving games:', error);
  });
}

function saveUserMetadata(metadata) {
  firebase.database().ref('players/' + firebase.auth().currentUser.uid + '/metadata').set(
    metadata
  ).catch(function(error) {
    console.error('Error saving games:', error);
  });
}

function saveUserGames(games) {
  firebase.database().ref('players/' + firebase.auth().currentUser.uid + '/games').set(
    games
  ).catch(function(error) {
    console.error('Error saving games:', error);
  });
}

export {
  initFirebaseAuth,
  googleLogin,
  logout,
  readUserData,
  saveUserGames,
  Games
}
