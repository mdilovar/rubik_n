/**
 * @author Miri Manzarshohi Dilovar
*/
/*
global colors, AXIS
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
        // returns rhr-ordered the nonCornerPieces, which are just edges for outer layers, and corner pieces for inner layers.
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
        if (this.cubiesPerAxis !== 3) throw ('getCenterPiece only works for 3x3x3 cubes!');
        this.centerPiece = this.cubies[4];
    };
    this.hasAlltheRightEdges = function hasAlltheRightEdges() {
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('hasAlltheRightEdges only works for 3x3x3 cubes!');
        this.determineCenterColor();
        var edges = this.getNonCornerPieces();
        for (var i = 0; i < edges.length; i++) {
            if (!edges[i].userData.has_color[colors[this.centerColor]]) break;
            if (i == edges.length - 1) {
                this.centerColor = colors[this.centerColor];
                return true;
            }
        }
        return false;
    };
    this.areEdgesCorrectlyOriented = function areEdgesCorrectlyOriented() {
        if (!this.isFaceLayer) throw ('this is not a face layer');
        if (this.cubiesPerAxis !== 3) throw ('hasAlltheRightEdges only works for 3x3x3 cubes!');
        if (!this.hasAlltheRightEdges()) return false;
        // #TODO: continue implementation

    };
}