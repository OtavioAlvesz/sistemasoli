/* Camada de armazenamento. PROTÓTIPO: dados ficam no navegador (LocalStorage), sem segurança real.
   Para usar API REST/Firebase/Supabase no futuro, reimplemente apenas estas funções. */
const PREFIX = 'techrequest_';
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function getData(key, def = null) { try { const v = localStorage.getItem(PREFIX + key); return v === null ? def : JSON.parse(v); } catch { return def; } }
function saveData(key, val) { try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); return true; } catch { return false; } }
function addData(key, item) { const a = getData(key, []); a.push(item); saveData(key, a); return item; }
function updateData(key, id, patch) { const a = getData(key, []); const i = a.find(x => x.id === id); if (i) Object.assign(i, patch); saveData(key, a); return i; }
function deleteData(key, id) { saveData(key, getData(key, []).filter(x => x.id !== id)); }
function resetAllData() { Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k)); }
