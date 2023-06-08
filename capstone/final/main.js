import * as THREE from "three";
import {generateRandomNormal} from "./math.js";
import { skybox} from "./texture.js"
import { materials } from './shader.js';
import { functions } from './curveFunction.js';

//  import { ParallaxBarrierEffect } from 'three/addons/effects/ParallaxBarrierEffect.js';
import { AnaglyphEffect } from "three/addons/effects/AnaglyphEffect.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


let disFrame_threshold = 0.2;
let container, camera, scene, renderer, effect, controls, raycaster;
let debug_mode = false;
let INTERSECTED;
const pointer = new THREE.Vector2();
const objHolder = [];
const objOffset = [];

let cur_mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16), new THREE.LineBasicMaterial({ color: 0x0000ff }));

// Function to find the parameter value for a given point on the curve
function findParameterForPoint(curve, point, min=0.0, max=1.0) {
  var divisions = 10; // Increase this value for finer precision
  
  for (var i = 0; i < divisions; i++) {
    var mid = (min + max) / 2;
    var curvePoint = curve.getPointAt(mid);
    var distanceSq = point.distanceToSquared(curvePoint);
    var distanceSqMax = curve.getPointAt(max).distanceToSquared(point);
    var distanceSqMin = curve.getPointAt(min).distanceToSquared(point);
    

    if (distanceSq < 0.0001) { // Adjust this threshold as needed
      return mid;
    } else if (distanceSqMin < distanceSqMax) {
      max = mid;
    } else {
      min = mid;
    }
  }

  return (min + max) / 2;
}

// Create an array of Vector3 points
var camera_positions = [
  new THREE.Vector3(0.21930503991026712, -0.25568895379692735, -15.719075472396616),
  new THREE.Vector3(0.03491573681097639, -4.451482286215212, -2.244000054771106),
  new THREE.Vector3(-0.0000036805640510047795, -4.72463489478683, -0.000002962702753072285),
  new THREE.Vector3(-0.01657917232036688, -2.156939201329411, -0.0000014448360032520566),
  new THREE.Vector3(0.9124536074196257, -2.147373230953876, 0.06961898994338345),
  new THREE.Vector3(2.3427258332075356, -1.4003776718309149, 1.1936724036616255),
  new THREE.Vector3(-0.9450571295649208, 1.6166657395961581, 4.048680001269946),
  new THREE.Vector3(-2.4349515557393744, 4.1142918903875625, 1.198036441430852),
  new THREE.Vector3(-4.196073365880624, 14.371580782163978, -2.002342262879248),
];

var camera_rotations = [
  new THREE.Vector3(-3.074586289419748+2*Math.PI, 0.032079311158325415, 3.139440285318715),
  new THREE.Vector3(3.129846984521562, -0.019523516810081198, 3.141363340848578),
  new THREE.Vector3(1.5707973266222752, -2.561558128631736e-8, 3.1159782530595375),
  new THREE.Vector3(1.570796033167292, 9.55966385663011e-7, 2.6159782530595375),
  new THREE.Vector3(0.6759415769723358, 0.012556366732142079, 0.63087629362683),
  new THREE.Vector3(2.5663469688678604, 0.8669875434880868, -2.6824954613175387),
  new THREE.Vector3(-0.8421416207204169, -0.4945338742617363, -2.48875504720903123),
  new THREE.Vector3(-1.8631579209686258, -0.2997703518715967, -2.3657293565322197),
  new THREE.Vector3(-1.8631579209686258, -0.2997703518715967, -2.3657293565322197),
];

var camera_speed = [5,1,1,0.2,0.3,0.4,0.8,1.7];

// Create the CatmullRomCurve3
var curve = new THREE.CatmullRomCurve3(camera_positions);
// Optional: Customize curve properties
curve.curveType = "centripetal"; // or 'chordal' or 'catmullrom'
curve.tension = 0.5; // 0.0 to 1.0, controls the tightness of the curve
// Optional: Create a TubeGeometry from the curve
var tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
var tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var pos_tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);

