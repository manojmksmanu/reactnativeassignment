import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatWindow from '../screens/ChatWindow';
import ForwardChatScreen from '../screens/ForwardChatScreen';
import {loggeduser} from '../services/authService';
import {AuthProvider} from '../context/userContext';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen
            name="ForwardChatScreen"
            component={ForwardChatScreen}
          />
          <Stack.Screen
            name="ChatWindow"
            options={{title: 'chat'}}
            component={ChatWindow}
          />
        </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;
