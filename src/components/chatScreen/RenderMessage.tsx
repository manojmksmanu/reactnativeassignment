import moment from 'moment';
import {Image, Text, View, StyleSheet, Dimensions} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  GestureHandlerRootView,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
const {width: SCREEN_WIDTH} = Dimensions.get('window');

const RenderMessage = ({
  item,
  userId,
  onLeftSwipe,
  onRightSwipe,
}: {
  item: any;
  userId: any;
  onLeftSwipe: any;
  onRightSwipe: any;
}) => {
  const isSender = item.sender !== userId;
  const translateX = useSharedValue(0);
  // Gesture handler for pan gestures
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (isSender) {
      // Sender's message:
      translateX.value = Math.min(event.nativeEvent.translationX, 0); // Only move to left
    } else {
      // Receiver's message:
      translateX.value = Math.max(event.nativeEvent.translationX, 0); //only move to right
    }
  };
  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      // Use GestureState.END for clarity
      if (isSender) {
        if (event.nativeEvent.translationX < -100) {
          translateX.value = withSpring(SCREEN_WIDTH / 2);
          onLeftSwipe(); // Trigger right swipe action
          translateX.value = withSpring(0);
        } else {
          translateX.value = withSpring(0); // Return to original position
        }
      } else {
        if (event.nativeEvent.translationX > 100) {
          translateX.value = withSpring(SCREEN_WIDTH / 2);
          onRightSwipe(); // Trigger right swipe action
          translateX.value = withSpring(0);
        } else {
          translateX.value = withSpring(0); // Return to original position
        }
      }
    }
  };
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <GestureHandlerRootView>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View
          style={[
            styles.messageContainer,
            isSender ? styles.senderContainer : styles.receiverContainer,
            animatedStyle,
          ]}>
          {item.replyingMessage && (
            <Text style={styles.renderRepyingMessage}>
              {item.replyingMessage.message}
            </Text>
          )}
          <View style={styles.message}>
            <Text
              style={
                isSender ? styles.sendermessageText : styles.receivermessageText
              }>
              {item.message}
            </Text>
          </View>

          <View style={styles.messageInfoContainer}>
            <Text style={styles.timeText}>
              {/* {messageTime} */}
              {moment(item.createdAt).format('hh:mm A')}
            </Text>
            {/* {isSender && item.isRead && ( */}
            {isSender && (
              <Image
                source={require('../../assets/double-check.png')}
                style={styles.tickIcon}
              />
            )}
            {/* )} */}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 5,
    padding: 8,
    borderRadius: 10,
    maxWidth: '70%',
    flexDirection: 'column', // Keep the content in a row
    flexWrap: 'wrap', // Allow wrapping to handle longer texts
  },
  message: {
    flexShrink: 1, // Allow message text to shrink when necessary
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    // backgroundColor:'red'
  },
  messageInfoContainer: {
    marginLeft: 5, // Space between the message and the info container
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeText: {
    color: '#808080',
    fontSize: 10,
    marginRight: 3, // Slight margin for separation
  },
  tickIcon: {
    width: 9,
    height: 9,
    marginLeft: 3, // Slight margin for separation
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 1, // Vertical offset
    },
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 1, // Shadow blur radius
    elevation: 1, // Android shadow
    maxWidth: '60%',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 1, // Vertical offset
    },
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 1, // Shadow blur radius
    elevation: 1, // Android shadow
  },
  sendermessageText: {
    color: '#000',
    fontSize: 16,
  },
  receivermessageText: {
    color: '#000',
    fontSize: 16,
  },
  renderRepyingMessage: {
    backgroundColor: '#F3F8EF',
    borderRadius: 5,
    padding: 10,
  },
});

export default RenderMessage;
