//global scene variables
var renderer, camera, scene, flashlight;
//declare an array-container for cubicle objects
var cubicles = [];

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
    var cubiclePerSide = 3;
    //set cubicle size
	var CUBICLE_SIZE = 200;
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
    //set colors
    var green = '#009E60';
    var red = "#C41E3A";
    var blue = '#0051BA';
    var yellow = '#FFD500';
    var white = '#FFFFFF';
    var orange = '#FF5800';
    //create the cubiles's geometry
	var cubicleGeometry = new THREE.BoxGeometry(CUBICLE_SIZE, CUBICLE_SIZE, CUBICLE_SIZE );
	//create the cube
	for (var line = 0; line < cubiclePerSide; line++){
        for (var cubicle = 0; cubicle < Math.pow(cubiclePerSide,2); cubicle++){
            //skip the core cubes. this helps prevent unnecessary and burdensome rendering. Helps especially as the cube gets bigger.
            if (!(line === 0 || line === (cubiclePerSide - 1))){	//if not the first or last line of the cube
                if (!((Math.floor(cubicle/cubiclePerSide) == (cubiclePerSide - 1)) || (Math.floor(cubicle/cubiclePerSide) === 0))){	//if not the first or the last row
                    if (!((cubicle % cubiclePerSide == (cubiclePerSide - 1)) || (cubicle % cubiclePerSide === 0))){  //if not first or the last cubicle of the current raw
                        continue;	//skip and don't draw
                    }}}
            //end of the 'skipper'
            var mesh = new THREE.Mesh(cubicleGeometry,//new THREE.MeshPhongMaterial({transparent: true, opacity: 0.3, color: red}));
                new THREE.MeshFaceMaterial([new THREE.MeshPhongMaterial({color: white, map: THREE.ImageUtils.loadTexture("images/cube_colors/white_center.png")}),    //right - white
                                            new THREE.MeshPhongMaterial({color: yellow, map: THREE.ImageUtils.loadTexture("images/cube_colors/yellow_center.png")}),   //left - yellow
                                            new THREE.MeshPhongMaterial({color: red, map: THREE.ImageUtils.loadTexture("images/cube_colors/red_center.png")}),      //top - red
                                            new THREE.MeshPhongMaterial({color: orange, map: THREE.ImageUtils.loadTexture("images/cube_colors/orange_center.png")}),   //bottom - orange
                                            new THREE.MeshPhongMaterial({color: blue, map: THREE.ImageUtils.loadTexture("images/cube_colors/blue_center.png")}),     //fromt - blue
                                            new THREE.MeshPhongMaterial({color: green, map: THREE.ImageUtils.loadTexture("images/cube_colors/green_center.png")})])); //back - green 
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
}



//redraw everything in case of window size change
function onWindowResize(e) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

setup();







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