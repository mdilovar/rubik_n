<?php
    define("BLOW_COST", 10); //The two digit cost parameter is the base-2 logarithm of the iteration count for the Blowfish alg.

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

    function register($email,$password,$mysqli) {
        if (!($stmt = $mysqli->prepare("INSERT INTO player(email,hash) VALUES (?,?)"))) {
            $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $db_error = array("prepare"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }

        $options = array('cost' => BLOW_COST);
        $hash = password_hash($password, PASSWORD_BCRYPT, $options);

        if (!$stmt->bind_param("ss", $email, $hash)) {
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
        return true;
    }

    function registerFB($email, $mysqli) {
        if (!($stmt = $mysqli->prepare("INSERT INTO player(email,hash) VALUES (?,?)"))) {
            $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $db_error = array("prepare"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }

        if (!$stmt->bind_param("ss", $email, $hash)) {
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
        return true;
    }

    function isEmailAvailable($email,$mysqli){
        if (!($stmt = $mysqli->prepare('SELECT email FROM player WHERE email = (?) LIMIT 1'))) {
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
        return $result->num_rows != 0 ? false : true;
    }

?>