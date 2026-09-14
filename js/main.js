/* YSMN — UI logic: preloader, clock, cursor, case carousel, orbit,
   services slider, quotes, counters, reveals, rail, form. No build step. */
(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s);};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouch=window.matchMedia&&window.matchMedia('(hover: none)').matches;

/* ---------- optional CDN libs (GSAP + Lenis), graceful fallback ---------- */
function loadScript(src){
  return new Promise(function(res){
    var s=document.createElement('script');
    s.src=src;s.async=true;
    s.onload=function(){res(true);};
    s.onerror=function(){res(false);};
    document.head.appendChild(s);
  });
}
var libsReady=Promise.all([
  loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'),
  loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'),
  loadScript('https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js')
]).then(function(r){
  if(r[0]&&r[1]&&window.gsap&&window.ScrollTrigger){
    window.gsap.registerPlugin(window.ScrollTrigger);
    if(!reduced)window.gsap.config({nullTargetWarn:false});
  }
  if(r[2]&&window.Lenis&&!reduced&&!isTouch){
    var lenis=new window.Lenis({duration:1.15,smoothWheel:true});
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);}
    requestAnimationFrame(raf);
    window.__lenis=lenis;
  }
  return r;
});
function scrollToEl(el){
  if(window.__lenis)window.__lenis.scrollTo(el,{offset:0});
  else el.scrollIntoView({behavior:reduced?'auto':'smooth'});
}

/* ---------- preloader: letters spread → assemble ---------- */
var pre=$('#preloader'),prePct=$('#prePct'),preLetters=$('#preLetters');
var t0=Date.now(),winLoaded=false;
window.addEventListener('load',function(){winLoaded=true;});
(function tickPre(){
  var el=Date.now()-t0;
  var pct=Math.min(99,Math.round(el/16));
  if(winLoaded&&el>1100)pct=100;
  if(prePct)prePct.textContent=(pct<10?'0':'')+pct;
  if(pct>=100){
    if(preLetters)preLetters.classList.add('is-assembled');
    if(pre)pre.classList.add('is-done');
    setTimeout(function(){
      document.body.classList.add('is-ready');
      document.dispatchEvent(new CustomEvent('ysmn:ready'));
    },650);
    setTimeout(function(){pre&&pre.parentNode&&pre.parentNode.removeChild(pre);},1800);
    return;
  }
  setTimeout(tickPre,40);
})();

/* safety: reveal everything currently in view once ready
   (covers headless/browsers where IO timing lags) */
function revealInView(){
  $$('.reveal-line').forEach(function(el){
    var r=el.getBoundingClientRect();
    if(r.top<innerHeight&&r.bottom>0)el.classList.add('is-in');
  });
}
document.addEventListener('ysmn:ready',function(){
  setTimeout(revealInView,350);
  setTimeout(revealInView,1200);
});
window.addEventListener('load',revealInView);

/* dev shortcut: ?s=work jumps to a section; ?flat=1 compact layout for tests */
(function(){
  var q=new URLSearchParams(location.search);
  if(q.has('flat')){
    document.body.classList.add('is-flat');
  }
  var m=location.search.match(/[?&]s=([a-z]+)/);
  if(m)document.addEventListener('ysmn:ready',function(){
    var el=document.getElementById(m[1]);
    if(el)setTimeout(function(){
      if(q.has('flat'))el.scrollIntoView();
      else scrollToEl(el);
    },420);
  });
})();

/* ---------- header clock: day % + local time ---------- */
var dayPct=$('#dayPct'),clockEl=$('#clock');
function tickClock(){
  var now=new Date();
  var pct=Math.floor(((now.getHours()*3600+now.getMinutes()*60+now.getSeconds())/864)*10)/10;
  pct=Math.min(99.9,Math.round(pct*10)/10);
  if(dayPct)dayPct.textContent=pct+'%';
  if(clockEl){
    try{
      clockEl.textContent=new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'}).format(now);
    }catch(e){
      clockEl.textContent=now.toTimeString().slice(0,5);
    }
  }
}
setInterval(tickClock,10000);tickClock();

