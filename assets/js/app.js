(function(){
"use strict";
var root=document.documentElement;
var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var isTouch=window.matchMedia("(hover: none)").matches;
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

if(!window.gsap||!window.ScrollTrigger){root.classList.remove("js");initStatic();return}
gsap.registerPlugin(ScrollTrigger);

/* 平滑滚动 */
var lenis=null;
if(!reduced&&window.Lenis){
  lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true});
  lenis.on("scroll",ScrollTrigger.update);
  gsap.ticker.add(function(t){lenis.raf(t*1000)});
  gsap.ticker.lagSmoothing(0);
  window.__lenis=lenis;
}
$$('a[href^="#"]').forEach(function(a){
  a.addEventListener("click",function(e){
    var id=a.getAttribute("href");var el=id==="#top"?document.body:$(id);
    if(!el)return;e.preventDefault();closeDrawer();
    if(lenis)lenis.scrollTo(el,{offset:id==="#top"?0:-72,duration:1.4});else el.scrollIntoView({behavior:reduced?"auto":"smooth"});
  });
});

/* 导航 */
var nav=$("#nav"),burger=$("#burger");
function closeDrawer(){nav.classList.remove("is-open");burger.setAttribute("aria-expanded","false")}
burger.addEventListener("click",function(){var o=nav.classList.toggle("is-open");burger.setAttribute("aria-expanded",o?"true":"false")});
ScrollTrigger.create({start:0,end:"max",onUpdate:function(self){
  var y=self.scroll();
  nav.classList.toggle("is-solid",y>40);
  if(nav.classList.contains("is-open"))return;
  nav.classList.toggle("is-hidden",self.direction===1&&y>700);
}});
var links=$$(".nav__links a");
links.forEach(function(a){
  var sec=$(a.getAttribute("href"));if(!sec)return;
  ScrollTrigger.create({trigger:sec,start:"top 45%",end:"bottom 45%",onToggle:function(s){if(s.isActive){links.forEach(function(l){l.classList.remove("is-on")});a.classList.add("is-on")}else a.classList.remove("is-on")}});
});
gsap.to(".progress i",{scaleX:1,ease:"none",scrollTrigger:{start:0,end:"max",scrub:.3}});

