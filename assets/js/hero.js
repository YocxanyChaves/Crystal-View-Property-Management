/* ---------- Hero: texto soplado por el viento, conteo de números y vidrio sucio que se limpia ---------- */
CV.hero=(function(){
  const {reduced,rnd}=CV;
  const hero=document.getElementById('hero');

  /* Texto soplado por el viento */
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

  /* Conteo de 0 al número */
  const nums=[...hero.querySelectorAll('[data-count]')];
  const fmt=v=>String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
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

  /* Vidrio sucio que se limpia */
  const card=document.getElementById('statCard'), cv=document.getElementById('dirt'), ctx=cv.getContext('2d');
  const wipeText=document.getElementById('wipeText');
  if(matchMedia('(hover: none)').matches) wipeText.textContent='Deslizá el dedo para limpiar el vidrio';
  let ready=false, cleaned=false, strokes=0, last=null, size='';
  function initDirt(){
    if(cleaned) return;
    const w=card.offsetWidth, h=card.offsetHeight;
    if(!w||!h||size===w+'x'+h) return;
    size=w+'x'+h;
    const d=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(w*d); cv.height=Math.round(h*d);
    ctx.setTransform(d,0,0,d,0,0);
    CV.paintDirt(ctx,w,h); ready=true; strokes=0;
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

  return {el:hero, blow, initDirt};
})();
