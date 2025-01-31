import './style.css'

import * as THREE from 'three';
import {OrbitControls}  from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import {addCubeToScene ,scaleCube, lightBlackMode} from "./modules/cube.js";
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
const gridButton = document.getElementById("grid");
const startInfo = document.getElementById("startingInfo");
const lightModeButton = document.getElementById("lightMode");
let lightMode = false;
const [boxX, boxY, boxZ] = [document.getElementById("xSize"),
  document.getElementById("ySize"),document.getElementById("zSize")];
const statsInfo = new Stats();

const cameraPosition = new THREE.Vector3(30, 40, 40);
let timer;
const gridHelper = new THREE.GridHelper(200,50);
let gridOnScene = true;

boxX.onchange = handleResizeChange;
boxY.onchange = handleResizeChange;
boxZ.onchange = handleResizeChange;

addMolecule.onclick = function(){
  const oldNumber = countMolecules();
  generateMolecules(addNumber.value, scene);
  const newNumber = countMolecules();
  displayMoleculesInfo(oldNumber, newNumber)
  updateCounter();
}

function displayMoleculesInfo(oldNumber, newNumber){
  const diffrance = newNumber - oldNumber;
  if(diffrance == 0){
    displayInfo("Can't add any new molecules, please resize the box for more space");
  }else{
    displayInfo("Successfully added "+diffrance+" molecules");
  }
}

function displayInfo(info){
  infoText.textContent = info;
  clearTimeout(timer);
  timer = setTimeout(function(){infoText.textContent=""},3000);
}

function handleResizeChange(){
  let x = negativeToRoot(parseInt(boxX.value));
  let y = negativeToRoot(parseInt(boxY.value));
  let z = negativeToRoot(parseInt(boxZ.value));
  scaleCube(x, y, z);
  verifyMolecules(scene);
  updateCounter();
  let scale = (x + y + z)/3;
  camera.position.setX(cameraPosition.x*scale);
  camera.position.setZ(cameraPosition.z*scale);
  if(scale >= y){
    camera.position.setY(cameraPosition.y*scale);
  }else{
    camera.position.setY(cameraPosition.y*y);
  }
  displayInfo("Successful resize of box, camera automatic set to see all box");
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
  changeSpeed(parseInt(temperatureRange.value));
}

function changeSpeed(newTemperature){
  updateMoleculeSpeeds(newTemperature);
  temperatureLabel.textContent = "Temperature: " + newTemperature + " K";
  temperatureRange.value = newTemperature;
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

gridButton.onclick = function(){
  if(gridOnScene){
    scene.remove(gridHelper);
    gridOnScene = false;
    gridButton.textContent = "Add grid";
  }else{
    scene.add(gridHelper);
    gridOnScene = true;
    gridButton.textContent = "Remove grid";
  }
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#myCanvas')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setX(cameraPosition.x);
camera.position.setZ(cameraPosition.z);
camera.position.setY(cameraPosition.y);

const controls = new OrbitControls(camera, renderer.domElement);

addCubeToScene(scene);

scene.add(gridHelper);

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
  changeSpeed(300);
  scaleCube(1, 1, 1);
  changeRadiusRange(negativeToRoot(parseInt(minMass.value)),negativeToRoot(parseInt(maxMass.value)));
  generateMolecules(parseInt(moleculesNum.value), scene);
  updateCounter();
  boxX.value = 1;
  boxY.value = 1;
  boxZ.value = 1;
  camera.position.setX(cameraPosition.x);
  camera.position.setZ(cameraPosition.z);
  camera.position.setY(cameraPosition.y);
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
  setTimeout(function(){
    startInfo.textContent = "";
  }, 5000);
  animate();
}

lightModeButton.onclick = function(){
  if(lightMode){
    scene.background = new THREE.Color(0x222222);
    lightBlackMode(false);
    lightModeButton.textContent = "Dark Mode";
    lightMode = false;
    infoText.classList.remove("lightMode");
    infoText.classList.add("darkMode");
    startInfo.classList.remove("lightMode");
    startInfo.classList.add("darkMode");
  }else{
    scene.background = new THREE.Color(0xF5F5F5);
    lightBlackMode(true);
    lightModeButton.textContent = "Light Mode";
    lightMode = true;
    infoText.classList.remove("darkMode");
    infoText.classList.add("lightMode");
    startInfo.classList.remove("darkMode");
    startInfo.classList.add("lightMode");
  }
}


