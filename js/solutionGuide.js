/**
 * @author Miri Manzarshohi Dilovar
*/
/*global colors_normal_order, THREE, theCube, CubeletType, AXIS*/
"use strict";
function SolutionGuide() {
    this.cube = null;
    this.initGuide = function initGuide(cube) {
        /*if (cube.cubiesPerAxis !== 3) {
            console.log('Solution guide only available for 3x3x3 cube for now!');
            return false;
        }*/
        this.cube = cube;
    };
    this.highlightCubelets = function highlightCubelets(cubelets) { // ex this.highlightCubelets(this.cube.getCubeletsByColor(undefined,CubeletType.MIDDLE));
        cubelets.forEach(function(element, index, array) {
            if (element.material) { // the placeholder cubelets in middle don't have material and should be skipped.
                element.material.materials.forEach(function(element, index, array) {
                    element.transparent = false;
                }, element);
            }
        });
    };
    this.highlightStickers = function highlightStickers(cublets, stickers) {
        // ex. this.highlightStickers([color_codes.green]);
        if (typeof stickers === 'undefined') throw ('sticker argument is required');
        cublets = typeof cublets !== 'undefined' ? cublets : this.cube.cubies;
        cublets.forEach(function(cubelet) {
            if (cubelet.material) {
                cubelet.material.materials.forEach(function(material, material_index) {
                    for (var i = 0; i < stickers.length; i++) {
                        if (material.color.equals(new THREE.Color(stickers[i]))) material.transparent = false;
                    }
                });
            }
        });
    };
    this.attenuateCubelets = function attenuateCubelets(cubelets) {
        cubelets.forEach(function(element, index, array) {
            if (element.material) { // the placeholder cubelets in middle don't have material and should be skipped.
                element.material.materials.forEach(function(element, index, array) {
                    element.transparent = true;
                    element.opacity = 0.2;
                });
            }
        });
    };

    this.startGuide = function startGuide() {
        this.highlightCubelets(this.cube.cubies);
        if (this.cube.isSolved()) {
            console.log('the cube is already solved!');
            return;
        }
        this.determineTopColor();
        this.attenuateCubelets(this.cube.cubies);
        if (!this.areTopLayerEdgesInPlace()) {
            console.log(["Let's start with solving the top layer cross.",
                "I have highlighted the cubelets to make it easier.",
                "You don't need to worry about the faded cubelets."
            ].join(' '));
            this.highlightCubelets(this.cube.getCubeletsByColor(undefined, CubeletType.MIDDLE));
            this.highlightCubelets(this.cube.getCubeletsByColor(this.topColor, CubeletType.EDGE));
            this.solveTopLayerEdgesPosition();
        }
        else if (!this.areTopLayerEdgesOrientated()) {
            this.solveTopLayerEdgesOrentation();
        }
        else if (!this.topHasRegularCorners()) {}
        else if (!this.isMiddleLayerSolved()) {}
        else if (!this.areLastLayerEdgesOrientated()) {}
        else if (!this.areLastLayerEdgesPermutated()) {}
        else if (!this.areLastLayerCornersOrientated()) {}
        else if (!this.areLastLayerCornersPermutated()) {}
        else {
            throw ('there is a flaw in the solving guide algoruithm.');
        }
        //this.highlightCubelets(this.cube.getCubeletsByColor(undefined,CubeletType.MIDDLE));
        //this.highlightStickers(this.cube.getCubeletsByColor('white', CubeletType.EDGE), [color_codes.white]);
        //this.highlightCubelets(this.cube.getCubeletsByColor('white',CubeletType.EDGE));
        //this.highlightStickers([color_codes.green]);
        // build corners
        // build 2n'd layer edges
        // build 3rd layer cross
        // correct the 3rd layer cross
        // place 3rd layer corners
        // rotate 3rd layer corners
    };

    this.determineTopColor = function determineTopColor() {
        // #TODO: derermine the top layer by most solved. for now:
        this.topColor = colors_normal_order[0]; //white

        //get the top centerpiece #TODO: move this to CubeLayer?
        this.topCenterPiece = null;
        this.cube.cubies.forEach(function(cubelet) {
            if (cubelet.CubeletType === CubeletType.MIDDLE) {
                if (cubelet.userData.has_color[this.topColor]) {
                    this.topCenterPiece = cubelet;
                }
            }
        }, this);

        //get the face with that centerpiece.
        this.topLayer = null;
        var curFace;
        for (var s = 0; s < theCube.cubiesPerAxis; s++) { // s - slice number
            if (s == 1) continue; // ignore the middle layers
            if (this.topLayer !== null) break;
            for (var d in AXIS) {
                curFace = theCube.getLayer(AXIS[d], s);
                if (curFace.hasCubie(this.topCenterPiece.id)) {
                    this.topLayer = curFace;
                    break;
                }
            }
        }

        // #TODO: /incomlete/ determine the order of middle layer.
        var sgAxis = this.topLayer.axis;
        var middleCornerPieces = this.cube.getLayer(sgAxis, 1).getNonCornerPieces();
        middleCornerPieces.forEach(function(piece, index) {
            //this.middleOrder = piece.userData.has_color
        });
        this.middleOrder = middleCornerPieces; //[colors_normal_order[2], colors_normal_order[4], colors_normal_order[3], colors_normal_order[5]]; //red,blue,orange,green - 2435
    };

    this.areTopLayerEdgesInPlace = function areTopLayerEdgesInPlace() {
        console.log('checking if top layer edges are in place ', this.topColor);
        var topLayerEdgePieces = this.topLayer.getNonCornerPieces();
        var edgesWithRightColor = [];
        // check if they are in the right layer first
        for (var i = 0; i < topLayerEdgePieces.length; i++) {
            console.log(topLayerEdgePieces[i].userData.has_color[this.topColor]);
            if (!topLayerEdgePieces[i].userData.has_color[this.topColor]) {
                return false;
            }
            else {
                edgesWithRightColor.push(topLayerEdgePieces[i]);
            }
        }
        // check if middle centerpieces' order matches that of the top layer
        //  find the beginning centerpies and start matching from there.
        var middleOrderStartingIndex = null;
        for (var i = 0; i < this.middleOrder.length; i++) {
            var flag = false;
            edgesWithRightColor[0].userData.has_color[this.topColor] = false; // set to false temporarily for comparision
            console.log('json comarision. ', JSON.stringify(edgesWithRightColor[0].userData.has_color) , JSON.stringify(this.middleOrder[i].userData.has_color));
            if(JSON.stringify(edgesWithRightColor[0].userData.has_color) === JSON.stringify(this.middleOrder[i].userData.has_color)) {
                flag = true;
                middleOrderStartingIndex = i;
            }
            edgesWithRightColor[0].userData.has_color[this.topColor] = true; // set back to true
            if (flag) break;
        }
        for (var i =0; i < middleOrderStartingIndex.length; i++) {

        }
        console.log("top layer edges are in place!");
        return true;
    };
    this.solveTopLayerEdgesPosition = function solveTopLayerEdgesPosition() {
        console.log("ok, let's move the top layer edges to their correct order. For now we don't care\
        about their orientation. Remember, the edges need to be in the same order as the center pieces of\
        the middle layer.");
        this.middleOrder.forEach(function(color) {
            //console.log(this.topLayer);
        }, this);
    };
    this.areTopLayerEdgesOrientated = function areTopLayerEdgesOrientated() {
        //#TODO: check how far solved and skip steps in necessary / later /
        console.log('checking if top layer edges are correctly oriented ', this.topColor);
        return false;
    };
    this.topHasRegularCorners = function topHasRegularCorners() {
        //#TODO: check how far solved and skip steps in necessary / later /
        console.log('checking if top has a regular corners for ', this.topColor);
        return true;
    };
    this.isMiddleLayerSolved = function isMiddleLayerSolved() {
        //#TODO: check how far solved and skip steps in necessary / later /
        console.log('checking if middle layer solved for topcolor ', this.topColor);
        return true;
    };
    this.areLastLayerEdgesOrientated = function areLastLayerEdgesOrientated() {
        //#TODO: check how far solved and skip steps in necessary / later /
        console.log('checking if last layer edges are oriented correctly ', this.topColor);
        return true;
    };
    this.areLastLayerEdgesPermutated = function areLastLayerEdgesPermutated() {
        //#TODO: check how far solved and skip steps in necessary / later /
        console.log('checking if last layer edges are permutated correctly ', this.topColor);
        return true;
    };
    this.areLastLayerCornersOrientated = function areLastLayerCornersOrientated() {
        //#TODO: check how far solved and skip steps in necessary / later /
        console.log('checking if last layer Corners are oriented correctly ', this.topColor);
        return true;
    };
    this.areLastLayerCornersPermutated = function areLastLayerCornersPermutated() {
        //#TODO: check how far solved and skip steps in necessary / later /
        console.log('checking if last layer Corners are permutated correctly ', this.topColor);
        return true;
    };
}

//var sg = new SolutionGuide(); sg.initGuide(theCube);