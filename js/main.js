/* =========================================================
   YSMN — main.js
   preloader / clock / ruler / pin-hero / lead / case carousel
   services + quotes rotators / about / contact / lightbox
   ========================================================= */
(function(){
'use strict';

var doc=document, win=window;
var $=function(s,c){return (c||doc).querySelector(s);};
var $$=function(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s));};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
var lerp=function(a,b,t){return a+(b-a)*t;};
var FLAT=/[?&]flat=1/.test(win.location.search);
var reduce=win.matchMedia&&win.matchMedia('(prefers-reduced-motion: reduce)').matches;
var t=win.t||function(k){return k;};

/* ---------- body flags ---------- */
if(FLAT)doc.body.classList.add('is-flat');
doc.body.classList.add('js-on');

/* =========================================================
   preloader: letters spread across the screen, then assemble
   ========================================================= */
(function preloader(){
  var pre=$('#preloader'),letters=$('#preLetters'),pct=$('#prePct');
  if(!pre)return;
  var spans=letters?$$('span',letters):[];
  if(reduce||FLAT){
    pre.classList.add('is-done');
    setTimeout(function(){pre.remove();},400);
    doc.body.classList.add('is-ready');
    return;
  }
  var p=0;
  var iv=setInterval(function(){
    p=Math.min(100,p+Math.random()*14+4);
    if(pct)pct.textContent=String(Math.floor(p)).padStart(2,'0');
    var spread=1-p/100;
    spans.forEach(function(sp,i){
      var ang=(i/(spans.length-1||1)-0.5)*2;      // -1..1
      sp.style.transform='translate('+(ang*38*spread)+'vw,'+((i%2?1:-1)*16*spread)+'vh) rotate('+ang*24*spread+'deg)';
      sp.style.opacity=p<12?String(p/12):'1';
    });
    if(p>=100){
      clearInterval(iv);
      pre.classList.add('is-assemble');
      setTimeout(function(){pre.classList.add('is-done');},700);
      setTimeout(function(){
        pre.remove();
        doc.body.classList.add('is-ready');
        $$('.reveal-line').slice(0,10).forEach(function(el,i){
          setTimeout(function(){el.classList.add('is-in');},i*90);
        });
      },1000);
    }
  },110);
})();

/* =========================================================
   clock (MSK) + ruler cursor
   ========================================================= */
(function clock(){
  var el=$('#clock');if(!el)return;
  function tick(){
    try{
      el.textContent=new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'}).format(new Date());
    }catch(e){
      el.textContent=new Date().toTimeString().slice(0,5);
    }
  }
  tick();setInterval(tick,15000);
})();

var scrollMax=1,scrollP=0;
function updScrollP(){
  scrollMax=Math.max(1,doc.documentElement.scrollHeight-win.innerHeight);
  scrollP=clamp(win.scrollY/scrollMax,0,1);
  var cur=$('#rulerCursor');
  if(cur)cur.style.left=(scrollP*100).toFixed(3)+'%';
}

/* =========================================================
   custom cursor
   ========================================================= */
(function cursor(){
  var cur=$('#cursor');if(!cur||FLAT)return;
  var x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
  win.addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;},{passive:true});
  (function loop(){
    x=lerp(x,tx,0.2);y=lerp(y,ty,0.2);
    cur.style.transform='translate('+x+'px,'+y+'px)';
    requestAnimationFrame(loop);
  })();
})();

/* =========================================================
   language box (header popup) + mobile menu
   ========================================================= */
(function ui(){
  var box=$('#langBox'),pop=box?box.parentElement:null;
  if(box&&pop){
    box.addEventListener('click',function(e){
      e.stopPropagation();
      var open=doc.body.classList.toggle('lang-open');
      box.setAttribute('aria-expanded',open?'true':'false');
    });
    doc.addEventListener('click',function(){
      doc.body.classList.remove('lang-open');
      box.setAttribute('aria-expanded','false');
    });
  }
  var burger=$('#burger'),mmenu=$('#mmenu');
  if(burger&&mmenu){
    burger.addEventListener('click',function(){
      var open=doc.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded',open?'true':'false');
      burger.textContent=open?'×':'M';
      doc.body.classList.toggle('is-locked',open);
    });
    $$('.mmenu__link',mmenu).forEach(function(a){
      a.addEventListener('click',function(){
        doc.body.classList.remove('menu-open','is-locked');
        burger.setAttribute('aria-expanded','false');
        burger.textContent='M';
      });
    });
  }
  /* rail click: smooth anchors come from CSS scroll-behavior */
  var rail=$('#rail');
  if(rail){
    $$('.rail__item',rail).forEach(function(a){
      a.addEventListener('click',function(e){
        e.preventDefault();
        var id=a.getAttribute('data-rail');
        var el=id==='hero'?$('#hero'):doc.getElementById(id);
        if(el)el.scrollIntoView({behavior:reduce?'auto':'smooth'});
      });
    });
  }
})();
/* =========================================================
   reveal on scroll
   ========================================================= */
