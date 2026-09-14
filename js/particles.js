/* YSMN — persistent WebGL object: volumetric letter Y built from particles.
   Morphs per section like the reference: Y (hero) → sphere (services, warm tint)
   → wireframe shell (about) → ring (contact). */
import * as THREE from 'three';

(function(){
'use strict';
const canvas=document.getElementById('gl');
const fallback=document.getElementById('glFallback');
const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=window.matchMedia&&window.matchMedia('(max-width: 760px)').matches;

let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'high-performance'});
  if(!renderer.getContext())throw new Error('no ctx');
}catch(e){
  if(fallback)fallback.classList.add('is-visible');
  if(canvas)canvas.style.display='none';
  return;
}
const DPR=Math.min(window.devicePixelRatio||1,isMobile?1.3:1.6);
renderer.setPixelRatio(DPR);
renderer.setSize(window.innerWidth,window.innerHeight);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,window.innerWidth/window.innerHeight,0.1,50);
camera.position.set(0,0,7);

const group=new THREE.Group();
scene.add(group);

/* ---------- target generators ---------- */
const COUNT=isMobile?9000:22000;
const DUST=isMobile?700:1500;

/* Letter Y: sample filled pixels of a glyph drawn on an offscreen canvas */
function sampleGlyph(ch,count){
  const S=420;
  const c=document.createElement('canvas');c.width=c.height=S;
  const g=c.getContext('2d',{willReadFrequently:true});
  g.fillStyle='#fff';
  g.textAlign='center';g.textBaseline='middle';
  g.font='700 360px "Montserrat",Arial,Helvetica,sans-serif';
  g.fillText(ch,S/2,S/2+18);
  const data=g.getImageData(0,0,S,S).data;
  const pts=[];
  const step=2;
  for(let y=0;y<S;y+=step){
    for(let x=0;x<S;x+=step){
      if(data[(y*S+x)*4+3]>110)pts.push(x,y);
    }
  }
  const nPts=pts.length/2;
  const H=3.6,out=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const k=(Math.random()*nPts)|0;
    const px=pts[k*2],py=pts[k*2+1];
    const jx=(Math.random()-0.5)*0.012,jy=(Math.random()-0.5)*0.012;
    out[i*3]  =(px/S-0.5)*H*(S/360)+jx;
    out[i*3+1]=-(py/S-0.5)*H*(S/360)+jy;
    /* volumetric extrusion: uniform through the depth, slightly denser core */
    const z=(Math.random()*2-1);
    out[i*3+2]=z*0.5*(1-0.25*z*z);
  }
  return out;
}

/* Fibonacci sphere */
function sphereTarget(count,R){
  const out=new Float32Array(count*3);
  const ga=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<count;i++){
    const t=i/count;
    const y=1-2*t;
    const r=Math.sqrt(Math.max(0,1-y*y));
    const a=ga*i;
    out[i*3]=Math.cos(a)*r*R;
    out[i*3+1]=y*R;
    out[i*3+2]=Math.sin(a)*r*R;
  }
  return out;
}

/* Wireframe-ish shell: sphere radius with jitter + sparse outliers */
function shellTarget(count,R){
  const base=sphereTarget(count,R);
  for(let i=0;i<count;i++){
    const o=Math.random();
    const k=o<0.85?(0.92+Math.random()*0.1):(1.15+Math.random()*0.65);
    base[i*3]*=k;base[i*3+1]*=k;base[i*3+2]*=k;
  }
  return base;
}

/* Ring / torus facing camera */
function ringTarget(count,R,r){
  const out=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2;
    const b=Math.random()*Math.PI*2;
    const rr=r*Math.sqrt(Math.random());
    out[i*3]  =Math.cos(a)*(R+Math.cos(b)*rr);
    out[i*3+1]=Math.sin(a)*(R+Math.cos(b)*rr);
    out[i*3+2]=Math.sin(b)*rr;
  }
  return out;
}

