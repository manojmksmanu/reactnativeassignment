import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

const UserInfoScreen: React.FC = ({}) => {
  return <Text>GroupInfoSCreen</Text>;
};

const styles = StyleSheet.create({});

export default UserInfoScreen;
