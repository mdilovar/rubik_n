"use strict";
/*
global THREE EventsControls requestAnimationFrame timer loadGame
*/
//global scene variables
var renderer, camera, scene, flashlight, controls, canvas_div, Detector;
var AXIS = {
    X: "x",
    Y: "y",
    Z: "z"
};
var color_codes = {
    green: '#009E60',
    red: '#8A0413',
    blue: '#0051BA',
    yellow: '#FFD500',
    white: '#FFFFFF',
    orange: '#F84704',
    black: '#000000'
};
var textures = {
    white: THREE.ImageUtils.loadTexture("../images/colors_512/white.png"),
    yellow: THREE.ImageUtils.loadTexture("../images/colors_512/yellow.png"),
    red: THREE.ImageUtils.loadTexture("../images/colors_512/red.png"),
    orange: THREE.ImageUtils.loadTexture("../images/colors_512/orange.png"),
    blue: THREE.ImageUtils.loadTexture("../images/colors_512/blue.png"),
    green: THREE.ImageUtils.loadTexture("../images/colors_512/green.png")
};
var colors = ["green", "red", "blue", "yellow", "white", "orange"];
var colors_normal_order = ["white", "yellow", "red", "orange", "blue", "green"]; // #TODO: replace var colors with this?
//set cubicle size
var cubieSize = 200;
//..and the Cube object
var theCube;
// vars used by mouse controls
var objects = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
    INTERSECTED, SELECTED, SELECTED2, FACE;

function setup() {
    //setup all the scene objects
    setupScene();
    //load the game
    loadGame();
    //start the animation
    draw();
}

function setupScene() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();
    //set the starting width and heigh of the scene
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight * .80;
    //set starting camera attributes
    var VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 20000;
    //create the renderer, the camera, and the scene
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene = new THREE.Scene();
    //set the camera starting position
    camera.position.z = 1500;
    // and the camera to the scene
    scene.add(camera);
    //create a flashlight
    flashlight = new THREE.SpotLight(0xffffff, 1.5);
    //add the flashlight to the camera
    camera.add(flashlight);
    flashlight.position.set(0, 0, 1);
    flashlight.target = camera;
    //start the WebGLRenderer
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0xf0f0f0);
    // render once just for the bg color
    renderer.render(scene, camera);
    //attach the renderer canvas to the DOM body
    canvas_div = document.getElementById('canvas_div');
    canvas_div.appendChild(renderer.domElement);
    // set up controls
    //controls = new THREE.OrbitControls( camera, renderer.domElement ); // OrbitControls has a natural 'up', TrackballControls doesn't.
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.noPan = true;
    //add window resize listener to redraw everything in case of windaw size change
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('mousemove', onCanvasMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onCanvasMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onCanvasMouseUp, false);
    renderer.domElement.addEventListener('touchstart', onCanvasTouchStart, false);
    renderer.domElement.addEventListener('touchend', onCanvasTouchEnd, false);
    renderer.domElement.addEventListener('touchmove', onCanvasTouchMove, false);
}

function onWindowResize(e) {
    //update camera and renderer in case of window size change
    renderer.setSize(window.innerWidth, window.innerHeight * .80);
    camera.aspect = window.innerWidth / (window.innerHeight * .80);
    camera.updateProjectionMatrix();
}

function onCanvasMouseMove(event) {
    event.preventDefault();
    var x = event.offsetX == undefined ? event.layerX : event.offsetX;
    var y = event.offsetY == undefined ? event.layerY : event.offsetY;
    mouse.x = (x / renderer.domElement.width) * 2 - 1;
    mouse.y = -(y / renderer.domElement.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (SELECTED) {
        return;
    }
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            INTERSECTED = intersects[0].object;
        }
        canvas_div.style.cursor = 'pointer';
    }
    else {
        INTERSECTED = null;
        canvas_div.style.cursor = 'auto';
    }
}

function onCanvasMouseDown(event) {
    event.preventDefault();
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        controls.enabled = false;
        SELECTED = intersects[0].object;
        FACE = intersects[0].face;
    }
}

function onCanvasMouseUp(event) {
    event.preventDefault();
    controls.enabled = true;
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        SELECTED2 = intersects[0].object;
        moveWithMouse(SELECTED, SELECTED2, FACE);
    }
    if (INTERSECTED) {
        SELECTED = null;
    }
}

