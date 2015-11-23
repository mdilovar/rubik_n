/**
 * @author Miri Manzarshohi Dilovar
*/
"use strict";
/*global colors_normal_order, THREE, CubeletType, AXIS*/

function SolutionGuide() {
    this.cube = null;
    this.initGuide = function initGuide(cube) {
        /*if (cube.cubiesPerAxis !== 3) {
            console.log('Solution guide only available for 3x3x3 cube for now!');
            return false;
        }*/
        this.cube = cube;
    };
    this.highlightCubelets = function highlightCubelets(cubelets) {
        // ex. this.highlightCubelets(this.cube.getCubeletsByColor(undefined,CubeletType.MIDDLE));
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
        // highlight all cubelets
        this.highlightCubelets(this.cube.cubies);
        // return if cube os already solved
        if (this.cube.isSolved()) {
            console.log('the cube is already solved!');
            return;
        }
        // determine the top color for solving
        this.determineTopColor();
        // update SolutionGuide's representation of the cube
        this.updateCubeState();
        // attenuate the whole cube (so that later appropriate cubelets are highlighed)
        this.attenuateCubelets(this.cube.cubies);
        // firts, check if top layer edges are ordered correctly
        if (!this.topLayer.areEdgesOrdered()) {
            console.log(["First: order top edge pieces in the same order as middle layer centerpieces."].join(' '));
            // highlight centerpieces
            this.highlightCubelets(this.cube.getCubeletsByColor(undefined, CubeletType.MIDDLE));
            // hightlight top-colored edges
            this.highlightCubelets(this.cube.getCubeletsByColor(this.topColor, CubeletType.EDGE));
            // solve the top layer edge positions
            this.solveTopLayerEdgesPosition();
        }
        // then check if top layer edges are oriented correctly
        else if (!this.areTopLayerEdgesOrientated()) {
            console.log(["Now, correctly orient top edge pieces."].join(' '));
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
        this.bottomColor = colors_normal_order[1]; //yellow
    };

    this.updateCubeState = function updateCubeState() {
        // call to update SolutionGuide's representation of the cube state.
        // note: this should be called after cube state has shanged
        this.topLayer = this.cube.getFaceLayerByCenterpieceColor(this.topColor);
        this.bottomLayer = this.cube.getFaceLayerByCenterpieceColor(this.bottomColor);
    };

    this.solveTopLayerEdgesPosition = function solveTopLayerEdgesPosition() {
        // get the virtual top layer edges - the edge pieces that should be in the top layer
        // var virtualTopEdges = this.cube.getCubeletsByColor(this.topColor, CubeletType.EDGE);
        // array of virtual edges already at the top layer
        // this.placedVirtualTopEdges = [];

        // get the correct order of top edges
        var correctOrder = this.topLayer.getCorrectEgeOrder();
        // Create the VOTE array - virtual ordered top edges
        var VOTE = [];
        correctOrder.forEach(function (cc) {
            VOTE.push(this.cube.getCubeletByColorsAndType([cc,this.topColor], CubeletType.EDGE));
        },this);
        // Create the ATE array - actual top edges
        var ATE = [];
        ATE = this.topLayer.getNonCornerPieces();
        if (ATE.filter(function(a){return a.id==VOTE[0].id }).length !== 1) {
            var _this = this;
            function bringToTop() {
                _this.cube.rotateFace(_this.cube.getLayer(sideFaceWithEdgePiece.axis, sideFaceWithEdgePiece.layer), 0, false, function() {
                    if (_this.cube.getFaceLayerByCenterpieceColor(colors_normal_order[0]).hasCubie(edgePiece.id)) {
                        bringToTop = function(){};
                    }
                    bringToTop();
                });
            }
            bringToTop();
        }
        /*
        // for each cubelet from virtual top face, check if it's in the actual top face
        virtualTopEdges.forEach(function(cubelet){
            if (this.topLayer.hasCubie(cubelet.id)){
                this.placedVirtualTopEdges.push(cubelet);
            }
        },this);
        if (this.placedVirtualTopEdges.length === 0){
            //find the first edge cubelet of the correct order
            var edgePiece = virtualTopEdges.filter(function(piece){
                return piece.userData.has_color[correctOrder[0]];
            })[0];
            // rotate the first face with that cube until the cube's at top.
            var sideFaceWithEdgePiece = this.cube.getFaceLayersByCubie(edgePiece).filter(function(layer){
                return !(layer.axis === this.axis && layer.layer === this.layer); // chooses only non-bottom faces
            },this.bottomLayer)[0];


            var _this = this;
            function bringToTop() {
                _this.cube.rotateFace(_this.cube.getLayer(sideFaceWithEdgePiece.axis, sideFaceWithEdgePiece.layer), 0, false, function() {
                    if (_this.cube.getFaceLayerByCenterpieceColor(colors_normal_order[0]).hasCubie(edgePiece.id)) {
                        bringToTop = function(){};
                    }
                    bringToTop();
                });
            }
            bringToTop();



        }else if(this.placedVirtualTopEdges.length > 0){
            //find the next edge cubelet of the correct order
            var nextCorrctEdgeColor = correctOrder.filter(function(color,index,array){
                return this.placedVirtualTopEdges[this.placedVirtualTopEdges.length - 1].userData.has_color[array[index-1]]; // get the next color
            },this)[0];
            var edgePiece = virtualTopEdges.filter(function(piece){
                return piece.userData.has_color[nextCorrctEdgeColor];
            })[0];
            // rotate the first face with that cube until the cube's at top.
            var sideFaceWithEdgePiece = this.cube.getFaceLayersByCubie(edgePiece).filter(function(layer){
                return !(layer.axis === this.axis && layer.layer === this.layer); // chooses only non-bottom faces
            },this.bottomLayer)[0];
            var _this = this;
            function bringToTop() {
                _this.cube.rotateFace(_this.cube.getLayer(sideFaceWithEdgePiece.axis, sideFaceWithEdgePiece.layer), 0, false, function() {
                    if (_this.cube.getFaceLayerByCenterpieceColor(colors_normal_order[0]).hasCubie(edgePiece.id)) {
                        bringToTop = function(){};
                    }
                    bringToTop();
                });
            }
            bringToTop();
        }
        */
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

//var sg = new SolutionGuide(); sg.initGuide(theCube); sg.startGuide();
