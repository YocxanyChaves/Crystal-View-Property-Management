/* ---------- Por qué nosotros: el balde se voltea y el limpiador limpia la sección ---------- */
CV.why=(function(){
  const {reduced,wait,cleaner}=CV;
  const why=document.getElementById('why');
  const grime=why.querySelector('.grime'), gctx=grime.getContext('2d');
  const wet=why.querySelector('.wet'), streak=why.querySelector('.streak');
  const bucketWrap=why.querySelector('.bucket-wrap');
  const water=CV.water(why,bucketWrap.querySelector('.bucket-big'),gctx);
  let state='dirty', grimeSize='';
  function paintGrime(){
    if(state==='clean') return;
    const w=why.offsetWidth, h=why.offsetHeight;
    if(!w||!h||grimeSize===w+'x'+h) return;
    grimeSize=w+'x'+h; grime.width=w; grime.height=h;
    CV.paintDirt(gctx,w,h,'rgba(150,142,120,.62)');
  }
  if('ResizeObserver' in window) new ResizeObserver(paintGrime).observe(why); else paintGrime();

  async function clean(){
    if(state!=='dirty') return; state='busy';
    if(reduced){ why.classList.add('clean'); state='clean'; return; }
    // La mancha mojada se abre desde donde cae el agua, a la izquierda del balde
    const r=why.getBoundingClientRect(), b=bucketWrap.getBoundingClientRect();
    wet.style.setProperty('--wx',(b.left-r.left-b.width*.6).toFixed(0)+'px');
    why.classList.add('pouring');
    water.start();
    await wait(1500);
    // El limpiador baja hasta la sección y la recorre de derecha a izquierda; el vidrio queda limpio detrás de la escobilla
    cleaner.pinTo(()=>{ const r=why.getBoundingClientRect(); return r.top+Math.min(r.height,innerHeight)*.32; });
    await wait(500);
    why.classList.add('wiping');
    await cleaner.slide(-(cleaner.left()-16),2600,()=>{
      const r=why.getBoundingClientRect();
      const cut=Math.max(0,Math.min(r.width,cleaner.squeegeeX()-r.left));
      const clip='inset(0 '+(r.width-cut)+'px 0 0)';
      grime.style.clipPath=clip; wet.style.clipPath=clip; water.canvas.style.clipPath=clip;
      streak.style.transform='translateX('+cut+'px)';
    });
    why.classList.remove('wiping'); why.classList.add('clean'); state='clean';
    cleaner.pinTo(null);
    await cleaner.slide(0,1400);
  }
  function watch(){
    if(!('IntersectionObserver' in window)){ clean(); return; }
    const io=new IntersectionObserver(([e])=>{ if(e.isIntersecting){ io.disconnect(); clean(); } },{threshold:.4});
    io.observe(why.querySelector('.why-head'));
  }
  return {watch};
})();
