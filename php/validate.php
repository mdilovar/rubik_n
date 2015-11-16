<?php
    function validateInput($input,$input_type,&$error_ar){
        $username_pattern = '/[^A-Za-z0-9]/';
        if("" == trim($input)) {
            $error_ar[$input_type] = "$input_type cannot be empty.";
        }else{
            if($input_type == 'username' && preg_match($username_pattern, $input)) {
                $error_ar[$input_type] = "You entered INVALID value for $input_type. Only alphanumeric characters are accepted.";
            }elseif ($input_type == 'email' && !filter_var($input, FILTER_VALIDATE_EMAIL)){
                $error_ar[$input_type] = "Invalid $input_type format.";
            }elseif ($input_type == 'password' && strlen ($input) < 6){
                $error_ar[$input_type] = "$input_type must have 6 or more characters";
            }// #TODO: add score time input_type (AND password_type?) validation & cube_size
        }
        return $input;
    }
?>