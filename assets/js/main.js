/* ---------- Arranque: muestra la vista que pide el enlace (los demás módulos ya se cargaron antes) ---------- */
(function(){
  const startHash=(location.hash||'').slice(1);
  CV.show(startHash==='faq'?'inicio':startHash||'inicio');
})();
