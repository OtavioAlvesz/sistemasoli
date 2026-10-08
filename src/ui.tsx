import React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, TextInputProps } from 'react-native';
export const C = { primary: '#4F46E5', bg: '#F5F6FA', card: '#fff', text: '#111827', muted: '#6B7280', danger: '#DC2626', ok: '#16A34A' };
export const Btn = ({ title, onPress, kind = 'primary' }: { title: string; onPress: () => void; kind?: 'primary'|'danger'|'ok'|'ghost' }) => (
  <TouchableOpacity onPress={onPress} style={[s.btn, kind==='danger'&&{backgroundColor:C.danger}, kind==='ok'&&{backgroundColor:C.ok}, kind==='ghost'&&{backgroundColor:'#E0E7FF'}]}>
    <Text style={[s.btnT, kind==='ghost'&&{color:C.primary}]}>{title}</Text></TouchableOpacity>);
export const Input = (p: TextInputProps) => <TextInput placeholderTextColor={C.muted} {...p} style={[s.input, p.style]} />;
export const Card = ({ children }: { children: React.ReactNode }) => <View style={s.card}>{children}</View>;
export const Chip = ({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[s.chip, active && { backgroundColor: C.primary }]}><Text style={{ color: active ? '#fff' : C.text }}>{label}</Text></TouchableOpacity>);
export const money = (n?: number) => n == null ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 16 },
  btn: { backgroundColor: C.primary, padding: 14, borderRadius: 12, alignItems: 'center', marginVertical: 4 },
  btnT: { color: '#fff', fontWeight: '700' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginVertical: 6, borderWidth: 1, borderColor: '#E5E7EB', color: C.text },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 14, marginVertical: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  chip: { backgroundColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  h1: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 8 }, bold: { fontWeight: '700', color: C.text }, muted: { color: C.muted }
});
