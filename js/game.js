function startGame(){
    this.highScore=0;

    introScreen=new introScreen();
    timer=new timer();
    theCube = new Cube();
    introScreen.display();
    
}

function introScreen(){
    this.cubeSize=3;
    this.display = function display(){/*
        // add other ui controls like user id etc and start button
        this.html = document.createElement('div');
        this.html.style.position = 'absolute';
        this.html.style.top = '10px';
        this.html.style.width = '100%';
        this.html.style.textAlign = 'center';
        this.html.innerHTML = '<form>  First name:<br>  <input type="text" name="firstname">  <br>  Last name:<br>  <input type="text" name="lastname"></form>';
        document.body.appendChild(this.html);*/
        var size = window.prompt("cuebe size: ","3");
        if (size !== null) {
            this.cubeSize = size;
           this.play();
        }
    };
    this.play = function play(){
        timer.display();
        //start the Cube
        theCube.initCube(this.cubeSize,function onIsSolved(){
            timer.stop();
            alert('Hoooray! your time: '+Math.floor(timer.getElapsedTime()/1000)+' seconds.')
        });
        theCube.scramble(function onComplete(){
            timer.start();
        });
    };
}

function timer(){
    this.startTime = Math.floor(Date.now());
    this.isRunning = false;
    this.display = function display(){
        this.t = document.createElement('div');
        this.t.style.position = 'absolute';
        this.t.style.top = '10px';
        this.t.style.width = '100%';
        this.t.style.textAlign = 'center';
        this.t.innerHTML = 'Time: 00:00';
        document.body.appendChild(this.t);
    };
    this.update=function update(){
        if(this.isRunning){
            var now = Math.floor(this.getElapsedTime()/1000); //display only up to seconds
            var minutes = Math.floor(now/60) % 60;
            now -= minutes * 60;
            var seconds = now % 60;
            seconds =  seconds<10 ? '0'+seconds : seconds;
            minutes =  minutes<10 ? '0'+minutes : minutes; 
            this.t.innerHTML = 'Time: ' + minutes + ':' + seconds;
        }
    };
    this.getElapsedTime  = function getElapsedTime(){
        return Math.floor(Date.now()) - this.startTime;
    };
    this.reset = function reset(){
        this.startTime = Math.floor(Date.now());
    };
    this.start = function start(){
        this.reset();
        this.isRunning = true;
    };
    this.stop = function stop(){
        this.isRunning = false;
    };
}