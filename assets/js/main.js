(function(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero=document.getElementById('hero');
  let opened=false;
  const rnd=(a,b)=>a+Math.random()*(b-a);

  /* ---------- Limpiador colgado de una cuerda que sigue el scroll ---------- */
  const cleaner=(function(){
    const el=document.getElementById('cleaner');
    const worker=el.querySelector('.worker');
    let y=-190, vy=0, sway=0, vs=0, x=0, running=false, lastBubble=0, pin=null, glide=null;
    const ease=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
    function target(){
      const h=worker.offsetHeight||130;
      if(pin) return Math.min(innerHeight-h-20,Math.max(90,pin()));
      const max=document.documentElement.scrollHeight-innerHeight;
      const p=max>0?Math.min(1,Math.max(0,scrollY/max)):0;
      const top=90, bottom=innerHeight-h-28;
      return top+p*Math.max(0,bottom-top);
    }
    function bubble(){
      const b=document.createElement('span'); b.className='bubble';
      const s=worker.offsetWidth/110; // escala del SVG
      b.style.left=(4*s)+'px'; b.style.top=(y+46*s)+'px';
      b.style.setProperty('--s',rnd(5,11)+'px');
      b.style.setProperty('--bx',rnd(-46,-12)+'px');
      b.style.setProperty('--by',rnd(-36,30)+'px');
      b.addEventListener('animationend',()=>b.remove());
      el.appendChild(b);
    }
    function frame(now){
      const t=target();
      vy=(vy+(t-y)*.05)*.84; y+=vy;
      // El cuerpo se queda atrás cuando baja o sube rápido: péndulo amortiguado
      vs=(vs+(Math.max(-9,Math.min(9,-vy*.45))-sway)*.07)*.9; sway+=vs;
      if(glide){
        const p=Math.min(1,(now-glide.t0)/glide.dur);
        x=glide.from+(glide.to-glide.from)*ease(p);
        el.style.setProperty('--x',x.toFixed(1)+'px');
        if(glide.onStep) glide.onStep();
        if(p>=1){const g=glide; glide=null; g.done();}
      }
      el.style.setProperty('--y',y.toFixed(1)+'px');
      el.style.setProperty('--sway',sway.toFixed(2)+'deg');
      const moving=Math.abs(vy)>.35||!!glide;
      el.classList.toggle('moving',moving);
      el.classList.toggle('down',vy>.8);
      el.classList.toggle('up',vy<-.8);
      if(moving&&now-lastBubble>110){lastBubble=now;bubble();}
      if(!glide&&Math.abs(t-y)<.3&&Math.abs(vy)<.02&&Math.abs(sway)<.05&&Math.abs(vs)<.01){running=false;el.classList.remove('moving','up','down');return;}
      requestAnimationFrame(frame);
    }
    function kick(){
      if(document.body.classList.contains('locked')) return;
      if(reduced){ y=target(); el.style.setProperty('--y',y+'px'); return; }
      if(!running){running=true;requestAnimationFrame(frame);}
    }
    // Desliza al limpiador en horizontal; onStep corre en cada cuadro para sincronizar otras cosas con él
    function slide(to,dur,onStep){
      if(reduced){ x=to; el.style.setProperty('--x',to+'px'); if(onStep) onStep(); return Promise.resolve(); }
      return new Promise(done=>{ glide={from:x,to,dur,t0:performance.now(),onStep,done}; kick(); });
    }
    let scareTimer;
    worker.querySelector('svg').addEventListener('click',()=>{
      el.classList.remove('scared'); void el.offsetWidth; el.classList.add('scared');
      vs+=(Math.random()<.5?-1:1)*rnd(4,5.5); // empujón: se columpia
      clearTimeout(scareTimer); scareTimer=setTimeout(()=>el.classList.remove('scared'),1700);
      kick();
    });
    addEventListener('scroll',kick,{passive:true});
    addEventListener('resize',kick);
    return {
      kick, slide,
      pinTo(fn){ pin=fn; kick(); },
      // Borde izquierdo de la escobilla, en coordenadas de pantalla
      squeegeeX(){ return worker.getBoundingClientRect().left+worker.offsetWidth*.02; },
      left(){ return worker.getBoundingClientRect().left; }
    };
  })();

  /* ---------- Navegación entre vistas ---------- */
  const pages=[...document.querySelectorAll('[data-page]')];
  const links=[...document.querySelectorAll('.menu a:not([data-scroll])')];
  const menu=document.getElementById('menu'), burger=document.getElementById('burger');
  function show(id){
    if(!pages.some(p=>p.dataset.page===id)) id='inicio';
    pages.forEach(p=>p.hidden=p.dataset.page!==id);
    links.forEach(a=>a.dataset.go===id?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
    menu.classList.remove('open'); burger.setAttribute('aria-expanded','false');
    window.scrollTo({top:0,behavior:'instant'});
    if(id==='inicio'){ initDirt(); if(opened) blow(); }
    cleaner.kick();
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-go]'); if(!a) return;
    e.preventDefault();
    const target=a.dataset.scroll&&document.getElementById(a.dataset.scroll);
    if(target&&!pages.find(p=>p.dataset.page===a.dataset.go).hidden){
      menu.classList.remove('open'); burger.setAttribute('aria-expanded','false');
    } else show(a.dataset.go);
    if(target) requestAnimationFrame(()=>target.scrollIntoView({behavior:reduced?'auto':'smooth'}));
    try{history.replaceState(null,'','#'+(a.dataset.scroll||a.dataset.go))}catch(_){}
  });
  burger.addEventListener('click',()=>{const o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)});

  /* ---------- Texto soplado por el viento ---------- */
  function splitWords(el){
    [...el.childNodes].forEach(n=>{
      if(n.nodeType===3){
        const frag=document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t=>{
          if(!t) return;
          if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(t));return;}
          const s=document.createElement('span'); s.className='w'; s.textContent=t; frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if(n.nodeType===1) splitWords(n);
    });
  }
  hero.querySelectorAll('.blow').forEach(splitWords);
  hero.querySelectorAll('.w, .gust').forEach((el,i)=>{
    const big=el.classList.contains('gust');
    el.style.setProperty('--i',i);
    el.style.setProperty('--fx',-rnd(big?60:35,big?90:75)+'vw');
    el.style.setProperty('--fy',rnd(-90,70)+'px');
    el.style.setProperty('--fr',rnd(-45,25)+'deg');
  });
  function blow(){
    hero.classList.remove('blown'); void hero.offsetWidth; hero.classList.add('blown');
    countUp(reduced?0:1300);
  }

  /* ---------- Conteo de 0 al número ---------- */
  const nums=[...hero.querySelectorAll('[data-count]')];
  const fmt=v=>String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  const paint=(b,v)=>b.textContent=(b.dataset.prefix||'')+fmt(v)+(b.dataset.suffix||'');
  let countTimer;
  function countUp(delay){
    clearTimeout(countTimer);
    nums.forEach(b=>paint(b,0));
    countTimer=setTimeout(()=>{
      const dur=reduced?1:2200, t0=performance.now();
      (function step(t){
        const p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,4);
        nums.forEach(b=>paint(b,+b.dataset.count*e));
        if(p<1) requestAnimationFrame(step);
      })(t0);
    },delay);
  }

  /* ---------- Vidrio sucio que se limpia ---------- */
  const card=document.getElementById('statCard'), cv=document.getElementById('dirt'), ctx=cv.getContext('2d');
  const wipeText=document.getElementById('wipeText');
  if(matchMedia('(hover: none)').matches) wipeText.textContent='Deslizá el dedo para limpiar el vidrio';
  let ready=false, cleaned=false, strokes=0, last=null, size='';
  function paintDirt(dc,w,h,base='rgba(170,152,120,.55)'){
    dc.globalCompositeOperation='source-over';
    dc.clearRect(0,0,w,h);
    dc.fillStyle=base; dc.fillRect(0,0,w,h);
    for(let i=0;i<55;i++){ // manchas de polvo
      const x=rnd(0,w), y=rnd(0,h), r=rnd(20,95);
      const g=dc.createRadialGradient(x,y,0,x,y,r);
      const c=Math.random()<.35?'235,228,212':'118,98,68';
      g.addColorStop(0,`rgba(${c},${rnd(.12,.32)})`); g.addColorStop(1,`rgba(${c},0)`);
      dc.fillStyle=g; dc.beginPath(); dc.arc(x,y,r,0,7); dc.fill();
    }
    for(let i=0;i<16;i++){ // chorreados
      const x=rnd(0,w), y=rnd(-10,h*.5), len=rnd(30,h*.6);
      dc.strokeStyle=`rgba(105,88,62,${rnd(.12,.28)})`; dc.lineWidth=rnd(1,3.5); dc.lineCap='round';
      dc.beginPath(); dc.moveTo(x,y); dc.bezierCurveTo(x+rnd(-4,4),y+len*.4,x+rnd(-6,6),y+len*.7,x+rnd(-3,3),y+len); dc.stroke();
      dc.fillStyle=dc.strokeStyle; dc.beginPath(); dc.arc(x,y+len,dc.lineWidth*1.2,0,7); dc.fill();
    }
    for(let i=0;i<140;i++){ // gotas secas
      const x=rnd(0,w), y=rnd(0,h), r=rnd(.8,4.5);
      dc.fillStyle=`rgba(95,80,55,${rnd(.1,.3)})`; dc.beginPath(); dc.arc(x,y,r,0,7); dc.fill();
      if(r>2.5){dc.strokeStyle='rgba(240,235,222,.35)';dc.lineWidth=.8;dc.stroke();}
    }
    for(let i=0;i<5;i++){ // huellas de mano
      const x=rnd(20,w-20), y=rnd(20,h-20);
      dc.strokeStyle='rgba(110,92,66,.18)'; dc.lineWidth=1;
      for(let k=1;k<9;k++){dc.beginPath(); dc.ellipse(x,y,k*2.4,k*3.2,rnd(-.4,.4),0,7); dc.stroke();}
    }
  }
  function initDirt(){
    if(cleaned) return;
    const w=card.offsetWidth, h=card.offsetHeight;
    if(!w||!h||size===w+'x'+h) return;
    size=w+'x'+h;
    const d=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(w*d); cv.height=Math.round(h*d);
    ctx.setTransform(d,0,0,d,0,0);
    paintDirt(ctx,w,h); ready=true; strokes=0;
  }
  function wipe(x,y){
    const R=32, g=ctx.createRadialGradient(x,y,0,x,y,R);
    g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(.55,'rgba(0,0,0,.75)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.globalCompositeOperation='destination-out';
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,R,0,7); ctx.fill();
  }
  function checkClean(){
    const d=ctx.getImageData(0,0,cv.width,cv.height).data;
    let clear=0,tot=0;
    for(let i=3;i<d.length;i+=80){tot++; if(d[i]<60) clear++;}
    if(clear/tot>.6){
      cleaned=true; card.classList.add('clean');
      wipeText.textContent='¡Impecable! Así quedan tus vidrios';
    }
  }
  cv.addEventListener('pointermove',e=>{
    if(cleaned||!ready) return;
    const r=cv.getBoundingClientRect(), s=cv.offsetWidth/r.width;
    const x=(e.clientX-r.left)*s, y=(e.clientY-r.top)*s;
    if(last){
      const dx=x-last.x, dy=y-last.y, n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));
      for(let i=1;i<=n;i++) wipe(last.x+dx*i/n,last.y+dy*i/n);
    } else wipe(x,y);
    last={x,y};
    if(++strokes%10===0) checkClean();
  });
  cv.addEventListener('pointerleave',()=>last=null);
  cv.addEventListener('pointerup',()=>last=null);
  if('ResizeObserver' in window) new ResizeObserver(initDirt).observe(card);

  /* ---------- Abrir la ventana ---------- */
  const intro=document.getElementById('intro'), openBtn=document.getElementById('openWin');
  const room=document.getElementById('room'), opening=intro.querySelector('.opening');
  function openWindow(){
    if(opened) return; opened=true;
    intro.classList.add('opening');
    if(!reduced){
      // Acercamos la sala hasta que el hueco de la ventana llene la pantalla
      const r=opening.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      const s=Math.max(innerWidth/r.width,innerHeight/r.height)*1.12;
      room.style.transformOrigin=cx+'px '+cy+'px';
      setTimeout(()=>{room.style.transform=`translate(${innerWidth/2-cx}px,${innerHeight/2-cy}px) scale(${s})`},650);
    }
    setTimeout(()=>{ intro.classList.add('gone'); if(!hero.closest('[data-page]').hidden) blow(); }, reduced?0:1850);
    setTimeout(()=>{ intro.remove(); document.body.classList.remove('locked'); cleaner.kick(); watchWhy(); }, reduced?50:2500);
  }
  openBtn.addEventListener('click',openWindow);

  const startHash=(location.hash||'').slice(1);
  show(startHash==='faq'?'inicio':startHash||'inicio');
  openBtn.focus({preventScroll:true});

  /* ---------- Barra que se compacta al bajar ---------- */
  const header=document.querySelector('header');
  const onScroll=()=>header.classList.toggle('scrolled',scrollY>12);
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* ---------- Entradas al hacer scroll ---------- */
  const staggered='.box,.steps li,.contact-grid > *';
  document.querySelectorAll('.page-head .stack, section:not([data-page="inicio"]) .band h2, .box, .steps li, .table-wrap, .ba, .combo, .contact-grid > *').forEach(el=>{
    if(el.hasAttribute('data-reveal')) return;
    el.setAttribute('data-reveal','');
    const i=[...el.parentElement.children].filter(c=>c.matches(staggered)).indexOf(el);
    if(i>0) el.style.setProperty('--d',i*110+'ms');
  });
  if('IntersectionObserver' in window&&!reduced){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px',threshold:.12});
    document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
  } else document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('in'));

  /* ---------- Vidrio líquido: brillo que sigue al puntero ---------- */
  document.querySelectorAll('[data-glass]').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse') return;
      const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--mx',x*100+'%'); card.style.setProperty('--my',y*100+'%');
      if(!reduced){card.style.setProperty('--ry',(x-.5)*5+'deg'); card.style.setProperty('--rx',(.5-y)*4+'deg');}
    });
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
  });

  /* ---------- Carruseles: cada etiqueta de lugar maneja una foto ---------- */
  document.querySelectorAll('.carousel-wrap').forEach(wrap=>{
    const slides=[...wrap.querySelectorAll('.slide')], tabs=[...wrap.querySelectorAll('.place')];
    const box=wrap.querySelector('[data-carousel]');
    let cur=0;
    function go(n){
      cur=(n+slides.length)%slides.length;
      slides.forEach((s,i)=>{s.classList.toggle('is-active',i===cur); s.setAttribute('aria-hidden',i!==cur);});
      tabs.forEach((t,i)=>{
        t.setAttribute('aria-selected',i===cur);
        const f=t.querySelector('.fill'); f.style.animation='none'; void f.offsetWidth; f.style.animation='';
      });
    }
    // La barrita de la etiqueta activa marca el ritmo: cuando se llena, pasa a la siguiente foto
    tabs.forEach((t,i)=>{
      t.addEventListener('click',()=>go(i));
      t.querySelector('.fill').addEventListener('animationend',()=>{ if(i===cur) go(cur+1); });
    });
    wrap.querySelector('.prev').addEventListener('click',()=>go(cur-1));
    wrap.querySelector('.next').addEventListener('click',()=>go(cur+1));
    wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')wrap.classList.add('paused')});
    wrap.addEventListener('pointerleave',()=>wrap.classList.remove('paused'));
    wrap.addEventListener('focusin',()=>wrap.classList.add('paused'));
    wrap.addEventListener('focusout',()=>wrap.classList.remove('paused'));
    let sx=null;
    box.addEventListener('pointerdown',e=>{sx=e.clientX});
    box.addEventListener('pointerup',e=>{ if(sx===null) return; const dx=e.clientX-sx; sx=null; if(Math.abs(dx)>40) go(cur+(dx<0?1:-1)); });
    if('IntersectionObserver' in window) new IntersectionObserver(([e])=>wrap.classList.toggle('paused',!e.isIntersecting)).observe(box);
    go(0);
  });

  /* ---------- Preguntas frecuentes: filtro por tema ---------- */
  const faqBtns=[...document.querySelectorAll('.faq-filter button')];
  faqBtns.forEach(b=>b.addEventListener('click',()=>{
    faqBtns.forEach(x=>x.setAttribute('aria-pressed',x===b));
    document.querySelectorAll('.faq-item').forEach(it=>{
      it.hidden=b.dataset.cat!=='all'&&it.dataset.cat!==b.dataset.cat;
      it.classList.add('in');
    });
  }));

  /* ---------- Fotos que vibran cuando el mouse se acerca ---------- */
  const cars=[...document.querySelectorAll('[data-carousel]')];
  cars.forEach(c=>c.addEventListener('animationend',e=>{ if(e.animationName==='jelly') c.classList.remove('jelly'); }));
  if(!reduced) document.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse') return;
    cars.forEach(c=>{
      if(!c.offsetParent) return;
      const r=c.getBoundingClientRect();
      const d=Math.hypot(Math.max(r.left-e.clientX,0,e.clientX-r.right),Math.max(r.top-e.clientY,0,e.clientY-r.bottom));
      const amp=d>0?Math.max(0,1-d/160)*3.4:0;
      c.style.setProperty('--amp',amp.toFixed(2));
      c.classList.toggle('buzz',amp>.15);
      if(d===0&&!c.dataset.inside){ c.dataset.inside='1'; c.classList.remove('jelly'); void c.offsetWidth; c.classList.add('jelly'); }
      else if(d>0) delete c.dataset.inside;
    });
  },{passive:true});

  /* ---------- Por qué nosotros: el balde se voltea y el limpiador limpia la sección ---------- */
  const why=document.getElementById('why');
  const grime=why.querySelector('.grime'), gctx=grime.getContext('2d');
  const wet=why.querySelector('.wet'), streak=why.querySelector('.streak');
  let whyState='dirty', grimeSize='';
  function paintGrime(){
    if(whyState==='clean') return;
    const w=why.offsetWidth, h=why.offsetHeight;
    if(!w||!h||grimeSize===w+'x'+h) return;
    grimeSize=w+'x'+h; grime.width=w; grime.height=h;
    paintDirt(gctx,w,h,'rgba(150,142,120,.62)');
  }
  if('ResizeObserver' in window) new ResizeObserver(paintGrime).observe(why); else paintGrime();
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  async function cleanWhy(){
    if(whyState!=='dirty') return; whyState='busy';
    if(reduced){ why.classList.add('clean'); whyState='clean'; return; }
    why.classList.add('pouring');
    await wait(1500);
    // El limpiador baja hasta la sección y la recorre de derecha a izquierda; el vidrio queda limpio detrás de la escobilla
    cleaner.pinTo(()=>{ const r=why.getBoundingClientRect(); return r.top+Math.min(r.height,innerHeight)*.32; });
    await wait(500);
    why.classList.add('wiping');
    await cleaner.slide(-(cleaner.left()-16),2600,()=>{
      const r=why.getBoundingClientRect();
      const cut=Math.max(0,Math.min(r.width,cleaner.squeegeeX()-r.left));
      const clip='inset(0 '+(r.width-cut)+'px 0 0)';
      grime.style.clipPath=clip; wet.style.clipPath=clip;
      streak.style.transform='translateX('+cut+'px)';
    });
    why.classList.remove('wiping'); why.classList.add('clean'); whyState='clean';
    cleaner.pinTo(null);
    await cleaner.slide(0,1400);
  }
  function watchWhy(){
    if(!('IntersectionObserver' in window)){ cleanWhy(); return; }
    const io=new IntersectionObserver(([e])=>{ if(e.isIntersecting){ io.disconnect(); cleanWhy(); } },{threshold:.4});
    io.observe(why.querySelector('.why-head'));
  }

  /* ---------- Esponjas: al apretarlas sueltan burbujas con la información ---------- */
  document.querySelectorAll('.sponge').forEach(sp=>{
    const wrap=sp.parentElement;
    sp.addEventListener('click',()=>{
      const open=!wrap.classList.contains('open');
      wrap.classList.toggle('open',open);
      sp.setAttribute('aria-expanded',open);
      sp.classList.remove('squish'); void sp.offsetWidth; sp.classList.add('squish');
      if(reduced) return;
      for(let i=0;i<(open?14:6);i++){
        const b=document.createElement('span'); b.className='sp-bubble';
        b.style.left=rnd(10,85)+'%'; b.style.top=rnd(18,50)+'%';
        b.style.setProperty('--s',rnd(8,24)+'px');
        b.style.setProperty('--bx',rnd(-60,60)+'px');
        b.style.setProperty('--by',-rnd(80,200)+'px');
        b.style.setProperty('--t',rnd(1,1.9)+'s');
        b.style.animationDelay=rnd(0,.25)+'s';
        b.addEventListener('animationend',()=>b.remove());
        wrap.appendChild(b);
      }
    });
    sp.addEventListener('animationend',()=>sp.classList.remove('squish'));
  });

  /* ---------- Formulario ---------- */
  document.getElementById('quote').addEventListener('submit',e=>{
    e.preventDefault();
    const name=document.getElementById('f-name').value.trim();
    const phone=document.getElementById('f-phone').value.trim();
    const ok=document.getElementById('ok');
    if(!name||!phone){ok.textContent='Falta tu nombre o teléfono para poder contactarte.';ok.hidden=false;return;}
    const svc=document.querySelector('input[name="svc"]:checked').value;
    ok.textContent='Listo, '+name+'. Recibimos tu solicitud de '+svc.toLowerCase()+' (demo: en el sitio real esto se enviaría por correo o WhatsApp).';
    ok.hidden=false; e.target.reset();
  });
})();
