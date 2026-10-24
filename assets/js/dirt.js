/* ---------- Pinta suciedad de vidrio (polvo, chorreados, gotas secas y huellas) en un canvas ---------- */
CV.paintDirt=function(dc,w,h,base='rgba(170,152,120,.55)'){
  const rnd=CV.rnd;
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
};
