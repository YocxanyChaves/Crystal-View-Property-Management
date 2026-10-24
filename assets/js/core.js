/* Utilidades compartidas: cada módulo del sitio cuelga lo suyo de window.CV */
window.CV={
  reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
  rnd:(a,b)=>a+Math.random()*(b-a),
  wait:ms=>new Promise(r=>setTimeout(r,ms)),
  opened:false
};
