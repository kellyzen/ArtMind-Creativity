let giveUpClicked = false;
window.addEventListener('beforeunload', function (e) {
    if (!giveUpClicked) {
        const confirmationMessage = 'Your changes may not be saved. Are you sure you want to leave?';
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }

});