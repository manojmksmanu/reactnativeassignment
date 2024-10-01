import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ForgotPassword from '../screens/ForgorPassword';
import ForwardChatScreen from '../screens/ForwardChatScreen';

import ChatWindow2 from '../screens/ChatWindow2';
import {useAuth} from '../context/userContext';
import {View, ActivityIndicator, Animated, Text, Easing} from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import DeleteAccount from '../screens/DeletAccountScreen';
import GroupCreateScreen from '../screens/GroupCreateScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import ImageDisplayScreen from '../screens/ImageDisplayScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const {loggedUser, loadingLoggedUser} = useAuth();
  console.log(loadingLoggedUser);
  if (loadingLoggedUser) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Animated.Text
          style={{
            fontSize: 30,
            fontWeight: 'bold',
            color: '#aa14f0',
          }}>
          Mymegamind
        </Animated.Text>
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{marginTop: 20}}
        />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        // headerShown: false,
        gestureEnabled: true,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.out(Easing.poly(4)),
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.out(Easing.poly(4)),
            },
          },
        },
        cardStyleInterpolator: ({current, next, layouts}) => {
          const translateX = current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          });

          const opacity = current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return {
            cardStyle: {
              transform: [{translateX}],
              opacity,
            },
          };
        },
      }}>
      {!loggedUser ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="ForgotPassowrd"
            component={ForgotPassword}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{headerShown: false}}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
          <Stack.Screen
            name="ForwardChatScreen"
            component={ForwardChatScreen}
          />
          <Stack.Screen name="ChatWindow2" component={ChatWindow2} />
          <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