function onCanvasTouchMove(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.touches.length == 1) {
        var x = event.touches[0].pageX - event.touches[0].target.offsetLeft;
        var y = event.touches[0].pageY - event.touches[0].target.offsetTop;
        mouse.x = (x / renderer.domElement.width) * 2 - 1;
        mouse.y = -(y / renderer.domElement.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
    }
}

function onCanvasTouchStart(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.touches.length == 1) {
        onCanvasTouchMove(event);
        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            controls.enabled = false;
            SELECTED = intersects[0].object;
            FACE = intersects[0].face;
        }
    }

}

function onCanvasTouchEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.touches.length == 0) {
        controls.enabled = true;
        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            SELECTED2 = intersects[0].object;
            moveWithMouse(SELECTED, SELECTED2, FACE);
        }
    }
}

function shouldReverseDirection(c1, c2, face) {
    //returns true/1 || false/0: false - right hand rule; true - left hand rule
    var cpx = face.cubiesPerAxis;
    var cps = Math.pow(cpx, 2);
    var negate4y = (face.axis == AXIS.Y) ? true : false; // because y is special :)
    if ((c1 >= (cps - cpx) || (c1 % cpx) === 0) && (c2 >= (cps - cpx) || (c2 % cpx) === 0)) {
        if (c2 > c1) {
            return true ^ negate4y;
        }
        else if (c2 < c1) {
            return false ^ negate4y;
        }
    }
    if ((c1 < cpx || (c1 % cpx) === (cpx - 1)) && (c2 < cpx || (c2 % cpx) === (cpx - 1))) {
        if (c2 > c1) {
            return false ^ negate4y;
        }
        else if (c2 < c1) {
            return true ^ negate4y;
        }
    }
    if ((c1 >= (cps - cpx) || (c1 % cpx) === (cpx - 1)) && (c2 >= (cps - cpx) || (c2 % cpx) === (cpx - 1))) {
        if (c2 > c1) {
            return false ^ negate4y;
        }
        else if (c2 < c1) {
            return true ^ negate4y;
        }
    }
    if ((c1 < cpx || (c1 % cpx) === 0) && (c2 < cpx || (c2 % cpx) === 0)) {
        if (c2 > c1) {
            return true ^ negate4y;
        }
        else if (c2 < c1) {
            return false ^ negate4y;
        }
    }
    return false;
    //throw ('the logic of shouldReverseDirection is faulty. It did not cover this combination of cubelets.');
}

function moveWithMouse(fromCubie, toCubie, face) {
    var landingFaceAxis; //don't rotate the face the mouse pointer clicks, but the layers perpendicular to that face only
    var direction = 0; // 0 - rhr, 1 - lhr
    var fromCubieIndex, toCubieIndex;
    if (!fromCubie || !toCubie) return false;
    if (fromCubie === toCubie) return false;
    var faceColor = colors_normal_order[FACE.materialIndex];
    var curFace;
    var cubieOrientation = fromCubie.userData.orientation;
    for (var w in cubieOrientation) { //determine the landing face's axis
        var i = cubieOrientation[w].indexOf(faceColor);
        if (i > -1) {
            landingFaceAxis = w;
        }
    }
    fromCubie = fromCubie.id;
    toCubie = toCubie.id;
    if (!theCube.busy) {
        for (var s = 1; s <= theCube.cubiesPerAxis; s++) { // s - slice number
            for (var d in AXIS) {
                if (AXIS[d] == landingFaceAxis) continue; // ignore the landing face.
                curFace = theCube.getLayer(AXIS[d], s);
                fromCubieIndex = curFace.cubies.map(function(e) {
                    return e.id;
                }).indexOf(fromCubie);
                toCubieIndex = curFace.cubies.map(function(e) {
                    return e.id;
                }).indexOf(toCubie);
                if (curFace.hasCubie(fromCubie) && curFace.hasCubie(toCubie)) {
                    theCube.busy = true;
                    direction = shouldReverseDirection(fromCubieIndex, toCubieIndex, curFace);
                    theCube.rotateFace(curFace.cubies, curFace.axis, curFace.memArr, direction, function() {
                        if (!theCube.gameHasStarted) {
                            theCube.gameHasStarted = true;
                            theCube.onFirstMove();
                        }
                        if (theCube.isSolved()) theCube.onIsSolved();
                    });
                    return;
                }
            }
        }
    }
}

