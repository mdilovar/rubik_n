<?php
session_start();

if (!(isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] == true)) {
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
    $email = $_SESSION["email"];
    $cube_size = validateInput($_GET['cube_size'], 'cube_size', $request_errors);

    if (count($request_errors) > 0) {
        echo json_encode(array(
            "success" => false,
            "general_message" => "Invalid data was submitted.",
            "errors" => $request_errors
        ));
    }
    else {
        include ("db_connect.php");
        $score = 0;
        if (getHiScore($email, $cube_size, $mysqli, $score)) {
            echo json_encode(array(
                "success" => true,
                "general_message" => "User HS was successfully retrieved.",
                "data" => array("hs"=>$score)
            ));
        }
        else {

            // echo json_encode(array("success" => false, "general_message" => "Failed to save the score. Unexpected error."));

        }
    }
}elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $request_errors = array();
    $email = $_SESSION["email"];
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

        if (saveScore($email, $score, $cube_size, $mysqli)) {
            echo json_encode(array(
                "success" => true,
                "general_message" => "The score was successfully recorded."
            ));
        }
        else {

            // echo json_encode(array("success" => false, "general_message" => "Failed to save the score. Unexpected error."));

        }
    }
}

function getHiScore($email, $cube_size, $mysqli, &$score)
{
    if (!($stmt = $mysqli->prepare("SELECT MIN(time) AS hs FROM game
                                    WHERE player_id = (
                                        SELECT id FROM player
                                        WHERE email = ? LIMIT 1)
                                    AND cube_size = ? "))) {
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

    if (!$stmt->bind_param("si", $email, $cube_size)) {
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

    $result = $stmt->get_result();

    if ($result->num_rows != 1) {
        $errors['email'] = "Incorrect email.";
        $score = 0;
    } else {
        $score = $result->fetch_object()->hs;
    }
    return true;
}

function saveScore($email, $score, $cube_size, $mysqli)
{
    if (!($stmt = $mysqli->prepare("INSERT INTO game(player_id,time,cube_size)
                                    SELECT id, ?,? FROM player WHERE email = ? LIMIT 1"))) {
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

    if (!$stmt->bind_param("iis", $score, $cube_size, $email)) {
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