var rot_curve = new THREE.CatmullRomCurve3(camera_rotations);
// Optional: Customize curve properties
rot_curve.curveType = "centripetal"; // or 'chordal' or 'catmullrom'
rot_curve.tension = 0.5; // 0.0 to 1.0, controls the tightness of the curve
// Optional: Create a TubeGeometry from the curve
var rot_tubeGeometry = new THREE.TubeGeometry(rot_curve, 64, 0.05, 8, false);
var rot_tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var rot_tubeMesh = new THREE.Mesh(rot_tubeGeometry, rot_tubeMaterial);

let disFrame = 1.0;
// The array to store the parameter values
var parameterValues = [];
var rot_parameterValues = [];
// Iterate over the curve to find the parameter values
for (var i = 0, min1=0.0, min2=0.0; i < camera_positions.length; i++) {
  min1 = findParameterForPoint(curve,camera_positions[i],min1,1.0);
  min2 = findParameterForPoint(rot_curve,camera_rotations[i],min2,1.0)
  parameterValues.push(min1);
  rot_parameterValues.push(min2);
}
parameterValues[0] = 0.0;
rot_parameterValues[0] = 0.0;
parameterValues[parameterValues.length-1] = 1.0;
rot_parameterValues[rot_parameterValues.length-1] = 1.0;
console.log(parameterValues);
console.log(rot_parameterValues);

let objsPos   = new THREE.Vector3(0, 0, 0);
let objsScale = new THREE.Vector3(6, 15, 6);

let cam_bar = 0;
let cam_idx = 0;
let frame_idx = 0;

// let windowHalfX = window.innerWidth / 2;
// let windowHalfY = window.innerHeight / 2;

document.addEventListener("mousemove", onDocumentMouseMove);
document.addEventListener("wheel", onDocumentWheelScroll);
document.addEventListener("keydown", onDocumentKeyDown);
window.addEventListener( 'pointerdown', onDocumentPointerDown );

var selecable_pos = [
  new THREE.Vector3(-0.29671861417364104, -2.7543387047712993, 0.21946743568627283),
  new THREE.Vector3(-0.01657917232036688, -2.156939201329411, -0.0000014448360032520566),
  new THREE.Vector3(1.1396306591152745, -1.5403097977890554, -0.46798824214336193),
  new THREE.Vector3(0.7269405450784296, -0.909715589478292, -0.8183184693517396),
  new THREE.Vector3(-0.8592384717864063, -0.02293590877198115, 3.315973382649237),
  new THREE.Vector3(-0.9067566601493351, 3.572362375097858, 0.5521491586550537),
  new THREE.Vector3(-2.4349515557393744, 4.1142918903875625, 1.198036441430852),
]

var selecable_objs = [];

init();
animate();

function generateObj(geometry, material, scene, numObj = 1000, stdev = 0.15) {
  let cur_objHolder = [];
  let cur_objOffset = [];
  for (let i = 0; i < numObj; i++) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    let scale = (1 + Math.random()) * 0.1;
    if(i%20==0) {
      mesh.material.uniforms['timeScale'].value = 0.3;
    }

    mesh.position.x = -0.5*scale;
    mesh.position.y = -0.5*scale;
    mesh.position.z = -0.5*scale;

    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

    scene.add(mesh);
    cur_objHolder.push(mesh);

    cur_objOffset.push([
        generateRandomNormal(0, stdev),
        generateRandomNormal(0, stdev),
        generateRandomNormal(0, stdev),
    ]);
  }
  return [cur_objHolder, cur_objOffset];
}

