<?php
    session_start();
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true){
        echo json_encode(array("success" => false, "general_message" => "Already loged in." ));
        header("location:php/rc.php");
        exit();
    }
    function forgotForm() {
        ?>
        <?php
    }
	function authForm() {
        ?>
            <p>
				<input type="text" name="email" value="" placeholder="email">
			</p>
			<p>
				<input type="password" name="password" value="" placeholder="password">
			</p>
			<div class="submit">
				<input type="submit" onclick="sendForm('php/login.php');" value="log in">
                <input type="button" onclick="sendForm('php/register.php');" value="sign up">
				<p class="or">
                    <span>or</span>
                </p>
				<input type="button" class='fb big' onclick="facebookLogin()">
				<input type="button" class='big' onclick="window.location.replace('php/rc.php?inGuestMode=true');" value="play in guest mode">
				<!--<div class="forgotsu">-->
    <!--                <p>-->
    <!--                    <a href=".?forgot">forgot password</a>-->
    <!--                </p>-->
				<!--</div>-->
			</div>
        <?php
    }
?>
<!DOCTYPE html>
<html>

<head>
	<meta charset=utf-8>
	<meta name=viewport content="width=device-width, initial-scale=1">
	<title>Login | rubik_n</title>
	<link rel="stylesheet" type="text/css" href="css/main.css">
	<script src="./js/ajax.js"></script>
	<script src="./js/login.js"></script>
	<link href='https://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet'>
</head>

<body>
	<!-- FACEBOOK SDK START -->
	<script>
		/*global FB statusChangeCallback*/
		window.fbAsyncInit = function() {
			FB.init({
				appId: '1500653416897531',
				cookie: true, // enable cookies to allow the server to access
				// the session
				xfbml: true, // parse social plugins on this page
				version: 'v2.2' // use version 2.2
			});

			FB.getLoginStatus(function(response) {
				statusChangeCallback(response); // Defined in login.js
			});
		};

		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	</script>
	<!-- FACEBOOK SDK END -->

	<div class="login_wrapper">
		<div class="login">
            <a class="logo" href="." target="_self">
                <h1>rubik_<span id="n">n</span></h1>
            </a>
			<form  action="javascript:void(0);">
			    <?php
    				if (isset($_GET['forgot'])){
                        forgotForm();
    				} else {
                        authForm();
    				}
				?>
			</form>
		</div>
		<div id="errors">
			<p id="emerr"></p>
			<p id="perr"></p>
			<p id="gerr"></p>
		</div>
		<div class="notifs">
			<div id="gnotif">
				<!--This is a demo of a work in progress. You may login with 'test123' for both username and password.-->
				<?php
					if (isset($_SESSION['registered']) && $_SESSION['registered'] == true){
				        echo "you were successfully registered. please log in to start playing.";
				        session_unset();
						session_destroy();
					}
			    ?>
			</div>
		</div>
	</div>
</body>
</html>
