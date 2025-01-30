import * as THREE from 'three';

const cubeWidth = 20;
const cubeHeight = 20;
const cubeDepth = 20;

const cubeGeometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeDepth);
const material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0xFF6347});
const readyCube = new THREE.Mesh(cubeGeometry, material);
readyCube.position.y = 10;

function scaleCube(_x, _y, _z){
    readyCube.scale.x = _x;
    readyCube.scale.y = _y;
    readyCube.scale.z = _z;
    readyCube.position.y = cubeHeight * _y / 2;
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

export {readyCube ,scaleCube, getDimensions};