const tY=sampleGlyph('Y',COUNT);
const tSphere=sphereTarget(COUNT,1.75);
const tShell=shellTarget(COUNT,1.75);
const tRing=ringTarget(COUNT,1.55,0.34);
/* ---------- geometry + shaders ---------- */
const rand=new Float32Array(COUNT*4);
for(let i=0;i<COUNT*4;i++)rand[i]=Math.random();

const geo=new THREE.BufferGeometry();
geo.setAttribute('position',new THREE.BufferAttribute(tY.slice(),3));
geo.setAttribute('aY',new THREE.BufferAttribute(tY,3));
geo.setAttribute('aSphere',new THREE.BufferAttribute(tSphere,3));
geo.setAttribute('aShell',new THREE.BufferAttribute(tShell,3));
geo.setAttribute('aRing',new THREE.BufferAttribute(tRing,3));
geo.setAttribute('aRand',new THREE.BufferAttribute(rand,4));

const uniforms={
  uTime:{value:0},
  uWY:{value:1},uWS:{value:0},uWSh:{value:0},uWR:{value:0},
  uMouse:{value:new THREE.Vector3(99,99,0)},
  uMouseK:{value:0},
  uSize:{value:isMobile?7.5:5.0},
  uAlpha:{value:0},
  uColor:{value:new THREE.Color('#9c9c96')},
  uColor2:{value:new THREE.Color('#e2a175')},
  uTint:{value:0}
};

const vert=`
attribute vec3 aY;
attribute vec3 aSphere;
attribute vec3 aShell;
attribute vec3 aRing;
attribute vec4 aRand;
uniform float uTime,uWY,uWS,uWSh,uWR;
uniform vec3 uMouse;
uniform float uMouseK,uSize;
varying float vMix;
varying float vDepth;

void main(){
  float s1=aRand.x*0.55;
  float wY=smoothstep(s1,s1+0.45,uWY);
  float wS=smoothstep(s1,s1+0.45,uWS);
  float wSh=smoothstep(s1,s1+0.45,uWSh);
  float wR=smoothstep(s1,s1+0.45,uWR);
  vec3 pos=aY*wY+aSphere*wS+aShell*wSh+aRing*wR;

  /* breathing */
  float n=sin(uTime*0.7+aRand.y*6.2831+pos.x*1.6)*cos(uTime*0.5+aRand.z*6.2831+pos.y*1.4);
  pos+=pos*0.018*n;

  /* mouse repulsion */
  vec3 d=pos-uMouse;
  float dist=length(d);
  float f=smoothstep(1.5,0.0,dist)*uMouseK;
  pos+=(d/max(dist,0.001))*f*0.55;

  vec4 mv=modelViewMatrix*vec4(pos,1.0);
  gl_Position=projectionMatrix*mv;
  vDepth=-mv.z;
  vMix=aRand.w;
  gl_PointSize=uSize*(0.55+aRand.y*0.8)*(5.2/max(vDepth,0.6));
}`;

const frag=`
precision mediump float;
uniform float uAlpha,uTint;
uniform vec3 uColor,uColor2;
varying float vMix;
varying float vDepth;
void main(){
  vec2 c=gl_PointCoord-0.5;
  float d=length(c);
  float a=smoothstep(0.5,0.14,d);
  a*=uAlpha*smoothstep(9.0,4.5,vDepth)*0.92+uAlpha*0.08;
  vec3 col=mix(uColor,uColor2,uTint*(0.35+0.65*vMix));
  gl_FragColor=vec4(col,a);
}`;

const mat=new THREE.ShaderMaterial({
  uniforms,vertexShader:vert,fragmentShader:frag,
  transparent:true,depthWrite:false,depthTest:false,blending:THREE.NormalBlending
});
const points=new THREE.Points(geo,mat);
group.add(points);

