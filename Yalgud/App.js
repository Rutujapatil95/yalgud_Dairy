import React, { createContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './redux/store';

import LoginScreen from './src/Screens/LoginScreen';
import SignupScreen from './src/Screens/SignupScreen';
import HomeScreen from './src/Screens/home';
import HelpScreen from './src/Screens/help';
import CreatePinScreen from './src/Screens/CreatePinScreen';
import SuccessLoginScreen from './src/Screens/SuccessLoginScreen';
import UserDetailsScreen from './src/Screens/UserDetailsScreen';
import Offerscreen from './src/Screens/Offerscreen';
import ProductScreen from './src/Screens/ProductScreen';
import ProductDetailScreen  from './src/Screens/ProductDetailScreen';
import BestSellers  from './src/Screens/bestSellers';
import AddToCartScreen from './src/Screens/AddToCartScreen';
import CheckoutScreen from './src/Screens/CheckoutScreen';
import EnterScreen from './src/Screens/EnterScreen';
import ProfileScreen from './src/Screens/ProfileScreen';
import BreadListScreen from './src/Screens/BreadListScreen';


export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="LoginScreen"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="home" component={HomeScreen} />
            <Stack.Screen name="help" component={HelpScreen} />
            <Stack.Screen name="CreatePinScreen" component={CreatePinScreen} />
            <Stack.Screen
              name="SuccessLoginScreen"
              component={SuccessLoginScreen}
            />
            <Stack.Screen
              name="UserDetailsScreen"
              component={UserDetailsScreen}
            />
            <Stack.Screen name="Offerscreen" component={Offerscreen} />
            <Stack.Screen name="ProductScreen" component={ProductScreen} />
            <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
            <Stack.Screen name="bestSellers" component={BestSellers} />
            <Stack.Screen name="AddToCartScreen" component={AddToCartScreen} />
             <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
              <Stack.Screen name="EnterScreen" component={EnterScreen} />
              <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
               <Stack.Screen name="BreadListScreen" component={BreadListScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </Provider>
  );
}