function init() {

  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    20000
  );

  // Light here
  const light = new THREE.AmbientLight(0xffffff);
  light.position.set(-100, -100, 100);

  camera.focalLength = 3;
  if (debug_mode) {
    camera.position.x = objsPos.x-5;
    camera.position.y = objsPos.y-5;
    camera.position.z = objsPos.z-5;
  } else {
    updateCamera()
  }
  

  scene = new THREE.Scene();
  // scene.background = textureCube;
  let backgroundT = new THREE.TextureLoader().load('./media/ucdavis360.png');
  backgroundT.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = backgroundT;
  // scene.background = new THREE.Color(0x000000);
  // scene.add(light);
  // Apply the rotation to the skybox's matrix
  // skybox.scale.x = skybox.scale.y = skybox.scale.z = 0.5;
  // skybox.rotation.y = Math.PI/4;
  // scene.add(skybox);

  for(let i = 0; i<7; ++i) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1 ), materials[2].clone());
    let scale = (1 + Math.random()) * 0.15;

    mesh.position.x = -0.5*scale;
    mesh.position.y = -0.5*scale;
    mesh.position.z = -0.5*scale;
    
    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

    scene.add(mesh);
    selecable_objs.push(mesh);
  }

  camera.lookAt(objsPos);

  // const sphere_geo= new THREE.SphereGeometry(0.1, 32, 16);
  // for(let i = 0, il = camera_positions.length; i < il; i++) {
  //   const mesh = new THREE.Mesh(sphere_geo, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
  //   mesh.position.copy(camera_positions[i]);
  //   scene.add(mesh);
  //   const rot_mesh = new THREE.Mesh(sphere_geo, new THREE.LineBasicMaterial({ color: 0xff0000 }));
  //   rot_mesh.position.copy(camera_rotations[i]);
  //   scene.add(rot_mesh);
  // }
  // scene.add(cur_mesh);

  // generateObj(sphere_geo, material, objHolder, objOffset, scene, 1000, 0.03);
  const cube_geo= new THREE.BoxGeometry( 1, 1, 1 ); 
  let res = generateObj(cube_geo, materials[0], scene, 1000, 0.03);
  objHolder.push(res[0]);
  objOffset.push(res[1]);

  res = generateObj(cube_geo, materials[1], scene, 1000, 0.03);
  objHolder.push(res[0]);
  objOffset.push(res[1]);
  

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  raycaster = new THREE.Raycaster();

  const width = window.innerWidth || 2;
  const height = window.innerHeight || 2;

  // effect = new AnaglyphEffect(renderer);
  // effect.setSize(width, height);
  renderer.setSize(width, height);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(objsPos);
  // Customize the initial radius
  controls.minDistance = 0; // Minimum distance from the target (default: 0)
  controls.maxDistance = 10; // Maximum distance from the target (default: Infinity)

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  // windowHalfX = window.innerWidth / 2;
  // windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // effect.setSize(window.innerWidth, window.innerHeight);
}