/* ---------- custom cursor ---------- */
var cursor=$('#cursor');
if(cursor&&!isTouch&&!reduced){
  var cx=innerWidth/2,cy=innerHeight/2,tx=cx,ty=cy;
  window.addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;},{passive:true});
  (function moveCursor(){
    cx+=(tx-cx)*0.2;cy+=(ty-cy)*0.2;
    cursor.style.transform='translate('+cx+'px,'+cy+'px)';
    requestAnimationFrame(moveCursor);
  })();
  document.addEventListener('pointerover',function(e){
    var hit=e.target&&e.target.closest&&e.target.closest('a,button,.case__main,.case__thumb');
    cursor.classList.toggle('is-hover',!!hit);
  });
}else if(cursor){cursor.style.display='none';}
/* ---------- case carousel ---------- */
var caseIdx=0,caseBusy=false;
var caseImg=$('#caseImg'),casePhone=$('#casePhone'),caseTag=$('#caseTag'),caseText=$('#caseText'),
    caseMeta=$('#caseMeta'),caseName=$('#caseName'),caseTools=$('#caseTools'),caseThumbs=$('#caseThumbs'),
    caseMain=$('#caseMain'),caseZoom=$('#caseZoom');

function pad2(n){return (n<10?'0'+n:''+n);}
function caseData(){return window.CASES[caseIdx];}

function renderCase(){
  var c=caseData();
  var key='pj.'+c.id+'.';
  var pages=c.pages;
  caseImg.src=pages[0];
  caseImg.alt=window.t(key+'name');
  casePhone.src=c.phone;
  casePhone.alt=window.t(key+'name')+' — detail';
  caseTag.textContent=window.t(key+'tag');
  caseText.textContent=window.t(key+'desc');
  caseMeta.textContent=pad2(caseIdx+1)+' / '+pad2(window.CASES.length)+' — '+pages.length+' pages';
  caseName.textContent=window.t(key+'name');
  caseZoom.textContent=window.t('work.zoom');
  caseTools.innerHTML='';
  c.tools.forEach(function(tl){
    var b=document.createElement('span');
    b.className='chip mono';b.textContent=tl;
    caseTools.appendChild(b);
  });
  caseThumbs.innerHTML='';
  pages.slice(0,6).forEach(function(src,i){
    var b=document.createElement('button');
    b.type='button';b.className='case__thumb'+(i===0?' is-current':'');
    b.setAttribute('aria-label','Page '+(i+1));
    var im=document.createElement('img');
    im.src=src;im.alt='';im.loading='lazy';im.decoding='async';
    b.appendChild(im);
    b.addEventListener('click',function(){swapCaseImg(src,b);});
    caseThumbs.appendChild(b);
  });
  var caseEl=$('#case');
  caseEl.classList.remove('is-swapped');
  void caseEl.offsetWidth;
  caseEl.classList.add('is-swapped');
}
function swapCaseImg(src,btn){
  caseImg.classList.add('is-fading');
  setTimeout(function(){
    caseImg.src=src;
    caseImg.classList.remove('is-fading');
  },180);
  $$('.case__thumb',caseThumbs).forEach(function(b){b.classList.remove('is-current');});
  if(btn)btn.classList.add('is-current');
}
function gotoCase(i){
  if(caseBusy)return;
  caseBusy=true;
  caseIdx=(i+window.CASES.length)%window.CASES.length;
  renderCase();
  try{history.replaceState(null,'','#case='+caseData().id);}catch(e){}
  setTimeout(function(){caseBusy=false;},420);
}
/* deep link */
(function(){
  var m=location.hash.match(/case=([a-z]+)/i);
  if(m){
    for(var i=0;i<window.CASES.length;i++){
      if(window.CASES[i].id===m[1]){caseIdx=i;break;}
    }
  }
})();
renderCase();
document.addEventListener('langchange',renderCase);
/* carousel controls */
if(caseMain){
  $('#casePrev').addEventListener('click',function(){gotoCase(caseIdx-1);});
  $('#caseNext').addEventListener('click',function(){gotoCase(caseIdx+1);});
  document.addEventListener('keydown',function(e){
    if($('#lightbox').classList.contains('is-open'))return;
    var r=$('#work').getBoundingClientRect();
    if(r.top>innerHeight*0.5||r.bottom<innerHeight*0.5)return;
    if(e.key==='ArrowRight')gotoCase(caseIdx+1);
    else if(e.key==='ArrowLeft')gotoCase(caseIdx-1);
  });
  var sx=null,sxStart=null;
  caseMain.addEventListener('pointerdown',function(e){sx=e.clientX;sxStart=e.clientX;});
  caseMain.addEventListener('pointerup',function(e){
    if(sx===null)return;
    var dx=e.clientX-sx;sx=null;
    if(Math.abs(dx)>40)gotoCase(caseIdx+(dx<0?1:-1));
  });
  caseMain.addEventListener('click',function(e){
    if(sxStart!==null&&Math.abs(e.clientX-sxStart)>40)return;
    openLB(caseIdx);
  });
  $('#caseShare').addEventListener('click',function(){
    var url=location.origin+location.pathname+'#case='+caseData().id;
    var note=window.t('work.copied');
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(function(){flashShare(note);},function(){flashShare(url);});
    }else flashShare(url);
  });
}
var shareT=null;
function flashShare(txt){
  var btn=$('#caseShare');
  btn.classList.add('is-on');
  btn.title=txt;
  clearTimeout(shareT);
  shareT=setTimeout(function(){btn.classList.remove('is-on');},1600);
}
/* ---------- orbit diagram (2D canvas, like the reference) ---------- */
var orbit=$('#orbit');
if(orbit){
  var octx=orbit.getContext('2d');
  var oT=0,oRun=false;
  var oDpr=Math.min(window.devicePixelRatio||1,2);
  orbit.width=420*oDpr;orbit.height=420*oDpr;
  function drawOrbit(){
    if(!oRun)return;
    oT+=0.004;
    var w=orbit.width,h=orbit.height,cx2=w/2,cy2=h/2;
    octx.clearRect(0,0,w,h);
    var rings=[[0.94,1,0.9,9],[0.66,-1,1.3,6],[0.4,1,1.7,4]];
    rings.forEach(function(rg){
      var R=rg[0]*w/2;
      octx.save();
      octx.translate(cx2,cy2);
      octx.rotate(oT*rg[1]*rg[2]);
      octx.strokeStyle='rgba(38,38,36,0.28)';
      octx.lineWidth=1*oDpr;
      octx.setLineDash([1.5*oDpr,3.5*oDpr]);
      octx.beginPath();octx.arc(0,0,R,0,Math.PI*2);octx.stroke();
      octx.setLineDash([]);
      for(var i=0;i<rg[3];i++){
        var a=(i/rg[3])*Math.PI*2;
        octx.beginPath();
        octx.arc(Math.cos(a)*R,Math.sin(a)*R,2.4*oDpr,0,Math.PI*2);
        octx.fillStyle='rgba(38,38,36,0.5)';
        octx.fill();
      }
      octx.restore();
    });
    requestAnimationFrame(drawOrbit);
  }
  new IntersectionObserver(function(es){
    es.forEach(function(en){
      var want=en.isIntersecting&&!reduced;
      if(want&&!oRun){oRun=true;drawOrbit();}
      else if(!want)oRun=false;
    });
  },{threshold:0.1}).observe(orbit);
}

