//global scene variables
var renderer, camera, scene, flashlight;
//declare an array-container for cubicle objects
var cubicles = [];
//...cubicles and cube config vars
var cubiclePerSide, CUBICLE_SIZE;
//..and the Cube object
var theCube;

function setup(){
    //setup all the scene objects
    setupScene();
    //start the animation
    draw();
}

function setupScene(){
    //set the starting width and heigh of the scene
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    //set starting camera attributes
    var VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;
	//create the renderer, the camera, and the scene
	renderer = new THREE.WebGLRenderer({antialias: true});
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene = new THREE.Scene();
	//add ambient light to the scene #TODO: remove this if no need 
	//scene.add( new THREE.AmbientLight( 0xa7a7a7 ) );
	//set the camera starting position
	camera.position.z = 1500;
	// and the camera to the scene
	scene.add(camera);
	//create a flashlight
	flashlight = new THREE.SpotLight(0xffffff, 1.5);
	//add the flashlight to the camera
	camera.add(flashlight);
	flashlight.position.set(0,0,1);
	flashlight.target = camera;
	// set up controls 
	// controls = new THREE.OrbitControls( camera, renderer.domElement ); // OrbitControls has a natural 'up', TrackballControls doesn't.
	controls = new THREE.TrackballControls(camera);
    //start the WebGLRenderer
    renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor( 0xf0f0f0 );
	//attach the renderer canvas to the DOM body
	document.body.appendChild(renderer.domElement);
	//if I ever want to attach it to an element by id:
	//var container = document.getElementById('container');
	//container.appendChild(renderer.domElement);
	//setup the Cube
	createCube();
	//add window resize listener to redraw everything in case of windaw size change
	window.addEventListener('resize', onWindowResize, false);
}

function createCube(){
    //number of cubicles per side. the N in NxNxN
    cubiclePerSide = 4;
    //set cubicle size
	CUBICLE_SIZE = 200;
	//add eventscontrols object for moving the cube's sides
	eControls = new EventsControls(camera, renderer.domElement);
	//define mouseover actions
	eControls.attachEvent('mouseOver', function () {
        //cahnge cursor to poiner when hovering over a cubicle
		this.container.style.cursor = 'pointer';
		//lighten the hovered cubicle
		this.mouseOvered.currentHex=[];
		//theCube.getTop();
        //this.mouseOvered.rotation.y = Math.PI/2;
        //this.mouseOvered.rotateOnAxis(new THREE.Vector3(1,1,1),Math.PI/2);
        //theCube.getMiddleX();
		for(var i in this.mouseOvered.material.materials){
            this.mouseOvered.currentHex[i] = this.mouseOvered.material.materials[i].emissive.getHex();
            this.mouseOvered.material.materials[i].emissive.setHex(0xff0000);
		}
	});
    //define mouuse out actions
	eControls.attachEvent( 'mouseOut', function () {
        //cursor back to normal
		this.container.style.cursor = 'auto';
		//dim the object back to previous level
		for(var i in this.mouseOvered.material.materials){
            this.mouseOvered.material.materials[i].emissive.setHex(this.mouseOvered.currentHex[i]);
		}
	});
	//just key controlled for now
	document.addEventListener("keydown", moveWithKey);
    //set colors
    var green = '#009E60';
    var red = '#8A0413';//"#C41E3A";
    var blue = '#0051BA';
    var yellow = '#FFD500';
    var white = '#FFFFFF';
    var orange = '#F84704'; //'#FF5800';
    //create the cubiles's geometry
	var cubicleGeometry = new THREE.BoxGeometry(CUBICLE_SIZE, CUBICLE_SIZE, CUBICLE_SIZE );
	//create the cube
	for (var line = 0; line < cubiclePerSide; line++){
        for (var cubicle = 0; cubicle < Math.pow(cubiclePerSide,2); cubicle++){/*
            //skip the core cubes. this helps prevent unnecessary and burdensome rendering. Helps especially as the cube gets bigger.
            if (!(line === 0 || line === (cubiclePerSide - 1))){	//if not the first or last line of the cube
                if (!((Math.floor(cubicle/cubiclePerSide) == (cubiclePerSide - 1)) || (Math.floor(cubicle/cubiclePerSide) === 0))){	//if not the first or the last row
                    if (!((cubicle % cubiclePerSide == (cubiclePerSide - 1)) || (cubicle % cubiclePerSide === 0))){  //if not first or the last cubicle of the current raw
                        continue;	//skip and don't draw
                    }}}
            //end of the 'skipper'
            */
            var mesh = new THREE.Mesh(cubicleGeometry,//new THREE.MeshPhongMaterial({transparent: true, opacity: 0.3, color: red}));
                new THREE.MeshFaceMaterial([new THREE.MeshPhongMaterial({color: white, map: THREE.ImageUtils.loadTexture("images/colors_512/white.png")}),    //right - white
                                            new THREE.MeshPhongMaterial({color: yellow, map: THREE.ImageUtils.loadTexture("images/colors_512/yellow.png")}),   //left - yellow
                                            new THREE.MeshPhongMaterial({color: red, map: THREE.ImageUtils.loadTexture("images/colors_512/red.png")}),      //top - red
                                            new THREE.MeshPhongMaterial({color: orange, map: THREE.ImageUtils.loadTexture("images/colors_512/orange.png")}),   //bottom - orange
                                            new THREE.MeshPhongMaterial({color: blue, map: THREE.ImageUtils.loadTexture("images/colors_512/blue.png")}),     //fromt - blue
                                            new THREE.MeshPhongMaterial({color: green, map: THREE.ImageUtils.loadTexture("images/colors_512/green.png")})])); //back - green 
            //set coordinates correction value calculated so that the cube overall fall in the center of the scene
            coordCorrection = -((cubiclePerSide-1) * CUBICLE_SIZE)/2;
            //give the coordinates of the cube
            mesh.position.x = coordCorrection + (cubicle % cubiclePerSide) * CUBICLE_SIZE;
            mesh.position.y = coordCorrection + Math.floor(cubicle/cubiclePerSide) * CUBICLE_SIZE;
            mesh.position.z = coordCorrection + (line % cubiclePerSide) * CUBICLE_SIZE;
            //add edge wireframe #TODO: remove this if not used
            //edges = new THREE.EdgesHelper(mesh, 0x00ff00);
            //scene.add(edges);
            scene.add(mesh);
            //push the object to cubicles objects array for later actions.
            cubicles.push(mesh);
            //make sure eventcontrol knows about the all the cubicles (eventcontrol is used for manipulating teh cube)
            eControls.attach(mesh);
        }
	}
	//create a Cube object witht the cubicles array. This object will get updates when the cube state is changed.
	theCube = new Cube(cubicles);
}

