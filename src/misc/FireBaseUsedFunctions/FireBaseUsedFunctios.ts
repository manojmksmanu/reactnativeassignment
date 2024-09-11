import {launchCamera, CameraOptions} from 'react-native-image-picker'; //👀
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import mime from 'react-native-mime-types';

const getFileTypeFromUri = (uri: string): string => {
  const extension = uri.split('.').pop();
  if (extension) {
    const mimeType = mime.lookup(extension);
    if (mimeType) {
      return mimeType;
    }
  }
  return 'unknown';
};

const requestExternalStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'External Storage Permission',
          message:
            'This app needs access to your external storage to upload files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (result === RESULTS.GRANTED) {
        console.log('Photo library access granted');
        return true;
      } else {
        const requestResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (requestResult === RESULTS.GRANTED) {
          console.log('Photo library access granted');
          return true;
        } else {
          console.log('Photo library access denied');
          return false;
        }
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
};
export const openDocumentPicker = async (
  setMessage: any,
  handleSendMessage: any,
) => {
  const hasPermission = await requestExternalStoragePermission();
  console.log('document permission is enabled');
  if (hasPermission) {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const documentUri = result[0].uri;
      console.log(documentUri, 'document');
      if (documentUri) {
        if (documentUri.startsWith('content://')) {
          const splitUri = documentUri.split('document/raw%3A');
          if (splitUri.length > 1) {
            const decodedUri = decodeURIComponent(splitUri[1]);
            console.log(decodedUri, 'decoded');

            // --to know file type--
            const fileType = getFileTypeFromUri(decodedUri);
            console.log('File Type:', fileType);

            await uploadFileToFirebase(decodedUri, fileType, handleSendMessage);
            return decodedUri;
          }
        }
        console.log('Selected file URI:', documentUri);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled document picker');
      } else {
        console.log('Error picking document:', err);
      }
    }
  } else {
    console.log('permission denied');
  }
};

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        return true;
      } else {
        console.log('Camera permission denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      if (result === RESULTS.GRANTED) {
        console.log('You can use the camera on iOS');
        return true;
      } else {
        console.log('Camera permission denied on iOS');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
};

export const openCamera = async () => {
  const hasPermission = await requestCameraPermission();
  console.log('Camera permission status:', hasPermission);
  if (hasPermission) {
    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: true,
    };
    try {
      const result = await launchCamera(options);
      console.log(result, 'data');
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  } else {
    console.log('Camera permission denied');
  }
};

const uploadFileToFirebase = async (
  fileUri: string,
  fileType: string,
  handleSendDocuments: any,
) => {
  try {
    const fileName = fileUri.split('/').pop();
    const reference = storage().ref(`/uploads/${fileName}`);

    // Ensure the file exists and is accessible
    console.log('File URI:', fileUri);

    const uploadTask = reference.putFile(fileUri);

    // Show progress updates
    uploadTask.on(
      'state_changed',
      snapshot => {
        // Calculate the progress percentage
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress.toFixed(2)}% complete`);
      },
      error => {
        console.error('Error uploading file:', error);
        Alert.alert('Upload failed', 'Error uploading file: ' + error.message);
      },
      async () => {
        try {
          // Handle upload completion
          const downloadURL = await reference.getDownloadURL();
          await handleSendDocuments(downloadURL, fileType);
          console.log('File available at', downloadURL);
          Alert.alert(
            'File uploaded successfully!',
            'File URL: ' + downloadURL,
          );
        } catch (error: any) {
          console.error('Error getting download URL:', error);
          Alert.alert(
            'Upload failed',
            'Error getting file URL: ' + error.message,
          );
        }
      },
    );
  } catch (error: any) {
    console.error('Error processing file:', error);
    Alert.alert('Upload failed', 'Error processing file: ' + error.message);
  }
};
