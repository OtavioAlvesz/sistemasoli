import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import { Btn, Card, Chip, Input, money, s } from '../ui';
import { CATEGORIES, Proposal, Request } from '../types';

export function BuyerHome({ navigation }: any) {
  const { profile } = useAuth(); const [items, setItems] = useState<Request[]>([]);
  useFocusEffect(useCallback(() => { supabase.from('requests').select('*').eq('buyer_id', profile!.id).order('created_at', { ascending: false }).then(({ data }) => setItems((data as Request[]) || [])); }, []));
  return (<View style={s.screen}><Btn title="+ Nova solicitação" onPress={() => navigation.navigate('NovaSolicitacao')} />
    <FlatList data={items} keyExtractor={i => i.id} ListEmptyComponent={<Text style={s.muted}>Nenhuma solicitação ainda.</Text>}
      renderItem={({ item }) => (<Card><Text style={s.bold}>{item.title}</Text><Text style={s.muted}>{item.category} · {item.quantity}x · {item.status.replace('_', ' ')}</Text>
        <Btn kind="ghost" title="Ver propostas" onPress={() => navigation.navigate('Solicitacao', { id: item.id })} /></Card>)} /></View>);
}

export function NewRequest({ navigation }: any) {
  const { profile } = useAuth(); const [cat, setCat] = useState(CATEGORIES[0]);
  const [f, setF] = useState({ title: '', quantity: '1', specs: '', notes: '', budget: '' }); const set = (k: string) => (v: string) => setF({ ...f, [k]: v });
  const publish = async () => {
    if (!f.title) return Alert.alert('Informe o produto');
    const { error } = await supabase.from('requests').insert({ buyer_id: profile!.id, category: cat, title: f.title, quantity: +f.quantity || 1, specs: f.specs, notes: f.notes, budget: f.budget ? +f.budget.replace(',', '.') : null });
    if (error) Alert.alert('Erro', error.message); else navigation.goBack();
  };
  return (<ScrollView style={s.screen}><Text style={s.bold}>Categoria</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>{CATEGORIES.map(c => <Chip key={c} label={c} active={c === cat} onPress={() => setCat(c)} />)}</ScrollView>
    <Input placeholder="Produto que procura" onChangeText={set('title')} /><Input placeholder="Quantidade" keyboardType="number-pad" value={f.quantity} onChangeText={set('quantity')} />
    <Input placeholder="Especificações técnicas" multiline onChangeText={set('specs')} /><Input placeholder="Observações" multiline onChangeText={set('notes')} />
    <Input placeholder="Orçamento aproximado (R$)" keyboardType="decimal-pad" onChangeText={set('budget')} /><Btn title="Publicar solicitação" onPress={publish} /></ScrollView>);
}

export function RequestDetail({ route, navigation }: any) {
  const { id } = route.params; const [req, setReq] = useState<Request | null>(null); const [props, setProps] = useState<Proposal[]>([]);
  const load = async () => {
    const { data: r } = await supabase.from('requests').select('*').eq('id', id).single(); setReq(r as Request);
    const { data } = await supabase.from('proposals').select('*, seller:profiles(*)').eq('request_id', id).order('price'); setProps((data as Proposal[]) || []);
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const setStatus = async (p: Proposal, status: string) => {
    await supabase.from('proposals').update({ status }).eq('id', p.id);
    if (status === 'aceita') await supabase.from('requests').update({ status: 'em_negociacao' }).eq('id', id);
    load();
  };
  const close = async (status: string) => { await supabase.from('requests').update({ status }).eq('id', id); load(); };
  if (!req) return null;
  return (<ScrollView style={s.screen}><Card><Text style={s.h1}>{req.title}</Text><Text style={s.muted}>{req.category} · {req.quantity}x · orçamento {money(req.budget)}</Text>
    {!!req.specs && <Text>{req.specs}</Text>}<Text style={s.bold}>Status: {req.status.replace('_', ' ')}</Text></Card>
    <Text style={s.h1}>Propostas ({props.length})</Text>
    {props.map(p => (<Card key={p.id}><Text style={s.bold}>{p.seller?.store_name} · ⭐ {p.seller?.rating}</Text><Text style={s.muted}>{p.seller?.name}</Text>
      <Text>{p.product}</Text><Text style={[s.h1, { marginTop: 6 }]}>{money(p.price)}</Text>
      <Text style={s.muted}>Disp.: {p.quantity} · Prazo: {p.delivery_days ?? '—'} dias · {p.payment_terms}</Text>{!!p.notes && <Text>{p.notes}</Text>}
      <Text style={s.bold}>Situação: {p.status}</Text>
      <Btn kind="ghost" title="Conversar" onPress={() => navigation.navigate('Chat', { proposalId: p.id, title: p.seller?.store_name })} />
      {p.status === 'enviada' && req.status !== 'concluida' && (<><Btn kind="ok" title="Aceitar proposta" onPress={() => setStatus(p, 'aceita')} /><Btn kind="danger" title="Recusar" onPress={() => setStatus(p, 'recusada')} /></>)}</Card>))}
    {req.status === 'em_negociacao' && <Btn kind="ok" title="Marcar como concluída" onPress={() => close('concluida')} />}
    {['aberta', 'em_negociacao'].includes(req.status) && <Btn kind="danger" title="Encerrar solicitação" onPress={() => close('encerrada')} />}</ScrollView>);
}

export function ProfileScreen() {
  const { profile, signOut } = useAuth();
  return (<View style={s.screen}><Card><Text style={s.h1}>{profile?.name}</Text><Text style={s.muted}>{profile?.role}</Text>
    {profile?.role === 'vendedor' && <Text>{profile.store_name} · {profile.location}</Text>}</Card><Btn kind="danger" title="Sair" onPress={signOut} /></View>);
}
