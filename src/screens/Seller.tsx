import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ScrollView, Alert, ScrollView as SV } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import { Btn, Card, Chip, Input, money, s } from '../ui';
import { CATEGORIES, Proposal, Request } from '../types';

export function SellerFeed({ navigation }: any) {
  const [items, setItems] = useState<Request[]>([]); const [q, setQ] = useState(''); const [cat, setCat] = useState<string | null>(null);
  useFocusEffect(useCallback(() => { supabase.from('requests').select('*').eq('status', 'aberta').order('created_at', { ascending: false }).then(({ data }) => setItems((data as Request[]) || [])); }, []));
  const list = items.filter(r => (!cat || r.category === cat) && r.title.toLowerCase().includes(q.toLowerCase()));
  return (<View style={s.screen}><Input placeholder="Pesquisar solicitações" value={q} onChangeText={setQ} />
    <SV horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }}><Chip label="Todas" active={!cat} onPress={() => setCat(null)} />{CATEGORIES.map(c => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />)}</SV>
    <FlatList data={list} keyExtractor={i => i.id} renderItem={({ item }) => (<Card><Text style={s.bold}>{item.title}</Text>
      <Text style={s.muted}>{item.category} · {item.quantity}x · orçamento {money(item.budget)}</Text>{!!item.specs && <Text>{item.specs}</Text>}
      <Btn title="Enviar proposta" onPress={() => navigation.navigate('EnviarProposta', { request: item })} /></Card>)} /></View>);
}

export function SendProposal({ route, navigation }: any) {
  const { profile } = useAuth(); const r: Request = route.params.request;
  const [f, setF] = useState({ product: '', price: '', quantity: String(r.quantity), delivery_days: '', payment_terms: '', notes: '' }); const set = (k: string) => (v: string) => setF({ ...f, [k]: v });
  const send = async () => {
    if (!f.product || !f.price) return Alert.alert('Informe produto e preço');
    const { error } = await supabase.from('proposals').insert({ request_id: r.id, seller_id: profile!.id, product: f.product, price: +f.price.replace(',', '.'), quantity: +f.quantity || 1, delivery_days: f.delivery_days ? +f.delivery_days : null, payment_terms: f.payment_terms, notes: f.notes });
    if (error) Alert.alert('Erro', error.code === '23505' ? 'Você já enviou proposta para esta solicitação.' : error.message); else navigation.goBack();
  };
  return (<ScrollView style={s.screen}><Card><Text style={s.bold}>{r.title}</Text><Text style={s.muted}>{r.specs}</Text></Card>
    <Input placeholder="Produto oferecido" onChangeText={set('product')} /><Input placeholder="Preço (R$)" keyboardType="decimal-pad" onChangeText={set('price')} />
    <Input placeholder="Quantidade disponível" keyboardType="number-pad" value={f.quantity} onChangeText={set('quantity')} />
    <Input placeholder="Prazo de entrega (dias)" keyboardType="number-pad" onChangeText={set('delivery_days')} />
    <Input placeholder="Condições de pagamento" onChangeText={set('payment_terms')} /><Input placeholder="Observações" multiline onChangeText={set('notes')} />
    <Btn title="Enviar proposta" onPress={send} /></ScrollView>);
}

export function SellerProposals({ navigation }: any) {
  const { profile } = useAuth(); const [items, setItems] = useState<Proposal[]>([]);
  const load = useCallback(() => { supabase.from('proposals').select('*, request:requests(*)').eq('seller_id', profile!.id).order('created_at', { ascending: false }).then(({ data }) => setItems((data as Proposal[]) || [])); }, []);
  useFocusEffect(load);
  const cancel = async (id: string) => { await supabase.from('proposals').update({ status: 'cancelada' }).eq('id', id); load(); };
  return (<FlatList style={s.screen} data={items} keyExtractor={i => i.id} ListEmptyComponent={<Text style={s.muted}>Sem propostas ainda.</Text>}
    renderItem={({ item }) => (<Card><Text style={s.bold}>{item.request?.title}</Text><Text>{item.product} · {money(item.price)}</Text><Text style={s.muted}>Status: {item.status}</Text>
      <Btn kind="ghost" title="Conversar" onPress={() => navigation.navigate('Chat', { proposalId: item.id, title: 'Comprador' })} />
      {item.status === 'enviada' && <Btn kind="danger" title="Cancelar negociação" onPress={() => cancel(item.id)} />}</Card>)} />);
}
