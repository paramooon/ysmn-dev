/* YSMN — i18n EN/RU */
(function(){
'use strict';
var DICT={
en:{
  'meta.title':'YSMN — CGI studio',
  'nav.work':'Work','nav.services':'Services','nav.about':'About','nav.contact':'Contact',
  'rail.intro':'Intro','rail.work':'Work','rail.services':'Services','rail.about':'About','rail.contact':'Contact',

  'hero.l1':'01. CGI Studio',
  'hero.l2':'02. Moscow Based',
  'hero.l3':'03. T: +7 925 000 00 00<br>M: hello@ysmn.studio',
  'hero.l4':'04. Open for projects',
  'hero.w1':'Shaping<br>Worlds',
  'hero.w2':'Rendering<br>Emotions',
  'hero.scroll':'Scroll to explore',

  'work.title':'Selected Work',
  'work.lead':'Projects',
  'work.sub':'Selected full-CG productions, from concept to final frame.',
  'work.cta':'Start a Project',
  'work.zoom':'View gallery',
  'work.copied':'Link copied',

  'ct.title':'Contact','ct.info':'Information','ct.connect':'Connect',
  'ct.whatsapp':'WhatsApp','ct.addr':'Moscow, Russia','ct.hours':'10:00 — 20:00 MSK',
  'ct.name':'Your name','ct.email':'Your email','ct.phone':'Phone (optional)',
  'ct.project':'Tell me about your project','ct.submit':'Discuss a project',
  'form.error':'Please fill in your name, email and project.','form.sent':'Opening your mail client — thank you.',
  'ft.copy':'ysmn © 2026','ft.privacy':'Privacy policy','ft.terms':'Terms of service',
  'ft.made':'Crafted with three.js — no templates',

  'srv.kicker':'Craft, physics and light working together. Without compromise.',
  'srv.w1':'Photoreal','srv.w2':'Physical','srv.w3':'Precise',
  'srv.cta':'Get in touch',
  'srv.satisfaction':'Satisfaction','srv.shots':'Shots Delivered','srv.years':'Years Experience',
  'srv.slides':[
    {w1:'full-CG',w2:'production',text:'Photoreal product and interior shots built entirely in the machine — no studio, no limits: lighting, materials and camera under full control.'},
    {w1:'simulation',w2:'& motion',text:'Houdini-driven dynamics: fluids, cloth, destruction and particles that give the frame life, rhythm and a physical sense of weight.'},
    {w1:'lookdev',w2:'& lighting',text:'Materials and light as the language of the brand — shaders, HDRIs and color scripts tuned until the surface feels touchable.'}
  ],
  'srv.quotes':[
    {text:'YSMN delivered the impossible: a full-CG film that our clients could not tell from live footage. Precise, fast, and genuinely creative.',who:'M. Willenbroek • CEO — Macada'},
    {text:'The renders lifted our packaging far beyond photography. Every material reads exactly as we imagined it.',who:'S. van Koppen • Co-founder — Arithma'},
    {text:'Tim thinks along proactively, suggests what we had not considered, and explains every decision clearly.',who:'Manolya • Psychotherapy'},
    {text:'From first storyboard to final delivery the process was transparent and calm. The result is ten times better than a template.',who:'Palma • Founder — Nukatak'}
  ],

  'about.title':'About',
  'about.sub':'Strategy, craft and technology — connected from first idea to final frame.',
  'about.cta':'Get in touch',
  'about.text':'YSMN is a CGI studio crafting photoreal worlds — full-CG shots, simulations, lookdev and lighting for ambitious brands.',
  'about.figcaption':'Unieco — full-CG product renders',
  'about.tools':['Houdini','Karma','Redshift','Nuke','Cinema 4D','Blender','After Effects','Figma'],
  'pj.lighthouse.name':'Lighthouse','pj.lighthouse.tag':'Lighting catalog 2026','pj.lighthouse.desc':'A nation-wide lighting brand catalog — art direction, layout system and print production across 200+ pages of product photography.',
  'pj.unieco.name':'UNIECO','pj.unieco.tag':'Vitamins packaging & CGI','pj.unieco.desc':'Full packaging line for a vitamin brand: label system, palette and a family of full-CG bottle renders for every SKU.',
  'pj.rentz.name':'RENTZ','pj.rentz.tag':'Doors & partitions','pj.rentz.desc':'Catalog for a doors and partitions manufacturer — restrained grid, precise technical drawings and tactile materials.',
  'pj.rubicon.name':'Rubicon','pj.rubicon.tag':'Contractor presentation','pj.rubicon.desc':'Presentation for a general contractor: engineering clarity, strong typography and structured project storytelling.',
  'pj.anker.name':'Anker Group','pj.anker.tag':'Developer catalog','pj.anker.desc':'A book of residential projects for a developer — panorama-driven spreads and calm editorial rhythm.',
  'pj.formattica.name':'Formattica','pj.formattica.tag':'Furniture catalog','pj.formattica.desc':'Furniture collection catalog: modular layout system reflecting the products themselves.',
  'pj.trevi.name':'Trevi','pj.trevi.tag':'Vinyl print','pj.trevi.desc':'Large-format vinyl print series — bold graphics engineered for real-world scale.',
  'pj.floor.name':'Raised floor','pj.floor.tag':'Industrial floors','pj.floor.desc':'Technical catalog for raised floor systems — diagrams, specs and industrial photography unified in one system.',
  'pj.wh.name':'WH — 24','pj.wh.tag':'Presentation 2024','pj.wh.desc':'Corporate presentation for WH — twenty-four pages of product story told through light and space.',
  'pj.nf.name':'New format','pj.nf.tag':'Catalog №4','pj.nf.desc':'The fourth issue of the New Format catalog — editorial design for an industrial audience.',
  'pj.kniga.name':'Smart Group','pj.kniga.tag':'Book of projects','pj.kniga.desc':'A large-format book of panorama projects for Smart Group — print design at architectural scale.'
},
ru:{
  'meta.title':'YSMN — CGI-студия',
  'nav.work':'Работы','nav.services':'Услуги','nav.about':'О студии','nav.contact':'Контакты',
  'rail.intro':'Интро','rail.work':'Работы','rail.services':'Услуги','rail.about':'О студии','rail.contact':'Контакты',

  'hero.l1':'01. CGI-студия',
  'hero.l2':'02. Москва',
  'hero.l3':'03. T: +7 925 000 00 00<br>M: hello@ysmn.studio',
  'hero.l4':'04. Открыты для проектов',
  'hero.w1':'Создаём<br>миры',
  'hero.w2':'Рендерим<br>эмоции',
  'hero.scroll':'Листайте, чтобы посмотреть',

  'work.title':'Избранные работы',
  'work.lead':'Проекты',
  'work.sub':'Полностью CG-продакшены — от концепта до финального кадра.',
  'work.cta':'Обсудить проект',
  'work.zoom':'Смотреть галерею',
  'work.copied':'Ссылка скопирована',

  'ct.title':'Контакты','ct.info':'Информация','ct.connect':'Связаться',
  'ct.whatsapp':'WhatsApp','ct.addr':'Москва, Россия','ct.hours':'10:00 — 20:00 МСК',
  'ct.name':'Ваше имя','ct.email':'Ваш email','ct.phone':'Телефон (необязательно)',
  'ct.project':'Расскажите о проекте','ct.submit':'Обсудить проект',
  'form.error':'Заполните имя, email и описание проекта.','form.sent':'Открываю почтовый клиент — спасибо.',
  'ft.copy':'ysmn © 2026','ft.privacy':'Политика конфиденциальности','ft.terms':'Условия использования',
  'ft.made':'Собрано на three.js — без шаблонов',

  'srv.kicker':'Ремесло, физика и свет работают вместе. Без компромиссов.',
  'srv.w1':'Фотореализм','srv.w2':'Физика','srv.w3':'Точность',
  'srv.cta':'Связаться',
  'srv.satisfaction':'Довольных клиентов','srv.shots':'Сданных шотов','srv.years':'Лет опыта',
  'srv.slides':[
    {w1:'full-CG',w2:'продакшен',text:'Фотореалистичные кадры продуктов и интерьеров, созданные целиком в машине — без студии и её ограничений: свет, материалы и камера под полным контролем.'},
    {w1:'симуляции',w2:'и моушен',text:'Динамика на Houdini: жидкости, ткань, разрушения и частицы — они дают кадру жизнь, ритм и физическое ощущение веса.'},
    {w1:'лукдев',w2:'и свет',text:'Материалы и свет как язык бренда — шейдеры, HDRI и колор-скрипты настроены до тех пор, пока поверхность не станет осязаемой.'}
  ],
  'srv.quotes':[
    {text:'YSMN сделал невозможное: полностью CG-ролик, который клиенты не отличили от съёмки. Точно, быстро и по-настоящему креативно.',who:'M. Willenbroek • CEO — Macada'},
    {text:'Рендеры подняли нашу упаковку далеко выше фотографии. Каждый материал читается ровно так, как мы задумывали.',who:'S. van Koppen • Сооснователь — Arithma'},
    {text:'Студия мыслит проактивно, предлагает то, о чём мы не подумали, и ясно объясняет каждое решение.',who:'Manolya • Психотерапия'},
    {text:'От первого сториборда до финальной сдачи процесс был прозрачным и спокойным. Результат в десять раз лучше шаблона.',who:'Palma • Основатель — Nukatak'}
  ],

  'about.title':'О студии',
  'about.sub':'Стратегия, ремесло и технологии — связаны от первой идеи до финального кадра.',
  'about.cta':'Связаться',
  'about.text':'YSMN — CGI-студия, создающая фотореалистичные миры: full-CG кадры, симуляции, лукдев и свет для амбициозных брендов.',
  'about.figcaption':'Unieco — full-CG рендеры упаковки',
  'about.tools':['Houdini','Karma','Redshift','Nuke','Cinema 4D','Blender','After Effects','Figma'],
  'pj.lighthouse.name':'Lighthouse','pj.lighthouse.tag':'Каталог света 2026','pj.lighthouse.desc':'Каталог федерального бренда света — арт-дирекшн, система макетов и печатная подготовка 200+ страниц продуктовой съёмки.',
  'pj.unieco.name':'UNIECO','pj.unieco.tag':'Упаковка витаминов и CGI','pj.unieco.desc':'Полная линия упаковки для бренда витаминов: система этикеток, палитра и семейство full-CG рендеров флаконов для каждого SKU.',
  'pj.rentz.name':'RENTZ','pj.rentz.tag':'Двери и перегородки','pj.rentz.desc':'Каталог производителя дверей и перегородок — сдержанная сетка, точные чертежи и тактильные материалы.',
  'pj.rubicon.name':'Rubicon','pj.rubicon.tag':'Презентация генподрядчика','pj.rubicon.desc':'Презентация генподрядчика: инженерная ясность, сильная типографика и структурированный сторителлинг проектов.',
  'pj.anker.name':'Anker Group','pj.anker.tag':'Каталог застройщика','pj.anker.desc':'Книга жилых проектов застройщика — панорамные развороты и спокойный редакционный ритм.',
  'pj.formattica.name':'Formattica','pj.formattica.tag':'Каталог мебели','pj.formattica.desc':'Каталог мебельной коллекции: модульная система макетов, отражающая сами продукты.',
  'pj.trevi.name':'Trevi','pj.trevi.tag':'Виниловый принт','pj.trevi.desc':'Серия широкоформатных виниловых принтов — смелая графика, рассчитанная на реальный масштаб.',
  'pj.floor.name':'Фальшполы','pj.floor.tag':'Индустриальные полы','pj.floor.desc':'Технический каталог систем фальшполов — схемы, спецификации и индустриальная съёмка в единой системе.',
  'pj.wh.name':'WH — 24','pj.wh.tag':'Презентация 2024','pj.wh.desc':'Корпоративная презентация WH — двадцать четыре страницы истории продукта через свет и пространство.',
  'pj.nf.name':'Новый формат','pj.nf.tag':'Каталог №4','pj.nf.desc':'Четвёртый выпуск каталога «Новый формат» — редакционный дизайн для индустриальной аудитории.',
  'pj.kniga.name':'Smart Group','pj.kniga.tag':'Книга проектов','pj.kniga.desc':'Книга панорамных проектов Smart Group большим форматом — печатный дизайн в архитектурном масштабе.'
}
};

/* ---------- engine ---------- */
var store=null;
try{store=window.localStorage;}catch(e){}
function detect(){var l=(navigator.language||'en').slice(0,2).toLowerCase();return l==='ru'?'ru':'en';}
var lang=(store&&store.getItem('ysmn-lang'))||detect();
if(!DICT[lang])lang='en';

function t(key){
  var v=DICT[lang][key];
  if(v===undefined)v=DICT.en[key];
  return v===undefined?key:v;
}
function apply(root){
  root=root||document;
  var els=root.querySelectorAll('[data-i18n]');
  for(var i=0;i<els.length;i++){var k=els[i].getAttribute('data-i18n');els[i].textContent=t(k);}
  var elsH=root.querySelectorAll('[data-i18n-html]');
  for(var j=0;j<elsH.length;j++){var k2=elsH[j].getAttribute('data-i18n-html');elsH[j].innerHTML=t(k2);}
  document.documentElement.lang=lang;
  var ti=document.querySelector('title');
  if(ti)ti.textContent=t('meta.title');
  var btns=document.querySelectorAll('.lang__btn');
  for(var q=0;q<btns.length;q++){btns[q].setAttribute('aria-pressed',btns[q].getAttribute('data-lang')===lang?'true':'false');}
}
function setLang(l){
  if(!DICT[l])return;
  lang=l;
  if(store)try{store.setItem('ysmn-lang',l);}catch(e){}
  apply();
  document.dispatchEvent(new CustomEvent('langchange',{detail:{lang:l}}));
}
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('.lang__btn'):null;
  if(b)setLang(b.getAttribute('data-lang'));
});

window.I18N=DICT;
window.t=t;
window.applyI18n=apply;
window.getLang=function(){return lang;};
window.setLang=setLang;
apply();
})();