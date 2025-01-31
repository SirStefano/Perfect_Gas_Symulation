import * as THREE from 'three';

const cubeWidth = 20;
const cubeHeight = 20;
const cubeDepth = 20;

const cubeGeometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeDepth);
const material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0xADD8E6});
const readyCube = new THREE.Mesh(cubeGeometry, material);
const lineGeometry = new THREE.EdgesGeometry( readyCube.geometry );
const lineMaterial = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 5 } );
const edges = new THREE.LineSegments( lineGeometry, lineMaterial );
readyCube.add( edges );
readyCube.position.y = 10;

function scaleCube(_x, _y, _z){
    readyCube.scale.x = _x;
    readyCube.scale.y = _y;
    readyCube.scale.z = _z;
    readyCube.position.y = cubeHeight * _y / 2;
}

function addCubeToScene(scene){
    scene.add(readyCube);
}

function getDimensions(){
    return {
        x1: (cubeWidth*readyCube.scale.x)/(-2),
        x2: (cubeWidth*readyCube.scale.x)/2,
        y1: 0,
        y2: cubeHeight*readyCube.scale.y,
        z1: (cubeDepth*readyCube.scale.z)/(-2),
        z2: (cubeDepth*readyCube.scale.z)/2
    };
}

function lightBlackMode(lightMode){
    if(lightMode){
        material.color.setHex(0x87CEEB);
        lineMaterial.color.setHex(0x0055AA);
    }else{
        material.color.setHex(0xADD8E6);
        lineMaterial.color.setHex(0xFF0000);
    }
}

export {addCubeToScene ,scaleCube, getDimensions, lightBlackMode};