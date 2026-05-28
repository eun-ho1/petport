import '../models/app_models.dart';
import 'api_client.dart';

class AnimalApiService {
  AnimalApiService({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<List<Dog>> fetchDogs() async {
    final data = await _client.get('/api/dogs');
    final items = data['items'] as List<dynamic>? ?? const [];
    return items
        .map((item) => Dog.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  Future<Dog> fetchDog(String id) async {
    final data = await _client.get('/api/dogs/$id');
    return Dog.fromJson(Map<String, dynamic>.from(data['item'] as Map));
  }

  Future<List<DailyCareRecord>> fetchDailyCareRecords(String dogId) async {
    final data = await _client.get('/api/dogs/$dogId/daily-care');
    final items = data['items'] as List<dynamic>? ?? const [];
    return items
        .map((item) =>
            DailyCareRecord.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  Future<DailyCareRecord> saveDailyCareRecord(
    String dogId,
    DailyCareInput input,
  ) async {
    final data = await _client.post(
      '/api/dogs/$dogId/daily-care',
      body: input.toJson(),
    );
    return DailyCareRecord.fromJson(
      Map<String, dynamic>.from(data['item'] as Map),
    );
  }

  Future<List<HealthAlert>> fetchHealthAlerts({bool? resolved}) async {
    final query = resolved == null ? '' : '?resolved=$resolved';
    final data = await _client.get('/api/health-alerts$query');
    final items = data['items'] as List<dynamic>? ?? const [];
    return items
        .map((item) =>
            HealthAlert.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  Future<HealthAlert> resolveHealthAlert(String alertId) async {
    final data = await _client.patch(
      '/api/health-alerts/$alertId/resolve',
      body: const <String, dynamic>{},
    );
    return HealthAlert.fromJson(
      Map<String, dynamic>.from(data['item'] as Map),
    );
  }
}
