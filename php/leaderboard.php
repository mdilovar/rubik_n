<?php
session_start();

if (!(isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true) ||
    !(isset($_SESSION['fbuid']))) {
    echo"<a class='closeX' href='javascript:startScene.hideLeaderBoard();'></a>";
    echo "<div id='notloggedin'>Please <a href = 'javascript:logout()'>login with Facebook</a> first.</div>";
    exit();
}
$fbuid = $_SESSION["fbuid"];
include ("db_connect.php");
include ("validate.php");

$request_errors = array();
$cube_size = validateInput($_GET['cube_size'], 'cube_size', $request_errors);

if (count($request_errors) > 0) {
    echo json_encode(array(
        "success" => false,
        "general_message" => "Invalid data was submitted.",
        "errors" => $request_errors
    ));
    die;
}
// Make FB API call to get user's friends.
require_once __DIR__ . '/lib/facebook-php-sdk-v4-5.0.0/src/Facebook/autoload.php';
include("config.php");

$fb = new Facebook\Facebook([
  'app_id' => FBAPPID,
  'app_secret' => FBAPPSECRET,
  'default_graph_version' => 'v2.5',
  ]);
$fb->setDefaultAccessToken($_SESSION['fb_access_token']);

try {
  $response = $fb->get('/me/friends');
  $graphEdge = $response->getGraphEdge();
} catch(Facebook\Exceptions\FacebookResponseException $e) {
  // When Graph returns an error
  error_log('\n'.$e->getMessage(), 3, "../tmp/errors.log");
  echo"<a class='closeX' href='javascript:startScene.hideLeaderBoard();'></a>";
  echo "<div id='notloggedin'>Something went wrong. Please try again later.</div>";
  exit;
} catch(Facebook\Exceptions\FacebookSDKException $e) {
  // When validation fails or other local issues
  error_log('\n'.$e->getMessage(), 3, "../tmp/errors.log");
  echo"<a class='closeX' href='javascript:startScene.hideLeaderBoard();'></a>";
  echo "<div id='notloggedin'>Something went wrong. Please try again later.</div>";
  exit;
}


$friends = array('You'=>$fbuid);
foreach ($graphEdge as $graphNode) {
    $friends[$graphNode->getField('name')] = $graphNode->getField('id');
}

// get the score board using the freinds liat
$result = getScoreBoard($cube_size, $friends);
if ($result->num_rows == 0) {
    echo"<a class='closeX' href='javascript:startScene.hideLeaderBoard();'></a>";
    echo "<div id='notloggedin'>None of your friends have solved this cube yet. Be the first one!</div>";
    die;
}

?>

<table>
    <tr>
        <th>Name</th>
        <th>Best Time</th>
        <th>Cube Size</th>
    </tr>
    <a class='closeX' href='javascript:startScene.hideLeaderBoard();'></a>
    <?php
        while($row = $result->fetch_assoc()){
            $name = array_search($row['fbuid'],$friends);
            $hs = round($row['hs']/1000,2);
            $cs = $row['cube_size'];
            print "<tr><td>".$name."</td><td>".$hs."</td><td>".$cs."</td></tr>";
        }
    ?>
</table>

<?php

function getScoreBoard($cube_size, $friends) {
    // $friends should be an array with the fbuids of the user's friends who are using the app
    // IMPORTANT: $friends must be validated and taken only from FB API, don't pass user input here.
    global $mysqli;
    $success = true;
    $db_error = '';

    $friends = implode($friends,',');

    $sql = "
        SELECT fbuid, time as hs, cube_size FROM game
        INNER JOIN fbuid ON game.player_id = fbuid.player_id
        WHERE fbuid in ($friends)
        AND (game.player_id, time) IN
            (SELECT player_id, MIN(time)
             FROM game
             WHERE cube_size = ?
             GROUP BY player_id)
        ORDER BY hs ASC
    ";

    if (!($stmt = $mysqli->prepare($sql))) {
        $db_error = "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
        $success = false;
    }

    else if (!$stmt->bind_param("i", $cube_size)) {
        $db_error = "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
        $success = false;
    }

    else if (!$stmt->execute()) {
        $db_error = "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
        $success = false;
    }

    if (!$success) {
        error_log($db_error, 3, "../tmp/errors.log");
        echo json_encode(array("success" => false, "general_message" => "Internal db error." ));
        die;
    }

    $result = $stmt->get_result();

    return $result;
}
?>

