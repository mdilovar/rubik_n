<?php
    #TODO: use https, safeguard data, esp password when it comes from client to server.
    session_start();
    if ($_SESSION["isLoggedIn"]){
        echo json_encode(array("success" => false, "general_message" => "Please logout first." ));
        exit();
    }
    define("BLOW_COST", 10); //The two digit cost parameter is the base-2 logarithm of the iteration count for the Blowfish alg.
    include("validate.php");
    
    $request_errors = array();
    $username = validateInput($_POST['username'],'username',$request_errors);
    $password = validateInput($_POST['password'],'password',$request_errors);


    if (count($request_errors) > 0) {
        echo json_encode(array("success" => false, "general_message" => "Invalid data was entered.", "errors" => $request_errors ));
    } else {
        include("db_connect.php");
        
        if (!isUsernameAvailable($username,$mysqli)){
            echo json_encode(array("success" => false, "general_message" => "Username unavailable."));
        }else if (register($username,$password,$mysqli)){
            echo json_encode(array("success" => true, "general_message" => "User $username was successfully registered." ));
        }else{
            echo json_encode(array("success" => false, "general_message" => "Failed to register user. Unexpected error."));
        }
    }

    function register($username,$password,$mysqli) {
        if (!($stmt = $mysqli->prepare("INSERT INTO player(username,hash) VALUES (?,?)"))) {
            $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $db_error = array("prepare"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }

        $options = array('cost' => BLOW_COST);
        $hash = password_hash($password, PASSWORD_BCRYPT, $options);
    
        if (!$stmt->bind_param("ss", $username, $hash)) {
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
    
    function isUsernameAvailable($username,$mysqli){
        if (!($stmt = $mysqli->prepare('SELECT username FROM player WHERE username = (?) LIMIT 1'))) {
            $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $db_error = array("prepare"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }
        
        if (!$stmt->bind_param('s', $username)) {
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