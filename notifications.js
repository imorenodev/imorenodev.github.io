const TYPES = {
    'info': 'info',
    'success': 'success',
    'warning':'warning',
    'error':'error' 
};

const CONTENT = {
   'incorrect': 'Incomplete! Try Again.',
   'correct': 'TOUCHDOWN!!',
   'points': 'points.',
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
    $.snack(TYPES.warning, CONTENT.incorrect, TWO_SECONDS);
}

export function showPointsLost(points) {
    setToastDefaults();
    $.snack(TYPES.error, `-${points} ${CONTENT.points}`, TWO_SECONDS);
}

export function showCorrectGuess() {
    setToastDefaults();
    $.snack(TYPES.success, CONTENT.correct, TWO_SECONDS);
}

export function showPointsGained(points) {
    setToastDefaults();
    $.snack(TYPES.info, `+${points} ${CONTENT.points}`, TWO_SECONDS);
}