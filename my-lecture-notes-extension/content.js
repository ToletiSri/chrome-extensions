let recognition = null;
let isRecording = false;
let finalTranscript = '';

function startRecording() {
    if (isRecording) {
        console.log('Already recording');
        return;
    }
    
    if (!recognition) {
        try {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = true;
            recognition.interimResults = false;  // We only care about final results

            recognition.onstart = function() {
                console.log('Speech recognition started');
                finalTranscript = '';
            };

            recognition.onresult = function(event) {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    finalTranscript += event.results[i][0].transcript;
                }
                
                console.log('Final transcript:', finalTranscript);

                // Send final transcript to background
                chrome.runtime.sendMessage({action: "appendTranscript", text: finalTranscript});
                finalTranscript = ''; // Reset final transcript after sending
            };

            recognition.onerror = function(event) {
                console.error('Speech recognition error', event.error);
            };

            recognition.onend = function() {
                console.log('Speech recognition ended');
                if (isRecording) {
                    console.log('Restarting speech recognition');
                    recognition.start();
                }
            };

        } catch (e) {
            console.error('Error initializing speech recognition:', e);
            return;
        }
    }

    try {
        recognition.start();
        isRecording = true;
        console.log('Recording started');
    } catch (e) {
        console.error('Error starting speech recognition:', e);
    }
}

function stopRecording() {
    if (!isRecording) {
        console.log('Not recording');
        return;
    }
    
    if (recognition) {
        recognition.stop();
    }
    isRecording = false;
    console.log('Recording stopped, sending writeTranscript message');
    
    // Send any remaining final transcript
    if (finalTranscript) {
        chrome.runtime.sendMessage({action: "appendTranscript", text: finalTranscript});
    }
    
    chrome.runtime.sendMessage({action: "writeTranscript"});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Message received in content script:', request.action);
    if (request.action === "startRecording") {
        startRecording();
    } else if (request.action === "stopRecording") {
        stopRecording();
    }
});

console.log('Content script loaded');