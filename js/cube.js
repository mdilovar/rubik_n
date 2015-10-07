//global scene variables
var renderer, camera, scene, flashlight;
//...cubies and cube config vars
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
	//setup the Cube
	createCube();
	//add window resize listener to redraw everything in case of windaw size change
	window.addEventListener('resize', onWindowResize, false);
}

function createCube(){
    //number of cubies per side. the N in NxNxN
    cubiesPerAxis = 3;
    //set cubicle size
	cubieSize = 200;
	//add eventscontrols object for moving the cube's sides
	eControls = new EventsControls(camera, renderer.domElement);
	//define mouseover actions
	eControls.attachEvent('mouseOver', function () {
        //cahnge cursor to poiner when hovering over a cubicle
		this.container.style.cursor = 'pointer';
		//lighten the hovered cubicle
		this.mouseOvered.currentHex=[];
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

	//create a Cube object witht the cubies array. This object will get updates when the cube state is changed.
	theCube = new Cube(cubiesPerAxis,cubieSize);
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
        if (e.keyCode == 84){ //t
            theCube.busy = true;
            theCube.rotateTopFace();
        }else if(e.keyCode == 66){ //b
            theCube.busy = true;
            theCube.rotateBottomFace();
        }else if(e.keyCode == 76){ //l
            theCube.busy = true;
            theCube.rotateLeftFace();
        }else if(e.keyCode == 82){ //r
            theCube.busy = true;
            theCube.rotateRightFace();
        }else if(e.keyCode == 70){ //f
            theCube.busy = true;
            theCube.rotateFrontFace();
        }else if(e.keyCode == 80){ //p
            theCube.busy = true;
            theCube.rotateBackFace();
        }
    }
    if (e.keyCode == 81){
        for (var i in theCube.cubies){
            scene.remove(theCube.cubies[i]);
        }
        theCube = new Cube(cubiesPerAxis,cubieSize);
    }
}

function Cube (cubiesPerAxis,cubieSize) {
    this.cubies=[]; //declare an array-container for cubie objects
    this.cubiesPerPlane = Math.pow(cubiesPerAxis,2);
    this.tempArr=[];
    this.pivot = new THREE.Object3D(); //create a rotation pivot for the group
    this.axis = 'x'; //axis of rotation
    this.face =[];
    this.memArr =[];
    this.busy = false;
    this.getCubieMesh = function getCubieMesh(x,y,z){ console.log(x,y,z);
        var colors = {  green: '#009E60', red: '#8A0413', 
                        blue: '#0051BA', yellow: '#FFD500', 
                        white: '#FFFFFF', orange:'#F84704', 
                        black: '#000000'};
        var color_right = colors.white, color_left = colors.yellow, 
            color_top = colors.red, color_bottom = colors.orange,
            color_front = colors.blue, color_back = colors.green;
        var texture_right = THREE.ImageUtils.loadTexture("images/colors_512/white.png"), 
            texture_left = THREE.ImageUtils.loadTexture("images/colors_512/yellow.png"), 
            texture_top = THREE.ImageUtils.loadTexture("images/colors_512/red.png"), 
            texture_bottom = THREE.ImageUtils.loadTexture("images/colors_512/orange.png"), 
            texture_front = THREE.ImageUtils.loadTexture("images/colors_512/blue.png"), 
            texture_back = THREE.ImageUtils.loadTexture("images/colors_512/green.png");
        //set the invisible sides to black
        if (x > 0){
            color_left = colors.black;
            texture_left = null;
        }
        if (x < cubiesPerAxis-1){
            color_right = colors.black;
            texture_right = null;
        }
        if (y > 0){
            color_bottom = colors.black;
            texture_bottom = null;
        }
        if (y < cubiesPerAxis-1){
            color_top = colors.black;
            texture_top = null;
        }
        if (z > 0){
            color_back = colors.black;
            texture_back = null;
        }
        if (z < cubiesPerAxis-1){
            color_front = colors.black;
            texture_front = texture_right;
        }
        //create the cubies's geometry
        var cubieGeometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
        //create the cubies's material
        var cubieMaterial = new THREE.MeshFaceMaterial([
            new THREE.MeshPhongMaterial({color: color_right, map: texture_right}),//right - white
            new THREE.MeshPhongMaterial({color: color_left, map: texture_left}),//left - yellow
            new THREE.MeshPhongMaterial({color: color_top, map: texture_top}),//top - red
            new THREE.MeshPhongMaterial({color: color_bottom, map: texture_bottom}),//bottom - orange
            new THREE.MeshPhongMaterial({color: color_front, map: texture_front}),//fromt - blue
            new THREE.MeshPhongMaterial({color: color_back, map: texture_back})]); //back - green
        //create and return the cubie mesh
        return new THREE.Mesh(cubieGeometry, cubieMaterial);
    };
    this.initCube = function initCube(){
        //create the cube
        for (var z = 0; z < cubiesPerAxis; z++){
            for (var y = 0; y < cubiesPerAxis; y++){
                for (var x = 0; x < cubiesPerAxis; x++){
                    /*
                        //skip the core cubes. this helps prevent unnecessary and burdensome rendering. Helps especially as the cube gets bigger.
                if (!(line === 0 || line === (cubiclePerSide - 1))){	//if not the first or last line of the cube
                    if (!((Math.floor(cubicle/cubiclePerSide) == (cubiclePerSide - 1)) || (Math.floor(cubicle/cubiclePerSide) === 0))){	//if not the first or the last row
                        if (!((cubicle % cubiclePerSide == (cubiclePerSide - 1)) || (cubicle % cubiclePerSide === 0))){  //if not first or the last cubicle of the current raw
                            continue;	//skip and don't draw
                        }}}
                //end of the 'skipper'
                */
                    var cubieMesh = this.getCubieMesh(x,y,z);
                    //set coordinates correction value calculated so that the cube overall falls in the center of the scene
                    coordCorrection = -((cubiesPerAxis-1) * cubieSize)/2;
                    //give the coordinates of the cube
                    cubieMesh.position.x = coordCorrection + x * cubieSize;// (cubieSize + 100);
                    cubieMesh.position.y = coordCorrection + y * cubieSize;// (cubieSize + 100);
                    cubieMesh.position.z = coordCorrection + z * cubieSize;// (cubieSize + 100);
                    //add the cube to the scene
                    scene.add(cubieMesh); console.log(scene);
                    //push the object to cubies objects array for later actions.
                    this.cubies.push(cubieMesh);
                    //make sure eventcontrol knows about the all the cubies (eventcontrol is used for manipulating teh cube)
                    eControls.attach(cubieMesh);
                }
            }
        }
    };
    this.initCube();

    this.updateCubiesOrder = function updateCubiesOrder(memArr,faceArr){
        //update the this.cubies "matrix" so that it matches the new "physical" locations of the cubies.
        //memArr - is the reference array that matches the position id to the physical cubicle id occupying it
        //faceArr is the array that holds current face cubies
        for (var k=0; k < this.cubiesPerPlane; k++){
            var x = k % cubiesPerAxis;
            var y = Math.floor(k/cubiesPerAxis);
            var newX = cubiesPerAxis - y - 1;
            var newY = x;
            var newPos = newY * cubiesPerAxis + newX;
            this.cubies[memArr[newPos]] = faceArr[k];  
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
                            //update this.cubies after movement
                            this.updateCubiesOrder(this.memArr,this.face);
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
                            //update this.cubies after movement
                            this.updateCubiesOrder(this.memArr,this.face);
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
                            //update this.cubies after movement
                            this.updateCubiesOrder(this.memArr,this.face);
                            theCube.busy = false;
                        }
                    }
                    break;
                default:
                    if (this.pivot.rotation.y > - Math.PI/2){
                        this.pivot.rotation.y -= 0.1;
                        this.pivot.updateMatrixWorld();
                    }else if (this.pivot.rotation.y < -Math.PI/2){
                        this.pivot.rotation.y = -Math.PI/2;
                        this.pivot.updateMatrixWorld();
                        for (var m in this.face) {
                            //this.face[j].updateMatrixWorld(); // if not done by the renderer
                            this.face[m].applyMatrix(this.pivot.matrixWorld);
                            scene.remove(this.pivot);
                            this.pivot.remove(this.face[m]);
                            scene.add(this.face[m]);
                            //update this.cubies after movement
                            this.updateCubiesOrder(this.memArr,this.face);
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
    this.rotateBackFace = function rotateBackFace(){
        var myFace = [];
        var memArr = [];
        var from = 0;
        var thru = this.cubiesPerPlane;
        for (var c in this.cubies){
            if (c >= from && c < thru) {
                myFace.push(this.cubies[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'z',memArr);

    };
    this.rotateFrontFace = function rotateFrontFace(){
        var myFace = [];
        var memArr = [];
        var from = this.cubies.length - this.cubiesPerPlane;
        var thru = this.cubies.length;
        for (var c in this.cubies){
            if (c >= from && c < thru) {
                myFace.push(this.cubies[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'z',memArr);
    };
    this.rotateRightFace = function rotateRightFace(){
        var myFace = [];
        var memArr = [];
        for (var c in this.cubies){
            if ((c % cubiesPerAxis) === 0) {
                myFace.push(this.cubies[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'x',memArr);
    };
    this.rotateLeftFace = function rotateLeftFace(){
        var myFace = [];
        var memArr = [];
        for (var c in this.cubies){
            if ((c % cubiesPerAxis) == (cubiesPerAxis-1)){
                myFace.push(this.cubies[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'x',memArr);
    };
    this.rotateBottomFace = function rotateBottomFace(){
        var myFace = [];
        var memArr = [];
        for (var c in this.cubies){
            //c%9 >= 0 && c%9 < 3-1
            //console.log(c % this.cubiesPerPlane);
            //console.log(cubiclePerSide-1);
            if (((c % this.cubiesPerPlane) >= 0) && ((c % this.cubiesPerPlane) < (cubiesPerAxis))){
                console.log(c);
                myFace.push(this.cubies[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'-y',memArr);
    };
    this.rotateTopFace = function rotateTopFace(){
        var myFace = [];
        var memArr = [];
        for (var c in this.cubies){
            //c%9 >= 9-3 && c%9 < 9
            if (((c % this.cubiesPerPlane) >= this.cubiesPerPlane-cubiesPerAxis) && ((c % this.cubiesPerPlane) < (this.cubiesPerPlane))){
                myFace.push(this.cubies[c]);
                memArr.push(c);
            }
        }
        this.rotateFace(myFace,'-y',memArr);
    };
    this.getMiddleX = function getMiddleX(middleSliceNumber){
        //returns a Object3D group with the cubies currently at the middle layer parallel to x axis of the Cube
        group = new THREE.Object3D(); // create an empty group
        middleSliceNumber = middleSliceNumber || 0;// for cubes with cubiclePerSide larger than 3 there will  be more than one one layer. middleSliceNumber specifies which slice is needed.
        var from = 1 + this.cubiclesPerPlane * (middleSliceNumber + 1);
        var thru = from + this.cubiclesPerPlane;
        console.log("from thru".concat(from).concat(thru));
        for (var c in  this.cubies.slice(from, thru)){
            group.add(this.cubies[c]);
        }
        return group;
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