function Cube() {
    this.cubies = []; //declare an array-container for cubie objects
    this.cubiesPerAxis;
    this.cubiesPerPlane;
    this.pivot = new THREE.Object3D(); //create a rotation pivot for the group
    this.solvedAmiation = {
        obj: new THREE.Object3D(),
        flag: false
    };
    this.busy = false;
    this.rendersPerMove = 26;
    this.animationRequests = [];
    this.updateStep = 0;
    this.gameHasStarted = false;
    this.scrambler;
    this.getCubieMesh = function getCubieMesh(x, y, z) { //console.log(x,y,z);
        var color_right = color_codes.white,
            color_left = color_codes.yellow,
            color_top = color_codes.red,
            color_bottom = color_codes.orange,
            color_front = color_codes.blue,
            color_back = color_codes.green;
        var texture_right = textures.white,
            texture_left = textures.yellow,
            texture_top = textures.red,
            texture_bottom = textures.orange,
            texture_front = textures.blue,
            texture_back = textures.green;
        var has_color = {
            green: true,
            red: true,
            blue: true,
            yellow: true,
            white: true,
            orange: true
        };
        //set the invisible sides to black
        if (x > 0) {
            color_left = color_codes.black;
            texture_left = null;
            has_color.yellow = false;
        }
        if (x < this.cubiesPerAxis - 1) {
            color_right = color_codes.black;
            texture_right = null;
            has_color.white = false;
        }
        if (y > 0) {
            color_bottom = color_codes.black;
            texture_bottom = null;
            has_color.orange = false;
        }
        if (y < this.cubiesPerAxis - 1) {
            color_top = color_codes.black;
            texture_top = null;
            has_color.red = false;
        }
        if (z > 0) {
            color_back = color_codes.black;
            texture_back = null;
            has_color.green = false;
        }
        if (z < this.cubiesPerAxis - 1) {
            color_front = color_codes.black;
            texture_front = null;
            has_color.blue = false;
        }
        //create the cubies's geometry
        var cubieGeometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
        var cubieMaterial;
        //create the cubies's material
        if (this.cubiesPerAxis > 5) { // #TODO: this val can be changed so that larde cube can be rendered without texture
            //load without texture if the cube is too big
            cubieMaterial = new THREE.MeshFaceMaterial([
                new THREE.MeshBasicMaterial({
                    color: color_right
                }), //right - white
                new THREE.MeshBasicMaterial({
                    color: color_left
                }), //left - yellow
                new THREE.MeshBasicMaterial({
                    color: color_top
                }), //top - red
                new THREE.MeshBasicMaterial({
                    color: color_bottom
                }), //bottom - orange
                new THREE.MeshBasicMaterial({
                    color: color_front
                }), //fromt - blue
                new THREE.MeshBasicMaterial({
                    color: color_back
                })
            ]); //back - green
        }
        else {
            cubieMaterial = new THREE.MeshFaceMaterial([
                new THREE.MeshPhongMaterial({
                    color: color_right,
                    map: texture_right
                }), //right - white
                new THREE.MeshPhongMaterial({
                    color: color_left,
                    map: texture_left
                }), //left - yellow
                new THREE.MeshPhongMaterial({
                    color: color_top,
                    map: texture_top
                }), //top - red
                new THREE.MeshPhongMaterial({
                    color: color_bottom,
                    map: texture_bottom
                }), //bottom - orange
                new THREE.MeshPhongMaterial({
                    color: color_front,
                    map: texture_front
                }), //fromt - blue
                new THREE.MeshPhongMaterial({
                    color: color_back,
                    map: texture_back
                })
            ]); //back - green
        }
        //create and return the cubie mesh
        var cubieMesh = new THREE.Mesh(cubieGeometry, cubieMaterial); //new THREE.MeshNormalMaterial( { transparent: true, opacity: 0.5 });
        cubieMesh.userData.has_color = has_color;
        cubieMesh.userData.orientation = {
            x: ['white', 'yellow'],
            y: ['red', 'orange'],
            z: ['blue', 'green']
        };
        //x - LR
        //z - FB
        //y - UD
        return cubieMesh;
    };
    this.initCube = function initCube(size, onIsSolved, onFirstMove) {
        this.cubiesPerAxis = size * 1 || 3;
        this.cubiesPerPlane = Math.pow(this.cubiesPerAxis, 2);
        this.onIsSolved = onIsSolved;
        this.onFirstMove = onFirstMove;
        // set max and min zoom (depends on the cube size and degree)
        controls.minDistance = 2.5 * this.cubiesPerAxis * cubieSize;
        controls.maxDistance = camera.far - 2.5 * this.cubiesPerAxis * cubieSize;
        //create the cube
        for (var z = 0; z < this.cubiesPerAxis; z++) {
            for (var y = 0; y < this.cubiesPerAxis; y++) {
                for (var x = 0; x < this.cubiesPerAxis; x++) {
                    //skip the core cubes. this helps prevent unnecessary and burdensome rendering. Helps especially as the cube gets bigger.
                    if (!(z === 0 || z === (this.cubiesPerAxis - 1))) { //if not the first or last line of the cube
                        if (!(x === 0 || x === (this.cubiesPerAxis - 1))) { //if not the first or the last row
                            if (!(y === 0 || y === (this.cubiesPerAxis - 1))) { //if not first or the last cubicle of the current raw
                                //add to the cubies array an empty 3d object entry but and don't draw anything
                                this.cubies.push(new THREE.Object3D());
                                continue;
                            }
                        }
                    }
                    //end of the 'skipper'
                    var cubieMesh = this.getCubieMesh(x, y, z);
                    //set coordinates correction value calculated so that the cube overall falls in the center of the scene
                    var coordCorrection = -((this.cubiesPerAxis - 1) * cubieSize) / 2;
                    //give the coordinates of the cube
                    cubieMesh.position.x = coordCorrection + x * cubieSize; // (cubieSize + 100);
                    cubieMesh.position.y = coordCorrection + y * cubieSize; // (cubieSize + 100);
                    cubieMesh.position.z = coordCorrection + z * cubieSize; // (cubieSize + 100);
                    //add the cube to the scene
                    scene.add(cubieMesh); //console.log(scene);
                    //push the object to cubies objects array for later actions.
                    this.cubies.push(cubieMesh);
                    //make sure eventcontrol knows about the all the cubies (eventcontrol is used for manipulating teh cube)
                    // /eControls.attach(cubieMesh);
                    objects.push(cubieMesh); // for mouse control
                }
            }
        }
    };
    this.scramble = function scramble(onComplete) {
        var randomMoveCount = 3 * theCube.cubiesPerAxis;
        var _this = this;
        var normal_speed = _this.rendersPerMove;
        _this.rendersPerMove = 3; // rotate fast during scrambling

        function recSrcamble(randomMoveCount) {
            var random_direction = Math.round(Math.random());
            var random_sliceNumber = Math.floor(Math.random() * (_this.cubiesPerAxis));
            var random_axis = [AXIS.X, AXIS.Y, AXIS.Z][Math.floor(Math.random() * 3)];
            _this.busy = true;
            var curFace = _this.getLayer(random_axis, random_sliceNumber);
            if (randomMoveCount === 0) { // last scramble move
                _this.rotateFace(curFace.cubies, curFace.axis, curFace.memArr, random_direction, function() {
                    _this.rendersPerMove = normal_speed;
                    onComplete();
                });
            }
            else {
                randomMoveCount--;
                _this.rotateFace(curFace.cubies, curFace.axis, curFace.memArr, random_direction, function() {
                    recSrcamble(randomMoveCount);
                });
            }
        }
        recSrcamble(randomMoveCount);
    };
    this.destroy = function destroy() {
        //clearInterval(this.scrambler); //what ahppens now?
        for (var c in this.cubies) {
            scene.remove(this.cubies[c]);
        }
        objects = [];
        scene.remove(this.solvedAmiation.obj);
        scene.remove(this.pivot);
        this.cubies = [];
        this.cubiesPerAxis;
        this.cubiesPerPlane;
        this.pivot = new THREE.Object3D();
        this.solvedAmiation = {
            obj: new THREE.Object3D(),
            flag: false
        };
        this.busy = false;
        this.rendersPerMove = 26;
        this.animationRequests = [];
        this.updateStep = 0;
        this.gameHasStarted = false;
    };
    this.go360 = function go360() {
        for (var c in this.cubies) {
            scene.remove(this.cubies[c]);
            this.solvedAmiation.obj.add(this.cubies[c]);
        }
        scene.add(this.solvedAmiation.obj);
        this.solvedAmiation.flag = true;
    };
    this.isSolved = function isSolved() {
        // checks if cube is solved
        // for each face cgecks if all colors are the same.(break as soon as any face returns not solved.)
        var nearfar = {
            'near': 0,
            'far': this.cubiesPerAxis - 1
        }; // anterior and posterior on each axis - e.g. front&back on, say z axis, top&bottom on y, etc.
        for (var i in nearfar) {
            for (var d in AXIS) {
                if (!this.getLayer(AXIS[d], nearfar[i]).isFaceUniform()) return false;
            }
        }
        this.busy = true;
        this.go360();
        return true;
    };
    this.updateCubiesOrder = function updateCubiesOrder(memArr, faceArr, dir) {
        //assumes a square matrix
        //updates the this.cubies array permutation. called after each move.
        //memArr - maps the layer cblets' indices with the this.cubies' indicec - each layer has this property.
        //faceArr - is the array that holds current layer's cublets
        var sideLen = Math.sqrt(faceArr.length); // corresponds to cubiesPerAxis
        if (sideLen % 1 !== 0) {
            throw ('not a square matrix.');
        }
        else if (dir === 1) {
            faceArr.reverse(); // because ccw rotation == reverse + cw rotation
        }
        else if (dir !== 0 && dir !== 1) {
            throw ('unknown direction!');
        }
        faceArr.forEach(function(entry, index, array) {
            /* this performs the cw rotation (if after reverse the overall effect will be a ccw rotation) */
            var x = index % sideLen;
            var y = Math.floor(index / sideLen);
            var newX = sideLen - y - 1;
            var newY = x;
            var newPos = newY * sideLen + newX;
            this.cubies[memArr[newPos]] = faceArr[index];
        }, this);
    };
    this.updateCubiesOrientation = function updateCubiesOrientation(faceArr, axis, direction) {
        // #TODO: this could be simplified
        for (var k = 0; k < faceArr.length; k++) {
            if (faceArr[k].userData.orientation) { // the middle placeholder objects don't have this variable.
                if (axis == AXIS.X) {
                    if (direction == 0) {
                        var temp1 = faceArr[k].userData.orientation[AXIS.Y][0];
                        faceArr[k].userData.orientation[AXIS.Y][0] = faceArr[k].userData.orientation[AXIS.Z][1];
                        faceArr[k].userData.orientation[AXIS.Z][1] = faceArr[k].userData.orientation[AXIS.Y][1];
                        faceArr[k].userData.orientation[AXIS.Y][1] = faceArr[k].userData.orientation[AXIS.Z][0];
                        faceArr[k].userData.orientation[AXIS.Z][0] = temp1;
                    }
                    else {
                        var temp1 = faceArr[k].userData.orientation[AXIS.Y][0];
                        faceArr[k].userData.orientation[AXIS.Y][0] = faceArr[k].userData.orientation[AXIS.Z][0];
                        faceArr[k].userData.orientation[AXIS.Z][0] = faceArr[k].userData.orientation[AXIS.Y][1];
                        faceArr[k].userData.orientation[AXIS.Y][1] = faceArr[k].userData.orientation[AXIS.Z][1];
                        faceArr[k].userData.orientation[AXIS.Z][1] = temp1;
                    }
                }
                if (axis == AXIS.Y) {
                    if (direction == 0) {
                        var temp2 = faceArr[k].userData.orientation[AXIS.Z][0];
                        faceArr[k].userData.orientation[AXIS.Z][0] = faceArr[k].userData.orientation[AXIS.X][1];
                        faceArr[k].userData.orientation[AXIS.X][1] = faceArr[k].userData.orientation[AXIS.Z][1];
                        faceArr[k].userData.orientation[AXIS.Z][1] = faceArr[k].userData.orientation[AXIS.X][0];
                        faceArr[k].userData.orientation[AXIS.X][0] = temp2;
                    }
                    else {
                        var temp2 = faceArr[k].userData.orientation[AXIS.Z][0];
                        faceArr[k].userData.orientation[AXIS.Z][0] = faceArr[k].userData.orientation[AXIS.X][0];
                        faceArr[k].userData.orientation[AXIS.X][0] = faceArr[k].userData.orientation[AXIS.Z][1];
                        faceArr[k].userData.orientation[AXIS.Z][1] = faceArr[k].userData.orientation[AXIS.X][1];
                        faceArr[k].userData.orientation[AXIS.X][1] = temp2;
                    }
                }
                if (axis == AXIS.Z) {
                    if (direction == 0) {
                        var temp3 = faceArr[k].userData.orientation[AXIS.Y][0];
                        faceArr[k].userData.orientation[AXIS.Y][0] = faceArr[k].userData.orientation[AXIS.X][0];
                        faceArr[k].userData.orientation[AXIS.X][0] = faceArr[k].userData.orientation[AXIS.Y][1];
                        faceArr[k].userData.orientation[AXIS.Y][1] = faceArr[k].userData.orientation[AXIS.X][1];
                        faceArr[k].userData.orientation[AXIS.X][1] = temp3;
                    }
                    else {
                        var temp3 = faceArr[k].userData.orientation[AXIS.Y][0];
                        faceArr[k].userData.orientation[AXIS.Y][0] = faceArr[k].userData.orientation[AXIS.X][1];
                        faceArr[k].userData.orientation[AXIS.X][1] = faceArr[k].userData.orientation[AXIS.Y][1];
                        faceArr[k].userData.orientation[AXIS.Y][1] = faceArr[k].userData.orientation[AXIS.X][0];
                        faceArr[k].userData.orientation[AXIS.X][0] = temp3;
                    }
                    /*x1 - y1 / y1 - x2 / x2 - y2 / y2 - x1*/
                }
            }
        }
    };
    this.animateRequest = function animateRequest(request) {
        if (!request.inProgress) {
            /*  remove the group from the scene, add it to the pivot group, rotate the pivot
            and then put its contents back on the scene
            */
            request.inProgress = true;
            this.pivot.rotation.set(0, 0, 0);
            this.pivot.updateMatrixWorld();
            for (var i in request.face) {
                var matrixWorldInverse = new THREE.Matrix4();
                matrixWorldInverse.getInverse(this.pivot.matrixWorld);
                request.face[i].applyMatrix(matrixWorldInverse);
                scene.remove(request.face[i]);
                this.pivot.add(request.face[i]);
            }
            scene.add(this.pivot);
        }
        this.pivot.rotation.x += request.rotateTo.x / this.rendersPerMove;
        this.pivot.rotation.y += request.rotateTo.y / this.rendersPerMove;
        this.pivot.rotation.z += request.rotateTo.z / this.rendersPerMove;
        this.pivot.updateMatrixWorld();
        this.updateStep++;
        if (this.updateStep > this.rendersPerMove) { // request completed, wrap it up and call the callback if it has one
            this.pivot.rotation.x = request.rotateTo.x;
            this.pivot.rotation.y = request.rotateTo.y;
            this.pivot.rotation.z = request.rotateTo.z;
            this.pivot.updateMatrixWorld();
            //scene.remove(this.pivot);
            for (var j in request.face) {
                //this.face[j].updateMatrixWorld(); // if not done by the renderer
                request.face[j].applyMatrix(this.pivot.matrixWorld);
                this.pivot.remove(request.face[j]);
                scene.add(request.face[j]);
            }
            //update this.cubies after movement
            this.updateCubiesOrder(request.memArr, request.face, request.direction);
            this.updateCubiesOrientation(request.face, request.axis, request.direction);
            this.animationRequests.shift();
            this.updateStep = 0;
            this.busy = false;
            if (request.callback) request.callback();
        }
    };
    this.update = function update() {
        if (this.animationRequests.length > 0) {
            this.animateRequest(this.animationRequests[0]);
        }
        if (this.solvedAmiation.flag) {
            this.solvedAmiation.obj.rotation.x += (Math.PI / 8) / this.rendersPerMove;
            this.solvedAmiation.obj.rotation.y += (Math.PI / 8) / this.rendersPerMove;
            this.solvedAmiation.obj.rotation.z += (Math.PI / 16) / this.rendersPerMove;
        }
    };
    this.rotateFace = function rotateFace(face, axis, memArr, direction, callback) {
        if (direction !== 0 && direction !== 1) {
            console.log('WARNING! rotate called without direction.');
            console.log(direction);
            direction = 0;
        }
        var request = {
            rotateTo: {
                x: 0,
                y: 0,
                z: 0
            },
            face: face,
            axis: axis,
            memArr: memArr,
            direction: 0, // 0 - rhr
            inProgress: false
        };
        request.direction = direction;
        if (callback) request.callback = callback;
        var rotationSign = (request.direction == 0) ? 1 : -1;
        if (axis == AXIS.X) {
            request.rotateTo.x = rotationSign * Math.PI / 2;
        }
        else if (axis == AXIS.Y) {
            request.rotateTo.y = rotationSign * Math.PI / 2;
        }
        else if (axis == AXIS.Z) {
            request.rotateTo.z = rotationSign * Math.PI / 2;
        }
        this.animationRequests.push(request);
        /* #TODO: some movement history recording should also be done*/
    };
    this.getLayer = function getLayer(axis, sliceNumber) {
        var memArr = [];
        var myFace = [];
        var reverse4y = (axis == AXIS.Y) ? true : false; // because y is special :)
        sliceNumber = typeof sliceNumber !== 'undefined' ? sliceNumber % this.cubiesPerAxis : 1;
        for (var c in this.cubies) {
            if (this.layerFilter(axis, sliceNumber, c)) {
                myFace.push(this.cubies[c]);
                memArr.push(c);
            }
        }
        if (reverse4y) memArr.reverse();
        return new CubeFace(myFace, axis, sliceNumber, memArr);
    };
    this.layerFilter = function layerFilter(axis, sliceNumber, cubletIndex) {
        var c = cubletIndex;
        if (axis == AXIS.X) {
            if ((c % this.cubiesPerAxis) === sliceNumber) {
                return true;
            }
            return false;
        }
        else if (axis == AXIS.Y) {
            if (((c % this.cubiesPerPlane) >= this.cubiesPerAxis * sliceNumber) && ((c % this.cubiesPerPlane) < (this.cubiesPerAxis * (sliceNumber + 1)))) {
                return true;
            }
            return false;
        }
        else if (axis == AXIS.Z) {
            if (c >= (this.cubiesPerPlane * sliceNumber) && c < (this.cubiesPerPlane * (sliceNumber + 1))) {
                return true;
            }
        }
        else {
            throw ('invalid Axis value.');
        }
    };
}

