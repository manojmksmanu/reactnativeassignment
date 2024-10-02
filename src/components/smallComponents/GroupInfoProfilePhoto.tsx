import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {getUserFirstLetter} from '../../misc/misc';
import {useAuth} from '../../context/userContext';

const GroupInfoProfilePhoto: React.FC = name => {
  const {loggedUser} = useAuth();
  return (
    <View style={styles.profileCircle}>
      {loggedUser ? (
        <Text style={styles.profileText}>{getUserFirstLetter(name)}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  profileText: {
    fontSize: 30,
    color: '#333',
  },
});

export default GroupInfoProfilePhoto;
