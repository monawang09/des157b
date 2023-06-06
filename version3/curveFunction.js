import * as THREE from "three";

function curve1(t) {
return new THREE.Vector3(
    Math.sqrt(t) * Math.cos(24 * t),
    Math.sqrt(t) - 0.5,
    Math.sqrt(t) * Math.sin(24 * t)
)
};

function curve2(t) {
return new THREE.Vector3(
    Math.sqrt(t) * Math.cos(24 * t + Math.PI)*0.7,
    Math.sqrt(t) - 0.5,
    Math.sqrt(t) * Math.sin(24 * t + Math.PI)*0.7
)
};

let functions = [curve1, curve2];

export { functions };