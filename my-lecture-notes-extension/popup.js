let isRecording = false;

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startRecording');
    const stopButton = document.getElementById('stopRecording');
    const statusText = document.getElementById('status');
    const statusIndicator = document.getElementById('status-indicator');

    // Initialize button states
    chrome.storage.local.get('isRecording', function(data) {
        isRecording = data.isRecording || false;
        updateButtonStates();
    });

    startButton.addEventListener('click', function() {
        isRecording = true;
        chrome.storage.local.set({isRecording: true});
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "startRecording"});
        });
        updateButtonStates();
    });

    stopButton.addEventListener('click', function() {
        isRecording = false;
        chrome.storage.local.set({isRecording: false});
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "stopRecording"});
        });
        updateButtonStates();
    });

    function updateButtonStates() {
        startButton.disabled = isRecording;
        stopButton.disabled = !isRecording;
        statusText.textContent = isRecording ? 'Recording' : 'Not recording';
        statusIndicator.style.backgroundColor = isRecording ? '#FF0000' : '#808080';
    }
});