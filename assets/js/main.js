/* ---------- Arranque: muestra la vista que pide el enlace (los demás módulos ya se cargaron antes) ---------- */
(function(){
  let startHash=(location.hash||'').slice(1);
  if(startHash==='ventanas'||startHash==='propiedades') startHash='servicio'; // enlaces viejos
  CV.show(startHash==='faq'?'inicio':startHash||'inicio');
})();