function CubeFace(faceCubies, axis, farnear, memArr) { //rename to CubeLayer; farnear - slice?
    //#TODO: maybe add partially/completely solved checkers to the face class, like cross, full first layer, etc
    this.cubiesPerAxis = Math.sqrt(faceCubies.length);
    if (this.cubiesPerAxis % 1 !== 0) {
        throw ('the facecubies array length must be a square of two.');
    }
    this.memArr = memArr;
    this.axis = axis;
    this.cubies = faceCubies;
    this.faceColor = null;
    this.isFaceLayer = (farnear !== 0 && farnear !== this.cubiesPerAxis - 1) ? false : true;
    if (farnear !== 0) farnear = 1; // can only be front/back, left/right, etc
    var nearfar = 1 - farnear; // swapping the near and the far //throw ('this is not a face layer');
    this.isLayerUniform = function isLayerUniform() { // checks is cubies are in the righ layer regardless of their orientation
        if (!this.isFaceLayer) throw ('this is not a face layer');
        for (var c = 0; c < colors.length; c++) {
            for (var i = 0; i < this.cubies.length; i++) {
                if (!this.cubies[i].userData.has_color[colors[c]]) break;
                if (i == this.cubies.length - 1) {
                    this.faceColor = colors[c];
                    return true;
                }
            }
        }
        return false;
    };
    this.getFaceColor = function getFaceColor() { // may return the face color even if the cubies are in the wrong orientation.
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.faceColor !== null) return this.faceColor;
        if (this.isLayerUniform()) return this.faceColor;
        throw ('Layer not uniform.');
    };
    this.isFaceUniform = function isFaceUniform() { //checks if cbies are in rigth layer and in the right orientation
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (!this.isLayerUniform()) return false; //a face can't be unifor if the layer doesn't have all the right cubies.
        for (var i = 0; i < this.cubies.length; i++) {
            if (this.cubies[i].userData.orientation[axis][nearfar] !== this.faceColor) break; //e.g.[y2]
            if (i == this.cubies.length - 1) return true;
        }
        return false;
    };
    this.hasCubie = function hasCubie(cid) {
        for (var i = 0; i < this.cubies.length; i++) {
            if (this.cubies[i].id === cid) return true;
        }
        return false;
    };
}

function draw() {
    //setup animation loop
    //setTimeout( function() {
    //    requestAnimationFrame( draw );
    //}, 1000 / 30 );
    requestAnimationFrame(draw);
    //used by OrbitControls or TrackballControls for camera movement.
    controls.update();
    //render the scene with the camera
    renderer.render(scene, camera);
    //update the cube and the timer
    theCube.update();
    timer.update();
}

setup();