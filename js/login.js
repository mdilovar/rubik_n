function sendForm(u, p, url){
    var ubox = document.getElementsByName("username")[0];
    var pbox = document.getElementsByName("password")[0];
    var uerr = document.getElementById("uerr");
    var perr = document.getElementById("perr");
    var gerr = document.getElementById("gerr");
    var utrim=ubox.value.replace( /^\s+|\s+$/g, '');
    var ptrim=pbox.value.replace( /^\s+|\s+$/g, '');
    if (utrim == "" || ptrim == "") {
        gerr.innerHTML="";
        if (utrim == ""){
            ubox.style.borderColor = "red";
            //ubox.placeholder = "username is required";
            uerr.innerHTML="username is required";
        }else{
            ubox.style.borderColor = "";
            //ubox.placeholder = "username";
            uerr.innerHTML="";
        }
        if (ptrim == ""){
            pbox.style.borderColor = "red";
            //pbox.placeholder = "password is required";
            perr.innerHTML="password is required";
        }else{
            pbox.style.borderColor = "";
            //pbox.placeholder = "password";
            perr.innerHTML="";
        }
        return;
    }else{
        ubox.style.borderColor = "";
        //ubox.placeholder = "username";
        uerr.innerHTML="";
        pbox.style.borderColor = "";
        //pbox.placeholder = "password";
        gerr.innerHTML="";
    }
	var data = {username: u, password:p};
	var ajax = new Ajax(url,data,handleResponse);
	ajax.post();
}
function handleResponse(response){
    var ubox = document.getElementsByName("username")[0];
    var pbox = document.getElementsByName("password")[0];
    var uerr = document.getElementById("uerr");
    var perr = document.getElementById("perr");
    var gerr = document.getElementById("gerr");
    response = JSON.parse(response);
    if (!response.success){
        console.log(response);
        console.log('frfr',response.errors.gerr);
        if(typeof response.errors !== 'undefined'){
            if(typeof response.errors.username !== 'undefined' || typeof response.errors.password !== 'undefined' || typeof response.errors.gerr !== 'undefined'){
                if(typeof response.errors.username !== 'undefined'){
                    ubox.style.borderColor = "red";
                    uerr.innerHTML=response.errors.username;
                }else{
                    ubox.style.borderColor = "";
                    uerr.innerHTML="";
                }
                if(typeof response.errors.password !== 'undefined'){
                    pbox.style.borderColor = "red";
                    perr.innerHTML=response.errors.password;
                }else{
                    pbox.style.borderColor = "";
                    perr.innerHTML="";
                }
                if(typeof response.errors.gerr !== 'undefined'){
                    gerr.innerHTML=response.errors.gerr;
                }else{
                    gerr.innerHTML="";
                }
            }else{
                ubox.style.borderColor = "";
                uerr.innerHTML="";
                pbox.style.borderColor = "";
                perr.innerHTML="";
                gerr.innerHTML="";
            }
        }
    }else{
        window.location = "php/rc.php";
    }
}


