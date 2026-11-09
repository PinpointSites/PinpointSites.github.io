// Geliştirici görünüm düğmesi: sadece bilgisayarda yerel önizlemede (localhost / 127.0.0.1 / file) görünür.
// Yayındaki sitede ve önizleme çerçevelerinin (iframe) içinde hiç çıkmaz, müşteri görmez.
(() => {
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  if (!local || window !== window.top) return;

  const css = `
    .dvt{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483646;display:flex;gap:2px;padding:4px;
      background:rgba(20,20,26,.92);border:1px solid rgba(255,255,255,.12);border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.35);
      font:600 13px/1 system-ui,-apple-system,Segoe UI,sans-serif;backdrop-filter:blur(8px)}
    .dvt button{all:unset;cursor:pointer;color:#b8b8c6;padding:9px 14px;border-radius:999px;white-space:nowrap}
    .dvt button:hover{color:#fff}
    .dvt button.on{background:#7c6cff;color:#fff}
    .dvt-stage{position:fixed;inset:0;z-index:2147483645;background:#0d0d10;display:flex;align-items:center;justify-content:center;padding:24px 16px 80px;overflow:auto}
    .dvt-phone{flex:0 0 auto;padding:12px;border-radius:52px;background:#1f1f26;border:1px solid #33333d;box-shadow:0 30px 60px rgba(0,0,0,.5);position:relative}
    .dvt-phone::before{content:"";position:absolute;top:22px;left:50%;transform:translateX(-50%);width:110px;height:28px;border-radius:20px;background:#000;z-index:2}
    .dvt-phone iframe{display:block;width:375px;height:min(780px,calc(100vh - 140px));border:0;border-radius:40px;background:#fff}
    .dvt-hide-scroll{overflow:hidden!important}
    .dvt-stage.desk{display:block;padding:0;background:#fff;overflow:hidden}
    .dvt-stage.desk iframe{position:absolute;top:0;left:0;width:1280px;border:0;transform-origin:0 0}
    @media (max-width:420px){.dvt-phone{padding:6px;border-radius:36px}.dvt-phone iframe{width:calc(100vw - 46px);border-radius:30px}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'dvt';
  bar.innerHTML = '<button data-m="desk" class="on">🖥 Masaüstü</button><button data-m="mob">📱 Telefon</button>';
  document.body.appendChild(bar);

  // Masaüstü: pencere yeterince genişse sayfanın kendisi; darsa (ör. uygulama paneli)
  // 1280px genişliğindeki gerçek masaüstü görünümü pencereye sığacak şekilde küçültülür.
  const DESK_W = 1280, NARROW = 1100;
  let stage = null, mode = 'desk';
  const src = () => location.href.split('#')[0];

  function clear(){
    if (stage) { stage.remove(); stage = null; }
    document.documentElement.classList.remove('dvt-hide-scroll');
  }
  function fitDesk(){
    if (!stage || !stage.classList.contains('desk')) return;
    const s = innerWidth / DESK_W, fr = stage.querySelector('iframe');
    fr.style.transform = `scale(${s})`;
    fr.style.height = (innerHeight / s) + 'px';
  }
  function render(){
    const wantStage = mode === 'mob' || innerWidth < NARROW;
    const kind = mode === 'mob' ? 'mob' : 'desk';
    if (!wantStage) { clear(); return; }
    if (stage && stage.dataset.kind === kind) { fitDesk(); return; }
    clear();
    stage = document.createElement('div');
    stage.dataset.kind = kind;
    stage.className = 'dvt-stage' + (kind === 'desk' ? ' desk' : '');
    stage.innerHTML = kind === 'mob'
      ? '<div class="dvt-phone"><iframe title="Telefon görünümü"></iframe></div>'
      : '<iframe title="Masaüstü görünümü"></iframe>';
    stage.querySelector('iframe').src = src();
    document.body.appendChild(stage);
    document.documentElement.classList.add('dvt-hide-scroll');
    fitDesk();
  }
  function setMode(m){
    mode = m;
    bar.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
    render();
    try { sessionStorage.setItem('dvt-mode', mode); } catch (e) {}
  }
  bar.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); });
  addEventListener('resize', render);

  // Klavye kısayolu: M tuşu görünümü değiştirir (yazı alanındayken çalışmaz)
  addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'm' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
    setMode(mode === 'mob' ? 'desk' : 'mob');
  });

  // Sayfa yenilenince son seçilen görünümü hatırla
  let saved = 'desk';
  try { saved = sessionStorage.getItem('dvt-mode') || 'desk'; } catch (e) {}
  setMode(saved);
})();