/* ---------- lightbox ---------- */
var lb=$('#lightbox'),lbTrack=$('#lbTrack'),lbTitle=$('#lbTitle'),lbCounter=$('#lbCounter'),
    lbClose=$('#lbClose'),lbPrev=$('#lbPrev'),lbNext=$('#lbNext');
var lbIndex=0,lbPages=[];
function buildGallery(ci){
  var c=window.CASES[ci];
  lbPages=c.pages;
  lbTrack.innerHTML='';
  lbPages.forEach(function(src,idx){
    var fig=document.createElement('figure');
    fig.className='lb-item';
    var im=document.createElement('img');
    im.src=src;im.alt=(idx+1);im.loading=idx<2?'eager':'lazy';im.decoding='async';
    fig.appendChild(im);
    lbTrack.appendChild(fig);
  });
}
function lbUpdate(){
  lbCounter.textContent=pad2(lbIndex+1)+' / '+pad2(lbPages.length);
  $$('.lb-item',lbTrack).forEach(function(el,i){el.classList.toggle('is-current',i===lbIndex);});
}
function openLB(ci){
  buildGallery(ci);
  lbTitle.textContent=window.t('pj.'+window.CASES[ci].id+'.name');
  lbIndex=0;lbUpdate();
  lb.classList.add('is-open');lb.setAttribute('aria-hidden','false');
  document.body.classList.add('lb-open');
  lbTrack.scrollTop=0;
  lbClose.focus();
}
function closeLB(){
  lb.classList.remove('is-open');lb.setAttribute('aria-hidden','true');
  document.body.classList.remove('lb-open');
}
function lbGoto(i){
  if(!lbPages.length)return;
  lbIndex=(i+lbPages.length)%lbPages.length;
  var items=$$('.lb-item',lbTrack);
  if(items[lbIndex])lbTrack.scrollTo({top:items[lbIndex].offsetTop-16,behavior:reduced?'auto':'smooth'});
  lbUpdate();
}
lbClose.addEventListener('click',closeLB);
lbPrev.addEventListener('click',function(){lbGoto(lbIndex-1);});
lbNext.addEventListener('click',function(){lbGoto(lbIndex+1);});
document.addEventListener('keydown',function(e){
  if(!lb.classList.contains('is-open'))return;
  if(e.key==='Escape')closeLB();
  else if(e.key==='ArrowRight')lbGoto(lbIndex+1);
  else if(e.key==='ArrowLeft')lbGoto(lbIndex-1);
});
lbTrack.addEventListener('click',function(e){
  var fig=e.target&&e.target.closest?e.target.closest('.lb-item'):null;
  if(fig)lbGoto(lbIndex+1);
});
var lbTick=false;
lbTrack.addEventListener('scroll',function(){
  if(lbTick)return;lbTick=true;
  requestAnimationFrame(function(){
    lbTick=false;
    var items=$$('.lb-item',lbTrack);
    var mid=lbTrack.scrollTop+lbTrack.clientHeight*0.4;
    for(var i=items.length-1;i>=0;i--){
      if(items[i].offsetTop<=mid){lbIndex=i;break;}
    }
    lbUpdate();
  });
},{passive:true});
/* ---------- services: word-flip slider ---------- */
var srvIdx=0,srvTimer=null;
var srvDots=$('#srvDots'),srvW1=$('#srvW1'),srvW2=$('#srvW2'),srvText=$('#srvText'),srvFlip=$('#srvFlip');
function srvRender(){
  var slides=window.t('srv.slides');
  var s=slides[srvIdx];
  srvW1.textContent=s.w1;
  srvW2.textContent=s.w2;
  srvText.textContent=s.text;
  $$('#srvDots .srv__dot').forEach(function(d,i){d.classList.toggle('is-on',i===srvIdx);});
  srvFlip.classList.remove('is-flipping');
  void srvFlip.offsetWidth;
  srvFlip.classList.add('is-flipping');
}
function srvGoto(i){
  srvIdx=(i+window.t('srv.slides').length)%window.t('srv.slides').length;
  srvRender();
  restartSrvTimer();
}
function restartSrvTimer(){
  clearInterval(srvTimer);
  if(!reduced)srvTimer=setInterval(function(){srvGoto(srvIdx+1);},5600);
}
if(srvDots){
  window.t('srv.slides').forEach(function(_,i){
    var b=document.createElement('button');
    b.type='button';b.className='srv__dot';b.setAttribute('aria-label','Slide '+(i+1));
    b.addEventListener('click',function(){srvGoto(i);});
    srvDots.appendChild(b);
  });
  srvRender();
  restartSrvTimer();
  document.addEventListener('langchange',srvRender);
}

