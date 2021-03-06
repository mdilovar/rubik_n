"use strict";
/*global FB checkLoginState*/
// REGULAR LOGIN/SIGNUP
function sendForm(url) {
    var embox = document.getElementsByName("email")[0];
    var pbox = document.getElementsByName("password")[0];
    var emerr = document.getElementById("emerr");
    var perr = document.getElementById("perr");
    var gerr = document.getElementById("gerr");
    var gnotif = document.getElementById("gnotif");
    gnotif.innerHTML = "";
    gerr.innerHTML = "";
    var noErr = true;

    var pval = pbox.value; //.replace(/^\s+|\s+$/g, ''); // not trimmin passwords
    var emval = embox.value.replace(/^\s+|\s+$/g, '');
    embox.value = emval;

    if (pval == "") {
        pbox.style.borderColor = "red";
        //pbox.placeholder = "password is required";
        perr.innerHTML = "password is required";
        noErr = false;
    }
    else if (pval.length < 6) {
        pbox.style.borderColor = "red";
        //pbox.placeholder = "password must have 6 or more characters";
        perr.innerHTML = "password must have 6 or more characters";
        noErr = false;
    }
    else {
        pbox.style.borderColor = "";
        //pbox.placeholder = "password";
        perr.innerHTML = "";
    }

    if (emval == "") {
        embox.style.borderColor = "red";
        //embox.placeholder = "email is required";
        emerr.innerHTML = "email is required";
        noErr = false;
    }
    else if (!(/\S+@\S+\.\S+/.test(emval))) { // minimal email validation
        embox.style.borderColor = "red";
        //embox.placeholder = "invalid email format"
        emerr.innerHTML = "invalid email format";
        noErr = false;
    }
    else {
        embox.style.borderColor = "";
        //embox.placeholder = "email";
        emerr.innerHTML = "";
    }

    if (noErr) {
        var data = {
            email: emval,
            password: pval
        };
        var ajax = new Ajax(url, data, handleResponse);
        ajax.post();
    }
}

function handleResponse(response) {
    var embox = document.getElementsByName("email")[0];
    var pbox = document.getElementsByName("password")[0];
    var emerr = document.getElementById("emerr");
    var perr = document.getElementById("perr");
    var gerr = document.getElementById("gerr");

    response = JSON.parse(response);

    if (!response.success) {
        console.log('debug: ', response);
        console.log('debug: ', response.errors.gerr);
        if (typeof response.errors !== 'undefined') {
            if (typeof response.errors.email !== 'undefined') {
                embox.style.borderColor = "red";
                emerr.innerHTML = response.errors.email;
            }
            else {
                embox.style.borderColor = "";
                emerr.innerHTML = "";
            }
            if (typeof response.errors.password !== 'undefined') {
                pbox.style.borderColor = "red";
                perr.innerHTML = response.errors.password;
            }
            else {
                pbox.style.borderColor = "";
                perr.innerHTML = "";
            }
            if (typeof response.errors.gerr !== 'undefined') {
                gerr.innerHTML = response.errors.gerr;
            }
            else {
                gerr.innerHTML = "";
            }
        }
    }
    else {
        window.location = "index.php";
    }
}

// FACEBOOK LOGIN
function facebookLogin() {
    FB.login(checkLoginState, {
        scope: 'public_profile,email,user_friends',
        auth_type: 'rerequest'
    });
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    if (response.status === 'connected') {
        // Logged into the app and Facebook. Updating backend.
        FB.api('/me', function(response) {
            var data = null; // even with data null the cookie will have the fb access token
            var ajax = new Ajax('php/fbauth.php', data, function (){
                // redirrect to main page after login.
                // If there is a session, php will redirrect to the game page.
                window.location = "index.php";
            });
            ajax.post();
        });
    }
    // else if (response.status === 'not_authorized') {
    //     // The person is logged into Facebook, but not the app.
    // }
    // else {
    //     // The person is not logged into Facebook
    // }
}

function logout(){
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            FB.logout(function(response) {
                window.location.replace('logout.php');
            });
        } else {
            window.location.replace('logout.php');
        }
    });
}