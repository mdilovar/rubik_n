/**
 * @author Miri Manzarshohi Dilovar
*/
"use strict";
/*
global colors, AXIS colors_normal_order
*/
function CubeLayer(faceCubies, axis, sliceNumber, memArr) {
    //#TODO: maybe add partially/completely solved checkers to the face class, like cross, full first layer, etc
    this.cubiesPerAxis = Math.sqrt(faceCubies.length);
    if (this.cubiesPerAxis % 1 !== 0) {
        throw ('the facecubies array length must be a square of two.');
    }
    this.memArr = memArr;
    this.axis = axis;
    this.cubies = faceCubies;
    this.faceColor = null;
    this.layer = sliceNumber;
    this.isFaceLayer = (sliceNumber !== 0 && sliceNumber !== this.cubiesPerAxis - 1) ? false : true;
    if (sliceNumber !== 0) sliceNumber = 1; // can only be front/back, left/right, etc
    var nearfar = 1 - sliceNumber; // swapping the near and the far //throw ('this is not a face layer');
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
    this.getNonCornerPieces = function getNonCornerPieces() {
        // returns ordered nonCornerPieces, which are just edges for outer layers, and corner pieces for inner layers.
        // note: does is make sense for inner layers? - nearfar is only for ouer layers
        if (this.cubiesPerAxis !== 3) throw ('getNonCornerPieces only works for 3x3x3 cubes!');
        var nonCornerPieces = [];
        this.cubies.forEach(function(cubelet, index) {
            if (index % 2 == 1) { // matches edgepiece of the layer
                nonCornerPieces.push(cubelet);
            }
        });
        // swap last two cubies
        var tmp = nonCornerPieces[3];
        nonCornerPieces[3] = nonCornerPieces[2];
        nonCornerPieces[2] = tmp;
        if (this.axis !== AXIS.Y) {
            // only for y axis the order will follow rhr, for the other layers, order neers to be reversed.
            nonCornerPieces.reverse();
        }
        if(nearfar === 0){
            // reverse for the far end faces.
            nonCornerPieces.reverse();
        }
        return nonCornerPieces;
    };
    this.determineCenterColor = function determineCenterColor() {
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('determineCenterColor only works for 3x3x3 cubes!');
        this.determineCenterPiece();
        var tmp_color_index;
        for (var c = 0; c < colors.length; c++) {
            if (this.centerPiece.userData.has_color[colors[c]]) {
                tmp_color_index = c;
                break;
            }
        }
        this.centerColor = colors[tmp_color_index];
    };
    this.determineCenterPiece = function determineCenterPiece() {
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('determineCenterPiece only works for 3x3x3 cubes!');
        this.centerPiece = this.cubies[4];
    };
    this.hasAlltheRightEdges = function hasAlltheRightEdges() {
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('hasAlltheRightEdges only works for 3x3x3 cubes!');
        this.determineCenterColor();
        var edges = this.getNonCornerPieces();
        for (var i = 0; i < edges.length; i++) {
            if (!edges[i].userData.has_color[this.centerColor]) return false;
        }
        return true;
    };
    this.areEdgesOrdered = function areEdgesOrdered() {
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('areEdgesOrdered only works for 3x3x3 cubes!');
        if (!this.hasAlltheRightEdges()) return false; //presence
        var correct_order = this.getCorrectEgeOrder();
        this.determineCenterColor();
        var edges = this.getNonCornerPieces();
        // set the needle
        var needle = null;
        for (var x = 0; x < correct_order.length; x++){
            if (edges[0].userData.has_color[correct_order[x]]) {
                needle = x;
                break;
            }
        }
        // rotate the correct_order array so that the needle is at 0
        while (needle !== 0) {
            var tmp = correct_order.shift();
            correct_order.push(tmp);
            needle --;
        }
        // finally, compare the edges color order to correct_order
        for (var x = 0; x < correct_order.length; x++){
            if (!edges[x].userData.has_color[correct_order[x]]) return false; //order
        }
        return true;
    };
    this.areEdgesOriented = function areEdgesOriented() {
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('areEdgesOriented only works for 3x3x3 cubes!');
        this.determineCenterColor();
        var edges = this.getNonCornerPieces();
        for (var i = 0; i < edges.length; i++) {
            if (!edges[i].userData.has_color[this.centerColor]) return false; // presence
            if (edges[i].userData.orientation[this.axis][nearfar] !== this.centerColor) return false; // orientation
        }
        return true;
    };
    this.areEdgesSolved = function areEdgesSolved(){
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('areEdgesOriented only works for 3x3x3 cubes!');
        if (!this.areEdgesOrdered() || !this.areEdgesOriented()) return false;
        return true;
    };
    this.getCorrectEgeOrder = function getCorrectEgeOrder(){
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('getCorrectEgeOrder only works for 3x3x3 cubes!');
        // note: cannot use axis of the face as centerpiece colors are not attached to axes,
        // but are only fixed relative to each other (in 3x3x3).
        this.determineCenterColor();
        var correctOrder;
        if (this.centerColor == colors_normal_order[0] || this.centerColor == colors_normal_order[1] ){ // x colors
            correctOrder = [colors_normal_order[2],colors_normal_order[4],colors_normal_order[3],colors_normal_order[5]];
        }
        else if (this.centerColor == colors_normal_order[2] || this.centerColor == colors_normal_order[3] ){ // y colors
            correctOrder = [colors_normal_order[0],colors_normal_order[5],colors_normal_order[1],colors_normal_order[4]];
        }
        else if (this.centerColor == colors_normal_order[4] || this.centerColor == colors_normal_order[5] ){ // z colors
            correctOrder = [colors_normal_order[0],colors_normal_order[2],colors_normal_order[1],colors_normal_order[3]];
        }
        // flipping still needs to be done for near colors. (note: edges are also flipped based on nearfar and y-axis)
        if (this.centerColor == colors_normal_order[0] ||
            this.centerColor == colors_normal_order[2] ||
            this.centerColor == colors_normal_order[4]){
            correctOrder.reverse();
        }
        return correctOrder;
    };
}

