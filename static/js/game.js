let count = 0;
let perClick = 1;
let upgradeCost = 25;
let level = 1;

// Level and upgrade display
const levelDisplay = document.getElementById('level');
const upgradeCostDisplay = document.getElementById('upgrade-cost');
const countDisplay = document.getElementById('count');

// Buttons
const upgradeButton = document.getElementById('upgrade-button');
const clickButton = document.getElementById('click-button');
// const resetButton = document.getElementById('reset-button');

// Execute on page load
window.onload = () => {
    // Display upgrade cost and level on load 
    upgradeCostDisplay.innerHTML = upgradeCost;
    levelDisplay.innerHTML = level;

    // Load local storage and update display
    if (localStorage.length == 4) {
        count = parseInt(localStorage.getItem('count'));
        perClick = parseInt(localStorage.getItem('perClick'));
        level = parseInt(localStorage.getItem('level'));
        upgradeCost = parseInt(localStorage.getItem('upgradeCost'));

        countDisplay.innerHTML = count;
        levelDisplay.innerHTML = level;
        upgradeCostDisplay.innerHTML = upgradeCost;
    } else {
        countDisplay.innerHTML = count;
        levelDisplay.innerHTML = level;
        upgradeCostDisplay.innerHTML = upgradeCost;
    }
};

// Save everything in local storage when the user closes the page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('count', count);
    localStorage.setItem('perClick', perClick);
    localStorage.setItem('level', level);
    localStorage.setItem('upgradeCost', upgradeCost);
});

// Upgrade/Level up
upgradeButton.addEventListener("click", () => {
    if (count >= upgradeCost) {
        // Level up
        level++;
        levelDisplay.innerHTML = level;

        // Double amount gained per click
        perClick = perClick * 2;

        // Update displayed count
        count = count - upgradeCost;
        countDisplay.innerHTML = count;

        // Increase upgrade cost by 2.5 and update display
        upgradeCost = Math.round(upgradeCost * 2.5);
        upgradeCostDisplay.innerHTML = upgradeCost;
    } else {
        alert(`Get your cookies up!\nCookies needed: ${upgradeCost - count}`);
        return;
    }
});

// Cookies!!!
clickButton.addEventListener("click", () => {
    count += perClick;
    countDisplay.innerHTML = count;
});

// Reset
/*resetButton.addEventListener("click", () => {
    count = 0;
    document.getElementById('count').innerHTML = count;
});*/