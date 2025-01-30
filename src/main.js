import './style.css'

import * as THREE from 'three';
import {OrbitControls}  from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import {readyCube ,scaleCube} from "./modules/cube.js";
import {generateMolecules, updateMolecules, resetToExport, countMolecules, 
  removeMolecule, verifyMolecules, calculatePressure, changeRadiusRange, updateMoleculeSpeeds} from "./modules/molecules.js";

const addMolecule = document.getElementById("addButton");
const addNumber = document.getElementById("numberToAdd");
const remMolecule = document.getElementById("removeButton");
const remNumber = document.getElementById("numberToRemove");
const counter = document.getElementById("mCounter");
const pressure = document.getElementById("pressure");
const minMass = document.getElementById("minimumMass");
const maxMass = document.getElementById("maximumMass");
const resetButton = document.getElementById("reset");
const moleculesNum = document.getElementById("moleculesStartingNumber");
const infoText = document.getElementById("information");
const temperatureLabel = document.getElementById("temperature");
const temperatureRange = document.getElementById("temperatureRange");
const [boxX, boxY, boxZ] = [document.getElementById("xSize"),
  document.getElementById("ySize"),document.getElementById("zSize")];
const statsInfo = new Stats();

boxX.onchange = handleResizeChange;
boxY.onchange = handleResizeChange;
boxZ.onchange = handleResizeChange;

addMolecule.onclick = function(){
  const oldNumber = countMolecules();
  generateMolecules(addNumber.value, scene);
  const newNumber = countMolecules();
  displayInfo(oldNumber, newNumber)
  updateCounter();
}

function displayInfo(oldNumber, newNumber){
  const diffrance = newNumber - oldNumber;
  if(diffrance == 0){
    infoText.textContent = "Can't add any new molecules, please try resize box for more space";
  }else{
    infoText.textContent = "Successfully added "+diffrance+" molecules";
  }
  setTimeout(function(){infoText.textContent=""},3000);
}

function handleResizeChange(){
  let x = negativeToRoot(parseInt(boxX.value));
  let y = negativeToRoot(parseInt(boxY.value));
  let z = negativeToRoot(parseInt(boxZ.value));
  scaleCube(x, y, z);
  verifyMolecules(scene);
  updateCounter();
}

function negativeToRoot(number){
  if(number<=0){
    number = 9 + number;
    number /= 10;
  }
  return number;
}

remMolecule.onclick = function(){
  for(let i = 0; i<remNumber.value; ++i){
    removeMolecule(scene);
    updateCounter();
  }
}

temperatureRange.onchange = function(){
  let newTemperature = parseInt(temperatureRange.value);
  updateMoleculeSpeeds(newTemperature);
  temperatureLabel.textContent = "Temperature: " + newTemperature + " K";
}

resetButton.onclick = resetAnimation;

function updateCounter(){
  counter.textContent = "Molecule counter: " + countMolecules();
}

function updatePressure(){
  let pressureNumber = calculatePressure();
  if(pressureNumber>=0.1){
    pressure.textContent = "Current pressure: " + pressureNumber.toFixed(3) + " Pa";
  }else{
    pressure.textContent = "Current pressure: " + (pressureNumber * 1000).toFixed(1) + " mPa";
  }
}

setInterval(updatePressure, 1000);

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

//const gridHelper = new THREE.GridHelper(200,50);

const controls = new OrbitControls(camera, renderer.domElement);

scene.add(readyCube);

generateMolecules(4, scene);
updateCounter();
updatePressure();

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 5);
scene.add( light );


function animate(){
  updateMolecules(scene);
  controls.update();
  renderer.render(scene, camera);
  statsInfo.update();
  requestAnimationFrame(animate);
}

function resetAnimation(){
  let numberOfM = countMolecules();
  for(let i = 0; i<numberOfM; ++i){
    removeMolecule(scene);
  }
  scaleCube(1, 1, 1);
  changeRadiusRange(negativeToRoot(parseInt(minMass.value)),negativeToRoot(parseInt(maxMass.value)));
  generateMolecules(parseInt(moleculesNum.value), scene);
  updateCounter();
  boxX.value = 1;
  boxY.value = 1;
  boxZ.value = 1;
}

document.addEventListener("visibilitychange", function() {
  if (document.hidden){
      console.log("Browser tab is hidden")
  } else {
      resetToExport();
      console.log("Browser tab is visible");
  }
});

window.onload = function(){
  statsInfo.begin();
  document.body.appendChild(statsInfo.dom);
  animate();
}


