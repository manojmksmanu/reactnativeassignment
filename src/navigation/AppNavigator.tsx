import React, {useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatWindow from '../screens/ChatWindow';
import ForwardChatScreen from '../screens/ForwardChatScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="ForwardChatScreen" component={ForwardChatScreen} />
        <Stack.Screen
          name="ChatWindow"
          options={{title: 'chat'}}
          component={ChatWindow}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