(function reveal(){
  var els=$$('.reveal-line');
  if(!('IntersectionObserver' in win)||reduce||FLAT){
    els.forEach(function(el){el.classList.add('is-in');});
    return;
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('is-in');io.unobserve(en.target);}
    });
  },{threshold:0.2});
  els.forEach(function(el){io.observe(el);});
})();

/* =========================================================
   rail: active section
   ========================================================= */
(function railActive(){
  var items={};$$('.rail__item').forEach(function(a){items[a.getAttribute('data-rail')]=a;});
  if(!Object.keys(items).length||!('IntersectionObserver' in win))return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var id=en.target.id==='hero'?'hero':en.target.id;
      if(en.isIntersecting&&items[id]){
        $$('.rail__item').forEach(function(a){a.classList.remove('is-active');});
        items[id].classList.add('is-active');
      }
    });
  },{rootMargin:'-42% 0px -42% 0px'});
  ['hero','work','services','about','contact'].forEach(function(id){
    var el=doc.getElementById(id);if(el)io.observe(el);
  });
})();

/* =========================================================
   HERO pin: at first only the shell breathes; near the end
   the slide slowly exits up together with its window while
   the 3D cloud stands still (world-compensated inside the
   scene) and sinks behind the window mask.
   ========================================================= */
(function heroPin(){
  var wrap=$('#hero'),hero=$('#heroSlide'),glHolder=$('#gl-hero');
  var lbls={t:$('#lblHT'),r:$('#lblHR'),b:$('#lblHB'),l:$('#lblHL')};
  if(!wrap||!hero)return;
  var pin=0;
  function measure(){
    pin=win.innerHeight*1.35;
    if(!FLAT)wrap.style.height='calc(100vh + '+pin+'px)';
  }
  measure();
  win.addEventListener('resize',measure);

  function smooth(v){v=clamp(v,0,1);return v*v*(3-2*v);}
  function onScroll(){
    if(FLAT){updScrollP();return;}
    var rect=wrap.getBoundingClientRect();
    var total=Math.max(1,rect.height-win.innerHeight);
    var p=clamp(-rect.top/total,0,1);
    /* exit phase: last 45% of the pin scroll — slow rise (55vh) */
    var exit=smooth((p-0.55)/0.45);
    var upPx=exit*win.innerHeight*0.55;
    hero.style.transform=upPx>0.1?'translate3d(0,'+(-upPx).toFixed(1)+'px,0)':'';
    /* blueprint labels tick with progress */
    var inset=Math.round(52-40*exit);
    if(lbls.t)lbls.t.textContent='inset(0px '+inset+'px '+inset+'px 0px)';
    if(lbls.b)lbls.b.textContent='inset('+inset+'px 0px 0px '+inset+'px)';
    if(lbls.r)lbls.r.textContent='inset(0 0 0 '+Math.round(52+exit*40)+'px)';
    if(lbls.l)lbls.l.textContent='inset('+Math.round(52+exit*40)+'px 52px 0 0)';
    var G=win.__YSMN_GL__;
    if(G&&G.hero){
      if(G.hero.setScrollPx)G.hero.setScrollPx(upPx,p);
      else if(G.hero.setScroll)G.hero.setScroll(p);
    }
    doc.body.classList.toggle('is-scrolled',p>0.02||win.scrollY>10);
    updScrollP();
  }
  win.addEventListener('scroll',onScroll,{passive:true});
  win.addEventListener('resize',onScroll);
  onScroll();

  /* click on the window agitates the shell */
  var wEl=$('#heroWin');
  if(wEl){
    wEl.style.pointerEvents='auto';
    wEl.addEventListener('click',function(){
      var G=win.__YSMN_GL__;
      if(G&&G.hero&&G.hero.poke)G.hero.poke();
    });
  }
})();
/* =========================================================
   CASE carousel (11 projects from portfolio.js)
   ========================================================= */
var CASES=win.CASES||[];
var caseState={idx:0,page:0};

function caseData(i){return CASES[(i+CASES.length)%CASES.length];}

