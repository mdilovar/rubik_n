<?php
    session_start();
    header('Content-Type: application/json');
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true){
        echo json_encode(array("success" => false, "general_message" => "You are already logged in." ));
        session_unset();
        session_destroy();
        exit();
    }
    include("validate.php");

    $request_errors = array();
    $email = validateInput($_POST['email'],'email',$request_errors);
    $password = validateInput($_POST['password'],'password',$request_errors);

    if (count($request_errors) > 0) {
        echo json_encode(array("success" => false, "general_message" => "Invalid data was entered.", "errors" => $request_errors ));
    } else {
        include("auth_helpers.php");
        if (is_numeric($player_id = login($email,$password))){
            $_SESSION["email"] = $email;
            $_SESSION["player_id"] = $player_id;
            $_SESSION["isLoggedIn"] = true;
            $_SESSION['inGuestMode'] = false;
            echo json_encode(array("success" => true, "general_message" => "User $email was successfully logged in." ));
        }else{
            echo json_encode(array("success" => false, "general_message" => "Failed to log in. Unexpected error."));
        }
    }
?>