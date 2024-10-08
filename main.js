import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css'
import * as THREE from 'three';
import * as CANNON from "cannon-es";
import CannonDebugger from 'cannon-es-debugger';
//variables
const pointsUI = document.querySelector("#points");
let points = 0;
const randomRenge = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
const moveObsatcles = (arr, speed, maxX, minX, maxZ, minZ) => {
  arr.forEach(el => {
    el.body.position.z += speed;
    if(el.body.position.z > camera.position.z) {
      el.body.position.x = randomRenge(maxX, minX);
      el.body.position.z = randomRenge(maxZ, minZ);
    }

    el.mesh.position.copy(el.body.position);
    el.mesh.quaternion.copy(el.body.quaternion);
  });
}

//scene setup
const scene = new THREE.Scene();
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
})
const cannonDebugger = new CannonDebugger(scene, world, {
  color: "#AEE2ff",
  scale: 1,
});
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 4.5;
camera.position.y = 1.5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

//controls
const controls = new OrbitControls(camera, renderer.domElement);

//ground
const groundBody = new CANNON.Body({
  shape: new CANNON.Box (new CANNON.Vec3(15, 0.5, 15)),
});
world.addBody(groundBody);

const ground = new THREE.Mesh( new THREE.BoxGeometry( 30, 1, 30 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
ground.position.y = -1;
scene.add( ground );

//player
const playerBody = new CANNON.Body({
  shape: new CANNON.Box (new CANNON.Vec3(0.25, 0.25, 0.25)),
  fixedRotation: true
});
world.addBody(playerBody);

const player = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 0.5, 0.5 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
scene.add( player );

//powerUp
const powerUps = [];
for (let i = 0; i<10; i++){
  const posX = randomRenge(8, -8);
  const posZ = randomRenge(-5, -10);

  const powerUp = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 50),
    new THREE.MeshBasicMaterial({color: 0xffff00})
  )
  powerUp.scale.set(0.1, 0.1, 0.1);
  powerUp.position.x = posX;
  powerUp.position.z = posZ;

  powerUp.name = "powerUp" + [i+1];
  scene.add(powerUp);

  const powerUpBody = new CANNON.Body({
    shape: new CANNON.Sphere(0.2)
  });
  powerUpBody.position.set(posX, 0, posZ);
  world.addBody(powerUpBody);

  const powerUpObject = {
    mesh: powerUp,
    body: powerUpBody
  }

  powerUps.push(powerUpObject);
}

//grid helper -> delete
// const gridHelper = new THREE.GridHelper(30, 30);
// scene.add(gridHelper);

function animate() {
  requestAnimationFrame(animate);
  moveObsatcles(powerUps, 0.001, 8, -8, -5, -10);
  controls.update();
  world.fixedStep();
  player.position.copy(playerBody.position);
  player.quaternion.copy(playerBody.quaternion);
  cannonDebugger.update();
	renderer.render( scene, camera );
}

animate();

window.addEventListener("resize", ()=> {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})

//player moving
window.addEventListener("keydown", (e)=>{
  switch (e.key) {
    case "d"|| "D" || "ArrowRight":
      playerBody.position.x += 0.1;
      break;
    case "a"|| "A" || "ArrowLeft":
      playerBody.position.x -= 0.1;
      break;
  }
  if (e.key === "r" || e.key === "R"){
    playerBody.position.x = 0;
    playerBody.position.y = 0;
    playerBody.position.z = 0;
  }
});