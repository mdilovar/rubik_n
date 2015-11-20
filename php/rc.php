<?php
    session_start();
    if (!(isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] == true)){
        echo json_encode(array("success" => false, "general_message" => "Please login first." ));
        header("location:../index.php");
        exit();
    }
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset=utf-8>
		<meta name=viewport content="width=device-width, initial-scale=1">
		<title>rubik_n</title>
		<link rel="stylesheet" type="text/css" href="../css/main.css">
		<!-- Begin Cookie Consent plugin by Silktide - http://silktide.com/cookieconsent
		<script type="text/javascript">
		    window.cookieconsent_options = {"message":"This website uses cookies to ensure you get the best experience.","dismiss":"Got it!","learnMore":"More info","link":null,"theme":"dark-top"};
		</script>
		<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.9/cookieconsent.min.js"></script>
		<!-- End Cookie Consent plugin -->
	</head>
	<body>
		<!-- FACEBOOK SDK START-->
		<script>
			/*global FB*/
			window.fbAsyncInit = function() {
				FB.init({
					appId: '1500653416897531',
					xfbml: true,
					version: 'v2.5'
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
		<!-- FACEBOOK SDK END-->

		<div id="cube_size_wrapper">
			<div id="cp" class="cube_size">
		      <h1>
		      	rubik_<span id="n">n</span>
		      	<a href="javascript:logout();" title="logout"><img alt="logout" src="../images/logout.svg"></a>
				<a onclick="startScene.reset();" id="restart_button" title="restart"><img alt="restart" src="../images/restart.svg"></a>
		      	<br>
		      	<span id="hs" class="notifs"></span>
		      	<span id="timen" class="notifs"></span>
		      </h1>
		      <form id="cube_size_form" action="javascript:void(0);">
		        <p><input type="number" id="csbox" name="n" min="2" max="10" value="3" ></p>
		        <p class="submit">
					<input type="submit" class="big" onclick="startScene.getUserCubeSize(this.form.n.value);" value ="start">
		        </p>
		      </form>
		    </div>
			<div class="notifs">
				<div id="gnotif"></div>
				<div id="cserr"></div>
				<div id="sizen">choose cube size</div>
			</div>
		</div>



	    <div id='canvas_div'></div>
	    <script src="../js/lib/three.min.js"></script>
	    <script src="../js/lib/Detector.js"></script>
		<script src="../js/lib/OrbitControls.js"></script>
		<script src="../js/lib/TrackballControls.js"></script>
		<script src="../js/ajax.js"></script>
		<script src="../js/login.js"></script>
		<script src="../js/game.js"></script>
		<script src="../js/cube.js"></script>

	</body>
</html>