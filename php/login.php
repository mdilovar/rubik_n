<?php
    session_start();
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] == true){
        echo json_encode(array("success" => false, "general_message" => "You are already logged in." ));
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
        $login_errors = array();
         if (login($email,$password,$mysqli,$login_errors)){
            $_SESSION["email"] = $email;
            $_SESSION["isLoggedIn"] = true;
            echo json_encode(array("success" => true, "general_message" => "User $email was successfully logged in." ));
        }else{
            echo json_encode(array("success" => false, "general_message" => "Failed to log in user.", "errors" => $login_errors));
        }
    }
    function login($email,$password,$mysqli,&$errors) {
        if (!($stmt = $mysqli->prepare('SELECT hash, email FROM player WHERE email = (?) LIMIT 1'))) {
            $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $db_error = array("prepare"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }

        if (!$stmt->bind_param('s', $email)) {
            $error_message = "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
            $db_error = array("binding"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }

        if (!$stmt->execute()) {
            $error_message = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
            $db_error = array("execution"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }

        $result = $stmt->get_result();

        if ($result->num_rows != 1) {
            $errors['gerr'] = "Incorrect email or password.";
            return false;
        } else {
            $player = $result->fetch_object();
            if (!password_verify($password, $player->hash)) {
                $errors['gerr'] = "Incorrect email or password.";
                return false;
            } else {
                return true;
            }
        }
    }


?>