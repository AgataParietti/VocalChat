//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;


var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording() {
    console.log("recordButton clicked");

    /*
        Simple constraints object, for more advanced audio features see
        https://addpipe.com/blog/audio-constraints-getusermedia/
    */

    var constraints = { audio: true, video:false }

    /*
       Disable the record button until we get a success or fail from getUserMedia()
   */

    recordButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false

    /*
        We're using the standard promise based getUserMedia()
        https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    */

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        /*
            create an audio context after getUserMedia is called
            sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
            the sampleRate defaults to the one set in your OS for your playback device
        */
        audioContext = new AudioContext();

        //update the format
        document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

        /*  assign to gumStream for later use  */
        gumStream = stream;

        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        /*
            Create the Recorder object and configure to record mono sound (1 channel)
            Recording 2 channels  will double the file size
        */
        rec = new Recorder(input,{numChannels:1})

        //start the recording process
        rec.record()

        console.log("Recording started");

    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        recordButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true
    });
}

function pauseRecording(){
    console.log("pauseButton clicked rec.recording=",rec.recording );
    if (rec.recording){
        //pause
        rec.stop();
        pauseButton.innerHTML="Resume";
    }else{
        //resume
        rec.record()
        pauseButton.innerHTML="Pause";

    }
}

function stopRecording() {
    console.log("stopButton clicked");

    //disable the stop button, enable the record too allow for new recordings
    stopButton.disabled = true;
    recordButton.disabled = false;
    pauseButton.disabled = true;

    //reset button just in case the recording is stopped while paused
    pauseButton.innerHTML="Pause";

    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(sendAudio);


}

function sendAudio(blob) {
    blobToBase64(blob).then(successCallback, failureCallback)

    function successCallback(result) {
        var url = URL.createObjectURL(blob);
        var au = document.createElement('audio');
        var li = document.createElement('li');
        au.controls = true;
        au.src = url;
        li.appendChild(au);
        recordingsList.appendChild(li);
        let blobBase64 = result;
        request_type = "save";
        var data = new FormData();
        data.append('action', request_type)
        data.append('audio', blobBase64);
        data.append('pl_id', sessionStorage.getItem('placeId'));
        data.append('vote', 0);

        $.ajax({
            url: "server/actions.php",
            type: 'POST',
            data: data,
            contentType: false,
            processData: false,
            success: function(data) {
                console.log('audio inviato ' + data)
            },
            error : (function (jqXHR, textStatus, errorThrown) {
                console.log("jqXHR: " + jqXHR.status + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);
            })
        });
    }

    function failureCallback(error) {
        console.error("Error generating audio file: " + error);
    }

}

function getAllAudios() {
    request_type = "get";
    var data = new FormData();
    data.append('action', request_type);
    data.append('pl_id', sessionStorage.getItem('placeId'));
    var request = $.ajax({
        url: "server/actions.php",
        type: 'POST',
        data : data,
        contentType: false,
        processData: false
    });

    request.done(function(data) {
        console.log('audio ricevuti ')
        var audios = data["audios"];
        for (var i = 0; i < audios.length; i++) {
            audios[i].aud = "data:audio/wav;base64," + audios[i].aud;
            blob = getBlob(audios[i].aud)
            var url = URL.createObjectURL(blob);
            var au = document.createElement('audio');
            var li = document.createElement('li')
            au.controls = true;
            au.src = url;
            li.appendChild(au);
            recordingsList.appendChild(li);
        }
    });

    request.fail(function (jqXHR, textStatus, errorThrown) {
            console.log("jqXHR: " + jqXHR.status + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);
    });
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

function getBlob(base64) {
    var byteString = atob(base64.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'audio/wav' });
}