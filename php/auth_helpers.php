<?php
    include("db_connect.php");

    function login($email,$password) {
        global $mysqli;
        $success = true;
        $db_error = '';
        $login_error = [];

        $query_string = "
            SELECT plyr.player_id, email, hash
            FROM player plyr
            JOIN password pass ON plyr.player_id = pass.player_id
            WHERE email = (?)
            LIMIT 1
        ";

        if ( !( $stmt = $mysqli->prepare($query_string) ) ) {
            $db_error = "\nPrepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $success = false;
        }

        else if (!$stmt->bind_param('s', $email)) {
            $db_error = "\nBinding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        else if (!$stmt->execute()) {
            $db_error = "\nExecute failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        if (!$success) {
            error_log($db_error, 3, "../tmp/errors.log");
            echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
            die;
        }

        $result = $stmt->get_result();

        if ($result->num_rows != 1) {
            $login_error['gerr'] = "Incorrect email or password.";
            $success = false;
        } else {
            $player = $result->fetch_object();
            if (!password_verify($password, $player->hash)) {
                $login_error['gerr'] = "Incorrect email or password.";
                $success = false;
            }
        }

        if (!$success) {
            echo json_encode(array("success" => false, "general_message" => "Failed to log in.", "errors" => $login_error));
            die;
        }

        return $player ->player_id;
    }

    function register($email,$password) {
        global $mysqli;
        $success = true;
        $db_error = '';
        $options = array('cost' => BLOW_COST);
        $hash = password_hash($password, PASSWORD_BCRYPT, $options);

        $query_string_email = "
            INSERT INTO player(email)
            VALUES (?);
        ";

        $query_string_pass = "
            INSERT INTO password(player_id,hash)
            VALUES ( (
            		 SELECT player_id
                	 FROM player
                	 WHERE email = (?)
                	 LIMIT 1
                	), (?) )
        ";

        if (!$stmt = $mysqli->prepare($query_string_email)) {
            $db_error = "\nPrepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $success = false;
        }

        else if (!$stmt->bind_param("s", $email)) {
            $db_error = "\nBinding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        else if (!$stmt->execute()) {
            $db_error = "\nExecute failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;;
        }

        else if (!$stmt = $mysqli->prepare($query_string_pass)) {
            $db_error = "\nPrepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $success = false;
        }

        else if (!$stmt->bind_param("ss", $email, $hash)) {
            $db_error = "\nBinding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        else if (!$stmt->execute()) {
            $db_error = "\nExecute failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;;
        }

        if (!$success) {
            error_log($db_error, 3, "../tmp/errors.log");
            echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
            die;
        }

        return true;
    }

    function registerFbuid($fbuid, $email) {
        // works even if user already has a regular account and is logging in with fb now.
        // this will create a corresponding player entry if it doesn't already exist.
        global $mysqli;
        $success = true;
        $db_error = '';

        if ( !doesPlayerExist($email) ) {
            $query_string_create_player = "
                INSERT INTO player(email)
                VALUES (?);
            ";
            if (!$stmt = $mysqli->prepare($query_string_create_player)) {
                $db_error = "\nPrepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
                $success = false;
            }

            else if (!$stmt->bind_param("s", $email)) {
                $db_error = "\nBinding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
                $success = false;
            }

            else if (!$stmt->execute()) {
                $db_error = "\nExecute failed: (" . $stmt->errno . ") " . $stmt->error;
                $success = false;
            }

            if (!$success) {
                error_log($db_error, 3, "../tmp/errors.log");
                echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
                die;
            }

        }

        $query_string_create_fbuid = "
                INSERT INTO fbuid(player_id, fbuid)
                VALUES ( (
                		 SELECT player_id
                    	 FROM player
                    	 WHERE email = (?)
                    	 LIMIT 1
                    	), (?) )
        ";
        if (!$stmt = $mysqli->prepare($query_string_create_fbuid)) {
            $db_error = "\nPrepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $success = false;
        }

        else if (!$stmt->bind_param("ss", $email, $fbuid)) {
            $db_error = "\nBinding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        else if (!$stmt->execute()) {
            $db_error = "\nExecute failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        if (!$success) {
            error_log($db_error, 3, "../tmp/errors.log");
            echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
            die;
        }

        return true;
    }

    function doesPlayerExist($email){
        global $mysqli;
        $success = true;
        $db_error = '';

        if (!($stmt = $mysqli->prepare('SELECT email FROM player WHERE email = (?) LIMIT 1'))) {
            $db_error = "\nPrepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $success = false;
        }

        else if (!$stmt->bind_param('s', $email)) {
            $db_error = "\nBinding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        else if (!$stmt->execute()) {
            $db_error = "\nExecute failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        if (!$success) {
            error_log($db_error, 3, "../tmp/errors.log");
            echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
            die;
        }

        $result = $stmt->get_result();
        return $result->num_rows == 1 ? true : false;
    }

    function getPlayerIdByFbuid($fbuid){
        global $mysqli;
        $success = true;
        $db_error = '';

        if (!($stmt = $mysqli->prepare('SELECT player_id, fbuid FROM fbuid WHERE fbuid = (?) LIMIT 1'))) {
            $db_error = "\nPrepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $success = false;
        }

        else if (!$stmt->bind_param('s', $fbuid)) {
            $db_error = "\nBinding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        else if (!$stmt->execute()) {
            $db_error = "\nExecute failed: (" . $stmt->errno . ") " . $stmt->error;
            $success = false;
        }

        if (!$success) {
            error_log($db_error, 3, "../tmp/errors.log");
            echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
            die;
        }

        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $player = $result->fetch_object();
            return $player->player_id;
        }

        return false;
    }

?>