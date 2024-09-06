import React, {useState} from 'react';
import moment from 'moment';
import {
  Image,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
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
import Pdf from 'react-native-pdf'; // Add this import for PDF viewing

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const RenderMessage = ({
  item,
  loggedUserId,
  onLeftSwipe,
  onRightSwipe,
}: {
  item: any;
  loggedUserId: string;
  onLeftSwipe: any;
  onRightSwipe: any;
}) => {
  const isSender = item.sender === loggedUserId;
  const {fileType, fileUrl, message} = item;
  const translateX = useSharedValue(0);
  const [isModalVisible, setModalVisible] = useState(false);

  // Gesture handler for pan gestures
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (isSender) {
      // Sender's message:
      translateX.value = Math.min(event.nativeEvent.translationX, 0); // Only move to left
    } else {
      // Receiver's message:
      translateX.value = Math.max(event.nativeEvent.translationX, 0); // Only move to right
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

  const renderFileContent = (
    fileType: any,
    fileUrl: string,
    message: string,
    isSender: boolean,
  ) => {
    if (
      fileType === 'image/png' ||
      fileType === 'image/jpeg' ||
      fileType === 'image/jpg'
    ) {
      return (
        <TouchableOpacity onPress={() => openFile(fileUrl, fileType)}>
          <Image
            source={{uri: fileUrl}}
            style={{width: 200, height: 200, resizeMode: 'contain'}}
          />
        </TouchableOpacity>
      );
    }

    if (fileType === 'application/pdf') {
      return (
        <TouchableOpacity onPress={() => openFile(fileUrl, fileType)}>
          <Text style={styles.documentText}>PDF Document</Text>
        </TouchableOpacity>
      );
    }

    if (fileType === 'text') {
      return (
        <Text
          style={
            isSender ? styles.senderMessageText : styles.receiverMessageText
          }>
          {message}
        </Text>
      );
    }

    return null; // Return null for unsupported file types
  };

  const openFile = (fileUrl: string, fileType: string) => {
    if (fileType === 'application/pdf') {
      setModalVisible(true);
    } else {
      // Handle other file types if needed
    }
  };

  const renderRepyingMessage = (repliedMessage: any) => {
    if (!repliedMessage) return null;

    const {fileType, fileUrl, message, senderName} = repliedMessage;

    return (
      <View style={styles.renderRepyingMessage}>
        <Text style={{color: '#25d366'}}>
          {senderName ? senderName : 'You'}
        </Text>
        {fileType === 'image/png' ||
        fileType === 'image/jpeg' ||
        fileType === 'image/jpg' ? (
          <Image
            source={{uri: fileUrl}}
            style={{width: 100, height: 100, resizeMode: 'contain'}}
          />
        ) : (
          <Text style={{color: 'grey'}}>{message}</Text>
        )}
      </View>
    );
  };

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
          {item.replyingMessage && renderRepyingMessage(item.replyingMessage)}
          <View style={styles.message}>
            {renderFileContent(fileType, fileUrl, message, isSender)}
          </View>

          <View style={styles.messageInfoContainer}>
            <Text style={styles.timeText}>
              {moment(item.createdAt).format('hh:mm A')}
            </Text>
            {isSender && (
              <Image
                source={require('../../assets/double-check.png')}
                style={styles.tickIcon}
              />
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Modal for viewing documents */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Pdf
            source={{uri: fileUrl, cache: true}}
            onLoadComplete={(numberOfPages: number) => {
              console.log(`number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page: number) => {
              console.log(`current page: ${page}`);
            }}
            onError={(error: any) => {
              console.log(error);
            }}
            onPressLink={(uri: string) => {
              console.log(`Link pressed: ${uri}`);
            }}
            style={styles.pdf}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  senderMessageText: {
    color: '#000',
    fontSize: 16,
    margin: 2,
  },
  receiverMessageText: {
    color: '#000',
    fontSize: 16,
    margin: 2,
  },
  renderRepyingMessage: {
    backgroundColor: '#F3F8EF',
    borderRadius: 5,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  documentText: {
    color: '#000',
    fontSize: 16,
    margin: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pdf: {
    width: SCREEN_WIDTH - 40,
    height: 600,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RenderMessage;
