import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static String get baseUrl => ApiConfig.baseUrl;
  
  // Headers
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
  };

  // Authentication
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers,
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Login failed: ${response.body}');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  static Future<Map<String, dynamic>> register(String name, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _headers,
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Registration failed: ${response.body}');
      }
    } catch (e) {
      throw Exception('Registration error: $e');
    }
  }

  // Tasks
  static Future<List<Map<String, dynamic>>> getTasks(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/tasks'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['tasks'] ?? []);
      } else {
        throw Exception('Failed to fetch tasks: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get tasks error: $e');
    }
  }

  static Future<Map<String, dynamic>> createTask(String token, Map<String, dynamic> taskData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/tasks'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
        body: jsonEncode(taskData),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to create task: ${response.body}');
      }
    } catch (e) {
      throw Exception('Create task error: $e');
    }
  }

  static Future<Map<String, dynamic>> updateTask(String token, String taskId, Map<String, dynamic> taskData) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/tasks/$taskId'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
        body: jsonEncode(taskData),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to update task: ${response.body}');
      }
    } catch (e) {
      throw Exception('Update task error: $e');
    }
  }

  static Future<void> deleteTask(String token, String taskId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/tasks/$taskId'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete task: ${response.body}');
      }
    } catch (e) {
      throw Exception('Delete task error: $e');
    }
  }

  // Lists
  static Future<List<Map<String, dynamic>>> getLists(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/lists'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['lists'] ?? []);
      } else {
        throw Exception('Failed to fetch lists: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get lists error: $e');
    }
  }

  static Future<Map<String, dynamic>> createList(String token, Map<String, dynamic> listData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/lists'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
        body: jsonEncode(listData),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to create list: ${response.body}');
      }
    } catch (e) {
      throw Exception('Create list error: $e');
    }
  }

  // Shopping Items
  static Future<List<Map<String, dynamic>>> getShoppingItems(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/shopping'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['items'] ?? []);
      } else {
        throw Exception('Failed to fetch shopping items: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get shopping items error: $e');
    }
  }

  static Future<Map<String, dynamic>> createShoppingItem(String token, Map<String, dynamic> itemData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/shopping'),
        headers: {..._headers, 'Authorization': 'Bearer $token'},
        body: jsonEncode(itemData),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to create shopping item: ${response.body}');
      }
    } catch (e) {
      throw Exception('Create shopping item error: $e');
    }
  }
}