/* 首屏标题 */
$$(".hero__title .split").forEach(function(el){
  var t=el.textContent;el.textContent="";
  t.split("").forEach(function(c){var s=document.createElement("span");s.className="ch";s.textContent=c;el.appendChild(s)});
});
function gradLine(){var l=$(".hero__title .line:last-child .split");if(!l)return;var w=l.offsetWidth;$$(".ch",l).forEach(function(c){c.style.backgroundSize=w+"px 100%";c.style.backgroundPosition=(-c.offsetLeft)+"px 0"})}
gradLine();window.addEventListener("resize",gradLine);if(document.fonts)document.fonts.ready.then(gradLine);
if(reduced){gsap.set("[data-hero]",{opacity:1,y:0})}
else{
  var tl=gsap.timeline({defaults:{ease:"expo.out"},delay:.15});
  tl.from(".hero__title .ch",{yPercent:115,rotate:6,duration:1.2,stagger:.045})
    .to("[data-hero]",{opacity:1,y:0,duration:1,stagger:.12},"-=.9");
  gsap.to(".hero__copy",{yPercent:-18,opacity:.25,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
  gsap.to(".hero__mesh",{yPercent:20,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
}

/* 滚动渐显 */
function revealIn(els){gsap.to(els,{opacity:1,y:0,duration:1.1,ease:"expo.out",stagger:.08,overwrite:true})}
ScrollTrigger.batch(".reveal",{start:"top 88%",once:true,onEnter:revealIn});
$$(".reveal-group").forEach(function(g){ScrollTrigger.create({trigger:g,start:"top 85%",once:true,onEnter:function(){revealIn(g.children)}})});

/* 视差 */
$$("[data-speed]").forEach(function(el){
  var sp=parseFloat(el.getAttribute("data-speed"));
  gsap.to(el,{y:function(){return sp*window.innerHeight},ease:"none",scrollTrigger:{trigger:el.parentNode,start:"top bottom",end:"bottom top",scrub:true}});
});
gsap.fromTo(".foot__big",{yPercent:40},{yPercent:6,ease:"none",scrollTrigger:{trigger:".foot",start:"top bottom",end:"bottom bottom",scrub:true}});

/* 关于：逐字点亮 */
var scrub=$("#scrub");
if(scrub){
  var txt=scrub.textContent;scrub.textContent="";
  var ws=txt.split("").map(function(c){var s=document.createElement("span");s.className="w";s.textContent=c;scrub.appendChild(s);return s});
  ScrollTrigger.create({trigger:scrub,start:"top 80%",end:"bottom 45%",scrub:true,onUpdate:function(s){
    var n=Math.round(s.progress*ws.length);
    for(var i=0;i<ws.length;i++)ws[i].classList.toggle("on",i<n);
  }});
}

/* 时间线 */
var tlSvg=$(".timeline__line");
if(tlSvg){
  var base=tlSvg.querySelector("line");var fill=base.cloneNode();fill.setAttribute("class","fill");tlSvg.appendChild(fill);
  fill.setAttribute("x2","0");
  var items=$$(".timeline li");
  ScrollTrigger.create({trigger:"#timeline",start:"top 75%",end:"bottom 55%",scrub:true,onUpdate:function(s){
    fill.setAttribute("x2",String(1000*s.progress));
    items.forEach(function(li,i){li.classList.toggle("lit",s.progress>=i/(items.length-1)-.02)});
  }});
  if(window.innerWidth<=720){items.forEach(function(li){ScrollTrigger.create({trigger:li,start:"top 75%",onEnter:function(){li.classList.add("lit")}})})}
}

/* 业务切换 */
var tabs=$$(".biz__tabs button"),panels=$$(".biz__panel"),glyph=$("#bizGlyph");
var glyphs=["团","投","播","达","仓","智"];var cur=0;
function showTab(i){
  if(i===cur)return;var prev=panels[cur],next=panels[i];cur=i;
  tabs.forEach(function(t,k){t.setAttribute("aria-selected",k===i?"true":"false");t.tabIndex=k===i?0:-1});
  if(reduced){prev.classList.remove("is-on");next.classList.add("is-on");glyph.textContent=glyphs[i];return}
  gsap.killTweensOf([prev,next,glyph]);
  gsap.to(prev,{opacity:0,y:-16,duration:.25,ease:"power2.in",onComplete:function(){
    prev.classList.remove("is-on");gsap.set(prev,{clearProps:"all"});
    next.classList.add("is-on");
    gsap.fromTo(next,{opacity:0,y:24},{opacity:1,y:0,duration:.6,ease:"expo.out"});
    gsap.fromTo(next.querySelectorAll("li"),{opacity:0,x:-12},{opacity:1,x:0,duration:.5,stagger:.05,ease:"expo.out",delay:.1});
  }});
  gsap.to(glyph,{opacity:0,scale:.9,duration:.25,onComplete:function(){glyph.textContent=glyphs[i];gsap.to(glyph,{opacity:1,scale:1,duration:.7,ease:"expo.out"})}});
}
tabs.forEach(function(t,i){
  t.addEventListener("click",function(){showTab(i)});
  t.addEventListener("keydown",function(e){var d=e.key==="ArrowDown"||e.key==="ArrowRight"?1:e.key==="ArrowUp"||e.key==="ArrowLeft"?-1:0;if(!d)return;e.preventDefault();var n=(cur+d+tabs.length)%tabs.length;showTab(n);tabs[n].focus()});
});

/* 光斑 */
$$(".spot").forEach(function(el){el.addEventListener("pointermove",function(e){var r=el.getBoundingClientRect();el.style.setProperty("--mx",(e.clientX-r.left)+"px");el.style.setProperty("--my",(e.clientY-r.top)+"px")})});

/* 数字滚动 */
$$(".count").forEach(function(el){
  var to=+el.getAttribute("data-to"),suf=el.getAttribute("data-suffix")||"";
  var o={v:0};
  function draw(){el.textContent=Math.round(o.v)+suf}
  if(reduced){o.v=to;draw();return}
  draw();
  ScrollTrigger.create({trigger:el,start:"top 90%",once:true,onEnter:function(){gsap.to(o,{v:to,duration:2.2,ease:"power3.out",onUpdate:draw})}});
});

/* 流程连线 */
var steps=$(".steps"),path=$("#stepsPath"),stepEls=$$(".step");
function layoutSteps(){
  var h=steps.offsetHeight;var svg=path.ownerSVGElement;svg.setAttribute("viewBox","0 0 4 "+h);svg.style.height=h+"px";
  path.setAttribute("d","M2 0 L2 "+h);
}
if(steps){
  layoutSteps();
  var bg=path.cloneNode();bg.removeAttribute("id");bg.setAttribute("stroke","rgba(238,243,248,.14)");path.parentNode.insertBefore(bg,path);
  path.setAttribute("stroke","#F2692E");
  ScrollTrigger.create({trigger:steps,start:"top 65%",end:"bottom 65%",scrub:true,onRefresh:function(){layoutSteps();bg.setAttribute("d",path.getAttribute("d"))},onUpdate:function(s){
    var len=steps.offsetHeight;path.style.strokeDasharray=len;path.style.strokeDashoffset=len*(1-s.progress);
    stepEls.forEach(function(st){var top=st.offsetTop+24;st.classList.toggle("lit",s.progress*len>=top-4)});
  }});
  path.style.strokeDasharray=steps.offsetHeight;path.style.strokeDashoffset=steps.offsetHeight;
}

/* 地图 */
buildMap();

/* 资质卡片 3D */
if(!isTouch&&!reduced){
  $$(".tilt").forEach(function(c){
    c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();var px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      c.style.transform="rotateY("+((px-.5)*16)+"deg) rotateX("+((.5-py)*14)+"deg) translateZ(0)";c.firstElementChild.style.setProperty("--sx",(100-px*100)+"%")});
    c.addEventListener("pointerleave",function(){c.style.transform="";c.firstElementChild.style.removeProperty("--sx")});
  });
  /* 磁吸按钮 */
  $$(".magnetic").forEach(function(b){
    b.addEventListener("pointermove",function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.4,ease:"power3.out"})});
    b.addEventListener("pointerleave",function(){gsap.to(b,{x:0,y:0,duration:.7,ease:"elastic.out(1,.4)"})});
  });
}
gsap.from(".cert__in",{opacity:0,y:60,duration:1.2,ease:"expo.out",stagger:.1,scrollTrigger:{trigger:".honor__wall",start:"top 85%",once:true}});
gsap.from(".cell",{opacity:0,y:40,scale:.96,duration:1,ease:"expo.out",stagger:.06,scrollTrigger:{trigger:".bento",start:"top 85%",once:true}});
gsap.from(".step",{opacity:0,x:30,duration:1,ease:"expo.out",stagger:.1,scrollTrigger:{trigger:".steps",start:"top 80%",once:true}});

