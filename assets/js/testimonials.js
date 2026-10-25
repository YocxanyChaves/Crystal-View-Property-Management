/* ---------- Lo que dicen: la ventana se ensucia al pasar el mouse y la escobilla la deja brillando ---------- */
(function(){
  const {reduced,rnd,wait}=CV;
  const hint=document.getElementById('homesHint');
  if(hint&&matchMedia('(hover: none)').matches) hint.textContent='Los vecinos se cuentan entre ellos cómo les va. Tocá una ventana y mirá lo rápido que la dejamos brillando.';
  const ease=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
  const frames=(dur,fn)=>new Promise(done=>{
    const t0=performance.now();
    (function tick(now){ const p=Math.min(1,(now-t0)/dur); fn(p); p<1?requestAnimationFrame(tick):done(); })(t0);
  });

  document.querySelectorAll('.pane').forEach(pane=>{
    const cv=pane.querySelector('.smudge'), ctx=cv.getContext('2d');
    const sq=pane.querySelector('.squeegee');
    // dirt: la suciedad completa; mask: dónde ya se pegó. Lo visible es la suciedad recortada por la máscara
    const dirt=document.createElement('canvas'), dctx=dirt.getContext('2d');
    const mask=document.createElement('canvas'), mctx=mask.getContext('2d');
    let busy=false, size='', W=0, H=0, pointer=null;
    function prep(){
      W=pane.clientWidth; H=pane.clientHeight;
      if(size===W+'x'+H) return; size=W+'x'+H;
      const d=Math.min(window.devicePixelRatio||1,2);
      [cv,dirt,mask].forEach(c=>{c.width=Math.round(W*d); c.height=Math.round(H*d);});
      [ctx,dctx,mctx].forEach(c=>c.setTransform(d,0,0,d,0,0));
      CV.paintDirt(dctx,W,H,'rgba(150,132,100,.55)');
    }
    function blob(x,y,r,a){
      const g=mctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,`rgba(0,0,0,${a})`); g.addColorStop(1,'rgba(0,0,0,0)');
      mctx.fillStyle=g; mctx.beginPath(); mctx.arc(x,y,r,0,7); mctx.fill();
    }
    function render(){
      ctx.globalCompositeOperation='source-over';
      ctx.clearRect(0,0,W,H); ctx.drawImage(mask,0,0,W,H);
      ctx.globalCompositeOperation='source-in'; ctx.drawImage(dirt,0,0,W,H);
      ctx.globalCompositeOperation='source-over';
    }
    async function cycle(){
      if(busy) return; busy=true;
      prep(); mctx.clearRect(0,0,W,H); cv.style.clipPath='';
      pane.classList.remove('shiny'); pane.classList.add('dirty');
      // Se va ensuciando: manchas que aparecen sobre todo cerca del puntero y polvo que cubre de a poco
      await frames(reduced?1:820,p=>{
        for(let i=0;i<3;i++) blob(rnd(0,W),rnd(0,H),rnd(14,44),rnd(.18,.4));
        if(pointer) blob(pointer.x+rnd(-12,12),pointer.y+rnd(-12,12),rnd(18,34),.32);
        mctx.fillStyle=`rgba(0,0,0,${(.02+p*.05).toFixed(3)})`; mctx.fillRect(0,0,W,H);
        render();
      });
      if(!reduced) await wait(160);
      // La escobilla pasa de izquierda a derecha y deja el vidrio limpio detrás
      pane.classList.add('wiping');
      await frames(reduced?1:560,p=>{
        const x=ease(p)*(W+24)-12;
        sq.style.transform=`translateX(${x.toFixed(1)}px)`;
        cv.style.clipPath=`inset(0 0 0 ${Math.max(0,x).toFixed(1)}px)`;
      });
      pane.classList.remove('wiping','dirty');
      ctx.clearRect(0,0,W,H); cv.style.clipPath='';
      void pane.offsetWidth; pane.classList.add('shiny');
      await wait(900);
      busy=false;
    }
    pane.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse') cycle(); });
    pane.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') cycle(); });
    pane.addEventListener('pointermove',e=>{ const r=pane.getBoundingClientRect(); pointer={x:e.clientX-r.left-7,y:e.clientY-r.top-7}; });
    pane.addEventListener('pointerleave',()=>pointer=null);
  });
})();
