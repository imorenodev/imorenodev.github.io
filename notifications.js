const TYPES = {
    'info': 'info',
    'success': 'success',
    'warning':'warning',
    'error':'error' 
};

const CONTENT = {
   'wrongGuess': 'Incomplete! Try Again.',
   'pointsLost': 'points.',
};

const POSITION = {
    'tr': 'top-right', 
    'tl': 'top-left', 
    'br': 'bottom-right', 
    'bl': 'bottom-left'
};

const TWO_SECONDS = 2000;

const setToastDefaults = () => {
    $.toastDefaults.dismissible = true;
    $.toastDefaults.stackable = true;
    $.toastDefaults.pauseDelayOnHover = true;
};

export function showWrongGuess() {
    setToastDefaults();
    $.snack(TYPES.warning, "Incomplete! Try Again.", TWO_SECONDS, POSITION.br, "toast-container-info");
}

export function showPointsLost(points) {
    setToastDefaults();
    $.snack(TYPES.error, `-${points} ${CONTENT.pointsLost}`, TWO_SECONDS, POSITION.tl, "toast-container-score");
}