function updateCamera() {
  camera.position.copy(pos_tubeMesh.geometry.parameters.path.getPointAt(cam_bar));
  let rot = rot_tubeMesh.geometry.parameters.path.getPointAt(rot_parameterValues[cam_idx]+(rot_parameterValues[cam_idx+1]-rot_parameterValues[cam_idx])*(cam_bar-parameterValues[cam_idx])/(parameterValues[cam_idx+1]-parameterValues[cam_idx]));
  camera.rotation.copy(new THREE.Euler(rot.x,rot.y,rot.z));
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  if (debug_mode) {
    controls.update();
  } else {
    updateCamera();
    camera.position.x += ( pointer.x - camera.position.x) * 0.01;
    camera.position.y += ( pointer.y - camera.position.y) * 0.05;
  }

  const timer = 0.0001 * Date.now();

  for(let i = 0, il = selecable_objs.length; i < il; i++) {
    let cursObj = selecable_objs[i];
    cursObj.material.uniforms[ 'time' ].value = Math.cos(30*timer + i*1.1);

    cursObj.position.x = selecable_pos[i].x + (0.1 * Math.cos(timer + i)) + objsPos.x;
    cursObj.position.y = selecable_pos[i].y + (0.1 * Math.cos(timer + i * 1.1)) + objsPos.y;
    cursObj.position.z = selecable_pos[i].z + (0.1 * Math.cos(timer + i * 1.2)) + objsPos.z;

    cursObj.rotation.x = 2*Math.PI * Math.cos(timer + i); // Rotate around the x-axis
    cursObj.rotation.y = 2*Math.PI * Math.cos(timer + i * 1.1); // Rotate around the y-axis
    cursObj.rotation.z = 2*Math.PI * Math.cos(timer + i * 1.2); // Rotate around the z-axis
  }
  // Set the initial camera position
  // material.uniforms[ 'cameraPosition' ].value.copy(camera.position);
  for(let k = 0, kl = objHolder.length; k < kl; k++) {
    for (let i = 0, il = (objHolder[k]).length; i < il; i++) {
      let objOffsetNorm = Math.sqrt(objOffset[k][i][0] * objOffset[k][i][0] + objOffset[k][i][1] * objOffset[k][i][1] + objOffset[k][i][2] * objOffset[k][i][2]);
      let t = (i / il) * 6 + 0.01 * (-Math.log10(objOffsetNorm))* timer;
      t = t - Math.floor(t);
      const curObj = objHolder[k][i];
      let fp = functions[k](t);
      curObj.material.uniforms[ 'time' ].value = Math.cos(10*timer + i*1.3);
      curObj.position.x = (fp.x + 0.02 * Math.cos(timer + i) + objOffset[k][i][0])*objsScale.x  + objsPos.x;
      curObj.position.y = (fp.y + 0.02 * Math.cos(timer + i * 1.1) + objOffset[k][i][1])*objsScale.y  + objsPos.y;
      curObj.position.z = (fp.z + 0.02 * Math.cos(timer + i * 1.2) + objOffset[k][i][2])*objsScale.z  + objsPos.z;
  
      curObj.rotation.x = 2*Math.PI * Math.cos(timer + i); // Rotate around the x-axis
      curObj.rotation.y = 2*Math.PI * Math.cos(timer + i * 1.1); // Rotate around the y-axis
      curObj.rotation.z = 2*Math.PI * Math.cos(timer + i * 1.2); // Rotate around the z-axis
    }
  }
  cur_mesh.position.copy(rot_tubeMesh.geometry.parameters.path.getPointAt(cam_bar));
  if ( INTERSECTED ) {
    INTERSECTED.rotation.x += 5*Math.PI * (timer-0.0001 *INTERSECTED.timer); // Rotate around the x-axis
    INTERSECTED.rotation.y += 5*Math.PI * (timer-0.0001 *INTERSECTED.timer); // Rotate around the y-axis
    INTERSECTED.rotation.z += 5*Math.PI * (timer-0.0001 *INTERSECTED.timer); // Rotate around the z-axis
  }

  renderer.render(scene, camera);
}

// onDocument Events
function onDocumentKeyDown(event) {
  // Check if the key is "M" (key code 77)
  if (event.key === 'm' || event.key === 'M') {
    console.log("M key pressed: Debug Mode");
    // Perform specific actions for the "M" key
    debug_mode = !debug_mode;
    if (debug_mode) {
      // Get the camera's look direction
      var lookDirection = new THREE.Vector3();
      camera.getWorldDirection(lookDirection);
      lookDirection.multiplyScalar(-1e-7);
      controls.target.copy(camera.position.clone().sub(lookDirection));
      // Add the tubeMesh to the scene
      scene.add(pos_tubeMesh);
      scene.add(rot_tubeMesh);
    } else {
      scene.remove(pos_tubeMesh);
      scene.remove(rot_tubeMesh);
    }
  }
  else if (event.key === 'p' || event.key === 'P') {
    // Get camera position
    let position = camera.position;
    // Get camera rotation
    let rotation = camera.rotation;
    // Get camera fov (field of view)
    let fov = camera.fov;
    // Get camera aspect ratio
    let aspect = camera.aspect;
    // Get camera near clipping plane distance
    let near = camera.near;
    // Get camera far clipping plane distance
    let far = camera.far;

    console.log(position);
    console.log(rotation);
    console.log(fov);
    console.log(aspect);
    console.log(near);
    console.log(far);
  }
}

