import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { useAuth } from '../auth';
import { Input, C } from '../ui';
import { Message } from '../types';
export default function ChatScreen({ route }: any) {
  const { proposalId, title } = route.params; const { profile } = useAuth(); const nav = useNavigation();
  const [msgs, setMsgs] = useState<Message[]>([]); const [text, setText] = useState(''); const ref = useRef<FlatList>(null);
  useEffect(() => {
    nav.setOptions({ title: title || 'Conversa' });
    supabase.from('messages').select('*').eq('proposal_id', proposalId).order('created_at').then(({ data }) => setMsgs((data as Message[]) || []));
    const ch = supabase.channel('chat-' + proposalId).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `proposal_id=eq.${proposalId}` },
      p => setMsgs(m => m.some(x => x.id === p.new.id) ? m : [...m, p.new as Message])).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  useEffect(() => { // marca recebidas como lidas
    supabase.from('messages').update({ read: true }).eq('proposal_id', proposalId).neq('sender_id', profile!.id).eq('read', false).then(() => {});
  }, [msgs.length]);
  const send = async () => { const body = text.trim(); if (!body) return; setText('');
    await supabase.from('messages').insert({ proposal_id: proposalId, sender_id: profile!.id, body }); };
  return (<KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
    <FlatList ref={ref} data={msgs} keyExtractor={m => m.id} contentContainerStyle={{ padding: 12 }} onContentSizeChange={() => ref.current?.scrollToEnd()}
      renderItem={({ item }) => { const mine = item.sender_id === profile!.id; return (
        <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', backgroundColor: mine ? C.primary : '#fff', borderRadius: 14, padding: 10, marginVertical: 3, maxWidth: '80%' }}>
          <Text style={{ color: mine ? '#fff' : C.text }}>{item.body}</Text>
          <Text style={{ color: mine ? '#C7D2FE' : C.muted, fontSize: 10, alignSelf: 'flex-end' }}>
            {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{mine ? (item.read ? ' ✓✓' : ' ✓') : ''}</Text></View>); }} />
    <View style={{ flexDirection: 'row', padding: 8, alignItems: 'center' }}><Input style={{ flex: 1 }} placeholder="Mensagem" value={text} onChangeText={setText} />
      <TouchableOpacity onPress={send} style={{ backgroundColor: C.primary, borderRadius: 22, padding: 12, marginLeft: 6 }}><Text style={{ color: '#fff', fontWeight: '700' }}>Enviar</Text></TouchableOpacity></View>
  </KeyboardAvoidingView>);
}
