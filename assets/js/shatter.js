/* ---------- Vidrio quebrado: la foto se raja desde el punto tocado y cae en pedazos ---------- */
CV.shatter=function(box,slide,px,py){
  const rnd=CV.rnd, TAU=Math.PI*2;
  const W=box.offsetWidth, H=box.offsetHeight;
  const layer=document.createElement('div'); layer.className='shatter';
  Object.assign(layer.style,{left:box.offsetLeft+'px',top:box.offsetTop+'px',width:W+'px',height:H+'px'});

  // Copia congelada de la foto actual (con su zoom del momento) que va dentro de cada pedazo
  const pic=slide.cloneNode(true);
  pic.removeAttribute('id'); pic.className='slide is-active';
  const img=pic.querySelector('img'), src=slide.querySelector('img');
  img.loading='eager'; img.style.transform=getComputedStyle(src).transform;

  // Telaraña de grietas: rayos desde el impacto cortados por anillos irregulares
  const D=Math.hypot(Math.max(px,W-px),Math.max(py,H-py));
  const N=Math.round(rnd(10,13)), a0=rnd(0,TAU);
  const angles=[...Array(N)].map((_,i)=>a0+(i+rnd(-.32,.32))*TAU/N);
  const rings=[0,D*rnd(.07,.1),D*rnd(.2,.27),D*rnd(.42,.52),D*1.7];
  const pts=angles.map(a=>rings.map((r,j)=>{
    const k=j===0||j===rings.length-1?1:rnd(.82,1.18), b=a+(j?rnd(-.06,.06):0);
    return [px+Math.cos(b)*r*k, py+Math.sin(b)*r*k];
  }));
  const polys=[];
  for(let i=0;i<N;i++){
    const n=(i+1)%N;
    for(let j=0;j<rings.length-1;j++){
      const q=j===0?[pts[i][0],pts[n][1],pts[i][1]]:[pts[i][j],pts[n][j],pts[n][j+1],pts[i][j+1]];
      // Los pedazos grandes de afuera a veces se parten en dos triángulos
      if(j>=2&&Math.random()<.55){
        if(Math.random()<.5){polys.push({p:[q[0],q[1],q[2]],j});polys.push({p:[q[0],q[2],q[3]],j});}
        else{polys.push({p:[q[0],q[1],q[3]],j});polys.push({p:[q[1],q[2],q[3]],j});}
      } else polys.push({p:q,j});
    }
  }

  // Grietas dibujadas encima antes de que caiga todo
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','cracks');
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const line=(d,cls,delay)=>{
    const p=document.createElementNS(NS,'path');
    p.setAttribute('d',d); p.setAttribute('pathLength','1'); p.setAttribute('class',cls);
    p.style.animationDelay=delay+'ms'; svg.appendChild(p);
  };
  pts.forEach(ray=>line('M'+ray.slice(0,-1).map(q=>q.map(v=>v.toFixed(1)).join(' ')).join(' L')+' L'+ray[ray.length-1].map(v=>v.toFixed(1)).join(' '),'ray',rnd(0,40)));
  for(let j=1;j<rings.length-1;j++) for(let i=0;i<N;i++){
    if(Math.random()<.18) continue;
    const a=pts[i][j], b=pts[(i+1)%N][j];
    line(`M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`,'ring',60+j*35);
  }
  const hit=document.createElement('span'); hit.className='impact';
  hit.style.left=px+'px'; hit.style.top=py+'px';

  const shards=polys.map(({p,j})=>{
    const s=document.createElement('div'); s.className='shard';
    s.style.clipPath='polygon('+p.map(q=>q[0].toFixed(1)+'px '+q[1].toFixed(1)+'px').join(',')+')';
    s.appendChild(pic.cloneNode(true));
    const glint=document.createElement('i'); // cada pedazo refleja la luz con otro ángulo
    glint.style.background=`linear-gradient(${rnd(0,360)}deg,rgba(255,255,255,${rnd(0,.28).toFixed(2)}),transparent 60%)`;
    s.appendChild(glint);
    layer.appendChild(s);
    const cx=p.reduce((a,q)=>a+q[0],0)/p.length, cy=p.reduce((a,q)=>a+q[1],0)/p.length;
    return {s,cx,cy,j};
  });
  layer.append(svg,hit);
  box.parentElement.appendChild(layer);

  const anims=[];
  setTimeout(()=>{
    layer.classList.add('falling');
    shards.forEach(({s,cx,cy,j})=>{
      let vx=cx-px, vy=cy-py; const d=Math.hypot(vx,vy)||1; vx/=d; vy/=d;
      const near=j<2, push=near?rnd(40,110):rnd(6,30);
      const z=near?rnd(120,260):rnd(-40,90);
      const rx=rnd(-75,75), ry=rnd(-75,75), rz=rnd(-70,70);
      const fall=H*rnd(.9,1.5)+(H-cy)*.4;
      const tf=(k,dx,dy,dz)=>`perspective(900px) translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,${dz.toFixed(1)}px) rotateX(${(rx*k).toFixed(1)}deg) rotateY(${(ry*k).toFixed(1)}deg) rotate(${(rz*k).toFixed(1)}deg)`;
      s.style.transformOrigin=cx.toFixed(1)+'px '+cy.toFixed(1)+'px';
      anims.push(s.animate([
        {offset:0,transform:tf(0,0,0,0),easing:'cubic-bezier(.2,.75,.4,1)'},
        {offset:.22,transform:tf(.25,vx*push*.7,vy*push*.7-rnd(0,10),z*.5),easing:'cubic-bezier(.55,0,.95,.55)'},
        {offset:1,transform:tf(1,vx*push+rnd(-30,30),fall,z)},
        {offset:0,opacity:1},{offset:.72,opacity:1},{offset:1,opacity:0}
      ].sort((a,b)=>a.offset-b.offset),{duration:rnd(950,1450),delay:(d/D)*170+rnd(0,50),fill:'both'}).finished);
    });
    // Polvillo de vidrio que salta del impacto
    for(let i=0;i<16;i++){
      const g=document.createElement('i'); g.className='glitter';
      g.style.left=px+'px'; g.style.top=py+'px'; g.style.setProperty('--s',rnd(3,8).toFixed(1)+'px');
      layer.appendChild(g);
      const a=rnd(0,TAU), v=rnd(40,150);
      anims.push(g.animate([
        {transform:'translate(0,0) rotate(0deg)',opacity:1},
        {transform:`translate(${(Math.cos(a)*v).toFixed(1)}px,${(Math.sin(a)*v*.6-rnd(10,40)).toFixed(1)}px) rotate(${rnd(-200,200)}deg)`,opacity:1,offset:.35},
        {transform:`translate(${(Math.cos(a)*v*1.4).toFixed(1)}px,${(H*.7+rnd(0,60)).toFixed(1)}px) rotate(${rnd(-400,400)}deg)`,opacity:0}
      ],{duration:rnd(700,1100),easing:'cubic-bezier(.3,.6,.7,1)',fill:'both'}).finished);
    }
  },200);

  return CV.wait(200).then(()=>Promise.all(anims)).catch(()=>{}).then(()=>layer.remove());
};
