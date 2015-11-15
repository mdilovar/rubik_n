<?php
    require_once __DIR__ . '/lib/facebook-php-sdk-v4-5.0.0/src/Facebook/autoload.php';
    include("config.php");
    session_start();
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] == true){
        echo json_encode(array("success" => false, "general_message" => "Please logout first." ));
        exit();
    }
    $fb = new Facebook\Facebook([
      'app_id' => FBAPPID,
      'app_secret' => FBAPPSECRET,
      'default_graph_version' => 'v2.2',
      ]);

    $helper = $fb->getJavaScriptHelper();

    try {
      $accessToken = $helper->getAccessToken();
    } catch(Facebook\Exceptions\FacebookResponseException $e) {
      // When Graph returns an error
      echo json_encode(array("success" => false, "general_message" => 'Graph returned an error: ' . $e->getMessage() ));
      exit;
    } catch(Facebook\Exceptions\FacebookSDKException $e) {
      // When validation fails or other local issues
      echo json_encode(array("success" => false, "general_message" => 'Facebook SDK returned an error: ' . $e->getMessage() ));
      exit;
    }

    if (! isset($accessToken)) {
      echo 'No cookie set or no OAuth data could be obtained from cookie.';
      exit;
    }

    // Logged in
    // echo '<h3>Access Token</h3>';
    // var_dump($accessToken->getValue());

    $_SESSION['fb_access_token'] = (string) $accessToken;

    // Sets the default fallback access token so we don't have to pass it to each request
    $fb->setDefaultAccessToken($_SESSION['fb_access_token']);

    try {
      $response = $fb->get('/me?locale=en_US&fields=name,email');
      $userNode = $response->getGraphUser();
    } catch(Facebook\Exceptions\FacebookResponseException $e) {
      // When Graph returns an error
      echo json_encode(array("success" => false, "general_message" => 'Graph returned an error: ' . $e->getMessage() ));
      exit;
    } catch(Facebook\Exceptions\FacebookSDKException $e) {
      // When validation fails or other local issues
      echo json_encode(array("success" => false, "general_message" => 'Facebook SDK returned an error: ' . $e->getMessage() ));
      exit;
    }

    $_SESSION["email"] = $userNode->getField('email'); // $userNode['email']
    $_SESSION["isLoggedIn"] = true;

    // CHECK IF EMAIL ALREAY EXISTS, IF NO CREATE ONE
    include("db_connect.php");
    include("auth_helpers.php");
    if (isEmailAvailable($_SESSION["email"],$mysqli)){
        // new email
        if (registerFB($email, $mysqli)){ // #TODO: argument list should fit db table, change db table (id autoinc + fbuid), change method definition
            echo json_encode(array("success" => true, "general_message" => "User $username was successfully registered." ));
        }else{
            echo json_encode(array("success" => false, "general_message" => "Failed to register user. Unexpected error."));
        }
    }

    echo json_encode(array("success" => true, "general_message" => $userNode->getField('email') ));
?>