function renderCaseText(){
  var c=caseData(caseState.idx);
  if(!c)return;
  var nameEl=$('#caseName'),tagEl=$('#caseTag'),txtEl=$('#caseText'),metaEl=$('#caseMeta');
  if(nameEl)nameEl.textContent=t('pj.'+c.id+'.name');
  if(tagEl)tagEl.textContent=t('pj.'+c.id+'.tag');
  if(txtEl)txtEl.textContent=t('pj.'+c.id+'.desc');
  if(metaEl)metaEl.textContent='CASE '+String(caseState.idx+1).padStart(2,'0')+' / '+String(CASES.length).padStart(2,'0');
  var toolsEl=$('#caseTools');
  if(toolsEl){
    toolsEl.innerHTML='';
    (c.tools||[]).forEach(function(tl){
      var s=doc.createElement('span');
      s.className='chip';
      s.textContent=tl;
      toolsEl.appendChild(s);
    });
  }
}

function renderCaseThumbs(c){
  var wrap=$('#caseThumbs');if(!wrap)return;
  wrap.innerHTML='';
  c.pages.slice(0,6).forEach(function(src,i){
    var b=doc.createElement('button');
    b.type='button';b.className='case__thumb'+(i===caseState.page?' is-current':'');
    b.setAttribute('aria-label','Page '+(i+1));
    var im=doc.createElement('img');
    im.src=src;im.alt='';im.loading='lazy';im.decoding='async';
    b.appendChild(im);
    b.addEventListener('click',function(){setCasePage(i);});
    wrap.appendChild(b);
  });
}

function setCasePage(i){
  var c=caseData(caseState.idx);
  caseState.page=clamp(i,0,c.pages.length-1);
  var main=$('#caseMain'),img=$('#caseImg');
  if(main&&img){
    main.classList.add('is-fading');
    var next=new Image();
    next.onload=next.onerror=function(){
      img.src=c.pages[caseState.page];
      main.classList.remove('is-fading');
    };
    next.src=c.pages[caseState.page];
  }
  var ph=$('#casePhone');
  if(ph&&c.phone)ph.src=c.phone;
  $$('#caseThumbs .case__thumb').forEach(function(el,k){
    el.classList.toggle('is-current',k===caseState.page);
  });
}

function setCase(idx){
  if(!CASES.length)return;
  caseState.idx=(idx+CASES.length)%CASES.length;
  caseState.page=0;
  var c=caseData(caseState.idx);
  setCasePage(0);
  renderCaseText();
  renderCaseThumbs(c);
  var box=$('#case');
  if(box&&!reduce){
    box.classList.remove('is-swapped');
    void box.offsetWidth;
    box.classList.add('is-swapped');
    setTimeout(function(){box.classList.remove('is-swapped');},600);
  }
}

(function caseInit(){
  if(!CASES.length)return;
  var c=CASES[0];
  var img=$('#caseImg');
  if(img)img.src=c.pages[0];
  var ph=$('#casePhone');
  if(ph)ph.src=c.phone;
  renderCaseText();
  renderCaseThumbs(c);
  var prev=$('#casePrev'),next=$('#caseNext');
  if(prev)prev.addEventListener('click',function(){setCase(caseState.idx-1);});
  if(next)next.addEventListener('click',function(){setCase(caseState.idx+1);});
  var share=$('#caseShare');
  if(share){
    share.addEventListener('click',function(){
      var url=win.location.origin+win.location.pathname+'#work';
      function done(){
        var meta=$('#caseMeta');
        if(meta){
          meta.textContent=t('work.copied');
          setTimeout(renderCaseText,1400);
        }
      }
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(done,done);
      }else{done();}
    });
  }
  var main=$('#caseMain');
  if(main){
    main.addEventListener('click',function(){openLightbox(caseState.idx,caseState.page);});
  }
  doc.addEventListener('keydown',function(e){
    if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
    var sec=doc.getElementById('work');
    if(!sec)return;
    var rect=sec.getBoundingClientRect();
    var visible=rect.top<win.innerHeight*0.7&&rect.bottom>win.innerHeight*0.3;
    if(!visible)return;
    if(e.key==='ArrowLeft')setCase(caseState.idx-1);
    if(e.key==='ArrowRight')setCase(caseState.idx+1);
  });
})();
/* =========================================================
   LIGHTBOX
   ========================================================= */
