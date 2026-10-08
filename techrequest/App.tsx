import 'react-native-url-polyfill/auto';
import React from 'react';
import { AuthProvider } from './src/auth';
import Navigation from './src/navigation';
export default function App() { return <AuthProvider><Navigation /></AuthProvider>; }
