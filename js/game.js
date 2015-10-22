var SCORE_URL = "/php/score.php";
function loadGame() {
    this.highScore = 0;

    IntroScreen = new IntroScreen();
    timer = new Timer();
    theCube = new Cube();
    game = new Game();
    IntroScreen.display();

}

function IntroScreen() {
    this.display = function display() {
        //show:
        var cube_size_form = document.getElementById('cube_size_form');
        var sizen = document.getElementById('sizen');
        cube_size_form.style.display = "inline";
        sizen.style.display = "inline";
        //hide:
        var restart_button = document.getElementById('restart_button');
        var hs = document.getElementById('hs');
        restart_button.style.display = "none";
        hs.innerHTML = "";
        //move around:
        var cube_size_wrapper = document.getElementById('cube_size_wrapper');
        cube_size_wrapper.style.paddingTop = "10%";
        //change n to n
        var n = document.getElementById('n');
        n.innerHTML = 'n';
    };
    this.hide = function hide(new_n) {
        //hide:
        var cube_size_form = document.getElementById('cube_size_form');
        var sizen = document.getElementById('sizen');
        cube_size_form.style.display = "none";
        sizen.style.display = "none";
        //show:
        var restart_button = document.getElementById('restart_button');
        restart_button.style.display = "inline";
        //move around:
        var cube_size_wrapper = document.getElementById('cube_size_wrapper');
        cube_size_wrapper.style.paddingTop = 0;
        //change n to 
        var n = document.getElementById('n');
        n.innerHTML = new_n;
    };
    this.getUserCubeSize = function getUserCubeSize(n) {
        var csbox = document.getElementById('csbox');
        var sizen = document.getElementById("sizen");
        n = parseInt(n,10);
        console.log(n);
        if (!(typeof n==='number' && (n%1)===0)){ //integer test
            csbox.style.borderColor = "red";
            sizen.innerHTML="please choose between 2 and 10";
            return;
        }else if (n < 2 || n > 10){
            csbox.style.borderColor = "red";
            sizen.innerHTML="please choose between 2 and 10";
            return;
        }else {
            csbox.style.borderColor = "";
            sizen.innerHTML="choose cube size";
        }
        this.hide(n);
        game.play(n);
    };
    this.reset = function rest(){
        document.removeEventListener("keydown", moveWithKey);
        theCube.destroy();
        timer.destroy();
        timer = new Timer();
        theCube = new Cube();
        game = new Game();
        this.display();
    };
}

function Timer() {
    this.startTime = Math.floor(Date.now());
    this.isRunning = false;
    this.display = function display() {
        this.t = document.getElementById('timen');
        this.t.innerHTML = 'Time: 00:00';
    };
    this.update = function update() {
        if (this.isRunning) {
            this.t.innerHTML = 'Time: ' + this.makeCuteTime(this.getElapsedTime());
        }
    };
    this.makeCuteTime = function makeCuteTime(time){
        var now = Math.floor(time / 1000); //display only up to seconds
        var minutes = Math.floor(now / 60) % 60;
        now -= minutes * 60;
        var seconds = now % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return minutes + ':' + seconds;
    };
    this.getElapsedTime = function getElapsedTime() {
        return Math.floor(Date.now()) - this.startTime;
    };
    this.reset = function reset() {
        this.startTime = Math.floor(Date.now());
    };
    this.start = function start() {
        this.reset();
        this.isRunning = true;
    };
    this.stop = function stop() {
        this.isRunning = false;
    };
    this.destroy = function destroy(){
       this.t.innerHTML = '';
    };
}

function Game() {
    this.cubeSize = 3;
    this.play = function play(n) {
        this.cubeSize = n;
        timer.display();
        //start the Cube
        theCube.initCube(this.cubeSize, function onIsSolved() {
            timer.stop();
            //window.location = "php/rc.php";
            document.removeEventListener("keydown", moveWithKey);
            game.sendScore(timer.getElapsedTime(),theCube.cubiesPerAxis);
        });
        theCube.scramble(function onComplete() {
            //just key controlled for now
            document.addEventListener("keydown", moveWithKey);
            timer.start();
        });
        this.grabHS(theCube.cubiesPerAxis);
    };
    this.sendScore = function sendScore(score,cube_size){
    	var data = {score:score, cube_size:cube_size};
    	var ajax = new Ajax(SCORE_URL,data,this.handleResponse);
    	ajax.post();
    };
    this.grabHS = function grabHS(cube_size){
        var data = {cube_size:cube_size};
    	var ajax = new Ajax(SCORE_URL,data,this.handleResponse);
    	ajax.get();
    };
    this.handleResponse = function handleResponse(response){
        response = JSON.parse(response);
        if (!response.success){
            console.log(response.general_message);
            for (var prop in response.errors) {
                console.log(response.errors[prop]);
            }
        }else{
            var hs = document.getElementById('hs');
            if(typeof response.data !== 'undefined'){
                if(response.data.hs !== null){
                    hs.innerHTML = "HS: "+ timer.makeCuteTime(response.data.hs) +"&nbsp;&nbsp;|";
                }
            }
            //console.log('Hoooray! recorded your score: ' ,  response);
        }
    };
}