import * as THREE from "three";

const path = "./media/";
const format = ".jpg";
const urls = [
  // path + "px" + format,
  // path + "nx" + format,
  // path + "py" + format,
  // path + "ny" + format,
  // path + "pz" + format,
  // path + "nz" + format,
  path + "x0" + format,
  path + "x1" + format,
  path + "y0" + format,
  path + "y1" + format,
  path + "z0" + format,
  path + "z1" + format,
];

let textureCube = new THREE.CubeTextureLoader().load(urls);

function createMaterialArray(urls) {
  const materialArray = urls.map(image => {
    let texture = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

const materialArray = createMaterialArray(urls);
const cubeGeometry = new THREE.BoxGeometry(200, 200, 200);
// const cubeMaterial = new THREE.MeshBasicMaterial({ envMap: textureCube });
let skybox = new THREE.Mesh(cubeGeometry, materialArray);
export{skybox}
