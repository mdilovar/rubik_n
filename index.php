<?php
    session_start();
    if ($_SESSION["isLoggedIn"]){
        echo json_encode(array("success" => false, "general_message" => "Already loged in." ));
        header("location:php/rc.php");
        exit();
    }
?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset=utf-8>
		<title>Login - NxNxN Rubik's Cube</title>
		<style>
			body { margin: 0; background-color: #f0f0f0; overflow: hidden;}
		</style>
		<script src="../js/ajax.js"></script>
		<script src="../js/login.js"></script>
	</head>
	<body>
		<div class="login">
	      <h1>Login to NxNxN Rubik's Cube</h1>
	      <form method="post" action="php/login.php">
	        <p><input type="text" name="username" value="" placeholder="Username"></p>
	        <p><input type="password" name="password" value="" placeholder="Password"></p>
	        <p class="submit">
	        	<button type="button" onclick="sendForm(this.form.username.value,this.form.password.value,this.form.action);">Login</button>
	        </p>
	      </form>
	    </div>
	    <div class="resister">
	      <h1>Register</h1>
	      <form method="post" action="php/register.php">
	        <p><input type="text" name="username" value="" placeholder="Username"></p>
	        <p><input type="password" name="password" value="" placeholder="Password"></p>
	        <!--<p class="submit"><input type="submit" value="Login"></p> -->
	        <p class="submit">
	        	<button type="button" onclick="sendForm(this.form.username.value,this.form.password.value,this.form.action);">Register</button>
	        </p>
	      </form>
	    </div>
	</body>
</html>