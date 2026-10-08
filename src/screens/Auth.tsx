import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { supabase } from '../supabase';
import { Btn, Input, s, Chip } from '../ui';
export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const login = async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) Alert.alert('Erro', error.message); };
  return (<View style={[s.screen, { justifyContent: 'center' }]}>
    <Text style={s.h1}>TechRequest</Text><Text style={s.muted}>Peça o que precisa, receba propostas.</Text>
    <Input placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
    <Input placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
    <Btn title="Entrar" onPress={login} /><Btn kind="ghost" title="Criar conta" onPress={() => navigation.navigate('Cadastro')} /></View>);
}
export function RegisterScreen() {
  const [role, setRole] = useState<'comprador'|'vendedor'>('comprador');
  const [f, setF] = useState({ name: '', email: '', password: '', store_name: '', store_description: '', location: '' });
  const set = (k: string) => (v: string) => setF({ ...f, [k]: v });
  const register = async () => {
    if (role === 'vendedor' && !f.store_name) return Alert.alert('Informe o nome da loja');
    const { error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: { name: f.name, role, store_name: f.store_name, store_description: f.store_description, location: f.location } } });
    if (error) Alert.alert('Erro', error.message);
  };
  return (<ScrollView style={s.screen}>
    <View style={{ flexDirection: 'row', marginBottom: 8 }}><Chip label="Sou comprador" active={role==='comprador'} onPress={() => setRole('comprador')} /><Chip label="Sou vendedor" active={role==='vendedor'} onPress={() => setRole('vendedor')} /></View>
    <Input placeholder="Nome" onChangeText={set('name')} /><Input placeholder="E-mail" autoCapitalize="none" onChangeText={set('email')} />
    <Input placeholder="Senha (mín. 6)" secureTextEntry onChangeText={set('password')} />
    {role === 'vendedor' && (<><Input placeholder="Nome da loja" onChangeText={set('store_name')} /><Input placeholder="Descrição da loja" multiline onChangeText={set('store_description')} /><Input placeholder="Localização (cidade/UF)" onChangeText={set('location')} /></>)}
    <Btn title="Criar conta" onPress={register} /></ScrollView>);
}
