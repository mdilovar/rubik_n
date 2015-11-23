/**
 * @author Miri Manzarshohi Dilovar
*/
"use strict";
/*global THREE CubeLayer AXIS colors_normal_order*/

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
    this.history = [];
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
        //CubeletType
        if (z === this.cubiesPerAxis - 1 && x === this.cubiesPerAxis - 1 && y === this.cubiesPerAxis - 1 ||
            z === this.cubiesPerAxis - 1 && x === this.cubiesPerAxis - 1 && y === 0 ||
            z === this.cubiesPerAxis - 1 && x === 0 && y === this.cubiesPerAxis - 1 ||
            z === 0 && x === this.cubiesPerAxis - 1 && y === this.cubiesPerAxis - 1 ||
            z === 0 && x === 0 && y === this.cubiesPerAxis - 1 ||
            z === 0 && x === this.cubiesPerAxis - 1 && y === 0 ||
            z === this.cubiesPerAxis - 1 && x === 0 && y === 0 ||
            z === 0 && x === 0 && y === 0) {
            cubieMesh.CubeletType = CubeletType.CORNER;
            //cubieMesh.visible = false;
        }
        else if (z < this.cubiesPerAxis - 1 && z > 0 && y < this.cubiesPerAxis - 1 && y > 0 ||
            z < this.cubiesPerAxis - 1 && z > 0 && x < this.cubiesPerAxis - 1 && x > 0 ||
            x < this.cubiesPerAxis - 1 && x > 0 && y < this.cubiesPerAxis - 1 && y > 0) {
            cubieMesh.CubeletType = CubeletType.MIDDLE;
            //cubieMesh.visible = false;
        }
        else {
            cubieMesh.CubeletType = CubeletType.EDGE;
            //cubieMesh.visible = false;
        }
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
        var randomMoveCount = 5 * this.cubiesPerAxis;
        // var randomMoveCount = 0;
        var _this = this;
        var normal_speed = _this.rendersPerMove;
        _this.rendersPerMove = 10; // rotate fast during scrambling

        function recSrcamble(randomMoveCount) {
            var random_direction = Math.round(Math.random());
            var random_sliceNumber = Math.floor(Math.random() * (_this.cubiesPerAxis));
            var random_axis = [AXIS.X, AXIS.Y, AXIS.Z][Math.floor(Math.random() * 3)];
            _this.busy = true;
            var curFace = _this.getLayer(random_axis, random_sliceNumber);
            if (randomMoveCount === 0) { // last scramble move
                _this.rotateFace(curFace, random_direction, false, function() {
                    _this.rendersPerMove = normal_speed;
                    onComplete();
                });
            }
            else {
                randomMoveCount--;
                _this.rotateFace(curFace, random_direction, false, function() {
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
    this.updateCubiesOrder = function updateCubiesOrder(request) {
        //assumes a square matrix
        //updates the this.cubies array permutation. called after each move.
        //memArr - maps the layer cblets' indices with the this.cubies' indicec - each layer has this property.
        //faceArr - is the array that holds current layer's cubelets
        var sideLen = Math.sqrt(request.layerObj.cubies.length); // corresponds to cubiesPerAxis
        if (sideLen % 1 !== 0) {
            throw ('not a square matrix.');
        }
        else if (request.direction === 1) {
            request.layerObj.cubies.reverse(); // because ccw rotation == reverse + cw rotation
        }
        else if (request.direction !== 0 && request.direction !== 1) {
            throw ('unknown direction!');
        }
        request.layerObj.cubies.forEach(function(entry, index, array) {
            /* this performs the cw rotation (if after reverse the overall effect will be a ccw rotation) */
            var x = index % sideLen;
            var y = Math.floor(index / sideLen);
            var newX = sideLen - y - 1;
            var newY = x;
            var newPos = newY * sideLen + newX;
            this.cubies[request.layerObj.memArr[newPos]] = request.layerObj.cubies[index];
        }, this);
    };
    this.updateCubiesOrientation = function updateCubiesOrientation(request) {
        // #TODO: this could be simplified
        var faceArr = request.layerObj.cubies,
            axis = request.layerObj.axis,
            direction = request.direction;
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
            for (var i in request.layerObj.cubies) {
                var matrixWorldInverse = new THREE.Matrix4();
                matrixWorldInverse.getInverse(this.pivot.matrixWorld);
                request.layerObj.cubies[i].applyMatrix(matrixWorldInverse);
                scene.remove(request.layerObj.cubies[i]);
                this.pivot.add(request.layerObj.cubies[i]);
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
            for (var j in request.layerObj.cubies) {
                //this.face[j].updateMatrixWorld(); // if not done by the renderer
                request.layerObj.cubies[j].applyMatrix(this.pivot.matrixWorld);
                this.pivot.remove(request.layerObj.cubies[j]);
                scene.add(request.layerObj.cubies[j]);
            }
            //update this.cubies after movement
            this.updateCubiesOrder(request);
            this.updateCubiesOrientation(request);
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
            this.solvedAmiation.obj.rotation.y += (Math.PI / 16) / this.rendersPerMove;
            //this.solvedAmiation.obj.rotation.z += (Math.PI / 16) / this.rendersPerMove;
        }
    };
    this.undo = function undo(depth) {
        var moveCount = (typeof depth !== 'undefined') && (depth < this.history.length) ? depth : this.history.length;
        var _this = this;
        var normal_speed = _this.rendersPerMove;
        _this.rendersPerMove = _this.rendersPerMove; //3;

        function recUndo(moveCount) {
            var lastMove = _this.history.pop(); // note: this deletes history irreversibly
            if (typeof lastMove === 'undefined') return;
            var direction = (lastMove.direction === 0) ? 1 : 0; // rotate in the opposite direction
            _this.busy = true;
            var curFace = _this.getLayer(lastMove.axis, lastMove.layer);
            if (moveCount === 1) { // last move
                _this.rotateFace(curFace, direction, true, function() {
                    _this.rendersPerMove = normal_speed;
                });
            }
            else {
                moveCount--;
                _this.rotateFace(curFace, direction, true, function() {
                    recUndo(moveCount);
                });
            }
        }
        recUndo(moveCount);
    };
    this.rotateFace = function rotateFace(layerObj, direction, isUndo, callback) {
        isUndo = typeof isUndo !== 'undefined' ? isUndo : false;
        if (!isUndo) {
            this.history.push({
                axis: layerObj.axis,
                layer: layerObj.layer,
                direction: direction
            });
        }
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
            layerObj: layerObj,
            direction: 0, // 0 - rhr
            inProgress: false
        };
        request.direction = direction;
        if (callback) request.callback = callback;
        var rotationSign = (request.direction == 0) ? 1 : -1;
        if (layerObj.axis == AXIS.X) {
            request.rotateTo.x = rotationSign * Math.PI / 2;
        }
        else if (layerObj.axis == AXIS.Y) {
            request.rotateTo.y = rotationSign * Math.PI / 2;
        }
        else if (layerObj.axis == AXIS.Z) {
            request.rotateTo.z = rotationSign * Math.PI / 2;
        }
        this.animationRequests.push(request);
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
        return new CubeLayer(myFace, axis, sliceNumber, memArr);
    };
    this.getFaceLayersByCubie = function getFaceLayersByCubie(cubelet){
        //get the faces with cubelet with id cid.
        var layers = [];
        var curFace;
        for (var s = 0; s < this.cubiesPerAxis; s++) { // s - slice number
            if (s !== 0 && s !== this.cubiesPerAxis-1) continue; // ignore the middle layers
            for (var d in AXIS) {
                curFace = theCube.getLayer(AXIS[d], s);
                if (curFace.hasCubie(cubelet.id)) {
                    layers.push(curFace);
                }
            }
        }
        return layers;
    };
    this.getFaceLayerByCenterpieceColor = function getFaceLayerByCenterpieceColor(color) {
        if (this.cubiesPerAxis !== 3) throw ('getFaceLayerByCenterpieceColor only works for 3x3x3 cubes!');
        var theCenterPiece = null;
        var theLayer = null;
        var curFace;
        //get the top centerpiece
        this.cubies.forEach(function(cubelet) {
            if (cubelet.CubeletType === CubeletType.MIDDLE) {
                if (cubelet.userData.has_color[color]) {
                    theCenterPiece = cubelet;
                    return;
                }
            }
        });
        //get the face with that centerpiece.
        for (var s = 0; s < theCube.cubiesPerAxis; s++) { // s - slice number
            if (s == 1) continue; // ignore the middle layers
            if (theLayer !== null) break;
            for (var d in AXIS) {
                curFace = theCube.getLayer(AXIS[d], s);
                if (curFace.hasCubie(theCenterPiece.id)) {
                    theLayer = curFace;
                    break;
                }
            }
        }
        return theLayer;
    };
    this.getCubeletsByColor = function getCubeletsByColor(color, type) {
        // not for rotation, the cubies might be on different layers.
        color = typeof color !== 'undefined' ? colors_normal_order.indexOf(color) : null;
        type = typeof type !== 'undefined' ? type : null;
        console.log(color, type);
        if ((color === -1 || color === null) && !type) throw ('please provide at least one of either the color or type of the of the cubelets.');
        var cubelets = [];
        for (var c in this.cubies) {
            if (color !== null) {
                if (type !== null) {
                    if (this.cubies[c].CubeletType !== type) continue;
                }
                if (this.filterCubiesByColor(color, c)) cubelets.push(this.cubies[c]);
            }
            else {
                if (type !== null) {
                    if (this.cubies[c].CubeletType === type) cubelets.push(this.cubies[c]);
                }
            }
        }
        return cubelets;
    };
    this.layerFilter = function layerFilter(axis, sliceNumber, cubeletIndex) {
        var c = cubeletIndex;
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
    this.filterCubiesByColor = function filterCubiesByColor(color, cubeletIndex) {
        var c = cubeletIndex;
        if (this.cubies[c].userData.has_color) {
            if (this.cubies[c].userData.has_color[colors_normal_order[color]]) return true;
        }
        return false;
    };
    this.getCubeletByColorsAndType = function getCubeletByColorsAndType(colors, type) {
        // colors - array of colors. ex. ['white','yellow']
        // ex var res = getCubeletByColor(['red','white','green'], 3);
        if (!colors || !type) {
            throw ('both colors and type are required');
        }
        return this.cubies.filter(function(cubelet) {
            if (typeof cubelet.userData.has_color === 'undefined') return false;
            var colLength = colors.length;
            for (var i = 0; i < colLength; i++) {
                if (!cubelet.userData.has_color[colors[i]]) {
                    return false;
                }
            }
            return (cubelet.CubeletType === type);
        })[0];
    };
}
