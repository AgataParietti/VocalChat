<?php

header('Content-Type: text/json');
require_once("config.php");

$action = $_POST['action'];

switch ($action) {
    case "load" :
        getPlaceId();
        break;
    case "save" :
        saveAudio();
        break;
    case "get" :
        getAudios();
        break;
}
//non sono sicura ci serva
function getPlaceId()
{
    $query_string = 'SELECT placeId FROM audios-db GROUP BY placeId';
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
    $result = $mysqli->query($query_string);

    $places_id = array();

    while ($row = $result->fetch_array(MYSQLI_ASSOC)) {

        $pl_id = $row['placeId'];

        $pl_id_arr = array('pl_id' => $pl_id);
        array_push($places_id, $pl_id_arr);
    }

    $response = array('places_id' => $places_id, 'type' => 'load');
    echo json_encode($response);
}

//non ho provato, ma sono fiduciosa
function saveAudio()
{
    $pl_id = $_POST['pl_id'];
    $aud = $_POST['aud'];
    $nome = $_POST['nome'];
    //$vote = $_POST['vote'];

    $aud = str_replace('data:audio/mp3;base64', '', $aud);
    $aud = str_replace(' ', '+', $aud);

    // create an image file
    $fp = fopen("tmp.mp3", "w+");
    // write the data in image file
    fwrite($fp, base64_decode($aud));
    // close an open file pointer
    fclose($fp);

    $query_string = 'INSERT INTO audios-db (placeId, audio, nome) VALUES(?,?,?)';
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
    $query = $mysqli->prepare($query_string);
    $null = NULL;
    $query->bind_param("ddbs", $pl_id, $null, $nome);
    $query->send_long_data(2, file_get_contents('tmp.mp3'));
    $query->execute();

    $id = $mysqli->insert_id;

    $query = $mysqli->prepare('SELECT nome FROM audios-db WHERE id=?');
    $query->bind_param("i", $id);
    $query->execute();

    $result = $query->get_result();
    $row = $result->fetch_assoc();

    $line = array('nome' => $row['nome']);
    $lines = array();
    array_push($lines, $line);

    $response = array('lines' => $lines, 'type' => 'save');
    echo json_encode($response);
}

//sicuramente non funziona
function getAudios()
{
    $title = $_POST['title'];

    $query_string = 'SELECT audio FROM audios-db WHERE nome=?';
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
    $query = $mysqli->prepare($query_string);
    $query->bind_param("s", $title);
    $query->execute();

    $images = array();

    $query->store_result();
    $query->bind_result($gallery);

    while ($query->fetch()) {
        $aud = array('aud' => base64_encode($gallery));
        array_push($images, $img);
    }

    $response = array('audios' => $audios, 'title' => $title, 'type' => 'get');
    echo json_encode($response);
}

?>