import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:remindly/services/api_service.dart';
import 'package:remindly/models/user.dart';
import 'package:remindly/models/task.dart';
import 'package:remindly/models/list.dart';

import 'api_service_test.mocks.dart';

@GenerateMocks([http.Client])
void main() {
  group('ApiService', () {
    late MockClient mockClient;

    setUp(() {
      mockClient = MockClient();
      // Mock SharedPreferences
      SharedPreferences.setMockInitialValues({});
    });

    group('login', () {
      test('should login successfully', () async {
        // Arrange
        when(mockClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          '{"success": true, "user": {"id": "1", "email": "test@example.com", "name": "Test User", "language": "he", "theme": "light"}, "token": "mock-token"}',
          200,
        ));

        // Act
        final result = await ApiService.login('test@example.com', 'password123');

        // Assert
        expect(result['success'], true);
        expect(result['user']['email'], 'test@example.com');
        expect(result['token'], 'mock-token');
      });

      test('should handle login error', () async {
        // Arrange
        when(mockClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          '{"success": false, "message": "Invalid credentials"}',
          401,
        ));

        // Act & Assert
        expect(
          () => ApiService.login('test@example.com', 'wrongpassword'),
          throwsException,
        );
      });
    });

    group('register', () {
      test('should register successfully', () async {
        // Arrange
        when(mockClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          '{"success": true, "user": {"id": "1", "email": "test@example.com", "name": "Test User", "language": "he", "theme": "light"}, "token": "mock-token"}',
          201,
        ));

        // Act
        final result = await ApiService.register(
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          language: 'he',
        );

        // Assert
        expect(result['success'], true);
        expect(result['user']['email'], 'test@example.com');
        expect(result['token'], 'mock-token');
      });

      test('should handle registration error', () async {
        // Arrange
        when(mockClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          '{"success": false, "message": "Email already exists"}',
          400,
        ));

        // Act & Assert
        expect(
          () => ApiService.register(
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
          ),
          throwsException,
        );
      });
    });

    group('getCurrentUser', () {
      test('should get current user successfully', () async {
        // Arrange
        when(mockClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          '{"success": true, "user": {"id": "1", "email": "test@example.com", "name": "Test User", "language": "he", "theme": "light"}}',
          200,
        ));

        // Act
        final user = await ApiService.getCurrentUser();

        // Assert
        expect(user.id, '1');
        expect(user.email, 'test@example.com');
        expect(user.name, 'Test User');
      });

      test('should handle get current user error', () async {
        // Arrange
        when(mockClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          '{"success": false, "message": "Unauthorized"}',
          401,
        ));

        // Act & Assert
        expect(
          () => ApiService.getCurrentUser(),
          throwsException,
        );
      });
    });

    group('getTasks', () {
      test('should get tasks successfully', () async {
        // Arrange
        when(mockClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          '{"success": true, "data": [{"id": "1", "title": "Test Task", "description": "Test Description", "listId": "1", "priority": "medium", "completed": false, "position": 0, "createdAt": "2024-01-01T00:00:00Z", "updatedAt": "2024-01-01T00:00:00Z"}]}',
          200,
        ));

        // Act
        final tasks = await ApiService.getTasks();

        // Assert
        expect(tasks.length, 1);
        expect(tasks.first.title, 'Test Task');
        expect(tasks.first.description, 'Test Description');
      });

      test('should handle get tasks error', () async {
        // Arrange
        when(mockClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          '{"success": false, "message": "Unauthorized"}',
          401,
        ));

        // Act & Assert
        expect(
          () => ApiService.getTasks(),
          throwsException,
        );
      });
    });

    group('createTask', () {
      test('should create task successfully', () async {
        // Arrange
        when(mockClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          '{"success": true, "data": {"id": "1", "title": "Test Task", "description": "Test Description", "listId": "1", "priority": "medium", "completed": false, "position": 0, "createdAt": "2024-01-01T00:00:00Z", "updatedAt": "2024-01-01T00:00:00Z"}}',
          201,
        ));

        // Act
        final task = await ApiService.createTask(CreateTaskForm(
          title: 'Test Task',
          description: 'Test Description',
          listId: '1',
          priority: 'medium',
        ));

        // Assert
        expect(task.title, 'Test Task');
        expect(task.description, 'Test Description');
        expect(task.listId, '1');
        expect(task.priority, 'medium');
      });

      test('should handle create task error', () async {
        // Arrange
        when(mockClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          '{"success": false, "message": "Validation error"}',
          400,
        ));

        // Act & Assert
        expect(
          () => ApiService.createTask(CreateTaskForm(
            title: 'Test Task',
            listId: '1',
            priority: 'medium',
          )),
          throwsException,
        );
      });
    });

    group('getLists', () {
      test('should get lists successfully', () async {
        // Arrange
        when(mockClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          '{"success": true, "data": [{"id": "1", "name": "Test List", "description": "Test Description", "icon": "mdi-list", "color": "#1976d2", "position": 0, "createdAt": "2024-01-01T00:00:00Z", "updatedAt": "2024-01-01T00:00:00Z"}]}',
          200,
        ));

        // Act
        final lists = await ApiService.getLists();

        // Assert
        expect(lists.length, 1);
        expect(lists.first.name, 'Test List');
        expect(lists.first.description, 'Test Description');
      });

      test('should handle get lists error', () async {
        // Arrange
        when(mockClient.get(
          any,
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
          '{"success": false, "message": "Unauthorized"}',
          401,
        ));

        // Act & Assert
        expect(
          () => ApiService.getLists(),
          throwsException,
        );
      });
    });

    group('createList', () {
      test('should create list successfully', () async {
        // Arrange
        when(mockClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          '{"success": true, "data": {"id": "1", "name": "Test List", "description": "Test Description", "icon": "mdi-list", "color": "#1976d2", "position": 0, "createdAt": "2024-01-01T00:00:00Z", "updatedAt": "2024-01-01T00:00:00Z"}}',
          201,
        ));

        // Act
        final list = await ApiService.createList(CreateListForm(
          name: 'Test List',
          description: 'Test Description',
          icon: 'mdi-list',
          color: '#1976d2',
        ));

        // Assert
        expect(list.name, 'Test List');
        expect(list.description, 'Test Description');
        expect(list.icon, 'mdi-list');
        expect(list.color, '#1976d2');
      });

      test('should handle create list error', () async {
        // Arrange
        when(mockClient.post(
          any,
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
          '{"success": false, "message": "Validation error"}',
          400,
        ));

        // Act & Assert
        expect(
          () => ApiService.createList(CreateListForm(
            name: 'Test List',
            icon: 'mdi-list',
            color: '#1976d2',
          )),
          throwsException,
        );
      });
    });
  });
}
