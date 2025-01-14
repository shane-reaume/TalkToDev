# TalkToDev

This is a POC project for learning Expo mobile development, along with an AI coding assistant backend. The concept is an AI coding assistant that helps you learn programming through natural conversation. Supports both OpenAI's GPT and Anthropic's Claude models.

## Features

### Currently Implemented
- ✅ Cross-platform support
  - Web (fully functional)
  - iOS (fully functional)
  - Android (in progress)
- ✅ AI Integration
  - OpenAI GPT-4 and GPT-3.5 support
  - Anthropic Claude 3 support
  - Language-specific conversations (Python, JavaScript, TypeScript)
  - Clear separation of explanations and code examples
  - Syntax highlighting for code blocks
- ✅ Basic UI
  - Programming language selection
  - AI provider configuration
  - Chat interface with code highlighting
  - Voice input support (Web/iOS/Android)
  - Auto-send messages after typing

### In Progress
- 🚧 Error Handling & Loading States
  - Frontend loading indicators
  - Error boundaries
  - Graceful error recovery
  - Network status handling

### Planned Features
- 📝 Conversation Management
  - Chat history persistence
  - Session management
  - Context-aware conversations
  - Export conversations

- 🎤 Voice Input/Output
  - Speech-to-text for questions
  - Voice commands
  - Accessibility support

- 🔄 State Management
  - Global state using Context/Redux
  - Persistent settings
  - User preferences

- 🔒 User Authentication (Optional)
  - User accounts
  - Saved conversations
  - API key management

- ✨ Advanced Features
  - Code execution playground
  - Multiple language support in single chat
  - GitHub integration
  - Code snippet sharing

## Project Structure

```
TalkToDev/
├── frontend/         # React Native + Expo frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/      # Screen components
│   │   ├── services/     # API and utility services
│   │   ├── context/      # React Context/State management
│   │   └── hooks/        # Custom React hooks
│   └── App.tsx          # Main application component
│
└── backend/          # Node.js + Express backend
    ├── src/
    │   ├── controllers/  # Request handlers
    │   ├── services/     # Business logic
    │   │   └── ai/      # AI service implementations
    │   ├── routes/      # API routes
    │   └── types/       # TypeScript type definitions
    └── server.ts       # Main server file
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- OpenAI API key and/or Anthropic API key
- For iOS development:
  - macOS
  - Xcode 15+
  - iOS Simulator or physical device
- For Android development:
  - Android Studio
  - Android SDK
  - Android Emulator or physical device

### Quick Start

1. Start the backend:
   ```bash
   cd backend
   npm install
   # Create .env file with your API keys (see Backend Setup section)
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   # Create .env with EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```

3. Choose your platform:

   For Web (recommended for development):
   ```bash
   npx expo start --web --clear
   ```

   For iOS:
   ```bash
   # Create development build for iOS
   npx expo prebuild -p ios
   npx expo run:ios
   ```

   After initial build, you can start the development server:
   ```bash
   npx expo start
   ```
   Then press:
   - `w` for web
   - `i` for iOS simulator

Note: Android support is currently in development. We recommend using the web or iOS versions for now.

Note: If you encounter build issues, you can clean the builds and try again:
```bash
# Clean builds (these are generated files)
rm -rf frontend/ios/ frontend/android/ frontend/.expo/
cd frontend
npm install
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```
   PORT=3000
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   CORS_ORIGIN=http://localhost:19006
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. Start the application:
   ```bash
   # For web development:
   npx expo start --web --clear
   
   # For iOS development:
   npx expo run:ios
   
   # For Android development:
   npx expo run:android
   ```

Note: When switching between platforms or after significant changes, you may need to clean the build:
```bash
# Clean builds
rm -rf ios/ android/ web-build/ node_modules/ .expo/
npm install

# Rebuild for your target platform
npx expo prebuild --clean
```

### Configuration

After starting the app:
1. Click the settings icon in the top right
2. Select your AI provider (OpenAI or Anthropic)
3. Enter your API key
4. Enter the model name:
   - For OpenAI: e.g., "gpt-4", "gpt-3.5-turbo"
   - For Anthropic: e.g., "claude-3-opus-20240229", "claude-3-sonnet-20240229"
5. Click Save

### Usage

1. Select your programming language (Python, JavaScript, or TypeScript)
2. Type your question or click the microphone icon for voice input
3. The app will automatically send your message after you stop typing
4. View the AI's response with syntax-highlighted code examples

## Development Roadmap

### Phase 1 (Current)
- ✅ Basic application structure
- ✅ AI service integration
- 🚧 Error handling & loading states

### Phase 2
- Conversation history management
- Voice input implementation
- State management setup

### Phase 3
- User authentication
- Advanced features
- Testing & optimization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
