/* ---------- Agua del balde: el chorro sale por el borde bajo de la boca, cae, salpica y escurre por el vidrio ---------- */
CV.water=function(why,bucket,gctx){
  const rnd=CV.rnd;
  const cv=why.querySelector('.splash'), ctx=cv.getContext('2d');
  const TOP=170; // el lienzo sube por encima de la sección, hasta donde está el balde
  const lipA=bucket.querySelector('.lip-a'), lipB=bucket.querySelector('.lip-b'), mid=bucket.querySelector('.b-mid');
  const surf=bucket.querySelector('.surf');
  let W=0, H=0, drops=[], runners=[], volume=1, prevLip=null, running=false, t0=0;

  const center=(el,r)=>{const b=el.getBoundingClientRect(); return [b.left+b.width/2-r.left, b.top+b.height/2-r.top];};

  function emit(r){
    const A=center(lipA,r), B=center(lipB,r), M=center(mid,r);
    const C=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    let ax=C[0]-M[0], ay=C[1]-M[1]; const al=Math.hypot(ax,ay)||1; ax/=al; ay/=al;
    const L=A[1]>B[1]?A:B; // el borde que queda más abajo es por donde se derrama
    const swing=prevLip?[L[0]-prevLip[0],L[1]-prevLip[1]]:[0,0]; prevLip=L;
    // Empieza a salir cuando la boca pasa de la horizontal; sale más mientras más volcado está
    const rate=Math.max(0,Math.min(1,(ay+.25)*1.5))*Math.min(1,volume*3);
    if(rate<=0||volume<=0) return;
    volume-=rate*.028;
    if(surf) surf.style.opacity=Math.max(0,volume).toFixed(2);
    const n=Math.round(rate*10);
    for(let i=0;i<n;i++){
      const k=rnd(0,.55), sp=rnd(1.6,3.4);
      drops.push({
        x:L[0]+(C[0]-L[0])*k, y:L[1]+(C[1]-L[1])*k,
        vx:ax*sp+swing[0]*.55+rnd(-.35,.35), vy:ay*sp+swing[1]*.55+rnd(-.3,.3),
        r:rnd(2,4.6)*(1-k*.6),
        // Altura en la que la gota pega contra el vidrio
        land:Math.random()<.35?TOP+rnd(-10,110):TOP+rnd(80,(H-TOP)*.7),
        life:Infinity
      });
    }
  }

  function wash(x,y,r,a){ // el agua deja el vidrio un poco más limpio donde pasa
    const gy=y-TOP; if(gy<-r) return;
    const g=gctx.createRadialGradient(x,gy,0,x,gy,r);
    g.addColorStop(0,`rgba(0,0,0,${a})`); g.addColorStop(1,'rgba(0,0,0,0)');
    gctx.globalCompositeOperation='destination-out';
    gctx.fillStyle=g; gctx.beginPath(); gctx.arc(x,gy,r,0,7); gctx.fill();
    gctx.globalCompositeOperation='source-over';
  }

  function splash(d){
    wash(d.x,d.y,d.r*5,.55);
    for(let i=0,n=Math.round(rnd(1,3));i<n;i++)
      drops.push({x:d.x,y:d.y,vx:d.vx*.3+rnd(-2.2,2.2),vy:-rnd(.8,2.6),r:rnd(.8,1.8),land:Infinity,life:rnd(14,26)});
    if(Math.random()<.32) runners.push({x:d.x,y:d.y,px:d.x,py:d.y,r:rnd(1.6,3.6),v:rnd(.5,1.8),ph:rnd(0,7),life:rnd(80,220)});
  }

  function step(){
    const r=cv.getBoundingClientRect();
    if(performance.now()-t0<2200) emit(r);
    ctx.clearRect(0,0,W,H);

    // Chorro y gotas en el aire: trazos estirados según la velocidad, con un brillo arriba
    ctx.lineCap='round';
    drops=drops.filter(d=>{
      d.vy+=.32; d.vx*=.995; d.x+=d.vx; d.y+=d.vy;
      if(d.y>=d.land){ splash(d); return false; }
      if(--d.life<=0||d.y>H+20) return false;
      const tx=d.x-d.vx*1.8, ty=d.y-d.vy*1.8;
      ctx.strokeStyle='rgba(120,196,238,.55)'; ctx.lineWidth=d.r*2;
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(d.x,d.y); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.75)'; ctx.lineWidth=d.r*.6;
      ctx.beginPath(); ctx.moveTo(tx-d.r*.35,ty); ctx.lineTo(d.x-d.r*.35,d.y); ctx.stroke();
      return true;
    });

    // Gotas pegadas al vidrio que bajan despacio, se frenan y dejan un rastro limpio
    runners=runners.filter(u=>{
      u.ph+=.08; u.v=Math.max(.15,u.v*.996+(Math.random()<.04?-u.v*.5:0)+(Math.random()<.05?rnd(.2,.8):0));
      u.px=u.x; u.py=u.y; u.y+=u.v; u.x+=Math.sin(u.ph)*.25;
      const gy=u.y-TOP;
      if(gy>0){
        gctx.globalCompositeOperation='destination-out';
        gctx.strokeStyle='rgba(0,0,0,.5)'; gctx.lineWidth=u.r*1.5; gctx.lineCap='round';
        gctx.beginPath(); gctx.moveTo(u.px,u.py-TOP); gctx.lineTo(u.x,gy); gctx.stroke();
        gctx.globalCompositeOperation='source-over';
      }
      const g=ctx.createRadialGradient(u.x-u.r*.35,u.y-u.r*.4,0,u.x,u.y,u.r*1.3);
      g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(.45,'rgba(170,222,250,.7)'); g.addColorStop(1,'rgba(79,176,227,.15)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(u.x,u.y,u.r,u.r*1.25,0,0,7); ctx.fill();
      return --u.life>0&&u.y<H;
    });

    if(performance.now()-t0<2200||drops.length||runners.length) requestAnimationFrame(step);
    else{ running=false; ctx.clearRect(0,0,W,H); }
  }

  return {
    canvas:cv,
    start(){
      if(running) return;
      W=why.offsetWidth; H=why.offsetHeight+TOP; cv.width=W; cv.height=H;
      drops=[]; runners=[]; volume=1; prevLip=null; running=true; t0=performance.now();
      requestAnimationFrame(step);
    }
  };
};
