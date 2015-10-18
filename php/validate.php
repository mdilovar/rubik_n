<?php
    function validateInput($input,$input_type,&$error_ar){
        $username_pattern = '/[^A-Za-z0-9]/';
        $input = trim($input);
        if("" == $input) {
            $error_ar[$input_type] = "You entered empty value for $input_type.";
        }else{
            if($input_type == 'username' && preg_match($username_pattern, $input)) {
                $error_ar[$input_type] = "You entered INVALID value for $input_type. Only alphanumeric characters are accepted.";
            }
        }
        return $input;
    }
?>