/* morphing heading words */
var srvWords=$('#srvWords');
if(srvWords&&!reduced){
  var wordSpans=$$('span',srvWords),wordIdx=0;
  wordSpans.forEach(function(sp,i){sp.classList.toggle('is-on',i===0);});
  setInterval(function(){
    wordSpans[wordIdx].classList.remove('is-on');
    wordIdx=(wordIdx+1)%wordSpans.length;
    wordSpans[wordIdx].classList.add('is-on');
  },2800);
}else if(srvWords){
  $$('span',srvWords).forEach(function(sp,i){sp.classList.toggle('is-on',i===0);});
}

/* ---------- quotes ---------- */
var qA=$('#qA'),qB=$('#qB'),qStart=0;
function quotesRender(){
  var qs=window.t('srv.quotes');
  var a=qs[qStart%qs.length],b=qs[(qStart+1)%qs.length];
  $('.q__text',qA).textContent=a.text;$('.q__who',qA).textContent=a.who;
  $('.q__text',qB).textContent=b.text;$('.q__who',qB).textContent=b.who;
  [qA,qB].forEach(function(q){
    q.classList.remove('is-in');
    void q.offsetWidth;
    q.classList.add('is-in');
  });
}
if(qA){
  $('#qPrev').addEventListener('click',function(){qStart=(qStart-1+window.t('srv.quotes').length)%window.t('srv.quotes').length;quotesRender();});
  $('#qNext').addEventListener('click',function(){qStart=(qStart+1)%window.t('srv.quotes').length;quotesRender();});
  quotesRender();
  document.addEventListener('langchange',quotesRender);
}

