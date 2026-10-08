import React from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from './auth';
import { LoginScreen, RegisterScreen } from './screens/Auth';
import { BuyerHome, NewRequest, RequestDetail, ProfileScreen } from './screens/Buyer';
import { SellerFeed, SendProposal, SellerProposals } from './screens/Seller';
import ChatScreen from './screens/Chat';
const Stack = createNativeStackNavigator(); const Tab = createBottomTabNavigator();
const BuyerTabs = () => (<Tab.Navigator><Tab.Screen name="Minhas solicitações" component={BuyerHome} /><Tab.Screen name="Perfil" component={ProfileScreen} /></Tab.Navigator>);
const SellerTabs = () => (<Tab.Navigator><Tab.Screen name="Solicitações abertas" component={SellerFeed} /><Tab.Screen name="Minhas propostas" component={SellerProposals} /><Tab.Screen name="Perfil" component={ProfileScreen} /></Tab.Navigator>);
export default function Navigation() {
  const { profile, loading } = useAuth();
  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  return (<NavigationContainer><Stack.Navigator>
    {!profile ? (<>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={RegisterScreen} /></>
    ) : (<>
      <Stack.Screen name="Tabs" component={profile.role === 'comprador' ? BuyerTabs : SellerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="NovaSolicitacao" component={NewRequest} options={{ title: 'Nova solicitação' }} />
      <Stack.Screen name="Solicitacao" component={RequestDetail} options={{ title: 'Solicitação' }} />
      <Stack.Screen name="EnviarProposta" component={SendProposal} options={{ title: 'Enviar proposta' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Conversa' }} /></>)}
  </Stack.Navigator></NavigationContainer>);
}
