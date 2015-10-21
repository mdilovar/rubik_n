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
		<title>NxNxN Rubik's Cube</title>
		<style>
			body { margin: 0; background-color: #f0f0f0; overflow: hidden;}
			#cube_size_form{display: none}
		</style>
	</head>
	<body>
		<div id="cube_size_form">
	      <h1>Choose your cube size.</h1>
	      <form>
	        <p><input type="number" name="n" min="1" max="10" value="3" ></p>
	        <p class="submit">
	        	<button type="button" onclick="IntroScreen.getUserCubeSize(this.form.n.value);">Start</button>
	        </p>
	      </form>
	    </div>
	    <div id="log_out">
	      <a href="logout.php">Log out</a> 
	    </div>
	   	<div id="reset">
	      <button type="button" onclick="IntroScreen.reset();">Restart</button>
	    </div>
	    <div id="user_hs">
	      <span id="hs"></span>
	    </div>
	    <div id='canvas_div'></div>
	    <script src="../js/ajax.js"></script>
	    <script src="../js/three.min.js"></script>
		<script src="../js/OrbitControls.js"></script>
		<script src="../js/TrackballControls.js"></script>
		<script src="../js/EventsControls.js"></script>
		<script src="../js/game.js"></script>
		<script src="../js/cube.js"></script>

	</body>
</html>