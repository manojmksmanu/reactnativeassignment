import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Image} from 'react-native';
import {useAuth} from '../../context/userContext';

interface BottomNavigationProps {
  setShowType: any;
  handleShowUsertype: any;
  showType: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  setShowType,
  showType,
  handleShowUsertype,
}) => {
  const handleButtonPress = async (item: string) => {
    await setShowType(item);
    await handleShowUsertype(item);
  };
  const {loggedUser} = useAuth();
  console.log(loggedUser);
  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity
        style={[
          styles.navButton,
          showType === 'Home' ? styles.activeButton : null,
        ]}
        onPress={() => handleButtonPress('Home')}>
        <Image
          source={require('../../assets/all.png')}
          style={{width: 25, height: 25}}
        />
        <Text
          style={[
            styles.label,
            {color: showType === 'Home' ? '#007bff' : '#888'},
          ]}>
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.navButton,
          showType === 'Admins' ? styles.activeButton : null,
        ]}
        onPress={() => handleButtonPress('Admins')}>
        <Image
          source={require('../../assets/software-engineer.png')}
          style={{width: 25, height: 25}}
        />
        <Text
          style={[
            styles.label,
            {color: showType === 'Admins' ? '#007bff' : '#888'},
          ]}>
          Admins
        </Text>
      </TouchableOpacity>

      {loggedUser?.userType === 'Super-Admin' ||
        loggedUser?.userType === 'Admin' ||
        (loggedUser?.userType === 'Co-Admin' && (
          <TouchableOpacity
            style={[
              styles.navButton,
              showType === 'Tutor' ? styles.activeButton : null,
            ]}
            onPress={() => handleButtonPress('Tutor')}>
            <Image
              source={require('../../assets/tutor.png')}
              style={{width: 25, height: 25}}
            />
            <Text
              style={[
                styles.label,
                {color: showType === 'Tutor' ? '#007bff' : '#888'},
              ]}>
              Tutor
            </Text>
          </TouchableOpacity>
        ))}

      {loggedUser?.userType === 'Super-Admin' ||
        loggedUser?.userType === 'Admin' ||
        (loggedUser?.userType === 'Sub-Admin' && (
          <TouchableOpacity
            style={[
              styles.navButton,
              showType === 'Student' ? styles.activeButton : null,
            ]}
            onPress={() => handleButtonPress('Student')}>
            <Image
              source={require('../../assets/students.png')}
              style={{width: 25, height: 25}}
            />
            <Text
              style={[
                styles.label,
                {color: showType === 'Student' ? '#007bff' : '#888'},
              ]}>
              Student
            </Text>
          </TouchableOpacity>
        ))}

      <TouchableOpacity
        style={[
          styles.navButton,
          showType === 'Group' ? styles.activeButton : null,
        ]}
        onPress={() => handleButtonPress('Group')}>
        <Image
          source={require('../../assets/meeting.png')}
          style={{width: 25, height: 25}}
        />
        <Text
          style={[
            styles.label,
            {color: showType === 'Group' ? '#007bff' : '#888'},
          ]}>
          Group
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButton: {
    alignItems: 'center',
  },
  activeButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#187afa',
  },
  label: {
    marginTop: 5,
    fontSize: 12,
  },
});

export default BottomNavigation;
