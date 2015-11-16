<?php
    include("db_connect.php");

    function login($email,$password,&$errors) {
        global $mysqli;
        $query_string = "
            SELECT email, hash
            FROM player plyr
            JOIN password pass ON plyr.player_id = pass.player_id
            WHERE email = (?)
            LIMIT 1
        ";
        if ( !( $stmt = $mysqli->prepare($query_string) ) ) {
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

    function register($email,$password) {
        global $mysqli;
        $query_string = "
            INSERT INTO player(email)
            VALUES (?);
            INSERT INTO password(player_id,hash)
            VALUES ( (
            		 SELECT player_id
                	 FROM player
                	 WHERE email = (?)
                	 LIMIT 1
                	), (?) ) )
        ";
        if ( !( $stmt = $mysqli->prepare($query_string) ) ) {
            $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $db_error = array("prepare"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }

        $options = array('cost' => BLOW_COST);
        $hash = password_hash($password, PASSWORD_BCRYPT, $options);

        if (!$stmt->bind_param("sss", $email, $email, $hash)) {
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

    function addFbuid($fbuid, $email) {
        global $mysqli;
        // will create a corresponding player entry if it doesn't already exist.
        if ( !doesPlayerExist($email) ) {
            $query_string = "
                INSERT INTO player(email)
                VALUES (?);
                INSERT INTO fbuid(player_id, fbuid)
                VALUES ( (
                		 SELECT player_id
                    	 FROM player
                    	 WHERE email = (?)
                    	 LIMIT 1
                    	), (?) ) )
            ";
            if (!($stmt = $mysqli->prepare($query_string))) {
                $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
                $db_error = array("prepare"=>$error_message);
                echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
                return false;
            }

            if (!$stmt->bind_param("sss", $email, $email, $fbuid)) {
                $error_message = "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
                $db_error = array("binding"=>$error_message);
                echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
                return false;
            }
        }else {
            $query_string = "
                    INSERT INTO fbuid(player_id, fbuid)
                    VALUES ( (
                    		 SELECT player_id
                        	 FROM player
                        	 WHERE email = (?)
                        	 LIMIT 1
                        	), (?) ) )
            ";
            if (!($stmt = $mysqli->prepare($query_string))) {
                $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
                $db_error = array("prepare"=>$error_message);
                echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
                return false;
            }

            if (!$stmt->bind_param("ss", $email, $fbuid)) {
                $error_message = "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
                $db_error = array("binding"=>$error_message);
                echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
                return false;
            }
        }



        if (!$stmt->execute()) {
            $error_message = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
            $db_error = array("execution"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }
        return true;
    }

    function doesPlayerExist($email){
        global $mysqli;
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
        return $result->num_rows == 1 ? true : false;
    }

    function doesFbuidExist($fbuid){
        global $mysqli;
        if (!($stmt = $mysqli->prepare('SELECT fbuid FROM fbuid WHERE fbuid = (?) LIMIT 1'))) {
            $error_message = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
            $db_error = array("prepare"=>$error_message);
            echo json_encode(array("success" => false, "general_message" => "Internal db error.", "errors" => $db_error ));
            return false;
        }

        if (!$stmt->bind_param('s', $fbuid)) {
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
        return $result->num_rows == 1 ? true : false;
    }

?>