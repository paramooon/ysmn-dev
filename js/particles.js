/* =========================================================
   YSMN — dotted shells in light mask windows
   A: hero letter Y   B: blue head   C: about face   D: knot
   The DOM window is the mask: the canvas is clipped at its
   edges, so the shell hides behind the window border.
   ========================================================= */
(function(){
'use strict';

var PI=Math.PI, sin=Math.sin, cos=Math.cos;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- letter Y shell: points on a thin 3D slab ---------- */
function surfaceYPoint(){
  var arm,v,e,x,y,z,r;
  if(Math.random()<0.26){                    // stem
    x=(Math.random()-0.5)*0.20;
    y=0.04+Math.random()*1.66;
    r=Math.random();
    if(r<0.5)       z= 0.09+Math.random()*0.03;   // front face
    else            z=-0.09-Math.random()*0.03;   // back face
  }else{                                     // arms: wide at TOP, meet at crotch
    arm=Math.random()<0.5?-1:1;
    v=Math.random();
    x=arm*(0.06+0.46*(1-v))+(Math.random()-0.5)*0.11;
    y=1.70-v*1.92;
    r=Math.random();
    if(r<0.5)       z= 0.09+Math.random()*0.03;
    else            z=-0.09-Math.random()*0.03;
  }
  return [x,y,z];
}
function buildShellPoints(count){
  var S=0.94, pts=new Float32Array(count*3);
  for(var i=0;i<count;i++){
    var p=surfaceYPoint();
    pts[i*3]=p[0]*S;pts[i*3+1]=p[1]*S;pts[i*3+2]=p[2]*S;
  }
  return pts;
}

/* breathing: idle wobble factor around 1 */
function makeBreath(amp){return {amp:amp,phaseA:Math.random()*6,phaseB:Math.random()*6};}
function breathAt(b,t){
  return 1+b.amp*0.6*sin(t*0.9+b.phaseA)+b.amp*0.4*sin(t*1.7+b.phaseB);
}

function makeRenderer(holder,W,H){
  try{
    var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(W,H);
    holder.appendChild(renderer.domElement);
    return renderer;
  }catch(e){
    return null;                    // no WebGL: window stays empty, site works
  }
}
/* =========================================================
   A. HERO — dotted shell of the letter Y in the mask window
   ========================================================= */
function initHero(){
  var holder=document.getElementById('gl-hero');
  if(!holder)return null;
  var W=holder.clientWidth||640,H=holder.clientHeight||640;
  var renderer=makeRenderer(holder,W,H);
  if(!renderer)return null;
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(32,W/H,0.1,60);
  camera.position.set(0,0.25,4.9);

  var COUNT=window.innerWidth<760?9000:16000;
  var pos=buildShellPoints(COUNT);
  var base=pos.slice();
  var geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  var pmat=new THREE.PointsMaterial({
    color:0x2a2a2e,size:0.012,transparent:true,opacity:0.9,sizeAttenuation:true
  });
  var points=new THREE.Points(geo,pmat);
  scene.add(points);

  var breath=makeBreath(0.055);
  var mouse={x:0,y:0,tx:0,ty:0};
  var amp=0,ampTarget=0;      // turbulence (ruler + exit)
  var exitPx=0,prog=0;        // window travel in px, progress 0..1
  var worldPerPx=0.0071;
  var tiltX=0,tiltY=0;

  function measureWorld(){
    var vh=2*camera.position.z*Math.tan(camera.fov*PI/360);
    worldPerPx=vh/Math.max(1,H);
  }
  measureWorld();

  window.addEventListener('pointermove',function(e){
    mouse.tx=(e.clientX/window.innerWidth)*2-1;
    mouse.ty=(e.clientY/window.innerHeight)*2-1;
  },{passive:true});

  function resize(){
    W=holder.clientWidth;H=holder.clientHeight;
    if(!W||!H)return;
    renderer.setSize(W,H);
    camera.aspect=W/H;camera.updateProjectionMatrix();
    measureWorld();
  }
  window.addEventListener('resize',resize);

  var clock=new THREE.Clock();
  function tick(){
    var t=clock.getElapsedTime();
    mouse.x+=(mouse.tx-mouse.x)*0.055;
    mouse.y+=(mouse.ty-mouse.y)*0.055;

    var br=breathAt(breath,t);
    var arr=geo.attributes.position.array;
    var agit=1+amp*2.2;
    for(var k=0;k<arr.length;k+=3){
      var bx=base[k],by=base[k+1],bz=base[k+2];
      var w1=sin(t*1.3+bx*2.1+by*1.1);
      var w2=sin(t*2.1+bz*3.0-by*1.7);
      var turb=amp>0.001?(sin(t*7+bx*11)+sin(t*9.3+by*13))*amp*0.05:0;
      arr[k]  =bx*br+w1*0.006*agit+turb;
      arr[k+1]=by*br+w2*0.006*agit+turb*0.6;
      arr[k+2]=bz*br+w1*0.004*agit;
    }
    geo.attributes.position.needsUpdate=true;

    tiltY+=(mouse.x*0.22-tiltY)*0.06;
    tiltX+=(mouse.y*0.16-tiltX)*0.06;
    points.rotation.y=tiltY;
    points.rotation.x=tiltX;

    /* window travels up, cloud stands still on screen:
       compensate the world by the exact pixel travel;
       canvas bounds act as the mask and swallow the shell */
    points.position.y=-exitPx*worldPerPx;
    points.rotation.z=prog*0.18;

    ampTarget=clamp((prog-0.2)/0.7,0,1);
    amp+=(ampTarget-amp)*0.06;
    pmat.size=0.012+amp*0.011;

    renderer.render(scene,camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return {
    setScrollPx:function(px,p){
      exitPx=px||0;
      prog=(p===undefined)?clamp((px||0)/1000,0,1):clamp(p,0,1);
    },
    setScroll:function(p){prog=clamp(p,0,1);exitPx=p*1.35*window.innerHeight;},
    poke:function(){amp=Math.min(1,amp+0.4);}
  };
}
/* =========================================================
   B. blue head in the work-grid window
   ========================================================= */
function initBlueModel(){
  var holder=document.getElementById('gl-blue');
  if(!holder)return null;
  var W=holder.clientWidth||420,H=holder.clientHeight||420;
  var renderer=makeRenderer(holder,W,H);
  if(!renderer)return null;
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(34,W/H,0.1,40);
  camera.position.set(0,0.1,4.2);

  var g=new THREE.BufferGeometry();
  var N=2600,arr=new Float32Array(N*3);
  for(var i=0;i<N;i++){
    var u=Math.random()*PI*2,v=Math.acos(2*Math.random()-1);
    var r=0.62+Math.random()*0.02;
    var x=r*sin(v)*cos(u),y=r*cos(v)*0.92,z=r*sin(v)*sin(u);
    if(y<-0.05){y=-0.05-y*0.35;x*=0.78;z*=0.78;}
    arr[i*3]=x;arr[i*3+1]=y-0.08;arr[i*3+2]=z;
  }
  g.setAttribute('position',new THREE.BufferAttribute(arr,3));
  var pm=new THREE.PointsMaterial({color:0x8fa3b8,size:0.02,transparent:true,opacity:0.9});
  var head=new THREE.Points(g,pm);scene.add(head);

  var b=makeBreath(0.045);
  var mx=0,my=0,tmx=0,tmy=0;
  window.addEventListener('pointermove',function(e){
    tmx=(e.clientX/window.innerWidth)*2-1;
    tmy=(e.clientY/window.innerHeight)*2-1;
  },{passive:true});
  function resize(){W=holder.clientWidth;H=holder.clientHeight;
    if(!W||!H)return;
    renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();}
  window.addEventListener('resize',resize);
  var clock=new THREE.Clock();
  (function tick(){
    var t=clock.getElapsedTime();
    mx+=(tmx-mx)*0.05;my+=(tmy-my)*0.05;
    head.rotation.y=mx*0.35;head.rotation.x=my*0.2;
    head.scale.setScalar(breathAt(b,t));
    pm.size=0.02+Math.abs(sin(t*1.4))*0.004;
    renderer.render(scene,camera);
    requestAnimationFrame(tick);
  })();
  return {poke:function(){}};
}
/* =========================================================
   C. point portrait in the about window
   ========================================================= */
function initAboutFace(){
  var holder=document.getElementById('gl-about');
  if(!holder)return null;
  var W=holder.clientWidth||380,H=holder.clientHeight||380;
  var renderer=makeRenderer(holder,W,H);
  if(!renderer)return null;
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(34,W/H,0.1,40);
  camera.position.set(0,0,2.9);

  var g=new THREE.BufferGeometry();
  var N=3600,n=0,arr=new Float32Array(N*3);
  for(var i=0;i<N;i++){
    var u=Math.random()*PI*2,v=Math.acos(2*Math.random()-1);
    var r=0.6;
    var x=r*sin(v)*cos(u)*0.82,y=r*cos(v)*0.96,z=r*sin(v)*sin(u);
    if(z<0)continue;
    arr[n*3]=x;arr[n*3+1]=y;arr[n*3+2]=z;n++;
  }
  arr=arr.slice(0,n*3);
  g.setAttribute('position',new THREE.BufferAttribute(arr,3));
  var pm=new THREE.PointsMaterial({color:0x2a2a2e,size:0.018,transparent:true,opacity:0.85});
  var face=new THREE.Points(g,pm);scene.add(face);
  function loop(pts,op){
    var l=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(
      pts.map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);})),
      new THREE.LineBasicMaterial({color:0x2a2a2e,transparent:true,opacity:op}));
    face.add(l);return l;
  }
  loop([[-0.24,0.16,0.5],[-0.1,0.16,0.55],[-0.1,0.1,0.55],[-0.24,0.1,0.5]],0.8);
  loop([[0.1,0.16,0.55],[0.24,0.16,0.5],[0.24,0.1,0.5],[0.1,0.1,0.55]],0.8);
  loop([[-0.12,-0.3,0.5],[0,-0.33,0.55],[0.12,-0.3,0.5],[0,-0.27,0.55]],0.65);

  var b=makeBreath(0.05);
  var clock=new THREE.Clock();
  (function tick(){
    var t=clock.getElapsedTime();
    face.scale.setScalar(breathAt(b,t));
    face.rotation.y=sin(t*0.35)*0.12;
    renderer.render(scene,camera);
    requestAnimationFrame(tick);
  })();
  return {poke:function(){}};
}
/* =========================================================
   D. point knot in the contact window
   ========================================================= */
