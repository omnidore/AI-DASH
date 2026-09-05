import * as THREE from 'three';
import './style.css';

const canvas = document.querySelector('#race-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#09111a');
scene.fog = new THREE.Fog('#09111a', 40, 150);
const camera = new THREE.PerspectiveCamera(44, 1, .1, 500);
const clock = new THREE.Clock();
let paused = false, activeCamera = 'follow';

scene.add(new THREE.HemisphereLight('#cde7ff', '#16210d', 2.1));
const sun = new THREE.DirectionalLight('#ffe5ba', 3.2); sun.position.set(-35, 60, 22); sun.castShadow = true; scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), new THREE.MeshStandardMaterial({ color: '#2a553c', roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

const roadPoints = [new THREE.Vector3(-48,0,-4),new THREE.Vector3(-28,0,25),new THREE.Vector3(14,0,30),new THREE.Vector3(48,0,12),new THREE.Vector3(45,0,-20),new THREE.Vector3(12,0,-31),new THREE.Vector3(-15,0,-23),new THREE.Vector3(-27,0,-2),new THREE.Vector3(-11,0,8),new THREE.Vector3(6,0,1),new THREE.Vector3(12,0,-12)];
const curve = new THREE.CatmullRomCurve3(roadPoints, true, 'catmullrom', .13);
const roadGeom = new THREE.TubeGeometry(curve, 300, 6.1, 10, true);
const road = new THREE.Mesh(roadGeom, new THREE.MeshStandardMaterial({ color: '#20242a', roughness: .82 })); road.receiveShadow = true; scene.add(road);
const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 300, .055, 4, true), new THREE.MeshBasicMaterial({ color:'#f7f0df' })); line.position.y=.13; scene.add(line);

function createCar(color) {
  const car = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color, metalness: .55, roughness: .25 });
  const black = new THREE.MeshStandardMaterial({ color:'#07090b', roughness:.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0,.34,4.7),paint); body.position.y=.55; body.castShadow=true; car.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.48,2.8,4),paint); nose.rotation.x=Math.PI/2; nose.position.set(0,.53,3.3); car.add(nose);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(.58,12,8),black); cockpit.scale.set(1,.48,1.25); cockpit.position.set(0,.85,-.22); car.add(cockpit);
  for (const x of [-1.02,1.02]) for (const z of [-1.25,1.5]) { const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.32,12),black); w.rotation.z=Math.PI/2; w.position.set(x,.42,z); car.add(w); }
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.8,.16,.4),black); wing.position.set(0,.72,-2.3); car.add(wing);
  return car;
}
const player = createCar('#e63331'); scene.add(player);
const rival = createCar('#244db7'); scene.add(rival);
const rival2 = createCar('#ef8a15'); scene.add(rival2);

const buildings = new THREE.Group();
for (let i=0;i<34;i++) { const a=i/34*Math.PI*2, r=55+(i%4)*9, h=6+(i%6)*3; const b=new THREE.Mesh(new THREE.BoxGeometry(5,h,5),new THREE.MeshStandardMaterial({color: i%3?'#c9c0ab':'#7896a4',roughness:.9})); b.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r); b.castShadow=true; buildings.add(b); } scene.add(buildings);

function placeCar(car, t) { const p=curve.getPointAt((t%1+1)%1), tangent=curve.getTangentAt((t%1+1)%1); car.position.copy(p); car.position.y=.13; car.rotation.y=Math.atan2(tangent.x,tangent.z); }
function resize(){ const w=canvas.clientWidth,h=canvas.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); } addEventListener('resize',resize); resize();
function tick(){ const elapsed=clock.getElapsedTime(); if(!paused){ const t=elapsed*.015; placeCar(player,t); placeCar(rival,t-.045); placeCar(rival2,t-.095); const p=player.position, tangent=curve.getTangentAt(t%1); if(activeCamera==='aerial') camera.position.lerp(new THREE.Vector3(p.x,p.y+68,p.z+20),.04); else if(activeCamera==='cockpit') camera.position.lerp(new THREE.Vector3(p.x-tangent.x*1.5,1.8,p.z-tangent.z*1.5),.12); else camera.position.lerp(new THREE.Vector3(p.x-tangent.x*15,7,p.z-tangent.z*15),.05); camera.lookAt(p.x+tangent.x*18,1,p.z+tangent.z*18); const speed=Math.round(274+Math.sin(elapsed*1.8)*20); document.querySelector('#speed').textContent=speed; document.querySelector('#gear').textContent=Math.max(4,Math.min(8,Math.round(speed/42))); document.querySelector('#throttle').textContent=`${Math.round(78+Math.sin(elapsed*2)*17)}%`; document.querySelector('#ers').textContent=`${Math.round(59+Math.sin(elapsed*.6)*6)}%`; document.querySelector('#rpm').textContent=`${(10300+Math.round(speed*2)).toLocaleString()} RPM`; document.querySelector('#rpm-bar').style.width=`${72+Math.sin(elapsed*2)*16}%`; } renderer.render(scene,camera); requestAnimationFrame(tick); } tick();
document.querySelectorAll('.camera').forEach(button=>button.addEventListener('click',()=>{ activeCamera=button.dataset.camera; document.querySelector('.camera.active').classList.remove('active'); button.classList.add('active'); }));
document.querySelector('#pause').addEventListener('click',()=>{ paused=!paused; document.querySelector('#pause').textContent=paused?'▶':'Ⅱ'; document.querySelector('#race-action').innerHTML=paused?'<span>▶</span> RESUME RACE':'<span>Ⅱ</span> PAUSE RACE'; });
document.querySelector('#race-action').addEventListener('click',()=>document.querySelector('#pause').click());
