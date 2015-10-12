function startGame(){
    this.highScore=0;

    introScreen=new introScreen();
    timer=new timer();
    theCube = new Cube();
    introScreen.display();
    
}

function introScreen(){
    this.cubeSize=3;
    this.display = function display(){
        timer.display();
        // add other ui controls like user id etc and start button
        // call this.play(); after started
        var size = prompt("Please enter cube size", "3");
        if (size !== null) {
            this.cubeSize = size;
            this.play();
        }
    };
    this.play = function play(){
        //start the Cube
        theCube.initCube(this.cubeSize);
        theCube.scramble(function onComplete(){
            timer.startTimer();
        });
    };
}

function timer(){
    this.startTime = new Date();
    this.now = this.startTime;
    this.isRunning = false;
    this.display = function display(){
        this.t = document.createElement('div');
        this.t.style.position = 'absolute';
        this.t.style.top = '10px';
        this.t.style.width = '100%';
        this.t.style.textAlign = 'center';
        this.t.innerHTML = 'Time: 00:00:00';
        document.body.appendChild(this.t);
    };
    this.update=function update(){
        if(this.isRunning){
            this.now = new Date() - this.startTime;
            var milliseconds = this.now%1000;
            milliseconds =  milliseconds<100 ? '0'+milliseconds : milliseconds;
            milliseconds =  milliseconds<10 ? '0'+milliseconds : milliseconds;
            var seconds = Math.floor(this.now/1000); // #TODO: 20:1800:122 Seconds are not handled properly
            seconds =  seconds<10 ? '0'+seconds : seconds;
            var minutes = Math.floor(this.now/60000);
            minutes =  minutes<10 ? '0'+minutes : minutes; 
            this.t.innerHTML = 'Time: ' + minutes + ':' + seconds + ':' +milliseconds;
            //console.log('Time: '+Date());   
        }
    };
    this.resetTimer = function resetTimer(){
        this.startTime = new Date();
        this.now = this.startTime;
    };
    this.startTimer = function resetTimer(){
        this.isRunning = true;
        this.resetTimer();
    };
}



/*

*/