const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const mainSection = document.querySelector('.main-controls');

stop.disabled = true;

if (navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');

    const constraints = { audio: true };
    let chunks = [];

    let onSuccess = function(stream) {
        const mediaRecorder = new MediaRecorder(stream);

        record.onclick = function() {
            mediaRecorder.start();
            console.log(mediaRecorder.state);
            console.log("recorder started");
            record.style.background = "red";
            stop.disabled = false;
            record.disabled = true;
        }

        stop.onclick = function() {
            mediaRecorder.stop();
            console.log(mediaRecorder.state);
            console.log("recorder stopped");
            record.style.background = "";
            record.style.color = "";
            // mediaRecorder.requestData();

            stop.disabled = true;
            record.disabled = false;
        }

        mediaRecorder.onstop = function(e) {
            console.log("data available after MediaRecorder.stop() called.");

            const clipContainer = document.createElement('article');
            const clipLabel = document.createElement('p');
            const audio = document.createElement('audio');
            //const deleteButton = document.createElement('button');

            clipContainer.classList.add('clip');
            audio.setAttribute('controls', '');
            //deleteButton.textContent = 'Delete';
            //deleteButton.className = 'delete';

            clipContainer.appendChild(audio);
            clipContainer.appendChild(clipLabel);
            //clipContainer.appendChild(deleteButton);
            soundClips.appendChild(clipContainer);

            audio.controls = true;
            const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);
            audio.src = audioURL;
            console.log("recorder stopped");


            clipLabel.onclick = function() {
                const existingName = clipLabel.textContent;
                const newClipName = prompt('Enter a new name for your sound clip?');
                if(newClipName === null) {
                    clipLabel.textContent = existingName;
                } else {
                    clipLabel.textContent = newClipName;
                }
            }
        }

        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        }
    }

    let onError = function(err) {
        console.log('The following error occured: ' + err);
    }

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
    console.log('getUserMedia not supported on your browser!');
}

