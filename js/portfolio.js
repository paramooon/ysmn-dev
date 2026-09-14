/* YSMN — case data (11 projects, sources from portfolio-site) */
(function(){
'use strict';
var A='assets/';
function p(base,nums){return nums.map(function(n){return A+base+'_p'+(n<10?'0'+n:n)+'.jpg';});}

window.CASES=[
  {id:'lighthouse',pages:p('lighthouse',[1,6,10,16,18,20,24,28,36]),phone:p('lighthouse',[10])[0],
   tools:['ID','PS','AI','AE']},
  {id:'unieco',pages:[A+'unieco_p01.jpg',A+'unieco_p02.jpg',A+'unieco_p03.jpg',A+'unieco_p04.jpg',
    A+'unieco_bottle_collagen.jpg',A+'unieco_bottle_magnesium.jpg',A+'unieco_bottle_zinc.jpg',A+'unieco_bottle_iron.jpg',
    A+'unieco_bottle_d3.jpg',A+'unieco_bottle_vitamina.jpg',A+'unieco_bottle_5htp.jpg',A+'unieco_bottle_tryptophan.jpg',
    A+'unieco_bottle_taurine.jpg',A+'unieco_bottle_lcarnitine.jpg',A+'unieco_bottle_maca.jpg',A+'unieco_bottle_multivitamin.jpg'],
   phone:A+'unieco_bottle_collagen.jpg',tools:['C4D','RS','PS','AI']},
  {id:'rentz',pages:p('rentz',[1,2,3,4,6,8,10,12,14]),phone:p('rentz',[4])[0],tools:['ID','PS','AI']},
  {id:'rubicon',pages:p('rubicon',[1,3,4,5,6,7,8,9]),phone:p('rubicon',[5])[0],tools:['ID','PS','AI']},
  {id:'anker',pages:p('anker',[1,3,5,9,13,17,21,25,29,33,37,41,45,49,53,57]),phone:p('anker',[9])[0],tools:['ID','PS','LR']},
  {id:'formattica',pages:p('formattica',[1,2,3,5,7,9,11,13,17,21,25,29,33,37]),phone:p('formattica',[5])[0],tools:['ID','PS','AI']},
  {id:'trevi',pages:p('trevi',[1,2,3,5,9,13,17,21,25,29,33,37,41]),phone:p('trevi',[9])[0],tools:['PS','AI','ID']},
  {id:'floor',pages:p('floor',[1,3,5,9,13,17,21,25]),phone:p('floor',[5])[0],tools:['ID','PS','C4D']},
  {id:'wh',pages:p('wh',[1,2,3,5,8,12,16,20,24,26]),phone:p('wh',[5])[0],tools:['ID','PS','AI']},
  {id:'nf',pages:p('nf',[1,3,5,7,9,11,13,17,21,25,29,33,37,41,45,49,53,57,61,65,69,73,77]),phone:p('nf',[9])[0],tools:['ID','PS','AI']},
  {id:'kniga',pages:p('kniga',[1,2,3,5,7,9,11,15,19,23,27,31,35,39,43,47,51,55]),phone:p('kniga',[11])[0],tools:['ID','PS','LR']}
];

window.caseImg=function(id,idx){
  var c=window.CASES.filter(function(x){return x.id===id;})[0];
  if(!c)return '';
  return c.pages[(idx||0)%c.pages.length];
};
})();
