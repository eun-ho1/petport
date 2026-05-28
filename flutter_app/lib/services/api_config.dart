import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String accessToken = String.fromEnvironment(
    'API_ACCESS_TOKEN',
    defaultValue: '',
  );

  static const String shelterId = String.fromEnvironment(
    'SHELTER_ID',
    defaultValue: '11111111-1111-1111-1111-111111111111',
  );

  static String get baseUrl {
    const fromDefine = String.fromEnvironment('API_BASE_URL');
    if (fromDefine.isNotEmpty) return fromDefine;
    if (kIsWeb) return 'http://localhost:3000';
    if (Platform.isAndroid) return 'http://10.0.2.2:3000';
    return 'http://127.0.0.1:3000';
  }
}
