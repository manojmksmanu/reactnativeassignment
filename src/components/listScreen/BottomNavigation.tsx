import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Image} from 'react-native';

interface BottomNavigationProps {
  items: Array<{label: string; icon: any}>;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({items}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleButtonPress = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <View style={styles.bottomNavigation}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.navButton,
            activeIndex === index ? styles.activeButton : null,
          ]}
          onPress={() => handleButtonPress(index)}>
          <Image
            source={
              typeof item.icon === 'string' ? {uri: item.icon} : item.icon
            }
            style={{width: 25, height: 25}}
          />
          <Text
            style={[
              styles.label,
              {color: activeIndex === index ? '#007bff' : '#888'},
            ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
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