function onDocumentMouseMove(event) {
  // mouseX = (event.clientX - windowHalfX) / 100;
  // mouseY = (event.clientY - windowHalfY) / 100;
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  if (disFrame) { //<disFrame_threshold
    // find intersections
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children, false );

    let iidx = 0;
    for (; iidx<intersects.length; ++iidx) {
      if(intersects[ iidx ].object!=skybox && (intersects[ iidx ].object.position).distanceTo(camera.position)<3.0) break;
    }
    if ( intersects.length > iidx ) {
      if ( INTERSECTED != intersects[ iidx ].object) {

        if ( INTERSECTED ) INTERSECTED.material.uniforms[ 'baseColor' ].value.copy( INTERSECTED.currentBaseColor);

        INTERSECTED = intersects[ iidx ].object;
        INTERSECTED.timer = Date.now();
        INTERSECTED.currentBaseColor = (INTERSECTED.material.uniforms[ 'baseColor' ]).value.clone();
        INTERSECTED.material.uniforms[ 'baseColor' ].value.copy(new THREE.Color(0xffffff));

      }

    } else {

      if ( INTERSECTED ) INTERSECTED.material.uniforms[ 'baseColor' ].value.copy(INTERSECTED.currentBaseColor);

      INTERSECTED = null;

    }
  }

  let titleList = [
    'THE FIRST<br>BIKE LANE IN USA',
    'FARMER\'S MARKET',
    'UNITRANS',
    'WE MARCH <br> WITH SELMA',
    'WAYNE THIEBAUD',
    'DAVIS COMMUNITY<br>MEALS AND HOUSING',
    'UNIVERSITY FARM CIRCLE'
  ];

  let titleImage = [
    './media/0.png',
    './media/1.png',
    './media/2.png',
    './media/3.png',
    './media/4.png',
    './media/5.png',
    './media/6.png'
  ];

  let bodyText = [
    "In 1967, Davis made history by becoming the first city in the United States to establish dedicated bike lanes on city streets. This forward-thinking initiative, driven by activists and city officials, not only transformed city planning but also influenced the development of cycling infrastructure nationwide.",
    "In 1976, the award-winning Davis Farmers' Market, envisioned by Ann Evans and inspired by a class with Isao Fujimoto, emerged as a result of the determination and activism of farmers, students, professors, and city officials.I It became the nation's first certified farmers' market, empowering local farmers to sell directly to consumers through regulatory changes and dedicated efforts.",
    "Unitrans is a public transportation service that operates in Davis, California, primarily serving the transportation needs of the University of California, Davis (UC Davis) community. As a student-run organization, Unitrans plays a vital role in connecting students, faculty, staff, and residents of Davis by providing reliable and convenient bus services.",
    "We March with Selma commemorates a powerful moment in Davis history when 35 dedicated citizens, including Pastor Dewey Proett from Davis Community Church, heeded Dr. Martin Luther King Jr.'s call for justice and equality. In 1956, following the events of Bloody Sunday, they courageously boarded a Greyhound bus in front of the church, embarking on a journey to join the historic march from Selma to Montgomery.",
    "As a distinguished professor at Davis, Wayne Thiebaud's artwork not only represents the far-reaching influence of Davis artists but also exemplifies the significant impact of the UC Davis Art Department. Renowned for his captivating portrayals of everyday objects and landscapes, Thiebaud's art contribute to the vibrant artistic community here at Davis. His masterful use of color, texture, and perspective, coupled with his unique approach to composition, has made him a celebrated and influential figure in the art world, resonating with audiences worldwide.",
    "Davis Community Meals and Housing (DCMH) is a pillar of compassion and support within the Davis community. Since its inception, DCMH has been unwavering in its commitment to addressing homelessness, food insecurity, and social inequality. Through a range of vital programs and services, including emergency shelter, transitional housing, and nutritious meals, DCMH provides a lifeline for individuals and families facing challenging circumstances. Their holistic approach focuses not only on meeting immediate needs but also on empowering individuals to regain stability and achieve self-sufficiency. With a strong network of volunteers, staff, and community partnerships, DCMH embodies the spirit of unity and care, offering hope and a brighter future for those in need.",
    "The University Farm Circle (UFC) holds a distinguished legacy of supporting and empowering women faculty, wives, and students during the formative years of the University. In collaboration with other early women's groups like the Davis Bachelor Girls and the Women's Improvement Club, the UFC played a pivotal role in creating a nurturing environment for women's advancement. Throughout the century, the organization has thrived, evidenced by its remarkable million-dollar endowment dedicated to scholarships. The UFC's enduring presence stands as a testament to the invaluable contributions and often overlooked efforts of women throughout history, continuing to shape and inspire the UC Davis community."
  ];


  let par = document.getElementById("specific");
  let find = false;
  for (let i = 0; i< selecable_objs.length; ++i) {
    if(INTERSECTED == selecable_objs[i]) {
      find = true;
      // Create a new <div> element
      // document.addEventListener("hover", ()=>{
        var existingElement = document.getElementById("name");
        var existingDescr = document.getElementById("description");
        var existingImage = document.getElementById("ima");
        if (!existingElement){
          var divElement = document.createElement("div");
          divElement.id = "name";
          divElement.innerHTML = titleList[i];
          if (i < 4) par.style.backgroundColor = '#fED809';
          else par.style.backgroundColor = '#3F96B0';
          par.style.zIndex = '100';
          par.style.opacity = '0.8';
          par.appendChild(divElement);
        } 
        else if (!existingDescr){
          var desc = document.createElement("div");
          desc.id = "description";
          desc.innerHTML = bodyText[i];
          par.appendChild(desc);
        } else if (!existingImage){
          var imageElement = document.createElement("img");
          imageElement.id = "ima";
          imageElement.src = titleImage[i];
          par.appendChild(imageElement);
        }
      // })
    }
  }
  if(!find) {
    let parentElement = document.getElementById("specific");
    parentElement.style.backgroundColor = "rgba(0, 0, 0, 0)";

    while (parentElement.firstChild) {
      parentElement.firstChild.remove();
    }
  }

}


