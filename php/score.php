<?php
session_start();
header('Content-Type: application/json');
if (isset($_SESSION['inGuestMode']) && $_SESSION['inGuestMode'] === true){
    echo json_encode(array(
        "success" => false,
        "general_message" => "You can't save your scores in guest mode.."
    ));
    die;
}
if (!(isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true)) {
    echo json_encode(array(
        "success" => false,
        "general_message" => "Please login first."
    ));
    session_unset();
    session_destroy();
    exit();
}

include ("validate.php");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $request_errors = array();
    $player_id = $_SESSION["player_id"];
    $cube_size = validateInput($_GET['cube_size'], 'cube_size', $request_errors);

    if (count($request_errors) > 0) {
        echo json_encode(array(
            "success" => false,
            "general_message" => "Invalid data was submitted.",
            "errors" => $request_errors
        ));
        die;
    }

    include ("db_connect.php");
    $score = 0;
    if (is_numeric($score = getHiScore($player_id, $cube_size) )) {
        echo json_encode(array(
            "success" => true,
            "general_message" => "User HS was successfully retrieved.",
            "data" => array("hs"=>$score)
        ));
        die;
    }
    else {
        echo json_encode(array(
            "success" => true,
            "general_message" => "Failed to get HS. Unexpected error."
        ));
        die;
    }

}elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $request_errors = array();
    $player_id = $_SESSION["player_id"];
    $score = validateInput($_POST['score'], 'score', $request_errors);
    $cube_size = validateInput($_POST['cube_size'], 'cube_size', $request_errors);

    if (count($request_errors) > 0) {
        echo json_encode(array(
            "success" => false,
            "general_message" => "Invalid data was submitted.",
            "errors" => $request_errors
        ));
        die;
    }

    include ("db_connect.php");

    if (saveScore($player_id, $score, $cube_size)) {
        echo json_encode(array(
            "success" => true,
            "general_message" => "The score was successfully recorded."
        ));
        die;
    }
}

function getHiScore($player_id, $cube_size) {
    global $mysqli;
    $success = true;
    $db_error = '';

    if (!($stmt = $mysqli->prepare("SELECT MIN(time) AS hs FROM game
                                    WHERE player_id = ?
                                    AND cube_size = ? "))) {
        $db_error = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
        $success = false;
    }

    else if (!$stmt->bind_param("ii", $player_id, $cube_size)) {
        $db_error = "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        $success = false;
    }

    else if (!$stmt->execute()) {
        $db_error = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        $success = false;
    }

    if (!$success) {
        error_log($db_error, 3, "../tmp/errors.log");
        echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
        die;
    }

    $result = $stmt->get_result();

    if ($result->num_rows != 1) {
        echo json_encode(array("success" => false, "general_message" => "No score found." ));
        die;
    }

    return $result->fetch_object()->hs;
}

function saveScore($player_id, $score, $cube_size) {
    global $mysqli;
    $success = true;
    $db_error = '';

    if (!$stmt = $mysqli->prepare("INSERT INTO game(player_id,time,cube_size)
                                    VALUES (?, ?, ?)")) {
        $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
        $success = false;
    }

    else if (!$stmt->bind_param("iii", $player_id, $score, $cube_size)) {
        $error_message = "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        $success = false;
    }

    else if (!$stmt->execute()) {
        $error_message = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        $success = false;
    }

    if (!$success) {
        error_log($db_error, 3, "../tmp/errors.log");
        echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
        die;
    }

    return true;
}

?>