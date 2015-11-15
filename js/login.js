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
    } else if (pval.length <6) {
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
            email : emval,
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
        scope: 'public_profile,email',
        auth_type: 'rerequest'
    });
}
// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        testAPI();
    }
    else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
    }
    else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
    }
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}
// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', {fields: 'email,first_name,last_name,gender'}, function(response) {
        console.log('Successful login for: ' + response.name);
        console.log(response);
        document.getElementById('status').innerHTML =
            'Thanks for logging in, ' + response.name + '!';
        var data = {
            id: response.id,
            email : response.email,
            fname : response.first_name,
            lname : response.last_name
        };
        var ajax = new Ajax('php/fbauth.php', data, handleResponse);
        ajax.post();
    });
}