/* ---------- dust layer ---------- */
const dGeo=new THREE.BufferGeometry();
const dPos=new Float32Array(DUST*3);
const dRand=new Float32Array(DUST*2);
for(let i=0;i<DUST;i++){
  const r=2.6+Math.random()*3.2;
  const th=Math.random()*Math.PI*2;
  const ph=Math.acos(2*Math.random()-1);
  dPos[i*3]=r*Math.sin(ph)*Math.cos(th);
  dPos[i*3+1]=r*Math.sin(ph)*Math.sin(th)*0.7;
  dPos[i*3+2]=r*Math.cos(ph)*0.6-1.0;
  dRand[i*2]=Math.random();dRand[i*2+1]=Math.random();
}
dGeo.setAttribute('position',new THREE.BufferAttribute(dPos,3));
dGeo.setAttribute('aRand',new THREE.BufferAttribute(dRand,2));
const dUniforms={
  uTime:uniforms.uTime,uAlpha:{value:0},
  uColor:{value:new THREE.Color('#b9b9b2')},
  uSize:{value:isMobile?3.4:2.6}
};
const dMat=new THREE.ShaderMaterial({
  uniforms:dUniforms,
  vertexShader:`
    attribute vec2 aRand;
    uniform float uTime,uSize;
    varying float vA;
    void main(){
      vec3 p=position;
      p.y+=sin(uTime*0.12+aRand.x*6.2831)*0.35;
      p.x+=cos(uTime*0.09+aRand.y*6.2831)*0.3;
      vec4 mv=modelViewMatrix*vec4(p,1.0);
      gl_Position=projectionMatrix*mv;
      vA=0.25+0.5*aRand.y;
      gl_PointSize=uSize*(0.5+aRand.x)*(4.0/max(-mv.z,0.6));
    }`,
  fragmentShader:`
    precision mediump float;
    uniform float uAlpha;
    uniform vec3 uColor;
    varying float vA;
    void main(){
      vec2 c=gl_PointCoord-0.5;
      float a=smoothstep(0.5,0.1,length(c))*vA*uAlpha;
      gl_FragColor=vec4(uColor,a);
    }`,
  transparent:true,depthWrite:false,depthTest:false
});
const dust=new THREE.Points(dGeo,dMat);
scene.add(dust);
/* ---------- section states ---------- */
const SECTIONS={
  hero:    {pos:[0,0,0],      wy:1,ws:0,wsh:0,wr:0, alpha:1,   tint:0,   rot:0.10},
  work:    {pos:[4.8,0.5,0],  wy:1,ws:0,wsh:0,wr:0, alpha:0.10,tint:0,   rot:0.03},
  services:{pos:[2.05,0.15,0],wy:0,ws:1,wsh:0,wr:0, alpha:1,   tint:0.8, rot:0.16},
  about:   {pos:[0.15,0.1,0], wy:0,ws:0,wsh:1,wr:0, alpha:0.85,tint:0.12,rot:0.20},
  contact: {pos:[0,-0.05,0],  wy:0,ws:0,wsh:0,wr:1, alpha:1,   tint:0,   rot:0.22}
};
if(isMobile){
  Object.keys(SECTIONS).forEach(function(k){
    SECTIONS[k].pos=[0,0,0];
    SECTIONS[k].alpha=Math.min(SECTIONS[k].alpha,0.55);
  });
}

const cur={pos:new THREE.Vector3(0,0,0),wy:0,ws:0,wsh:0,wr:0,alpha:0,tint:0};
let target=SECTIONS.hero;
let ready=false;

function setSection(name){
  if(SECTIONS[name])target=SECTIONS[name];
}
window.__YSMN_GL={setSection:setSection};

/* observe sections */
var io=new IntersectionObserver(function(entries){
  entries.forEach(function(en){
    if(en.isIntersecting)setSection(en.target.getAttribute('data-morph')||'hero');
  });
},{threshold:0.3});
document.querySelectorAll('[data-morph]').forEach(function(s){io.observe(s);});

/* body.is-ready → assemble the letter */
function onReady(){
  if(ready)return;
  ready=true;
  setSection(document.querySelector('[data-morph]:not(.work)')?'hero':'hero');
}
if(document.body.classList.contains('is-ready'))onReady();
else document.addEventListener('ysmn:ready',onReady);

