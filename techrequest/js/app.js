/* TechRequest - UI e regras de negócio.
   AVISO: login/senha são DEMONSTRAÇÃO (senha em texto puro no LocalStorage). NÃO é seguro para produção.
   Chat e notificações são locais; não há comunicação real entre dispositivos. */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CATS = ['Processadores','Placas de vídeo','Placas-mãe','Memória RAM','SSD','HD','Fontes','Gabinetes','Coolers','Monitores','Teclados','Mouses','Headsets','Notebooks','Celulares','Tablets','Cabos','Adaptadores','Componentes de rede','Periféricos','Outros'];
const ST = { open: 'Aberta', recv: 'Recebendo propostas', neg: 'Em negociação', acc: 'Proposta aceita', done: 'Concluída', canc: 'Cancelada' };
const PST = { pend: 'Enviada', acc: 'Aceita', rej: 'Recusada', canc: 'Cancelada' };
const money = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fdate = t => new Date(t).toLocaleDateString('pt-BR');
const ftime = t => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const get = k => getData(k, []);
const me = () => get('users').find(u => u.id === getData('session'));
const user = id => get('users').find(u => u.id === id) || { name: '?' };
const reqOf = id => get('requests').find(r => r.id === id);
const propOf = id => get('proposals').find(p => p.id === id);
const isSeller = () => me()?.role === 'seller';
const go = h => { location.hash = '#/' + h; };
const opts = (arr, sel) => arr.map(c => `<option ${c === sel ? 'selected' : ''}>${esc(c)}</option>`).join('');
const stars = n => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
const empty = t => `<div class="empty">📭<p>${t}</p></div>`;
const pill = (r, m = ST) => `<span class="pill s-${r.status}">${m[r.status]}</span>`;
function rating(sid) { const rs = get('reviews').filter(r => r.seller === sid); return { n: rs.length, avg: rs.length ? rs.reduce((a, r) => a + r.stars, 0) / rs.length : 0 }; }
function notify(to, text, link) { addData('notifs', { id: uid('n'), to, text, link, ts: Date.now(), read: false }); }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); }
function confirmBox(msg) {
  return new Promise(res => {
    const m = $('#modal');
    m.innerHTML = `<div class="box"><p>${esc(msg)}</p><br><button class="btn ghost" id="mn">Não</button><button class="btn" id="my">Sim</button></div>`;
    m.classList.add('on');
    $('#mn').onclick = () => { m.classList.remove('on'); res(false); };
    $('#my').onclick = () => { m.classList.remove('on'); res(true); };
  });
}
function show(html) { const v = $('#view'); v.innerHTML = html; v.classList.remove('fade'); void v.offsetWidth; v.classList.add('fade'); scrollTo(0, 0); }
function readImg(file) {
  return new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 500 / im.width), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .7)); }; im.onerror = () => res(''); im.src = fr.result; };
    fr.readAsDataURL(file);
  });
}
const reqCard = r => `<div class="card" onclick="go('request/${r.id}')"><div class="between"><b>${esc(r.name)}</b>${pill(r)}</div><p class="mut">${esc(r.cat)} • ${r.qty} un.</p><p>${money(r.min)} – ${money(r.max)}</p><p class="mut">📍 ${esc(r.loc)} • ${fdate(r.ts)}</p><button class="btn sm">Ver detalhes</button></div>`;
const propCard = p => { const r = reqOf(p.req) || {}, s = isSeller(); return `<div class="card" onclick="go('${s ? 'request/' + p.req : 'compare/' + p.req}')"><div class="between"><b>${esc(p.product)}</b>${pill(p, PST)}</div><p>${money(p.price)} • ${esc(p.brand)} ${esc(p.model)}</p><p class="mut">${s ? 'Para: ' + esc(r.name) : 'Vendedor: ' + esc(user(p.seller).store || user(p.seller).name)}</p></div>`; };

