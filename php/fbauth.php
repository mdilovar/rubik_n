<?php
    require_once __DIR__ . '/lib/facebook-php-sdk-v4-5.0.0/src/Facebook/autoload.php';
    include("config.php");
    session_start();
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] == true){
        // #TODOL: in this part of every script, add destroy session
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
      $response = $fb->get('/me?locale=en_US&fields=id,first_name,last_name,email');
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
    $_SESSION["fbuid"] = $userNode->getField('id'); // $userNode['id']
    $_SESSION["first_name"] = $userNode->getField('email'); // $userNode['first_name']
    $_SESSION["last_name"] = $userNode->getField('email'); // $userNode['last_name']

    // CHECK IF USER ALREAY EXISTS, IF NO CREATE ONE
    include("db_connect.php");
    include("auth_helpers.php");

    // First, check if the user exists in fbplayer table.
    // Given the FK constraints on that table, if the user exists
    // there, they must also exist in the player table, and nothing
    // needs to be done, just a session is establised.
    // {code}
      // $_SESSION["isLoggedIn"] = true;
    // Otherwise, (if not in fbplayer), check if user is in player table.
    // If they are, that means an existing user has just lgged in with Facebook.
    // In this case, just create an entry for the use in the fbplayer table.
      // if (!isEmailAvailable($_SESSION["email"],$mysqli)){
          // if (registerFB($_SESSION["fbuid"], $_SESSION["email"], $_SESSION["first_name"], $_SESSION["last_name"], $mysqli)){
          //     echo json_encode(array("success" => true, "general_message" => "User $username was successfully registered." ));
          // }else{
          //     echo json_encode(array("success" => false, "general_message" => "Failed to register user. Unexpected error."));
          // }
      // }
    // And finally, if all above is false, that means this is a new user.
    // Two new entries must be created, first one for player,
    // {code}
    // and then for fbplayer.

?>