function draw(){
    //setup animation loop
    requestAnimationFrame(draw);
    //used by OrbitControls or TrackballControls for camera movement.
    controls.update();
    //used by EventsControls to update/redraw changes to scene made by ser events
    eControls.update();
    //render the scene with the camera
    renderer.render(scene, camera);
    //
    theCube.update();
}



//redraw everything in case of window size change
function onWindowResize(e) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

setup();

function moveWithKey(e){
    console.log(e.keyCode);
    if (!theCube.busy){
        theCube.busy = true;
        if (e.keyCode == 84){ //t
            theCube.rotateTopFace();
        }else if(e.keyCode == 66){ //b
            theCube.rotateBottomFace();
        }else if(e.keyCode == 76){ //l
            theCube.rotateLeftFace();
        }else if(e.keyCode == 82){ //r
            theCube.rotateRightFace();
        }else if(e.keyCode == 70){ //f
            theCube.rotateFrontFace();
        }else if(e.keyCode == 80){ //p
            theCube.rotateBackFace();
        }
    }
}

function Cube (cubicles) {
    this.cubicles = cubicles;
    this.cubiclesPerPlane = Math.pow(cubiclePerSide,2);
    this.tempArr=[];
    this.pivot = new THREE.Object3D(); //create a rotation pivot for the group
    this.axis = 'x'; //axis of rotation
    this.face =[];
    this.memArr =[];
    this.busy = false;
    this.updateCubiclesOrder = function updateCubiclesOrder(memArr,faceArr){
        //update the this.cubicles "matrix" so that it matches the new "physical" locations of the cubicles.
        //memArr - is the reference array that matches the position id to the physical cubicle id occupying it
        //faceArr is the array that holds current face cubicles
        for (var k=0; k < this.cubiclesPerPlane; k++){
            var x = k % cubiclePerSide;
            var y = Math.floor(k/cubiclePerSide);
            var newX = cubiclePerSide - y - 1;
            var newY = x;
            var newPos = newY * cubiclePerSide + newX;
            this.cubicles[memArr[newPos]] = faceArr[k];  
        }
    };
    this.update = function update (){
        if((this.pivot instanceof THREE.Object3D)) {
            switch(this.axis) {
                case 'x':
                    if (this.pivot.rotation.x < Math.PI/2){
                        this.pivot.rotation.x += 0.1;
                        this.pivot.updateMatrixWorld();
                    }else if (this.pivot.rotation.x > Math.PI/2){
                        this.pivot.rotation.x = Math.PI/2;
                        this.pivot.updateMatrixWorld();
                        for (var j in this.face) {
                            //this.face[j].updateMatrixWorld(); // if not done by the renderer
                            this.face[j].applyMatrix(this.pivot.matrixWorld);
                            scene.remove(this.pivot);
                            this.pivot.remove(this.face[j]);
                            scene.add(this.face[j]);
                            //update this.cubicles after movement
                            this.updateCubiclesOrder(this.memArr,this.face);
                            theCube.busy = false;
                        }
                    }
                    break;
                case 'y':
                    if (this.pivot.rotation.y < Math.PI/2){
                        this.pivot.rotation.y += 0.1;
                        this.pivot.updateMatrixWorld();
                    }else if (this.pivot.rotation.y > Math.PI/2){
                        this.pivot.rotation.y = Math.PI/2;
                        this.pivot.updateMatrixWorld();
                        for (var k in this.face) {
                            //this.face[j].updateMatrixWorld(); // if not done by the renderer
                            this.face[k].applyMatrix(this.pivot.matrixWorld);
                            scene.remove(this.pivot);
                            this.pivot.remove(this.face[k]);
                            scene.add(this.face[k]);
                            //update this.cubicles after movement
                            this.updateCubiclesOrder(this.memArr,this.face);
                            theCube.busy = false;
                        }
                    }
                    break;
                case 'z':
                    if (this.pivot.rotation.z < Math.PI/2){
                        this.pivot.rotation.z += 0.1;
                        this.pivot.updateMatrixWorld();
                    }else if (this.pivot.rotation.z > Math.PI/2){
                        this.pivot.rotation.z = Math.PI/2;
                        this.pivot.updateMatrixWorld();
                        for (var l in this.face) {
                            //this.face[j].updateMatrixWorld(); // if not done by the renderer
                            this.face[l].applyMatrix(this.pivot.matrixWorld);
                            scene.remove(this.pivot);
                            this.pivot.remove(this.face[l]);
                            scene.add(this.face[l]);
                            //update this.cubicles after movement
                            this.updateCubiclesOrder(this.memArr,this.face);
                            theCube.busy = false;
                        }
                    }
                    break;
                default:
                    if (this.pivot.rotation.z < Math.PI/2){
                        this.pivot.rotation.z += 0.1;
                        this.pivot.updateMatrixWorld();
                    }else if (this.pivot.rotation.z > Math.PI/2){
                        this.pivot.rotation.z = Math.PI/2;
                        this.pivot.updateMatrixWorld();
                        for (var m in this.face) {
                            //this.face[j].updateMatrixWorld(); // if not done by the renderer
                            this.face[m].applyMatrix(this.pivot.matrixWorld);
                            scene.remove(this.pivot);
                            this.pivot.remove(this.face[m]);
                            scene.add(this.face[m]);
                            //update this.cubicles after movement
                            this.updateCubiclesOrder(this.memArr,this.face);
                            theCube.busy = false;
                        }
                    }
            }
        }
    };
    this.rotateFace = function rotateFace(face,axis,memArr){
        //remove the group from the scene, add it to the pivot group, rotate and then put it back on the scene
        this.pivot.rotation.set(0, 0, 0);
        this.pivot.updateMatrixWorld();
        for (var i in face) {
            var matrixWorldInverse = new THREE.Matrix4();
            matrixWorldInverse.getInverse(this.pivot.matrixWorld);
            face[i].applyMatrix(matrixWorldInverse);
            scene.remove(face[i]);
            this.pivot.add(face[i]);
        }
        scene.add(this.pivot);
        this.face = face;
        this.axis = axis;
        this.memArr = memArr;
        /* #TODO: some movement history recording should also be done*/
    };
    this.rotateTopFace = function rotateTopFace(){
        var myFace = [];
        var memArr = [];
        var from = 0;
        var thru = this.cubiclesPerPlane;
        for (var c in this.cubicles){
            if (c >= from && c < thru) {
                myFace.push(this.cubicles[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'z',memArr);

    };
    this.rotateBottomFace = function rotateBottomFace(){
        var myFace = [];
        var memArr = [];
        var from = this.cubicles.length - this.cubiclesPerPlane;
        var thru = this.cubicles.length;
        for (var c in this.cubicles){
            if (c >= from && c < thru) {
                myFace.push(this.cubicles[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'z',memArr);
    };
    this.rotateLeftFace = function rotateLeftFace(){
        var myFace = [];
        var memArr = [];
        for (var c in this.cubicles){
            if ((c % cubiclePerSide) === 0) { // if the leftmost cubicle
                myFace.push(this.cubicles[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'x',memArr);
    };
    this.rotateRightFace = function rotateRightFace(){
        var myFace = [];
        var memArr = [];
        for (var c in this.cubicles){
            if ((c % cubiclePerSide) == (cubiclePerSide-1)){ // if the rightmost cubicle
                myFace.push(this.cubicles[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'x',memArr);
    };
    this.rotateFrontFace = function rotateFrontFace(){
        var myFace = [];
        var memArr = [];
        for (var c in this.cubicles){
            //c%9 >= 0 && c%9 < 3-1
            //console.log(c % this.cubiclesPerPlane);
            //console.log(cubiclePerSide-1);
            if (((c % this.cubiclesPerPlane) >= 0) && ((c % this.cubiclesPerPlane) < (cubiclePerSide))){ // if a front cubicle
                console.log(c);
                myFace.push(this.cubicles[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'y',memArr);
    };
    this.rotateBackFace = function rotateBackFace(){
        var myFace = [];
        var memArr = [];
        for (var c in this.cubicles){
            //c%9 >= 9-3 && c%9 < 9
            if (((c % this.cubiclesPerPlane) >= this.cubiclesPerPlane-cubiclePerSide) && ((c % this.cubiclesPerPlane) < (this.cubiclesPerPlane))){ // if a posterior cubicle
                myFace.push(this.cubicles[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'y',memArr);
    };
    this.getTop = function getTop(){
        //returns a Object3D group with the cubicles currently at the top of the Cube

    };
    this.getBottom = function getBottom(){
        //returns a Object3D group with the cubicles currently at the top of the Cube
    };
    this.getBack = function getBack(){
        //returns a Object3D group with the cubicles currently at the back of the Cube
    };
    this.getFront = function getBack(){
        //returns a Object3D group with the cubicles currently at the front of the Cube
    };
    this.getLeft = function getLeft(){
        //returns a Object3D group with the cubicles currently at the left of the Cub
    };
    this.getRight = function getRight(){
        //returns a Object3D group with the cubicles currently at the right of the Cube
    };
    this.getMiddleX = function getMiddleX(middleSliceNumber){
        //returns a Object3D group with the cubicles currently at the middle layer parallel to x axis of the Cube
        group = new THREE.Object3D(); // create an empty group
        middleSliceNumber = middleSliceNumber || 0;// for cubes with cubiclePerSide larger than 3 there will  be more than one one layer. middleSliceNumber specifies which slice is needed.
        var from = 1 + this.cubiclesPerPlane * (middleSliceNumber + 1);
        var thru = from + this.cubiclesPerPlane;
        console.log("from thru".concat(from).concat(thru));
        for (var c in  this.cubicles.slice(from, thru)){
            group.add(this.cubicles[c]);
        }
        return group;
    };
    this.getMiddleY = function getMiddleY(){
        //returns a Object3D group with the cubicles currently at the middle layer parallel to y axis of the Cube
    };
    this.getMiddleZ = function getMiddleZ(){
        //returns a Object3D group with the cubicles currently at the middle layer parallel to Z axis of the Cube
    };
}




/* some incomplete logic for selectively aplying the texture only to the outward faces of the cubicles

if line === 0{	//first line
	top : red
}
if line == cubiclePerSide - 1{	//last line
	bottom : orange
}
if (Math.floor(cubicle/cubiclePerSide) == 0){	//if the first raw of each line
	back : green

}
if (Math.floor(cubicle/cubiclePerSide) == (cubiclePerSide - 1)){	//if the last raw of each line
    fromnt: blue
}



*/



// just some snippets I might use later.
//for (var key in cubicles){
//    if (cubicles.hasOwnProperty(key)) {
//       //console.log(cubicles[key]);
//       cubicles[key].rotation.y += 0.1;
//    }