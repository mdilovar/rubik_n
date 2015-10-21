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
	<title>Login - rubik_n</title>
	<link rel="stylesheet" type="text/css" href="css/main.css">
	<script src="./js/ajax.js"></script>
	<script src="./js/login.js"></script>
</head>

<body>
	<div class="login_wrapper">
		<div class="login">
			<h1>rubik_n</h1>
			<form method="post" action="php/login.php">
				<p>
					<input type="text" name="username" value="" placeholder="username">
				</p>
				<p>
					<input type="password" name="password" value="" placeholder="password">
				</p>
				<p class="submit">
					<input type="button" name="commit" onclick="sendForm(this.form.username.value,this.form.password.value,'php/login.php');" value="log in">
					<input type="button" name="commit" onclick="sendForm(this.form.username.value,this.form.password.value,'php/register.php');" value="sign up">
				</p>
			</form>
		</div>
		<div id="errors">
			<p id="uerr"></p>
			<p id="perr"></p>
			<p id="gerr"></p>
		</div>
	</div>
</body>
</html>
