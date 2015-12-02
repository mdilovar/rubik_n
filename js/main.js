/**
 * @author Miri Manzarshohi Dilovar
 */
"use strict";
/*
global THREE requestAnimationFrame timer loadGame onCanvasTouchEnd
onCanvasTouchMove onCanvasMouseMove onCanvasMouseDown onCanvasMouseUp onCanvasTouchStart
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
var colors_normal_order = ["white" /*0:x0*/, "yellow"/*1:x1*/, "red"/*2:y0*/, "orange"/*3:y1*/, "blue"/*4:z0*/, "green"/*5:z1*/]; // #TODO: replace var colors with this?
//set cubicle size
var cubieSize = 200;
//..and the Cube object
var theCube;

var CubeletType = {
    CORNER: 3,
    EDGE: 2,
    MIDDLE: 1
};

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
    camera.position.copy({ x: 1000, y: 1000, z: 1000 });
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
    // var axisHelper = new THREE.AxisHelper(1000);
    // scene.add( axisHelper );
}

function onWindowResize(e) {
    //update camera and renderer in case of window size change
    renderer.setSize(window.innerWidth, window.innerHeight * .80);
    camera.aspect = window.innerWidth / (window.innerHeight * .80);
    camera.updateProjectionMatrix();
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
