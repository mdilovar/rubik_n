/**
 * @author Miri Manzarshohi Dilovar
 */
"use strict";
/*
global THREE requestAnimationFrame timer loadGame controls canvas_div renderer camera AXIS theCube colors_normal_order
*/

// vars used by mouse controls
var objects = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
    INTERSECTED, SELECTED, SELECTED2, FACE;

function onCanvasMouseMove(event) {
    event.preventDefault();
    // var x = event.offsetX == undefined ? event.layerX : event.offsetX;
    // var y = event.offsetY == undefined ? event.layerY : event.offsetY;
    var x = event.pageX - event.target.offsetLeft;
    var y = event.pageY - event.target.offsetTop;
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
                    theCube.rotateFace(curFace, direction, false, function() {
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
