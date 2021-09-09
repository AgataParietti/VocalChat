<?php

require_once("config.php");

$action = $_POST['action'];

switch ($action) {
    case "save" :
        saveAudio();
        break;
    case "get" :
        getAudios();
        break;
}

function saveAudio() {
    $placeId = $_POST['pl_id'];
    $vote = $_POST['vote'];
    $audio = $_POST['audio'];

    $n = 'audio : ' . $audio;
    printf("%%s = '%s'\n", $n); // string representation


    $audio = str_replace('data:audio/wav;base64,', '', $audio);
    $audio = str_replace(' ', '+', $audio);

    $fp = fopen('../Audio/tmp.wav', 'w+');
    fwrite($fp, base64_decode($audio));
    fclose($fp);

    $query_string = "INSERT INTO `audios`( `placeId`, `audio`, `vote`) VALUES (?,?,?)";
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
    $query = $mysqli->prepare($query_string);
    $null = NULL;
    $query->bind_param("sbi", $placeId, $null, $vote);
    $query->send_long_data(1,  file_get_contents('../Audio/tmp.wav'));
    $query->execute();
}

function getAudios() {
    $placeId = $_POST['pl_id'];

    $query_string = 'SELECT `audio` FROM `audios` WHERE `placeId`=? ORDER BY `audio`';
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
    $query = $mysqli->prepare($query_string);
    $query->bind_param("s", $placeId);
    $query->execute();

    $query->store_result();
    $query->bind_result($gallery);

    $audios = array();

    while ($query->fetch()) {
        $aud = array('aud' => base64_encode($gallery));
        array_push($audios, $aud);
    }

    header('Content-Type: text/json');
    $response = array('audios' => $audios, 'type' => 'get');
    echo json_encode($response);
}

?>
