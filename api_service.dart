import 'package:dio/dio.dart';
import 'package:uuid/uuid.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000';
  
  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  Future<Map<String, dynamic>> executeTopup({
    required int packageId,
    required String targetNumber,
    required String pin,
    String currency = 'YER_OLD',
  }) async {
    final String idempotencyKey = const Uuid().v4();
    try {
      final res = await _dio.post(
        '/api/v1/orders/topup',
        data: {
          'package_id': packageId,
          'target_number': targetNumber,
          'pin': pin,
          'currency': currency,
        },
        options: Options(headers: {'X-Idempotency-Key': idempotencyKey}),
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'فشل الاتصال بالخادم');
    }
  }
}
