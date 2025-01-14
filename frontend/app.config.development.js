module.exports = {
  expo: {
    name: 'TalkToDev (Dev)',
    slug: 'talk-to-dev-dev',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.talktodev.app.dev',
      infoPlist: {
        NSMicrophoneUsageDescription: 'This app needs access to the microphone to record your coding questions.',
        NSSpeechRecognitionUsageDescription: 'This app needs access to speech recognition to convert your voice to text.'
      }
    },
    android: {
      package: 'com.talktodev.app.dev',
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.INTERNET'
      ]
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
      newArchEnabled: true,
      eas: {
        projectId: 'talk-to-dev-dev'
      }
    }
  }
}; 