let scrolltext = [
  "Scroll to explore",
  "",
  "Pathfinders of Progress: <br> Tracing Davis' Community Legacy",
  "",
  "",
  "Transformative Initiatives: <br> Empowering Communities",
  "",
  "",
  "Voices of Our Community: Perspectives and Reflection",
];

let scrolldesc = [
  'Explore the historical foundation of Davis,<br> highlighting key milestones that contribute to the community <br> throughout history.' ,
  'Showcases the lasting impact and innovative initiatives <br> of the Davis community in areas such as sustainability, arts and culture, social justice, <br> education, and local engagement.' ,
  'Voice out your love and support to Davis Communities!'
]

let colorlist = [
  '#486803',
  '',
  '#ffdc00',
  '',
  '',
  '#3F96B0',
  '', 
  '',
  '#92a46c'
]
function onDocumentWheelScroll(event) {
  let changed = false;
  let old_frameIdx = frame_idx;
  // Check the deltaY property of the event to get the scroll amount
  var scrollAmount = event.deltaY;
  // Perform actions based on the scroll amount
  cam_bar += 0.00003*camera_speed[cam_idx] * scrollAmount;
  if (cam_bar > 1) cam_bar = 1;
  else if (cam_bar < 0) cam_bar = 0;
  if(cam_bar > parameterValues[cam_idx+1]) { cam_idx +=1; }
  else if(cam_bar < parameterValues[cam_idx]) { cam_idx -=1;}
  disFrame = 2.0*Math.min(cam_bar-parameterValues[cam_idx], parameterValues[cam_idx+1]-cam_bar)/(parameterValues[cam_idx+1]-parameterValues[cam_idx]);
  // console.log(frame_idx);

  if(disFrame >= disFrame_threshold) {
    if (INTERSECTED ) {
      INTERSECTED.material.uniforms[ 'baseColor' ].value.copy(INTERSECTED.currentBaseColor);
      INTERSECTED = null;
    }
  } 
  else {
    if (parameterValues[cam_idx+1]-cam_bar < cam_bar-parameterValues[cam_idx]) {
      if(frame_idx != cam_idx+1) {
        frame_idx = cam_idx+1;
        changed=true;
      }
    }
    else{
      if(frame_idx != cam_idx) {
        frame_idx = cam_idx;
        changed=true;
      }
    }

    if(changed) {
      let page = document.getElementById("curate"); 
      let line = document.getElementById("instruction"); 
      let icon = document.getElementsByClassName("icon-scroll");
      
      if (frame_idx == 0){
        // Manages starter page
        var collectionElement = document.getElementById("collection");
        if (collectionElement) {
          collectionElement.id = "instruction";
        }
        page.style.backgroundColor = colorlist[frame_idx];
        line = document.getElementById("instruction"); 
        line.style.color = '#FAF6EB';
        // Add Icon 
        icon = document.getElementsByClassName("icon-scroll");
        if (!icon || icon.length === 0) {
          let scrollIcon = document.createElement("div");
          scrollIcon.className = "icon-scroll";
          line.innerHTML = scrolltext[frame_idx];
          line.style.color = '#FAF6EB';
          page.appendChild(scrollIcon);
        }
      }
      else if (frame_idx >= 2){
        // Clear frame 0 element
        if (icon.length > 0) {
          icon[0].remove();
        }
        // Frame 1 is for the first exibition 
        
        // console.log(line);
        if (old_frameIdx < 2) {
          page.style.backgroundColor = colorlist[frame_idx];
          line.setAttribute("id", "collection");
          line.style.color = '#000000';
          line.innerHTML = scrolltext[frame_idx];
        }
        else if (frame_idx==2 || frame_idx==5 || frame_idx==8) {
          page.style.backgroundColor = colorlist[frame_idx];
          var collectionElement = document.getElementById("collection");
          collectionElement.style.color = '#000000';
          collectionElement.innerHTML = scrolltext[frame_idx];
        } 
        // else{
        //   let frame = document.getElementById("curate"); 
        //   frame.style.opacity = 0; 
        // }
  
      }
    }
  }

  let pageone = document.getElementById("curate"); 
  if (frame_idx == 1) {
    pageone.style.opacity = 0;
  } 
  else if (frame_idx==2 || frame_idx==5 || frame_idx==8) { pageone.style.opacity = 0.7* (1.0 - Math.min((disFrame*disFrame)/(disFrame_threshold*disFrame_threshold),1.0));} // Change opacity of scroll 
 

  // for(let k = 0, kl = objHolder.length; k < kl; k++) {
  //   for (let i = 0, il = (objHolder[k]).length; i < il; i++) {
  //     const curObj = objHolder[k][i];
  //     curObj.material.uniforms[ 'dis_frame' ].value = disFrame*disFrame;
  //   }
  // }

  let parentElement = document.getElementById("specific");
  parentElement.style.backgroundColor = "rgba(0, 0, 0, 0)";

  while (parentElement.firstChild) {
    parentElement.firstChild.remove();
  }
}

// Useless Raycaster
function onDocumentPointerDown( event ) {

  console.log(INTERSECTED);
  
  // if ( intersects.length > 0 ) {

  //     const object = intersects[ 0 ].object;
  //     const randomColor = Math.random() * 0xffffff;; 
  //     object.material.color.setHex(randomColor);
  //     render();
  // }
}
