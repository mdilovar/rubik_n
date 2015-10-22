<?php
    session_start();
    if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] == true){
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
	<!-- Begin Cookie Consent plugin by Silktide - http://silktide.com/cookieconsent
	<script type="text/javascript">
	    window.cookieconsent_options = {"message":"This website uses cookies to ensure you get the best experience.","dismiss":"Got it!","learnMore":"More info","link":null,"theme":"dark-top"};
	</script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.9/cookieconsent.min.js"></script>
	<!-- End Cookie Consent plugin -->
</head>

<body>
	<div class="login_wrapper">
		<div class="login">
			<h1>rubik_<span id="n">n</span></h1>
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
