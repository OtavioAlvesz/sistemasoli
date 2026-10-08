/* Dados fictícios de demonstração. Senha de todas as contas demo: 123456 */
function initializeDemoData() {
  if (getData('seeded')) return;
  const D = 864e5, now = Date.now();
  const users = [
    { id: 'b1', name: 'João Silva', email: 'joao@demo.com', role: 'buyer', loc: 'São Paulo - SP' },
    { id: 'b2', name: 'Maria Souza', email: 'maria@demo.com', role: 'buyer', loc: 'Campinas - SP' },
    { id: 'b3', name: 'Pedro Lima', email: 'pedro@demo.com', role: 'buyer', loc: 'Curitiba - PR' },
    { id: 's1', name: 'Tech Store', email: 'tech@demo.com', role: 'seller', store: 'Tech Store', loc: 'São Paulo - SP', desc: 'Hardware novo e seminovo com garantia.' },
    { id: 's2', name: 'Hardware Max', email: 'max@demo.com', role: 'seller', store: 'Hardware Max', loc: 'Campinas - SP', desc: 'Especialistas em componentes para gamers.' },
    { id: 's3', name: 'InfoPro', email: 'infopro@demo.com', role: 'seller', store: 'InfoPro Informática', loc: 'Curitiba - PR', desc: 'Notebooks, monitores e periféricos.' }
  ].map(u => ({ password: '123456', ...u }));
  const R = [
    ['r1','b1','Placa de vídeo RTX 4060','Placas de vídeo',1,'8GB GDDR6, dual fan',1800,2500,'São Paulo - SP',2],
    ['r2','b1','Memória RAM DDR4 16GB','Memória RAM',2,'3200MHz, CL16',200,400,'São Paulo - SP',3],
    ['r3','b1','SSD NVMe 1TB','SSD',1,'Leitura 3000MB/s+',300,450,'São Paulo - SP',4],
    ['r4','b2','Fonte 650W 80 Plus','Fontes',1,'Modular, 80 Plus Bronze+',300,500,'Campinas - SP',1],
    ['r5','b2','Monitor 24" 144Hz','Monitores',1,'IPS, 1ms',700,1000,'Rio Claro - SP',5],
    ['r6','b3','Notebook i5 16GB','Notebooks',1,'i5 12ª geração, SSD 512GB',3000,4000,'Curitiba - PR',6],
    ['r7','b3','Teclado mecânico','Teclados',1,'ABNT2, switch red',150,300,'Curitiba - PR',1],
    ['r8','b1','Processador Ryzen 5 5600','Processadores',1,'AM4',500,800,'São Paulo - SP',12]
  ].map(a => ({ id: a[0], buyer: a[1], name: a[2], cat: a[3], qty: a[4], specs: a[5], min: a[6], max: a[7], loc: a[8], deadline: '', obs: '', status: 'open', ts: now - a[9] * D }));
  const P = [
    ['p1','r1','s1','RTX 4060 8GB','Gigabyte','Windforce OC',2400,1,'3 dias','Novo','12 meses','Pix / Cartão 10x'],
    ['p2','r1','s2','RTX 4060 8GB','MSI','Ventus 2X',2250,2,'5 dias','Novo','12 meses','Pix'],
    ['p3','r2','s1','Kit 2x8GB DDR4','Corsair','Vengeance',340,3,'2 dias','Novo','Vitalícia','Pix / Cartão'],
    ['p4','r2','s3','Kit 2x8GB DDR4','Kingston','Fury',320,2,'4 dias','Novo','12 meses','Boleto / Pix'],
    ['p5','r3','s2','SSD NVMe 1TB','WD','SN570',360,5,'3 dias','Novo','5 anos','Pix'],
    ['p6','r4','s1','Fonte 650W','Corsair','CV650',390,4,'2 dias','Novo','3 anos','Pix / Cartão'],
    ['p7','r5','s3','Monitor 24" 144Hz','AOC','Hero 24G2',899,2,'6 dias','Novo','12 meses','Cartão 12x'],
    ['p8','r6','s2','Notebook i5 16GB','Dell','Inspiron 15',3590,1,'7 dias','Novo','12 meses','Cartão 10x'],
    ['p9','r8','s1','Ryzen 5 5600','AMD','5600',620,2,'2 dias','Novo','12 meses','Pix'],
    ['p10','r4','s3','Fonte 650W','XPG','Core Reactor',450,1,'5 dias','Novo','5 anos','Boleto']
  ].map(a => ({ id: a[0], req: a[1], seller: a[2], product: a[3], brand: a[4], model: a[5], price: a[6], qty: a[7], delivery: a[8], cond: a[9], warranty: a[10], pay: a[11], obs: '', status: a[0] === 'p9' ? 'acc' : 'pend', ts: now - D / 2 }));
  R.forEach(r => { if (P.some(p => p.req === r.id)) r.status = 'recv'; });
  R.find(r => r.id === 'r1').status = 'neg';
  R.find(r => r.id === 'r8').status = 'done';
  const M = [['p1','b1','Olá, essa placa de vídeo possui garantia?'],['p1','s1','Sim, possui 12 meses de garantia.'],['p1','b1','É possível melhorar o preço?'],['p1','s1','Posso fazer por R$ 2.300.']]
    .map((m, i) => ({ id: 'm' + i, pid: m[0], from: m[1], text: m[2], ts: now - 36e5 * (5 - i) }));
  const V = [
    { id: 'v1', seller: 's1', buyer: 'b1', req: 'r8', stars: 5, text: 'Entrega rápida e produto perfeito!', ts: now - 8 * D },
    { id: 'v2', seller: 's2', buyer: 'b2', req: null, stars: 4, text: 'Bom atendimento, preço justo.', ts: now - 20 * D },
    { id: 'v3', seller: 's3', buyer: 'b3', req: null, stars: 5, text: 'Recomendo, tudo certo.', ts: now - 30 * D }
  ];
  const N = [{ id: 'n1', to: 'b1', text: 'Você recebeu uma nova proposta.', link: 'compare/r1', ts: now - 36e5, read: false },
             { id: 'n2', to: 's1', text: 'O comprador enviou uma mensagem.', link: 'chat/p1', ts: now - 18e5, read: false }];
  [['users', users], ['requests', R], ['proposals', P], ['messages', M], ['reviews', V], ['notifs', N]].forEach(([k, v]) => saveData(k, v));
  saveData('seeded', 1);
}