var lbState={open:false,idx:0,page:0};
function openLightbox(caseIdx,pageIdx){
  var lb=$('#lightbox');if(!lb)return;
  var c=caseData(caseIdx);
  if(!c)return;
  lbState.open=true;lbState.idx=caseIdx;lbState.page=pageIdx||0;
  var track=$('#lbTrack');
  track.innerHTML='';
  c.pages.forEach(function(src,i){
    var f=doc.createElement('figure');
    f.className='lb-item';
    var im=doc.createElement('img');
    im.src=src;im.alt='';im.loading='lazy';
    f.appendChild(im);
    track.appendChild(f);
  });
  $('#lbTitle').textContent=t('pj.'+c.id+'.name');
  lb.classList.add('is-open');
  lb.setAttribute('aria-hidden','false');
  doc.body.classList.add('is-locked');
  var target=track.children[lbState.page];
  if(target)track.scrollTop=target.offsetTop-40;
  updateLbCounter();
  var items=$$('.lb-item',track);
  if('IntersectionObserver' in win){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting&&en.intersectionRatio>0.6){
          items.forEach(function(el){el.classList.remove('is-current');});
          en.target.classList.add('is-current');
          lbState.page=items.indexOf(en.target);
          updateLbCounter();
        }
      });
    },{root:track,threshold:[0.6]});
    items.forEach(function(el){io.observe(el);});
  }
}
function updateLbCounter(){
  var c=caseData(lbState.idx);
  var el=$('#lbCounter');
  if(el&&c)el.textContent=String(lbState.page+1).padStart(2,'0')+' / '+String(c.pages.length).padStart(2,'0');
}
(function lbInit(){
  var lb=$('#lightbox');if(!lb)return;
  function close(){
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden','true');
    lbState.open=false;
    doc.body.classList.remove('is-locked');
  }
  $('#lbClose').addEventListener('click',close);
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  function lbScroll(dir){
    var track=$('#lbTrack');
    var items=$$('.lb-item',track);
    if(!items.length)return;
    var n=clamp(lbState.page+dir,0,items.length-1);
    track.scrollTo({top:items[n].offsetTop-40,behavior:reduce?'auto':'smooth'});
  }
  $('#lbPrev').addEventListener('click',function(){lbScroll(-1);});
  $('#lbNext').addEventListener('click',function(){lbScroll(1);});
  doc.addEventListener('keydown',function(e){
    if(!lbState.open)return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft')lbScroll(-1);
    if(e.key==='ArrowRight')lbScroll(1);
  });
})();
/* =========================================================
   lead connector: dashed line grows with scroll
   ========================================================= */
(function lead(){
  var lead=$('#lead'),dash=$('#leadDash');
  if(!lead||!dash)return;
  var a=$('#leadNodeA'),b=$('#leadNodeB');
  var shown=false;
  function onScroll(){
    var r=lead.getBoundingClientRect();
    var vh=win.innerHeight;
    var ratio=clamp((vh*0.85-r.top)/(r.height*0.72),0,1);
    if(ratio>0.004&&!shown){shown=true;lead.classList.add('is-on');}
    dash.style.clipPath='inset('+((1-ratio)*100).toFixed(1)+'% 0 0 0)';
    if(a)a.classList.toggle('is-on',ratio>0.01);
    if(b)b.classList.toggle('is-on',ratio>0.96);
  }
  win.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
})();

/* =========================================================
   services: word rotator + slide rotator + counters
   ========================================================= */
