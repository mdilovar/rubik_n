/**
 * @author Miri Manzarshohi Dilovar
*/
"use strict";
/*global colors_normal_order, THREE, theCube, CubeletType, AXIS*/
function SolutionGuide() {
    this.cube = null;
    this.initGuide = function initGuide(cube) {
        if (cube.cubiesPerAxis !== 3) {
            console.log('Solution guide only available for 3x3x3 cube for now!');
            return false;
        }
        this.cube = cube;
    };
    this.higlightCublets = function higlightCublets(cublets, color) {
        cublets.forEach(function(element, index, array) {
            if (element.material) { // the placeholder cublets in middle don't have material and should be skipped.
                element.material.materials.forEach(function(element, index, array) {
                    console.log(array, index, color);
                    if (typeof color !== 'undefined') {
                        if (index !== color) return;
                    }
                    element.transparent = false;
                });
            }
        });
    };
    this.attenuateCublets = function attenuateCublets(cublets) {
        cublets.forEach(function(element, index, array) {
            if (element.material) { // the placeholder cublets in middle don't have material and should be skipped.
                element.material.materials.forEach(function(element, index, array) {
                    element.transparent = true;
                    element.opacity = 0.2;
                });
            }
        });
    };
    this.startGuide = function startGuide() {
        // #TODO: choose the best/user-given top color - for now just going with white
        // #TODO: check how far solved and skip steps in necessary / later /
        // build correctly oriented cross
        //  highlight cross
        this.attenuateCublets(this.cube.cubies);
        this.higlightCublets()
            // build corners
            // build 2n'd layer edges
            // build 3rd layer cross
            // correct the 3rd layer cross
            // place 3rd layer corners
            // rotate 3rd layer corners
    };
    this.isTopCross = function isTopCross(topColor) {
        //#TODO: check how far solved and skip steps in necessary / later /
    };
}

//var sg = new SolutionGuide(); sg.initGuide(theCube);