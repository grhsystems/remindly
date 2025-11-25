import 'dart:io';

class ApiConfig {
  static String get baseUrl {
    if (Platform.isAndroid) {
      // For Android emulator, use 10.0.2.2
      return 'http://10.0.2.2:3001/api';
    } else if (Platform.isIOS) {
      // For iOS simulator, use localhost
      return 'http://localhost:3001/api';
    } else {
      // For web and other platforms, use localhost
      return 'http://localhost:3001/api';
    }
  }
}
