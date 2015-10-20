<?php
session_start();

if (!$_SESSION["isLoggedIn"]) {
    echo json_encode(array(
        "success" => false,
        "general_message" => "Please login first."
    ));
    exit();
}

include ("validate.php");

$request_errors = array();
$username = $_SESSION["username"];
$score = validateInput($_POST['score'], 'score', $request_errors);
$cube_size = validateInput($_POST['cube_size'], 'cube_size', $request_errors);

if (count($request_errors) > 0) {
    echo json_encode(array(
        "success" => false,
        "general_message" => "Invalid data was submitted.",
        "errors" => $request_errors
    ));
}
else {
    include ("db_connect.php");

    if (saveScore($username, $score, $cube_size, $mysqli)) {
        echo json_encode(array(
            "success" => true,
            "general_message" => "The score was successfully recorded."
        ));
    }
    else {

        // echo json_encode(array("success" => false, "general_message" => "Failed to save the score. Unexpected error."));

    }
}

function saveScore($username, $score, $cube_size, $mysqli)
{
    if (!($stmt = $mysqli->prepare("INSERT INTO game(player_id,time,cube_size) 
                                    SELECT id, ?,? FROM player WHERE username = ? LIMIT 1"))) {
        $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
        $db_error = array(
            "prepare" => $error_message
        );
        echo json_encode(array(
            "success" => false,
            "general_message" => "Internal db error.",
            "errors" => $db_error
        ));
        return false;
    }

    if (!$stmt->bind_param("iis", $score, $cube_size, $username)) {
        $error_message = "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        $db_error = array(
            "binding" => $error_message
        );
        echo json_encode(array(
            "success" => false,
            "general_message" => "Internal db error.",
            "errors" => $db_error
        ));
        return false;
    }

    if (!$stmt->execute()) {
        $error_message = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        $db_error = array(
            "execution" => $error_message
        );
        echo json_encode(array(
            "success" => false,
            "general_message" => "Internal db error.",
            "errors" => $db_error
        ));
        return false;
    }

    return true;
}

?>