/* ---------- pointer + drag ---------- */
const ndc=new THREE.Vector2(99,99);
let dragging=false,lastX=0,lastY=0,velX=0,velY=0,rotX=0,rotY=0;
const INTERACTIVE='a,button,input,textarea,select,label,.lightbox,.mmenu';

function updateMouse(cx,cy){
  ndc.x=(cx/window.innerWidth)*2-1;
  ndc.y=-(cy/window.innerHeight)*2+1;
  const halfH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;
  const halfW=halfH*camera.aspect;
  uniforms.uMouse.value.set(ndc.x*halfW,ndc.y*halfH,0);
  uniforms.uMouseK.value=1;
}
if(!reduced){
  window.addEventListener('pointermove',function(e){
    if(e.pointerType==='touch')return;
    updateMouse(e.clientX,e.clientY);
  },{passive:true});
  window.addEventListener('pointerdown',function(e){
    if(e.target.closest&&e.target.closest(INTERACTIVE))return;
    dragging=true;lastX=e.clientX;lastY=e.clientY;
  },{passive:true});
  window.addEventListener('pointermove',function(e){
    if(!dragging)return;
    velY+=(e.clientX-lastX)*0.00028;
    velX+=(e.clientY-lastY)*0.00022;
    lastX=e.clientX;lastY=e.clientY;
  },{passive:true});
  window.addEventListener('pointerup',function(){dragging=false;},{passive:true});
  window.addEventListener('pointerleave',function(){
    uniforms.uMouseK.value=0;
    uniforms.uMouse.value.set(99,99,0);
  });
}

/* ---------- loop ---------- */
const clock=new THREE.Clock();
function tick(){
  requestAnimationFrame(tick);
  if(document.hidden)return;
  const dt=Math.min(clock.getDelta(),0.05);
  const k=1-Math.exp(-dt*(reduced?30:3.2));
  cur.wy+= (target.wy-cur.wy)*k;
  cur.ws+= (target.ws-cur.ws)*k;
  cur.wsh+=(target.wsh-cur.wsh)*k;
  cur.wr+= (target.wr-cur.wr)*k;
  cur.alpha+=(target.alpha-cur.alpha)*k;
  cur.tint+=(target.tint-cur.tint)*k;
  cur.pos.lerp(new THREE.Vector3(target.pos[0],target.pos[1],target.pos[2]),k);

  uniforms.uWY.value=cur.wy;uniforms.uWS.value=cur.ws;
  uniforms.uWSh.value=cur.wsh;uniforms.uWR.value=cur.wr;
  uniforms.uAlpha.value=cur.alpha;uniforms.uTint.value=cur.tint;
  group.position.copy(cur.pos);
  dUniforms.uAlpha.value=cur.alpha*0.8;

  if(!reduced){
    uniforms.uTime.value+=dt;
    velX*=0.94;velY*=0.94;
    rotY+=velY+target.rot*dt*0.4;
    rotX+=velX;
    rotX=Math.max(-0.9,Math.min(0.9,rotX));
    group.rotation.y=rotY;
    group.rotation.x=rotX;
  }
  renderer.render(scene,camera);
}
tick();

window.addEventListener('resize',function(){
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
canvas.addEventListener('webglcontextlost',function(){
  canvas.style.display='none';
  if(fallback)fallback.classList.add('is-visible');
});

/* re-sample the glyph once the webfont is actually loaded (nicer Y) */
if(document.fonts&&document.fonts.ready){
  document.fonts.ready.then(function(){
    try{
      const tY2=sampleGlyph('Y',COUNT);
      geo.getAttribute('aY').copyArray(tY2);
      geo.getAttribute('aY').needsUpdate=true;
      geo.getAttribute('position').copyArray(tY2);
      geo.getAttribute('position').needsUpdate=true;
    }catch(e){}
  });
}
})();