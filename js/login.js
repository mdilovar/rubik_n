function sendForm(u, p, url){
	var data = {username: u, password:p};
	var ajax = new Ajax(url,data,handleResponse);
	ajax.post();
}
function handleResponse(response){
    response = JSON.parse(response);
    console.log(response);
    if (!response.success){
        console.log(response.general_message);
        for (var prop in response.errors) {
            console.log(response.errors[prop]);
        }
    }else{
        window.location = "php/rc.php";
    }
}