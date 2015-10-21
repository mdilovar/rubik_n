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
        var cube_size_form = document.getElementById('cube_size_form');
        cube_size_form.style.display = "inline";
    };
    this.hide = function hide() {
        var cube_size_form = document.getElementById('cube_size_form');
        cube_size_form.style.display = "none";
    };
    this.getUserCubeSize = function getUserCubeSize(n) {
        this.hide();
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
        this.t = document.createElement('div');
        this.t.style.position = 'absolute';
        this.t.style.top = '10px';
        this.t.style.width = '100%';
        this.t.style.textAlign = 'center';
        this.t.innerHTML = 'Time: 00:00';
        document.body.appendChild(this.t);
    };
    this.update = function update() {
        if (this.isRunning) {
            var now = Math.floor(this.getElapsedTime() / 1000); //display only up to seconds
            var minutes = Math.floor(now / 60) % 60;
            now -= minutes * 60;
            var seconds = now % 60;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            this.t.innerHTML = 'Time: ' + minutes + ':' + seconds;
        }
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
        this.t.parentNode.removeChild(this.t);
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
                hs.innerHTML = response.data.hs;   
            }
            console.log('Hoooray! recorded your score: ' ,  response);
        }
    };
}