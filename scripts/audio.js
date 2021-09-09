const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');


(function($) {
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
                stop.disabled = true;
                record.disabled = false;
            }

            mediaRecorder.onstop = function(e) {
                console.log("data available");
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
                const blob = new Blob(chunks, { 'type' : 'audio/mp3;base64 codecs=opus' });
                chunks = [];
                audio.src = window.URL.createObjectURL(blob);
                console.log("recorder stopped");
                sendAudio(audio)
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

    function sendAudio(blob) {
        request_type = "save";
        var aud = new FormData();
        aud.append('file', blob);

        $.ajax({
            url: "server/actions.php",
            type: 'POST',
            data: {
                "action": request_type,
                "pl_id": sessionStorage.getItem("placeId"),
                "aud": aud
            },
            dataType: "json",
        })

        .done(function (data) {
            console.log('audio inviato')
        })

        .fail(function (jqXHR, textStatus) {
                alert("Request failed: " + textStatus);
        })
    }
})(jQuery);