/* ---------- counters ---------- */
function animateCount(el,to,suffix){
  if(reduced){el.textContent=to+suffix;return;}
  var t0=null,DUR=1400;
  function step(ts){
    if(!t0)t0=ts;
    var p=Math.min(1,(ts-t0)/DUR);
    p=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*p)+suffix;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
var numsDone=false;
var numsIO=new IntersectionObserver(function(es){
  es.forEach(function(en){
    if(en.isIntersecting&&!numsDone){
      numsDone=true;
      animateCount($('#statPct'),99,'%');
      $$('[data-count]').forEach(function(el){
        animateCount(el,parseInt(el.getAttribute('data-count'),10),'+');
      });
      numsIO.disconnect();
    }
  });
},{threshold:0.4});
if($('#statPct'))numsIO.observe($('#statPct'));

/* ---------- about tools ---------- */
var aboutTools=$('#aboutTools');
if(aboutTools){
  function renderTools(){
    aboutTools.innerHTML='';
    window.t('about.tools').forEach(function(tl){
      var s=document.createElement('span');
      s.className='chip chip--lg mono';s.textContent=tl;
      aboutTools.appendChild(s);
    });
  }
  renderTools();
  document.addEventListener('langchange',renderTools);
}
/* ---------- reveals (clip-path, like the reference) ---------- */
var revealIO=new IntersectionObserver(function(es){
  es.forEach(function(en){
    if(en.isIntersecting){
      en.target.classList.add('is-in');
      revealIO.unobserve(en.target);
    }
  });
},{threshold:0.18,rootMargin:'0px 0px -6% 0px'});
$$('.reveal-line').forEach(function(el,i){
  el.style.transitionDelay=(el.dataset.delay||(i%6))*60+'ms';
  revealIO.observe(el);
});

/* ---------- rail + anchors ---------- */
var railItems=$$('.rail__item');
var railIO=new IntersectionObserver(function(es){
  es.forEach(function(en){
    if(en.isIntersecting){
      var id=en.target.id;
      railItems.forEach(function(r){r.classList.toggle('is-active',r.getAttribute('data-rail')===id);});
    }
  });
},{threshold:0.35});
$$('main section').forEach(function(s){railIO.observe(s);});
railItems.forEach(function(r){
  r.addEventListener('click',function(e){
    e.preventDefault();
    var el=document.getElementById(r.getAttribute('data-rail'));
    if(el)scrollToEl(el);
  });
});
$$('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var id=a.getAttribute('href').slice(1);
    var el=id?document.getElementById(id):null;
    if(el){
      e.preventDefault();
      scrollToEl(el);
      closeMenu();
    }
  });
});

/* ---------- mobile menu ---------- */
var burger=$('#burger'),mmenu=$('#mmenu');
function closeMenu(){
  document.body.classList.remove('menu-open');
  if(burger)burger.setAttribute('aria-expanded','false');
  if(mmenu)mmenu.setAttribute('aria-hidden','true');
}
if(burger&&mmenu){
  burger.addEventListener('click',function(){
    var open=!document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    mmenu.setAttribute('aria-hidden',open?'false':'true');
  });
}

/* ---------- form → mailto ---------- */
var form=$('#form'),formNote=$('#formNote');
if(form){
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=($('#fName').value||'').trim();
    var email=($('#fEmail').value||'').trim();
    var phone=($('#fPhone').value||'').trim();
    var msg=($('#fProject').value||'').trim();
    if(!name||!email||!msg){
      formNote.textContent=window.t('form.error');
      return;
    }
    var subject=encodeURIComponent('YSMN — '+name);
    var body=encodeURIComponent(msg+'\n\n'+name+' / '+email+(phone?' / '+phone:''));
    formNote.textContent=window.t('form.sent');
    window.location.href='mailto:hello@ysmn.studio?subject='+subject+'&body='+body;
  });
}
})();
