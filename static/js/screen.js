// This magical script can prevent the screen from sleeping so you can cook in peace.

/*
<span class="cooking-mode">
    <label class="switch">
        <input type="checkbox" id="wakeLockCheckbox">
        <span class="slider"></span>
    </label>
    <span>Cooking mode</span>
</span>
<div id="statusDiv"></div>
*/
try {
    const recipeDiv = document.querySelector('div.recipe');
    const cookingModeSpan = document.createElement('span');
    cookingModeSpan.classList.add('cooking-mode');
        const cookingModeLabel = document.createElement('label');
        cookingModeLabel.classList.add('switch');
            const cookingModeInput = document.createElement('input');
            cookingModeInput.setAttribute('type', 'checkbox');
            cookingModeInput.setAttribute('id', 'wakeLockCheckbox');
            const cookingModeSlider = document.createElement('span');
            cookingModeSlider.classList.add('m-2');
        const cookingModeText = document.createElement('span');
            cookingModeText.textContent = 'Cooking mode';
        const cookingModeStatus = document.createElement('div');
        cookingModeStatus.setAttribute('id', 'statusDiv');
    
    cookingModeLabel.appendChild(cookingModeInput);
    cookingModeLabel.appendChild(cookingModeSlider);
    cookingModeSpan.appendChild(cookingModeLabel);
    cookingModeSpan.appendChild(cookingModeText);
    recipeDiv.prepend(cookingModeStatus);
    recipeDiv.prepend(cookingModeSpan);

    const wakeLockCheckbox = document.querySelector('#wakeLockCheckbox');
    const statusDiv = document.querySelector('#statusDiv');

    if ('WakeLock' in window && 'request' in window.WakeLock) {  
        let wakeLock = null;
        
        const requestWakeLock = () => {
            const controller = new AbortController();
            const signal = controller.signal;
            window.WakeLock.request('screen', {signal})
            .catch((e) => {      
                if (e.name === 'AbortError') {
                    wakeLockCheckbox.checked = false;
                    statusDiv.textContent = 'Wake Lock was aborted';
                    console.log('Wake Lock was aborted');
                } else {
                    statusDiv.textContent = `${e.name}, ${e.message}`;
                    console.error(`${e.name}, ${e.message}`);
                }
            });
            wakeLockCheckbox.checked = true;
            statusDiv.textContent = 'Wake Lock is active';
            console.log('Wake Lock is active');
            return controller;
        };
        
        wakeLockCheckbox.addEventListener('change', () => {
            console.log(wakeLockCheckbox.checked);
            if (wakeLockCheckbox.checked) {
                wakeLock = requestWakeLock();
            } else {
                wakeLock.abort();
                wakeLock = null;
            }
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        const handleVisibilityChange = () => {    
            if (wakeLock !== null && document.visibilityState === 'visible') {
                wakeLock = requestWakeLock();
            }
        };
    } else if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {  
    let wakeLock = null;
    
    const requestWakeLock = async () => {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', (e) => {
                console.log(e);
                wakeLockCheckbox.checked = false;
                statusDiv.textContent = 'Screen sleep restored';
                console.log('Wake Lock was released');                    
            });
            wakeLockCheckbox.checked = true;
            statusDiv.textContent = 'Your screen will not sleep';
            console.log('Wake Lock is active');      
        } catch (e) {      
            wakeLockCheckbox.checked = false;
            statusDiv.textContent = `${e.name}, ${e.message}`;
            console.error(`${e.name}, ${e.message}`);
        } 
    };

    // release if exists, we don't want it to persist
    navigator.wakeLock.request('screen').then((wakeLock) => {
        if (wakeLock !== null) {
            wakeLock.release();
            wakeLock = null;
        }
    });
    
    wakeLockCheckbox.addEventListener('change', () => {
        if (wakeLockCheckbox.checked) {
            requestWakeLock();
        } else {
            wakeLock.release();
            wakeLock = null;
        }
    });
    } else {  
        statusDiv.textContent = 'Wake Lock API not supported.';
        console.error('Wake Lock API not supported.');
    }
} catch (e) {
    console.log('Not a recipe page');
    // release wakeLock if exists
    const wakeLock = navigator.wakeLock.request('screen').then((wakeLock) => {
        if (wakeLock !== null) {
            wakeLock.release();
            wakeLock = null;
            console.log('Wake Lock was released');
        }
    });
}