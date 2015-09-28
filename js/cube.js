//global scene variables
var renderer, camera, scene, flashlight, raycaster, mouseV;
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
	//add a projector and a mousev for raypicking
    raycaster = new THREE.Raycaster();
    mouseV = new THREE.Vector2();
	//add mosemove listener for rotating the cube sides (using raypicking)
	renderer.domElement.addEventListener('mousemove', canvasMouseMove, false);
	//add window resize listener to redraw everything in case of windaw size change
	window.addEventListener('resize', onWindowResize, false);
}

function createCube(){
    //number of cubicles per side. the N in NxNxN
    var cubiclePerSide = 3;
    //set cubicle size
	var CUBICLE_SIZE = 200;
    //set colors
    var green = '#009E60';
    var red = "#C41E3A";
    var blue = '#0051BA';
    var yellow = '#FFD500';
    var white = '#FFFFFF';
    var orange = '#FF5800';
    //create the cubecles' materials
    materials = [];
    materials.green = new THREE.MeshPhongMaterial({color: green, map: THREE.ImageUtils.loadTexture("images/cube_colors/green_center.png")});
    materials.red = new THREE.MeshPhongMaterial({color: red, map: THREE.ImageUtils.loadTexture("images/cube_colors/red_center.png")});
    materials.blue = new THREE.MeshPhongMaterial({color: blue, map: THREE.ImageUtils.loadTexture("images/cube_colors/blue_center.png")});
    materials.yellow = new THREE.MeshPhongMaterial({color: yellow, map: THREE.ImageUtils.loadTexture("images/cube_colors/yellow_center.png")});
    materials.white = new THREE.MeshPhongMaterial({color: white, map: THREE.ImageUtils.loadTexture("images/cube_colors/white_center.png")});
    materials.orange = new THREE.MeshPhongMaterial({color: orange, map: THREE.ImageUtils.loadTexture("images/cube_colors/orange_center.png")});
    materials.crate = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture("images/crate.gif")});
    materials.experiment = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture("images/green_middle.png")});
    materials.experiment_red = new THREE.MeshPhongMaterial({color: red, map: THREE.ImageUtils.loadTexture("images/cube_colors/red_center.png")});
	//create the cubiles's geometry
	var cubicleGeometry = new THREE.BoxGeometry(CUBICLE_SIZE, CUBICLE_SIZE, CUBICLE_SIZE );
	//create the cube
	for (var line = 0; line < cubiclePerSide; line++){
        for (var cubicle = 0; cubicle < Math.pow(cubiclePerSide,2); cubicle++){
            var mesh = new THREE.Mesh(cubicleGeometry, 
                new THREE.MeshFaceMaterial([materials.white,    //right - white
                                            materials.yellow,   //left - yellow
                                            materials.red,      //top - red
                                            materials.orange,   //bottom - orange
                                            materials.blue,     //fromt - blue
                                            materials.green])); //back - back
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
            cubicles.push(mesh);
        }
	}
}

function draw(){
    //setup animation loop
    requestAnimationFrame(draw);
    //used by OrbitControls or TrackballControls for camera movement.
    controls.update();
    //render the scene with the camera
    renderer.render(scene, camera);
}

//helps user move the cube sides
function canvasMouseMove(e){
    //mouseV.x = 2 * (e.clientX / window.innerWidth) - 1;
    //mouseV.y = 1 - 2 * ( e.clientY / window.innerWidth );
    mouseV.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouseV.y = 1 - 2 * (e.clientY / window.innerHeight);
    //console.log(mouseV);
    //update raycaser	
	raycaster.setFromCamera(mouseV, camera);
	//find objects intersecting with the ray
	var insects = raycaster.intersectObjects(scene.children);
	for (var i = 0; i < insects.length; i++) {
		//insects[i].object.material.materials[0].color.setRGB( 1.0 - i / insects.length, 0, 0 );
		insects[i].object.rotation.z += 0.01;
		//insects[i].object.visible = ! insects[i].object.visible;
		//console.log(insects[i].object.material);
		//insects[i].object.material.transparent = true;
		//insects[i].object.material.opacity = 1;
	}
}

//redraw everything in case of window size change
function onWindowResize(e) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

setup();















// just some snippets I might use later.
//for (var key in cubicles){
//    if (cubicles.hasOwnProperty(key)) {
//       //console.log(cubicles[key]);
//       cubicles[key].rotation.y += 0.1;
//    }