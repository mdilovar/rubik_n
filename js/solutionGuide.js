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
        if (!this.topLayer.areEdgesOrdered()) {
            console.log(["First: order top edge layers in the same order as middle layer centerpieces."].join(' '));
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
        this.bottomColor = colors_normal_order[1]; //yellow
        //get the top layer - note this should be called dynamycally after last move to update the topLayer
        this.topLayer = this.cube.getFaceLayerByCenterpieceColor(this.topColor);
        this.bottomLayer = this.cube.getFaceLayerByCenterpieceColor(this.bottomColor);
    };


    this.solveTopLayerEdgesPosition = function solveTopLayerEdgesPosition() {
        // for each cubelet from virtual face, check if in actual face
        // if yes put in current_order array
        // if no, record emty value in the current_order array
        // if currect_array has > 1 acctual cubelets
        //   check against correct order --- choose the best order match.
        //   set the pointer to the first cubelet that is out of order.
        //   putEdgeCubeletInOrder()
        // if 1 actual cubelet
        //   use as a beginning point of order
        //   begin with first non top cubelet
        //   putEdgeCubeletInOrder()
        // if no actual cubelets.
        //   begin with any cubelet
        //   putEdgeCubeletInOrder()

        //get the virtual top layer edges - the edge pieces that should be in the top taler
        var virtualTopEdges = this.cube.getCubeletsByColor(this.topColor, CubeletType.EDGE);
        // array of virtual edges already at the top layer
        this.placedVirtualTopEdges = [];
        //get the correct order of top edges
        var correctOrder = this.topLayer.getCorrectEgeOrder();
        //this.cube.getCubeletsByColor(this.topColor, CubeletType.EDGE)
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
            if (this.bottomLayer.hasCubie(edgePiece.id)){
                // get the layers that have the cubelet
                var layersWithEdgePiece = this.cube.getFaceLayersByCubie(edgePiece);
                // pick the non-bottom layer
                var sideFaceWithEdgePiece = layersWithEdgePiece.filter(function(layer){
                    return layer.axis !== this.bottomLayer.axis;
                },this)[0];
                // rotate the side face 180 degrees.
                var _this = this;
                this.cube.rotateFace(sideFaceWithEdgePiece, 0, false, function(){
                    _this.cube.rotateFace(_this.cube.getLayer(sideFaceWithEdgePiece.axis,sideFaceWithEdgePiece.layer), 0, false, undefined );
                });
            } // if it's not in bottom layer...
        }else if(this.placedVirtualTopEdges.length > 0){
            //find the next edge cubelet of the correct order
            var nextCorrctEdgeColor = correctOrder.filter(function(color,index,array){
                return this.placedVirtualTopEdges[this.placedVirtualTopEdges.length - 1].userData.has_color[array[index-1]]; // get the next color
            },this)[0];
            var edgePiece = virtualTopEdges.filter(function(piece){
                return piece.userData.has_color[nextCorrctEdgeColor];
            })[0];
            if (this.bottomLayer.hasCubie(edgePiece.id)){
                // get the layers that have the cubelet
                var layersWithEdgePiece = this.cube.getFaceLayersByCubie(edgePiece);
                // pick the non-bottom layer
                var sideFaceWithEdgePiece = layersWithEdgePiece.filter(function(layer){
                    return layer.axis !== this.bottomLayer.axis;
                },this)[0];
                // rotate the side face 180 degrees.
                var _this = this;
                this.cube.rotateFace(sideFaceWithEdgePiece, 0, false, function(){
                    _this.cube.rotateFace(_this.cube.getLayer(sideFaceWithEdgePiece.axis,sideFaceWithEdgePiece.layer), 0, false, undefined );
                });
            } // if it's not in bottom layer...
        }
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