<?php
    session_start();
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true){
        echo json_encode(array("success" => false, "general_message" => "You are already logged in." ));
        exit();
    }
    echo "NOT IMPLEMENTED YET."
?>