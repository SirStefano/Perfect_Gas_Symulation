import './style.css'

import * as THREE from 'three';
import {OrbitControls}  from 'three/examples/jsm/controls/OrbitControls.js';

import {readyCube ,scaleCube} from "./modules/cube.js";
import {generateMolecules, updateMolecules, resetToExport, countMolecules, removeMolecule, verifyMolecules} from "./modules/molecules.js";

const addMolecule = document.getElementById("addButton");
const addNumber = document.getElementById("numberToAdd");
const remMolecule = document.getElementById("removeButton");
const remNumber = document.getElementById("numberToRemove");
const counter = document.getElementById("mCounter");
const [boxX, boxY, boxZ] = [document.getElementById("xSize"),
  document.getElementById("ySize"),document.getElementById("zSize")];

addMolecule.onclick = function(){
  generateMolecules(addNumber.value, scene);
  udpateCounter();
}

boxX.onchange = handleResizeChange;
boxY.onchange = handleResizeChange;
boxZ.onchange = handleResizeChange;

function handleResizeChange(){
  let x = parseInt(boxX.value);
  let y = parseInt(boxY.value);
  let z = parseInt(boxZ.value);
  if(x<=0){
    x = 9 + x;
    x /= 10;
  }if(y<=0){
    y = 9 + y;
    y /= 10;
  }if(z<=0){
    z = 9 + z;
    z /= 10;
  }
  scaleCube(x, y, z);
  verifyMolecules(scene);
  udpateCounter();
}

remMolecule.onclick = function(){
  for(let i = 0; i<remNumber.value; ++i){
    removeMolecule(scene);
    udpateCounter();
  }
}

function udpateCounter(){
  counter.textContent = "Molecules counter: " + countMolecules();
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc5dbdb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#myCanvas')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setX(30);
camera.position.setZ(30);
camera.position.setY(40);

const gridHelper = new THREE.GridHelper(200,50);

const controls = new OrbitControls(camera, renderer.domElement);

scene.add(readyCube, gridHelper);

generateMolecules(4, scene);
udpateCounter();

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 5);
scene.add( light );


function animate(){
  requestAnimationFrame(animate);
  updateMolecules();
  controls.update();
  renderer.render(scene, camera);
}

document.addEventListener("visibilitychange", function() {
  if (document.hidden){
      console.log("Browser tab is hidden")
  } else {
      resetToExport();
      console.log("Browser tab is visible");
  }
});

animate();


