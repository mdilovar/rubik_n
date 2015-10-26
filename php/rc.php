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
		<div id="cube_size_wrapper">
			<div class="cube_size">
		      <h1>
		      	rubik_<span id="n">n</span>
		      	<a href="logout.php" title="logout"><img alt="logout" src="../images/logout.svg"></a>
		      	<a onclick="startScene.reset();" id="restart_button" title="restat"><img alt="restat" src="../images/restart.svg"></a>
		      	<span id="hs" class="notifs"></span>
		      	<span id="timen" class="notifs"></span>
		      </h1>
		      <form  id="cube_size_form">
		        <p><input type="number" id="csbox" name="n" min="2" max="10" value="3" ></p>
		        <p class="submit">
		        	<input type="button" class="big" onclick="startScene.getUserCubeSize(this.form.n.value);" value ="start">
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
		<script src="../js/lib/EventsControls.js"></script>
		<script src="../js/ajax.js"></script>
		<script src="../js/game.js"></script>
		<script src="../js/cube.js"></script>

	</body>
</html>