initForm();
initParticles();
window.addEventListener("load",function(){ScrollTrigger.refresh()});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh()});

/* ---------- 函数 ---------- */
function initStatic(){
  $$(".count").forEach(function(el){el.textContent=el.getAttribute("data-to")+(el.getAttribute("data-suffix")||"")});
  buildMap();initForm();
}

function buildMap(){
  var D=window.NE_MAP,svg=$("#mapSvg");if(!D||!svg||svg.childNodes.length)return;
  var NS="http://www.w3.org/2000/svg";
  function mk(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e}
  svg.setAttribute("viewBox",window.innerWidth<720?"250 10 750 590":"0 0 "+D.w+" "+D.h);
  var defs=mk("defs",{});var g=mk("linearGradient",{id:"arcGrad",x1:"0",y1:"0",x2:"1",y2:"0"},defs);
  mk("stop",{offset:"0","stop-color":"#F2692E","stop-opacity":"1"},g);mk("stop",{offset:"1","stop-color":"#EEF3F8","stop-opacity":".5"},g);
  var gp=mk("g",{});var pv={};
  var order=["内蒙古","黑龙江","吉林","辽宁"];
  order.forEach(function(n){pv[n]=mk("path",{d:D.paths[n],"class":"pv","data-prov":n},gp)});
  var hub=D.cities["沈阳"];
  var targets=["大连","长春","哈尔滨","齐齐哈尔","牡丹江","延吉","通辽","赤峰","呼伦贝尔","呼和浩特","丹东","大庆","锦州"];
  var ga=mk("g",{}),arcs=[];
  targets.forEach(function(n){
    var c=D.cities[n];var mx=(hub[0]+c[0])/2,my=(hub[1]+c[1])/2;var dx=c[0]-hub[0],dy=c[1]-hub[1];var L=Math.hypot(dx,dy);
    var cx=mx+dy*.22,cy=my-dx*.22-L*.12;var d="M"+hub[0]+" "+hub[1]+" Q"+cx+" "+cy+" "+c[0]+" "+c[1];
    arcs.push(mk("path",{d:d,"class":"arc"},ga));
    var f=mk("path",{d:d,"class":"flow"},ga);f.style.animationDelay=(-Math.random()*3)+"s";
  });
  var gc=mk("g",{});
  var labels={"沈阳":1,"大连":1,"长春":1,"哈尔滨":1,"呼和浩特":1,"呼伦贝尔":1,"赤峰":1,"齐齐哈尔":1,"延吉":1};
  Object.keys(D.cities).forEach(function(n){
    var c=D.cities[n];var isHub=n==="沈阳";var cg=mk("g",{"class":"city"+(isHub?" hub":"")},gc);
    if(isHub){mk("circle",{cx:c[0],cy:c[1],r:7,"class":"pulse"},cg);var p2=mk("circle",{cx:c[0],cy:c[1],r:7,"class":"pulse"},cg);p2.style.animationDelay="1.2s"}
    else if(targets.indexOf(n)>-1){var p=mk("circle",{cx:c[0],cy:c[1],r:4,"class":"pulse"},cg);p.style.animationDelay=(Math.random()*2.4)+"s"}
    mk("circle",{cx:c[0],cy:c[1],r:isHub?6.5:3.2,"class":"core"},cg);
    if(labels[n]){var t=mk("text",{x:c[0]+(isHub?12:8),y:c[1]+(isHub?6:4)},cg);t.textContent=isHub?"沈阳 总部":n}
  });
  // 交互：省份 <-> 列表
  var list=$$("#provList li"),tip=$("#mapTip"),mapBox=$("#map");
  var info={"辽宁":"辽宁 总部所在","吉林":"吉林 文旅与本地生活","黑龙江":"黑龙江 冰雪与文旅","内蒙古":"内蒙古 东部盟市"};
  function setOn(n){Object.keys(pv).forEach(function(k){pv[k].classList.toggle("is-on",k===n);pv[k].classList.toggle("dim",!!n&&k!==n)});list.forEach(function(li){li.classList.toggle("is-on",li.getAttribute("data-prov")===n)})}
  Object.keys(pv).forEach(function(n){
    pv[n].addEventListener("pointerenter",function(){setOn(n);tip.textContent=info[n];tip.style.opacity=1});
    pv[n].addEventListener("pointermove",function(e){var r=mapBox.getBoundingClientRect();tip.style.left=(e.clientX-r.left)+"px";tip.style.top=(e.clientY-r.top)+"px"});
    pv[n].addEventListener("pointerleave",function(){setOn(null);tip.style.opacity=0});
  });
  list.forEach(function(li){li.addEventListener("pointerenter",function(){setOn(li.getAttribute("data-prov"))});li.addEventListener("pointerleave",function(){setOn(null)})});
  setOn("辽宁");
  if(window.gsap&&!reduced){
    var all=Object.keys(pv).map(function(k){return pv[k]});
    all.forEach(function(p){var l=p.getTotalLength();p.style.strokeDasharray=l;p.style.strokeDashoffset=l});
    arcs.forEach(function(p){var l=p.getTotalLength();p.style.strokeDasharray=l;p.style.strokeDashoffset=l});
    gsap.set(".map .flow,.map .city",{opacity:0});
    var mt=gsap.timeline({paused:true});
    mt.to(all,{strokeDashoffset:0,duration:2,ease:"power2.inOut",stagger:.15})
      .to(".map .city",{opacity:1,duration:.5,stagger:.03},"-=1")
      .to(arcs,{strokeDashoffset:0,duration:1.2,ease:"power2.out",stagger:.06},"-=.6")
      .to(".map .flow",{opacity:1,duration:.6},"-=.4");
    ScrollTrigger.create({trigger:"#map",start:"top 80%",once:true,onEnter:function(){mt.play()}});
    window.__mapTl=mt;
  }
}

