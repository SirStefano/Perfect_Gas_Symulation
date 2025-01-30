import * as THREE from 'three';

import {getDimensions} from "./cube.js";

let moleculesArray = [];
let totalForce = 0;

let minRadius = 0.2;
let maxRadius = 2;

class moleculeClass{
    static maxSpeed = 10;
    static minSpeed = -10;
    #readyMolecule;
    get molecule(){
        return this.#readyMolecule;
    }
    get futurePosition(){
        return (new THREE.Vector3).addVectors(this.#readyMolecule.position, this.speedWithDT());
    }
    get position(){
        return this.#readyMolecule.position;
    }
    set position(vector){
        this.#readyMolecule.position.x = vector.x;
        this.#readyMolecule.position.y = vector.y;
        this.#readyMolecule.position.z = vector.z;
    }
    static #clockForDT = new THREE.Clock(false);
    static #deltaTime;
    static updateDT(){
        this.#deltaTime = this.#clockForDT.getDelta();
    }
    static resetDT(){
        this.#clockForDT = new THREE.Clock();
        this.#deltaTime = 0.0;
    } 
    static startClock(){
        if(this.#clockForDT.running === false){
            this.#deltaTime = 0.0;
            this.#clockForDT.start();
        }
    }
    constructor(constructorRadius){
        this.radius = constructorRadius;
        const sphereGeometry = new THREE.SphereGeometry(this.radius);
        const material = new THREE.MeshStandardMaterial({color: 0x347aeb});
        this.#readyMolecule = new THREE.Mesh(sphereGeometry, material);
        this.speed = new THREE.Vector3(getRandom(this.constructor.minSpeed, this.constructor.maxSpeed), 
            getRandom(this.constructor.minSpeed, this.constructor.maxSpeed), getRandom(this.constructor.minSpeed, this.constructor.maxSpeed));
        let cubeDimensions = getDimensions();
        let colisionWithOther;
        let randomLocation
        do{
            randomLocation = new THREE.Vector3(
                getRandom(cubeDimensions.x1 + this.radius, cubeDimensions.x2 - this.radius),
                getRandom(cubeDimensions.y1 + this.radius, cubeDimensions.y2 - this.radius), 
                getRandom(cubeDimensions.z1 + this.radius, cubeDimensions.z2 - this.radius));
            colisionWithOther = false;
            moleculesArray.forEach(function(element){
                if((element.position.distanceTo(randomLocation) 
                        - constructorRadius - element.radius) <= 0){
                    colisionWithOther = true;
                }
            });
        }while(colisionWithOther);
        this.position = randomLocation;
    }
    move(){
        this.#readyMolecule.position.add(this.speedWithDT());
    }
    speedWithDT(){
        return new THREE.Vector3(this.speed.x*moleculeClass.#deltaTime, this.speed.y*moleculeClass.#deltaTime, this.speed.z*moleculeClass.#deltaTime);
    }
    distanceFromAnotherMolecule(anotherMolecule){
        return (this.position.distanceTo(anotherMolecule.position) 
            - this.radius - anotherMolecule.radius);
    }
    futureDistanceFromAnotherMolecule(anotherMolecule){
        return (this.futurePosition.distanceTo(anotherMolecule.futurePosition) 
            - this.radius - anotherMolecule.radius);
    }
    colorBasicOnSpeed(){
        const sumMinSpeed = 0;
        const sumMaxSpeed = Math.sqrt(Math.pow(moleculeClass.maxSpeed, 2)*3);
        const sumSpeed = Math.sqrt(Math.pow(this.speed.x, 2)+Math.pow(this.speed.y, 2)+Math.pow(this.speed.z, 2));
        const [hMin, sMin, lMin] = [0.65, 1, 0.5];
        const [hMax, sMax, lMax] = [0, 1, 0.5];
        const h = hMin + ((hMax - hMin) / 
            (sumMaxSpeed - sumMinSpeed)) * (sumSpeed - sumMinSpeed);
        const s = sMin + ((sMax - sMin) / 
            (sumMaxSpeed - sumMinSpeed)) * (sumSpeed - sumMinSpeed);
        const l = lMin + ((lMax - lMin) / 
            (sumMaxSpeed - sumMinSpeed)) * (sumSpeed - sumMinSpeed);
        this.#readyMolecule.material.color.setHSL(h, s, l);
    }
}

function generateMolecules(numberOfMolecules, scene){
    for(let i = 0; i<numberOfMolecules; ++i){
        if(countMolecules()<4000){
            let tryRadius = getRandom(minRadius, maxRadius);
            if(!filledToMax(tryRadius)){
                let moleculeObject = new moleculeClass(tryRadius);
                moleculeObject.colorBasicOnSpeed();
                scene.add(moleculeObject.molecule);
                moleculesArray.push(moleculeObject);
            }
        }
    }
    moleculeClass.startClock();
}

function removeMolecule(scene){
    if(moleculesArray.length>0){
        scene.remove(moleculesArray[moleculesArray.length-1].molecule);
        moleculesArray.pop();
    }
}

function moleculeWithWallColision(element, margin = 0){
    let cubeDimensions = getDimensions();
    if(element.futurePosition.x - element.radius + margin <= cubeDimensions.x1 
            || element.futurePosition.x + element.radius - margin >= cubeDimensions.x2){
        if(margin == 0){
            let force = 2 * element.radius * Math.abs(element.speed.x);
            totalForce += force;
        }
        element.speed.x *= (-1);
        return true;
    }
    if(element.futurePosition.y - element.radius + margin <= cubeDimensions.y1 
            || element.futurePosition.y + element.radius - margin >= cubeDimensions.y2){
        if(margin == 0){
            let force = 2 * element.radius * Math.abs(element.speed.y);
            totalForce += force;
        }
        element.speed.y *= (-1);
        return true;
    }
    if(element.futurePosition.z - element.radius + margin <= cubeDimensions.z1 
            || element.futurePosition.z + element.radius - margin >= cubeDimensions.z2){
        if(margin == 0){
            let force = 2 * element.radius * Math.abs(element.speed.z);
            totalForce += force;
        }
        element.speed.z *= (-1);
        return true;
    }
}


function postCollisionVelocity(m1, m2, v1, v2, normal) {
    let v1n = v1.dot(normal); 
    let v2n = v2.dot(normal);

    let u1n = ((m1 - m2) * v1n + 2 * m2 * v2n) / (m1 + m2);
    let u2n = ((m2 - m1) * v2n + 2 * m1 * v1n) / (m1 + m2);

    let deltaV1 = normal.clone().multiplyScalar(u1n - v1n);
    let deltaV2 = normal.clone().multiplyScalar(u2n - v2n);

    return [v1.clone().add(deltaV1), v2.clone().add(deltaV2)];
}

function moleculeWithMoleculeColision(element, superiorIterator) {
    for (let i = superiorIterator + 1; i < moleculesArray.length; i++) {
        let other = moleculesArray[i];
        
        if (element.distanceFromAnotherMolecule(other) <= 0) {
            let normal = element.position.clone().sub(other.position).normalize();
            
            let [newV1, newV2] = postCollisionVelocity(
                element.radius, other.radius,
                element.speed, other.speed,
                normal
            );

            element.speed = newV1;
            other.speed = newV2;

            element.colorBasicOnSpeed();
            other.colorBasicOnSpeed();

            let overlap = element.futureDistanceFromAnotherMolecule(other);
            if (overlap < 0) {
                let correction = normal.clone().multiplyScalar(-overlap / 2);
                element.position.add(correction);
                other.position.sub(correction);
            }
        }
    }
}

function colisionCheck(){
    moleculesArray.forEach(function (element, iterator) {
        moleculeWithMoleculeColision(element, iterator);
        moleculeWithWallColision(element);
    });
}

function updateMolecules(scene){
    moleculeClass.updateDT();
    colisionCheck();
    moleculesArray.forEach(element => {
        element.move();
    });
    let countBefore = moleculesArray.length;
    verifyMolecules(scene, maxRadius);
    let countAfter = moleculesArray.length;
    generateMolecules(countBefore-countAfter, scene);
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function resetToExport(){
    moleculeClass.resetDT();
}

function countMolecules(){
    return moleculesArray.length;
}

function verifyMolecules(scene, margin = 0){
    for(let i = moleculesArray.length - 1; i>=0; i--){
        if(moleculeWithWallColision(moleculesArray[i], margin)){
            scene.remove(moleculesArray[i].molecule);
            moleculesArray[i] = moleculesArray[moleculesArray.length - 1];
            moleculesArray.pop();
        }
    }
}

function filledToMax(radiusToCalculate){
    let cubeDimensions = getDimensions();
    let cubeVolume = (cubeDimensions.x2 * 2) * cubeDimensions.y2 * (cubeDimensions.z2 * 2);
    let sumVolumeOfMolecules = 0;
    moleculesArray.forEach(function(molecule){
        sumVolumeOfMolecules += (4/3 * Math.PI * Math.pow(molecule.radius, 3))
    });
    if(0.12 * cubeVolume <= sumVolumeOfMolecules + Math.pow(radiusToCalculate, 3)){
        return true;
    }
    return false;
}

function calculatePressure(){
    let cubeDimensions = getDimensions();
    let width = cubeDimensions.x2 * 2;
    let height = cubeDimensions.y2;
    let depth = cubeDimensions.z2 * 2;
    let cubeArea = width * height * 2 + width * depth * 2 + height * depth *2;
    let pressure = totalForce/cubeArea;
    totalForce = 0;
    return pressure;
}

function changeRadiusRange(min, max){
    if(moleculesArray.length==0){
        minRadius = min;
        maxRadius = max;
    }
}

export {generateMolecules, updateMolecules, resetToExport, countMolecules, 
    removeMolecule, verifyMolecules, calculatePressure, changeRadiusRange};
