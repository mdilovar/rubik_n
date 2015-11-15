<?php
    session_start();
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] == true){
        echo json_encode(array("success" => false, "general_message" => "Please logout first." ));
        exit();
    }

    include("validate.php");

    $request_errors = array();
    $email = validateInput($_POST['email'],'email',$request_errors);
    $password = validateInput($_POST['password'],'password',$request_errors);

    if (count($request_errors) > 0) {
        echo json_encode(array("success" => false, "general_message" => "Invalid data was entered.", "errors" => $request_errors ));
    } else {
        include("db_connect.php");
        include("auth_helpers.php");
        if (!isEmailAvailable($email,$mysqli)){
            echo json_encode(array("success" => false, "general_message" => "Email not available.", "errors" =>array("email"=>"Sorry, it looks like $email belongs to an existing account.")));
        }else if (register($email,$password,$mysqli)){
            echo json_encode(array("success" => true, "general_message" => "User $username was successfully registered." ));
            $_SESSION["registered"] = true;
        }else{
            echo json_encode(array("success" => false, "general_message" => "Failed to register user. Unexpected error."));
        }
    }
?>