function initContactWin(){
  var holder=document.getElementById('gl-contact');
  if(!holder)return null;
  var W=holder.clientWidth||360,H=holder.clientHeight||360;
  var renderer=makeRenderer(holder,W,H);
  if(!renderer)return null;
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(34,W/H,0.1,40);
  camera.position.set(0,0,3);

  var g=new THREE.TorusKnotGeometry(0.42,0.13,140,16);
  var N=3200,pos=new Float32Array(N*3);
  var cnt=g.attributes.position.count;
  for(var i=0;i<N;i++){
    var idx=(Math.random()*cnt)|0;
    pos[i*3]  =g.attributes.position.getX(idx)+(Math.random()-0.5)*0.03;
    pos[i*3+1]=g.attributes.position.getY(idx)+(Math.random()-0.5)*0.03;
    pos[i*3+2]=g.attributes.position.getZ(idx)+(Math.random()-0.5)*0.03;
  }
  var pg=new THREE.BufferGeometry();
  pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  var pm=new THREE.PointsMaterial({color:0x2a2a2e,size:0.016,transparent:true,opacity:0.85});
  var knot=new THREE.Points(pg,pm);scene.add(knot);

  var b=makeBreath(0.05);
  var clock=new THREE.Clock();
  (function tick(){
    var t=clock.getElapsedTime();
    knot.rotation.y=t*0.35;knot.rotation.x=sin(t*0.4)*0.2;
    knot.scale.setScalar(breathAt(b,t));
    renderer.render(scene,camera);
    requestAnimationFrame(tick);
  })();
  return {poke:function(){}};
}

/* ---------- boot ---------- */
function boot(){
  if(!window.THREE)return;
  var hero=initHero();
  initBlueModel();initAboutFace();initContactWin();
  window.__YSMN_GL__={hero:hero};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
})();



