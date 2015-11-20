<?php
    session_start();
    header('Content-Type: application/json');

    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true){
        echo json_encode(array("success" => false, "general_message" => "Please logout first." ));
        session_unset();
        session_destroy();
        exit();
    }

    require_once __DIR__ . '/lib/facebook-php-sdk-v4-5.0.0/src/Facebook/autoload.php';
    include("config.php");

    // CREATE FB APP CONNECTION AND CHECK REQUEST COOKIES for
    // fb access token. The actual login is handled in the front-end
    // with Facebook JS SDK.

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

    // -- access token set and user is Logged in to facebook --

    // GRAB FB ID and FB EMAIL USING THE ACCESS TOKEN

    $_SESSION['fb_access_token'] = (string) $accessToken;

    // Sets the default fallback access token so we don't have to pass it to each request
    $fb->setDefaultAccessToken($_SESSION['fb_access_token']);

    try {
      $response = $fb->get('/me?fields=id,email');
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

    $email = $userNode->getField('email'); // $userNode['email']
    $fbuid = $userNode->getField('id'); // $userNode['id']

    // CHECK IF PLAYER ALREAY EXISTS; IF NO, CREATE ONE. THEN CREATE A SESSION.
    include("validate.php");
    include("auth_helpers.php");

    if (!is_numeric($player_id = getPlayerIdByFbuid($fbuid))){
        $request_errors = array();
        $email = validateInput($email, 'email', $request_errors);

        if (count($request_errors) > 0) {
            echo json_encode(array("success" => false, "general_message" => "Invalid data was provided.", "errors" => $request_errors ));
            exit;
        }

        registerFbuid($fbuid, $email);

    }

    if (is_numeric($player_id = getPlayerIdByFbuid($fbuid))){
        $_SESSION["fbuid"] = $fbuid;
        $_SESSION["player_id"] = $player_id;
        $_SESSION["isLoggedIn"] = true;
        echo json_encode(array("success" => true, "general_message" => "FB user was successfully registered and logged in." ));
        exit;
    }

    echo json_encode(array("success" => false, "general_message" => "Failed to register FB user. Unexpected error."));
?>