(function services(){
  var words=$('#srvWords');
  if(words){
    var spans=$$('span',words);
    var wi=0;
    spans.forEach(function(sp,i){sp.classList.toggle('is-on',i===0);});
    setInterval(function(){
      if(FLAT)return;
      spans[wi].classList.remove('is-on');
      wi=(wi+1)%spans.length;
      spans[wi].classList.add('is-on');
    },3600);
  }

  var SLIDES=(win.I18N&&win.getLang)?(win.I18N[win.getLang()]['srv.slides']||[]):[];
  var flip=$('#srvFlip'),dotsEl=$('#srvDots'),txtEl=$('#srvText');
  var w1=$('#srvW1'),w2=$('#srvW2');
  var si=0,timer=null;
  function slides(){return (win.I18N[win.getLang()]&&win.I18N[win.getLang()]['srv.slides'])||[];}
  function renderDots(n){
    if(!dotsEl)return;
    dotsEl.innerHTML='';
    for(var i=0;i<n;i++){
      var d=doc.createElement('button');
      d.type='button';d.className='srv__dot'+(i===si?' is-on':'');
      d.setAttribute('aria-label','Slide '+(i+1));
      d.addEventListener('click',function(){show(parseInt(d.getAttribute('aria-label').slice(6),10)-1);});
      dotsEl.appendChild(d);
    }
  }
  function show(i){
    var arr=slides();if(!arr.length)return;
    si=(i+arr.length)%arr.length;
    var s=arr[si];
    if(w1)w1.textContent=s.w1;
    if(w2)w2.textContent=s.w2;
    if(txtEl)txtEl.textContent=s.text;
    $$('.srv__dot',dotsEl).forEach(function(d,k){d.classList.toggle('is-on',k===si);});
    if(flip&&!reduce){
      flip.classList.remove('is-flipping');
      void flip.offsetWidth;
      flip.classList.add('is-flipping');
      setTimeout(function(){flip.classList.remove('is-flipping');},600);
    }
  }
  function start(){
    if(timer)clearInterval(timer);
    if(FLAT||reduce)return;
    timer=setInterval(function(){show(si+1);},4600);
  }
  if(flip){
    show(0);renderDots(slides().length||3);start();
    doc.addEventListener('langchange',function(){
      show(si);renderDots(slides().length||3);
    });
  }

  /* quotes */
  var qA=$('#qA'),qB=$('#qB');
  var qi=0;
  function quotes(){return (win.I18N[win.getLang()]&&win.I18N[win.getLang()]['srv.quotes'])||[];}
  function renderQuotes(){
    var arr=quotes();if(!arr.length||!qA||!qB)return;
    var a=arr[qi%arr.length],b=arr[(qi+1)%arr.length];
    $('.q__text',qA).textContent=a.text;
    $('.q__who',qA).textContent=a.who;
    $('.q__text',qB).textContent=b.text;
    $('.q__who',qB).textContent=b.who;
  }
  var qPrev=$('#qPrev'),qNext=$('#qNext');
  if(qPrev)qPrev.addEventListener('click',function(){qi=(qi-1+quotes().length)%quotes().length;renderQuotes();pulseQ();});
  if(qNext)qNext.addEventListener('click',function(){qi=(qi+1)%quotes().length;renderQuotes();pulseQ();});
  function pulseQ(){
    [qA,qB].forEach(function(el){
      if(!el||reduce)return;
      el.classList.remove('is-in');void el.offsetWidth;el.classList.add('is-in');
    });
  }
  if(qA&&qB){
    renderQuotes();
    doc.addEventListener('langchange',renderQuotes);
  }

  /* counters */
  function animCount(el){
    var target=parseInt(el.getAttribute('data-count'),10)||0;
    var start=performance.now(),dur=1200;
    function frame(now){
      var k=clamp((now-start)/dur,0,1);
      var e=1-Math.pow(1-k,3);
      el.textContent=Math.round(target*e)+'+';
      if(k<1)requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var pctEl=$('#statPct');
  function animPct(){
    if(!pctEl)return;
    var start=performance.now(),dur=1400;
    function frame(now){
      var k=clamp((now-start)/dur,0,1);
      var e=1-Math.pow(1-k,3);
      pctEl.textContent=Math.round(100*e)+'%';
      if(k<1)requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var nums=$('.srv__nums');
  if(nums&&'IntersectionObserver' in win&&!FLAT){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting){
          $$('[data-count]',nums).forEach(animCount);
          animPct();
          io.disconnect();
        }
      });
    },{threshold:0.4});
    io.observe(nums);
  }else{
    $$('[data-count]').forEach(function(el){el.textContent=el.getAttribute('data-count')+'+';});
    if(pctEl)pctEl.textContent='100%';
  }
})();
/* =========================================================
   about tools chips + contact form
   ========================================================= */
(function aboutTools(){
  var box=$('#aboutTools');
  function render(){
    if(!box)return;
    var arr=(win.I18N[win.getLang()]&&win.I18N[win.getLang()]['about.tools'])||[];
    box.innerHTML='';
    arr.forEach(function(name){
      var s=doc.createElement('span');
      s.className='chip chip--lg';
      s.textContent=name;
      box.appendChild(s);
    });
  }
  render();
  doc.addEventListener('langchange',render);
})();

(function contactForm(){
  var form=$('#form');
  if(!form)return;
  var note=$('#formNote');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=$('#fName').value.trim();
    var email=$('#fEmail').value.trim();
    var project=$('#fProject').value.trim();
    var phone=$('#fPhone')?$('#fPhone').value.trim():'';
    if(!name||!email||!project){
      if(note)note.textContent=t('form.error');
      return;
    }
    var subject='Project inquiry — '+name;
    var body=project+(phone?('\n\nPhone: '+phone):'')+'\n\n— '+name+' ('+email+')';
    if(note)note.textContent=t('form.sent');
    win.location.href='mailto:hello@ysmn.studio?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });
})();

/* =========================================================
   misc: initial scroll state + flat-mode final paint
   ========================================================= */
updScrollP();
if(FLAT){
  win.addEventListener('load',function(){
    $$('.reveal-line').forEach(function(el){el.classList.add('is-in');});
  });
}
})();