const A = {
  search(f) { go('search/' + encodeURIComponent(f.q.value)); return false; },
  theme() { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; saveData('theme', t); },
  login(id) { saveData('session', id); go('home'); toast('Bem-vindo(a), ' + user(id).name + '!'); },
  swap() { A.login(isSeller() ? 'b1' : 's1'); },
  logout() { saveData('session', null); go('login'); },
  async resetDemo() { if (await confirmBox('Apagar tudo e restaurar dados de demonstração?')) { resetAllData(); initializeDemoData(); go('login'); toast('Dados restaurados'); } },
  async cancelReq(id) {
    if (!await confirmBox('Cancelar esta solicitação?')) return;
    updateData('requests', id, { status: 'canc' });
    get('proposals').filter(p => p.req === id && p.status === 'pend').forEach(p => { updateData('proposals', p.id, { status: 'rej' }); notify(p.seller, 'Uma solicitação foi cancelada pelo comprador.', 'request/' + id); });
    toast('Solicitação cancelada'); render();
  },
  async cancelProp(id) { if (!await confirmBox('Cancelar sua proposta?')) return; const p = propOf(id); updateData('proposals', id, { status: 'canc' }); notify(reqOf(p.req).buyer, 'Uma proposta foi cancelada pelo vendedor.', 'compare/' + p.req); toast('Proposta cancelada'); render(); },
  async accept(pid) {
    const p = propOf(pid); if (!await confirmBox('Aceitar esta proposta? As demais serão recusadas.')) return;
    get('proposals').filter(x => x.req === p.req && x.id !== pid && x.status === 'pend').forEach(x => { updateData('proposals', x.id, { status: 'rej' }); notify(x.seller, 'Sua proposta foi recusada.', 'request/' + p.req); });
    updateData('proposals', pid, { status: 'acc' }); updateData('requests', p.req, { status: 'acc' });
    notify(p.seller, 'Sua proposta foi aceita.', 'request/' + p.req); toast('Proposta aceita!'); render();
  },
  async reject(pid) { if (!await confirmBox('Recusar esta proposta?')) return; const p = propOf(pid); updateData('proposals', pid, { status: 'rej' }); notify(p.seller, 'Sua proposta foi recusada.', 'request/' + p.req); toast('Proposta recusada'); render(); },
  async finish(id) { if (!await confirmBox('Marcar negociação como concluída?')) return; updateData('requests', id, { status: 'done' }); const p = get('proposals').find(x => x.req === id && x.status === 'acc'); if (p) notify(p.seller, 'Negociação concluída.', 'request/' + id); toast('Negociação concluída'); go('rate/' + id); },
  send(e, pid) { const t = e.target.t.value.trim(); if (t) sendMsg(pid, me().id, t, false); },
  sim(pid) {
    const p = propOf(pid), r = reqOf(p.req), buyer = me().id === r.buyer;
    const S = ['Sim, tenho em estoque e posso enviar hoje.', `Posso fazer por ${money(p.price * .95)} à vista.`, 'Possui garantia e nota fiscal.'], B = ['Pode fechar por esse valor?', 'Tem como enviar mais fotos?', 'Qual o prazo de entrega?'];
    const L = buyer ? S : B; sendMsg(pid, buyer ? p.seller : r.buyer, L[Math.floor(Math.random() * L.length)], true);
  }
};
function sendMsg(pid, from, text, demo) {
  const p = propOf(pid), r = reqOf(p.req);
  addData('messages', { id: uid('m'), pid, from, text, ts: Date.now(), demo });
  notify(from === p.seller ? r.buyer : p.seller, from === p.seller ? 'O vendedor enviou uma mensagem.' : 'O comprador enviou uma mensagem.', 'chat/' + pid);
  if (['open', 'recv'].includes(r.status)) updateData('requests', r.id, { status: 'neg' });
  render();
}
function list() {
  const u = me(), s = isSeller();
  let rs = get('requests').filter(r => (s || r.buyer === u.id) && (!F.cat || r.cat === F.cat) && (!F.max || r.min <= +F.max) && (!F.loc || r.loc.toLowerCase().includes(F.loc.toLowerCase())) && (F.st ? r.status === F.st : (!s || ['open', 'recv', 'neg'].includes(r.status))));
  rs.sort((a, b) => F.sort === 'old' ? a.ts - b.ts : b.ts - a.ts);
  $('#list').innerHTML = rs.map(reqCard).join('') || empty('Nenhuma solicitação encontrada');
}
let F = { cat: '', max: '', loc: '', st: '', sort: 'new' };
const V = {};
V.login = () => {
  show(`<h2>⚡ TechRequest</h2><p class="mut">Protótipo — autenticação apenas para demonstração.</p>
  <h3>Contas de demonstração</h3><button class="btn" onclick="A.login('b1')">João Silva (Comprador)</button><button class="btn" onclick="A.login('s1')">Tech Store (Vendedor)</button>
  <h3>Entrar</h3><form class="form" id="lf"><label>E-mail<input name="email" type="email" required></label><label>Senha<input name="pw" type="password" required></label><button class="btn big">Entrar</button></form>
  <h3>Cadastrar</h3><form class="form" id="rf"><label>Nome<input name="name" required></label><label>E-mail<input name="email" type="email" required></label><label>Senha<input name="pw" type="password" minlength="4" required></label>
  <label>Tipo<select name="role"><option value="buyer">Comprador</option><option value="seller">Vendedor</option></select></label><button class="btn big ghost">Criar conta</button></form>`);
  $('#lf').onsubmit = e => { e.preventDefault(); const f = e.target, u = get('users').find(x => x.email === f.email.value.trim().toLowerCase() && x.password === f.pw.value); u ? A.login(u.id) : toast('E-mail ou senha inválidos'); };
  $('#rf').onsubmit = e => {
    e.preventDefault(); const f = e.target, em = f.email.value.trim().toLowerCase();
    if (get('users').some(x => x.email === em)) return toast('E-mail já cadastrado');
    const n = { id: uid('u'), name: f.name.value.trim(), email: em, password: f.pw.value, role: f.role.value, loc: '', store: f.role.value === 'seller' ? f.name.value.trim() : '', desc: '' };
    addData('users', n); A.login(n.id);
  };
};
V.home = () => {
  const u = me(), s = isSeller();
  const rs = get('requests').filter(r => s ? ['open', 'recv'].includes(r.status) : r.buyer === u.id).sort((a, b) => b.ts - a.ts).slice(0, 3);
  const ps = get('proposals').filter(p => s ? p.seller === u.id : reqOf(p.req)?.buyer === u.id).sort((a, b) => b.ts - a.ts).slice(0, 3);
  show(`<h2>Olá, ${esc(u.name.split(' ')[0])} 👋</h2><p class="mut">${s ? 'Veja o que os compradores procuram' : 'O que você precisa hoje?'}</p>
  <form class="search" onsubmit="return A.search(this)"><input name="q" placeholder="Buscar peças, categorias, vendedores"><button class="btn">🔍</button></form>
  ${s ? '<button class="btn big" onclick="go(\'requests\')">Ver solicitações</button>' : '<button class="btn big" onclick="go(\'new\')">＋ Nova solicitação</button>'}
  <div class="grid"><a href="#/requests">📋 ${s ? 'Solicitações' : 'Minhas solicitações'}</a><a href="#/proposals">💼 Minhas propostas</a><a href="#/chats">💬 Conversas</a><a href="#/profile">👤 Perfil</a></div>
  <h3>${s ? 'Solicitações recentes' : 'Minhas solicitações recentes'}</h3>${rs.map(reqCard).join('') || empty('Nada por aqui ainda')}
  <h3>${s ? 'Minhas propostas' : 'Propostas recebidas'}</h3>${ps.map(propCard).join('') || empty('Nenhuma proposta ainda')}`);
};
V.requests = () => {
  const s = isSeller();
  show(`<h2>${s ? 'Solicitações' : 'Minhas solicitações'}</h2>${s ? '' : '<button class="btn" onclick="go(\'new\')">＋ Nova</button>'}<div class="filters">
  <select onchange="F.cat=this.value;list()"><option value="">Categoria</option>${opts(CATS, F.cat)}</select>
  <input type="number" placeholder="Orçamento até R$" value="${F.max}" oninput="F.max=this.value;list()">
  <input placeholder="Localização" value="${esc(F.loc)}" oninput="F.loc=this.value;list()">
  <select onchange="F.st=this.value;list()"><option value="">Status: ativas</option>${Object.entries(ST).map(([k, v]) => `<option value="${k}" ${F.st === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
  <select onchange="F.sort=this.value;list()"><option value="new">Mais recentes</option><option value="old" ${F.sort === 'old' ? 'selected' : ''}>Mais antigas</option></select></div><div id="list"></div>`);
  list();
};
V.new = id => {
  const r = id ? reqOf(id) || {} : {};
  if (isSeller()) { toast('Apenas compradores criam solicitações'); return go('requests'); }
  show(`<h2>${id ? 'Editar' : 'Nova'} solicitação</h2><form class="form" id="f">
  <label>Nome do produto<input name="name" required value="${esc(r.name)}"></label>
  <label>Categoria<select name="cat">${opts(CATS, r.cat)}</select></label>
  <label>Quantidade<input name="qty" type="number" min="1" required value="${r.qty || 1}"></label>
  <label>Especificações técnicas<textarea name="specs">${esc(r.specs)}</textarea></label>
  <label>Orçamento mínimo (R$)<input name="min" type="number" min="0" step="0.01" required value="${r.min ?? ''}"></label>
  <label>Orçamento máximo (R$)<input name="max" type="number" min="0" step="0.01" required value="${r.max ?? ''}"></label>
  <label>Localização<input name="loc" required value="${esc(r.loc || me().loc)}"></label>
  <label>Prazo desejado<input name="deadline" type="date" value="${esc(r.deadline)}"></label>
  <label>Observações<textarea name="obs">${esc(r.obs)}</textarea></label>
  <label>Imagem do produto desejado<input name="img" type="file" accept="image/*"></label>
  <button class="btn big">${id ? 'Salvar alterações' : 'Publicar solicitação'}</button></form>`);
  $('#f').onsubmit = async e => {
    e.preventDefault(); const f = e.target;
    const o = { name: f.name.value.trim(), cat: f.cat.value, qty: +f.qty.value, specs: f.specs.value, min: +f.min.value, max: +f.max.value, loc: f.loc.value, deadline: f.deadline.value, obs: f.obs.value };
    if (o.max < o.min) return toast('Orçamento máximo menor que o mínimo');
    if (f.img.files[0]) o.img = await readImg(f.img.files[0]);
    if (id) { updateData('requests', id, o); toast('Solicitação atualizada'); go('request/' + id); }
    else { const n = { id: uid('r'), buyer: me().id, status: 'open', ts: Date.now(), ...o }; addData('requests', n); toast('Solicitação publicada!'); go('request/' + n.id); }
  };
};
V.request = id => {
  const r = reqOf(id); if (!r) return show(empty('Solicitação não encontrada'));
  const u = me(), own = r.buyer === u.id, ps = get('proposals').filter(p => p.req === id && p.status !== 'canc'), mine = ps.find(p => p.seller === u.id);
  let b = '';
  if (isSeller()) {
    if (mine) b += `<button class="btn" onclick="go('chat/${mine.id}')">💬 Conversar</button>` + (mine.status === 'pend' ? `<button class="btn ghost" onclick="go('proposal/${id}')">Editar proposta</button><button class="btn bad" onclick="A.cancelProp('${mine.id}')">Cancelar proposta</button>` : `<p>Sua proposta: ${PST[mine.status]}</p>`);
    else if (['open', 'recv'].includes(r.status)) b += `<button class="btn big" onclick="go('proposal/${id}')">Enviar proposta</button>`;
  } else if (own) {
    if (ps.length) b += `<button class="btn" onclick="go('compare/${id}')">Ver propostas (${ps.length})</button>`;
    if (['open', 'recv', 'neg'].includes(r.status)) b += `<button class="btn ghost" onclick="go('new/${id}')">Editar</button><button class="btn bad" onclick="A.cancelReq('${id}')">Cancelar</button>`;
    if (r.status === 'acc') b += `<button class="btn ok" onclick="A.finish('${id}')">Concluir negociação</button>`;
    if (r.status === 'done' && !get('reviews').some(x => x.req === id)) b += `<button class="btn ok" onclick="go('rate/${id}')">⭐ Avaliar vendedor</button>`;
  }
  show(`<div class="between"><h2>${esc(r.name)}</h2>${pill(r)}</div>${r.img ? `<img class="img" src="${r.img}" alt="">` : ''}
  <div class="card" style="cursor:default"><p><b>Categoria:</b> ${esc(r.cat)}</p><p><b>Quantidade:</b> ${r.qty}</p><p><b>Especificações:</b> ${esc(r.specs) || '-'}</p><p><b>Orçamento:</b> ${money(r.min)} – ${money(r.max)}</p><p><b>Local:</b> ${esc(r.loc)}</p><p><b>Prazo:</b> ${r.deadline ? fdate(r.deadline) : '-'}</p><p><b>Observações:</b> ${esc(r.obs) || '-'}</p><p class="mut">Publicada em ${fdate(r.ts)} por ${esc(user(r.buyer).name)}</p></div>${b}`);
};
V.proposal = rid => {
  const r = reqOf(rid), u = me(), ex = get('proposals').find(p => p.req === rid && p.seller === u.id && p.status === 'pend'), p = ex || {};
  if (!r || !isSeller() || !['open', 'recv'].includes(r.status)) { toast('Não é possível enviar proposta'); return go('requests'); }
  const f = (n, l, t = 'text') => `<label>${l}<input name="${n}" type="${t}" required value="${esc(p[n])}" ${t === 'number' ? 'min="0" step="0.01"' : ''}></label>`;
  show(`<h2>${ex ? 'Editar' : 'Enviar'} proposta</h2><p class="mut">Para: ${esc(r.name)} (${r.qty} un.)</p><form class="form" id="f">
  ${f('product', 'Produto oferecido')}${f('brand', 'Marca')}${f('model', 'Modelo')}${f('price', 'Preço (R$)', 'number')}${f('qty', 'Quantidade disponível', 'number')}${f('delivery', 'Prazo de entrega')}
  <label>Condição<select name="cond">${opts(['Novo', 'Usado', 'Recondicionado'], p.cond)}</select></label>${f('warranty', 'Garantia')}${f('pay', 'Forma de pagamento')}
  <label>Observações<textarea name="obs">${esc(p.obs)}</textarea></label><button class="btn big">Enviar proposta</button></form>`);
  $('#f').onsubmit = e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); d.price = +d.price; d.qty = +d.qty;
    if (ex) updateData('proposals', ex.id, d);
    else {
      addData('proposals', { id: uid('p'), req: rid, seller: u.id, status: 'pend', ts: Date.now(), ...d });
      if (r.status === 'open') updateData('requests', rid, { status: 'recv' });
      notify(r.buyer, 'Sua solicitação recebeu uma nova proposta.', 'compare/' + rid);
    }
    toast('Proposta enviada!'); go('request/' + rid);
  };
};
V.proposals = () => {
  const u = me(), s = isSeller();
  const ps = get('proposals').filter(p => s ? p.seller === u.id : reqOf(p.req)?.buyer === u.id).sort((a, b) => b.ts - a.ts);
  show(`<h2>${s ? 'Minhas propostas' : 'Propostas recebidas'}</h2>${ps.map(p => propCard(p) + (s && p.status === 'pend' ? `<button class="btn sm ghost" onclick="go('proposal/${p.req}')">Editar</button><button class="btn sm bad" onclick="A.cancelProp('${p.id}')">Cancelar</button>` : '')).join('') || empty('Nenhuma proposta')}`);
};
V.compare = rid => {
  const r = reqOf(rid), u = me();
  if (!r || r.buyer !== u.id) { toast('Acesso negado'); return go('home'); }
  const ps = get('proposals').filter(p => p.req === rid && p.status !== 'canc'), open = ['open', 'recv', 'neg'].includes(r.status);
  const row = (l, v) => `<dt>${l}</dt><dd>${v}</dd>`;
  show(`<h2>Propostas: ${esc(r.name)}</h2><p>${pill(r)}</p><div class="cmp">${ps.map(p => { const s = user(p.seller), R = rating(s.id); return `<div class="card"><dl>
  ${row('Vendedor', `<a href="#/profile/${s.id}">${esc(s.store || s.name)}</a>`)}${row('Avaliação', R.n ? `${stars(R.avg)} (${R.n})` : 'Sem avaliações')}${row('Produto', esc(p.product))}${row('Marca / Modelo', esc(p.brand) + ' ' + esc(p.model))}
  ${row('Preço', money(p.price))}${row('Prazo', esc(p.delivery))}${row('Garantia', esc(p.warranty))}${row('Condição', esc(p.cond))}${row('Pagamento', esc(p.pay))}${row('Status', PST[p.status])}</dl>
  <button class="btn sm" onclick="go('chat/${p.id}')">💬 Conversar</button>${p.status === 'pend' && open ? `<button class="btn sm ok" onclick="A.accept('${p.id}')">Aceitar proposta</button><button class="btn sm bad" onclick="A.reject('${p.id}')">Recusar proposta</button>` : ''}</div>`; }).join('') || empty('Ainda sem propostas')}</div>
  <button class="btn ghost" onclick="go('request/${rid}')">Ver solicitação</button>`);
};
V.chats = () => {
  const u = me(), ps = get('proposals').filter(p => p.status !== 'canc' && (p.seller === u.id || reqOf(p.req)?.buyer === u.id));
  const rows = ps.map(p => { const ms = get('messages').filter(m => m.pid === p.id).sort((a, b) => b.ts - a.ts); return { p, last: ms[0] }; }).sort((a, b) => (b.last?.ts || 0) - (a.last?.ts || 0));
  show(`<h2>Conversas</h2>${rows.map(({ p, last }) => { const o = user(p.seller === u.id ? reqOf(p.req).buyer : p.seller); return `<div class="card" onclick="go('chat/${p.id}')"><b>${esc(o.store || o.name)}</b><p>${esc(p.product)}</p><p class="mut">${last ? esc(last.text) : 'Sem mensagens'}</p></div>`; }).join('') || empty('Nenhuma conversa')}`);
};
V.chat = pid => {
  const p = propOf(pid), r = p && reqOf(p.req), u = me();
  if (!p || !r || (u.id !== r.buyer && u.id !== p.seller)) { toast('Acesso negado'); return go('chats'); }
  const o = user(u.id === r.buyer ? p.seller : r.buyer);
  get('notifs').filter(n => n.to === u.id && n.link === 'chat/' + pid && !n.read).forEach(n => updateData('notifs', n.id, { read: true }));
  const ms = get('messages').filter(m => m.pid === pid).sort((a, b) => a.ts - b.ts);
  show(`<div class="chead"><b>${esc(o.store || o.name)}</b><small>${esc(o.name)} • ${esc(p.product)} (${money(p.price)}) • ${esc(r.name)}</small></div>
  <div class="msgs">${ms.map(m => `<div class="msg ${m.from === u.id ? 'me' : ''}">${esc(m.text)}<small>${ftime(m.ts)} ${m.from === u.id ? '✓' : ''}${m.demo ? ' • demo' : ''}</small></div>`).join('') || empty('Inicie a conversa')}</div>
  <button class="btn ghost sm" onclick="A.sim('${pid}')">🎭 Simular resposta ${u.id === r.buyer ? 'do vendedor' : 'do comprador'} (recurso de demonstração)</button>
  <form class="send" onsubmit="A.send(event,'${pid}');return false"><input name="t" placeholder="Mensagem" autocomplete="off" required><button class="btn">➤</button></form>`);
  scrollTo(0, document.body.scrollHeight);
};
V.notifs = () => {
  const u = me(), ns = get('notifs').filter(n => n.to === u.id).sort((a, b) => b.ts - a.ts);
  show(`<h2>Notificações</h2>${ns.map(n => `<div class="card ${n.read ? '' : 'unread'}" onclick="go('${n.link}')"><p>${esc(n.text)}</p><small>${fdate(n.ts)} ${ftime(n.ts)}</small></div>`).join('') || empty('Sem notificações')}`);
  ns.forEach(n => updateData('notifs', n.id, { read: true })); chrome();
};
V.rate = rid => {
  const r = reqOf(rid), p = get('proposals').find(x => x.req === rid && x.status === 'acc');
  if (!r || !p || r.buyer !== me().id || r.status !== 'done') { toast('Avaliação indisponível'); return go('home'); }
  if (get('reviews').some(x => x.req === rid)) { toast('Já avaliado'); return go('request/' + rid); }
  show(`<h2>Avaliar ${esc(user(p.seller).store)}</h2><form class="form" id="f"><label>Nota<select name="s">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${stars(n)} (${n})</option>`).join('')}</select></label><label>Comentário<textarea name="t"></textarea></label><button class="btn big">Enviar avaliação</button></form>`);
  $('#f').onsubmit = e => { e.preventDefault(); addData('reviews', { id: uid('v'), seller: p.seller, buyer: r.buyer, req: rid, stars: +e.target.s.value, text: e.target.t.value, ts: Date.now() }); notify(p.seller, 'Você recebeu uma nova avaliação.', 'profile/' + p.seller); toast('Obrigado pela avaliação!'); go('profile/' + p.seller); };
};
V.profile = id => {
  const u = me(), t = id ? user(id) : u, own = t.id === u.id; let body;
  if (t.role === 'seller') {
    const R = rating(t.id), rv = get('reviews').filter(x => x.seller === t.id).sort((a, b) => b.ts - a.ts), deals = get('proposals').filter(p => p.seller === t.id && p.status === 'acc').length;
    body = `<p>${esc(t.desc)}</p><p class="mut">📍 ${esc(t.loc || '-')}</p><div class="stats"><div><b>${R.n ? R.avg.toFixed(1) : '–'}</b>${stars(R.avg)}</div><div><b>${R.n}</b>avaliações</div><div><b>${deals}</b>negociações</div></div><h3>Avaliações</h3>${rv.map(x => `<div class="card" style="cursor:default"><b>${stars(x.stars)}</b><p>${esc(x.text)}</p><small>${esc(user(x.buyer).name)} • ${fdate(x.ts)}</small></div>`).join('') || empty('Sem avaliações')}`;
  } else {
    const rs = get('requests').filter(r => r.buyer === t.id);
    body = `<p class="mut">✉ ${esc(t.email)}</p><p class="mut">📍 ${esc(t.loc || '-')}</p><div class="stats"><div><b>${rs.length}</b>solicitações</div><div><b>${rs.filter(r => r.status === 'done').length}</b>concluídas</div><div><b>${get('reviews').filter(x => x.buyer === t.id).length}</b>avaliações feitas</div></div>`;
  }
  show(`<div class="avatar">${esc(t.name[0])}</div><h2>${esc(t.store || t.name)}</h2><p class="mut">${t.role === 'seller' ? 'Vendedor' : 'Comprador'} ${t.store ? '• ' + esc(t.name) : ''}</p>${body}
  ${own ? `<h3>Conta</h3><button class="btn ghost" onclick="A.theme()">🌓 Tema claro/escuro</button><button class="btn ghost" onclick="A.swap()">⇄ Alternar usuário demo</button><button class="btn ghost" onclick="A.resetDemo()">♻ Restaurar dados demo</button><button class="btn bad" onclick="A.logout()">Sair</button>` : ''}`);
};
V.search = q => {
  q = (q || '').trim(); const k = q.toLowerCase(), has = s => String(s || '').toLowerCase().includes(k);
  const rs = k ? get('requests').filter(r => has(r.name) || has(r.cat) || has(r.specs) || has(r.loc)) : [], cs = k ? CATS.filter(has) : [], ss = k ? get('users').filter(u => u.role === 'seller' && (has(u.name) || has(u.store))) : [];
  show(`<h2>Busca</h2><form class="search" onsubmit="return A.search(this)"><input name="q" value="${esc(q)}" placeholder="Buscar..."><button class="btn">🔍</button></form>
  <h3>Solicitações / produtos</h3>${rs.map(reqCard).join('') || empty('Nada encontrado')}
  <h3>Categorias</h3>${cs.map(c => `<button class="btn ghost sm" onclick="F.cat='${c}';F.st='';go('requests')">${c}</button>`).join('') || empty('Nenhuma categoria')}
  <h3>Vendedores</h3>${ss.map(s => `<div class="card" onclick="go('profile/${s.id}')"><b>${esc(s.store || s.name)}</b><p class="mut">${stars(rating(s.id).avg)}</p></div>`).join('') || empty('Nenhum vendedor')}`);
};
function chrome() {
  const u = me(), r = location.hash.replace(/^#\/?/, '').split('/')[0] || 'home';
  document.body.classList.toggle('auth', !u);
  const map = { request: 'requests', new: 'requests', proposal: 'requests', compare: 'proposals', chat: 'chats', rate: 'profile', search: 'home', notifs: 'home' }, tab = map[r] || r;
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === tab));
  $('#back').hidden = ['home', 'requests', 'proposals', 'chats', 'profile', 'login'].includes(r);
  if (u) { const n = get('notifs').filter(x => x.to === u.id && !x.read).length; $('#bell').hidden = !n; $('#bell').textContent = n; $('#tabreq').textContent = u.role === 'seller' ? 'Solicitações' : 'Minhas'; }
}
function render() {
  const [p, ...rest] = location.hash.replace(/^#\/?/, '').split('/'), route = p || 'home', u = me();
  if (!u && route !== 'login') return go('login');
  if (u && route === 'login') return go('home');
  let arg; try { arg = decodeURIComponent(rest.join('/')) || undefined; } catch { arg = undefined; }
  (V[route] || V.home)(arg); chrome();
}
document.documentElement.dataset.theme = getData('theme', 'light');
initializeDemoData();
window.addEventListener('hashchange', render);
render();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