function initForm(){
  var f=$("#form");if(!f)return;var note=$("#formNote");
  f.addEventListener("submit",function(e){
    e.preventDefault();var ok=true;
    var name=f.elements.name,tel=f.elements.tel;
    [[name,name.value.trim().length>0],[tel,/^[0-9\-\s]{7,13}$/.test(tel.value.trim())]].forEach(function(p){p[0].parentNode.classList.toggle("bad",!p[1]);if(!p[1])ok=false});
    if(!ok){note.textContent="请先补全标红的内容。";return}
    note.textContent="在线留言通道正在开通。商务电话和邮箱更新后会公布在本页，也欢迎直接到公司来访。";
  });
  $$("input",f).forEach(function(i){i.addEventListener("input",function(){i.parentNode.classList.remove("bad")})});
}

function initParticles(){
  var cv=$("#heroCanvas");if(!cv||!cv.getContext)return;
  var ctx=cv.getContext("2d");var W,H,dpr,parts=[],running=true,mouse={x:-9999,y:-9999};
  var img=new Image();img.src="logo.svg";
  img.onload=function(){setup();if(!reduced)loop();else drawStatic()};
  function sample(size){
    var oc=document.createElement("canvas");oc.width=oc.height=size;var o=oc.getContext("2d");
    o.drawImage(img,0,0,size,size*img.height/img.width||size);
    var d=o.getImageData(0,0,size,size).data,pts=[];var step=W<720?3:3;var c=size/2;
    for(var y=0;y<size;y+=step)for(var x=0;x<size;x+=step){
      var i=(y*size+x)*4;var r=Math.hypot(x-c,y-c);if(r>size*.5)continue;
      if(d[i+3]<90){if(r<size*.47)pts.push([x,y,1])}
      else if(r>size*.465&&Math.random()<.55)pts.push([x,y,0]);
    }
    return pts;
  }
  function setup(){
    dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    var mobile=W<720,size,ox,oy;
    if(mobile){var cr=cv.getBoundingClientRect(),top=$(".hero__cta").getBoundingClientRect().bottom-cr.top+24,bot=$(".hero__foot").getBoundingClientRect().top-cr.top-20;
      size=Math.round(Math.max(150,Math.min(W*.72,bot-top)));ox=W/2-size/2;oy=top+Math.max(0,(bot-top-size)/2)}
    else{size=Math.round(Math.min(H*.74,W*.42,640));ox=W*.73-size/2;oy=H*.5-size/2-10}
    var pts=sample(size);var max=mobile?1800:4200;
    if(pts.length>max){pts.sort(function(){return Math.random()-.5});pts=pts.slice(0,max)}
    var old=parts;parts=pts.map(function(p,k){var q=old[k];return{x:q?q.x:Math.random()*W,y:q?q.y:Math.random()*H,vx:0,vy:0,tx:ox+p[0],ty:oy+p[1],a:p[2]?.95:.4,s:p[2]?1.7:1.2,e:Math.random()<.06,ph:Math.random()*6.28}});
  }
  function drawStatic(){ctx.clearRect(0,0,W,H);parts.forEach(function(p){p.x=p.tx;p.y=p.ty});render(0)}
  function render(t){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<parts.length;i++){var p=parts[i];
      ctx.fillStyle=p.e?"rgba(255,138,82,"+p.a+")":"rgba(238,243,248,"+p.a+")";
      var w=Math.sin(t*.0012+p.ph)*.6;ctx.fillRect(p.x+w,p.y,p.s,p.s)}
  }
  function loop(t){
    if(!running){requestAnimationFrame(loop);return}
    for(var i=0;i<parts.length;i++){var p=parts[i];
      var dx=p.x-mouse.x,dy=p.y-mouse.y,d2=dx*dx+dy*dy;
      if(d2<12000){var f=(12000-d2)/12000*2.4;var d=Math.sqrt(d2)||1;p.vx+=dx/d*f;p.vy+=dy/d*f}
      p.vx+=(p.tx-p.x)*.012;p.vy+=(p.ty-p.y)*.012;p.vx*=.86;p.vy*=.86;p.x+=p.vx;p.y+=p.vy}
    render(t||0);requestAnimationFrame(loop);
  }
  var hero=$("#hero");
  hero.addEventListener("pointermove",function(e){var r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top});
  hero.addEventListener("pointerleave",function(){mouse.x=mouse.y=-9999});
  if("IntersectionObserver" in window)new IntersectionObserver(function(en){running=en[0].isIntersecting}).observe(hero);
  document.addEventListener("visibilitychange",function(){running=!document.hidden});
  var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){if(Math.abs(cv.clientWidth-W)>40){setup();if(reduced)drawStatic()}},200)});
}
})();
