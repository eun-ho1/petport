import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.details});

  final String message;
  final int? statusCode;
  final Object? details;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? httpClient}) : _httpClient = httpClient ?? http.Client();

  final http.Client _httpClient;

  Future<Map<String, dynamic>> get(String path) async {
    return _request('GET', path);
  }

  Future<Map<String, dynamic>> post(String path, {Object? body}) async {
    return _request('POST', path, body: body);
  }

  Future<Map<String, dynamic>> patch(String path, {Object? body}) async {
    return _request('PATCH', path, body: body);
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Object? body,
  }) async {
    if (ApiConfig.accessToken.isEmpty) {
      throw ApiException(
        '로그인 토큰이 없습니다. --dart-define=API_ACCESS_TOKEN=<supabase access token> 값을 설정해 주세요.',
      );
    }

    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer ${ApiConfig.accessToken}',
    };

    late final http.Response response;
    try {
      switch (method) {
        case 'GET':
          response = await _httpClient.get(uri, headers: headers);
          break;
        case 'POST':
          response = await _httpClient.post(
            uri,
            headers: headers,
            body: jsonEncode(body),
          );
          break;
        case 'PATCH':
          response = await _httpClient.patch(
            uri,
            headers: headers,
            body: jsonEncode(body),
          );
          break;
        default:
          throw UnsupportedError('Unsupported method: $method');
      }
    } on Exception catch (error) {
      throw ApiException(
        '서버에 연결하지 못했습니다. API 주소와 네트워크 상태를 확인해 주세요.',
        details: error,
      );
    }

    final decodedText = utf8.decode(response.bodyBytes);
    final payload = decodedText.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(decodedText) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final error = payload['error'] as Map<String, dynamic>?;
      throw ApiException(
        error?['message'] as String? ?? '요청 처리 중 오류가 발생했습니다.',
        statusCode: response.statusCode,
        details: error?['details'],
      );
    }

    if (payload['success'] != true) {
      throw ApiException('응답 형식이 올바르지 않습니다.', details: payload);
    }

    return (payload['data'] as Map<String, dynamic>? ?? <String, dynamic>{});
  }
}
