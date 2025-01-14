export default {
  expo: {
    name: 'TalkToDev',
    slug: 'talk-to-dev',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      bundleIdentifier: 'com.talktodev.app',
      buildNumber: '1.0.0',
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription: 'This app needs access to the microphone to record your coding questions.',
        NSSpeechRecognitionUsageDescription: 'This app needs access to speech recognition to convert your voice to text.'
      }
    },
    android: {
      package: 'com.talktodev.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.INTERNET'
      ]
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      [
        '@react-native-voice/voice',
        {
          microphonePermission: 'Allow TalkToDev to access your microphone.',
          speechRecognitionPermission: 'Allow TalkToDev to access speech recognition.'
        }
      ]
    ],
    extra: {
      newArchEnabled: true
    }
  }
}; 