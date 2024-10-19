let fullTranscript = '';
let pendingWrite = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "appendTranscript") {
        fullTranscript += (fullTranscript ? ' ' : '') + request.text;
        console.log('New transcribed text:', request.text);
        console.log('Full transcript length:', fullTranscript.length);
        saveTranscript();
    } else if (request.action === "writeTranscript") {
        pendingWrite = true;
        if (fullTranscript.length > 0) {
            writeTranscriptToFile();
        } else {
            console.log('No content to write yet. Will write when content is available.');
        }
    }
});

function saveTranscript() {
    chrome.storage.local.set({transcript: fullTranscript}, function() {
        console.log('Transcript saved to storage.');
        if (fullTranscript.length <= 100) {
            console.log('Full transcript:', fullTranscript);
        } else {
            console.log('First 50 characters:', fullTranscript.slice(0, 50) + '...');
            console.log('Last 50 characters:', '...' + fullTranscript.slice(-50));
        }
        
        // Check if there's a pending write request after saving
        if (pendingWrite && fullTranscript.length > 0) {
            writeTranscriptToFile();
        }
    });
}

function writeTranscriptToFile() {
    if (fullTranscript.length === 0) {
        console.warn('Transcript is empty. No file will be created.');
        pendingWrite = false;
        return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `transcript_${timestamp}.txt`;
    
    const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(fullTranscript);

    chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: false
    }, function(downloadId) {
        if (chrome.runtime.lastError) {
            console.error('Error writing file:', chrome.runtime.lastError);
        } else {
            console.log('Transcript written to file:', filename);
            console.log('Transcript content:', fullTranscript);
        }
        // Reset after saving
        fullTranscript = '';
        pendingWrite = false;
    });
}