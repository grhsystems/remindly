class Task {
  final String id;
  final String title;
  final String? description;
  final String listId;
  final String priority;
  final bool completed;
  final String? dueDate;
  final String? dueTime;
  final DateTime createdAt;
  final DateTime updatedAt;

  Task({
    required this.id,
    required this.title,
    this.description,
    required this.listId,
    required this.priority,
    this.completed = false,
    this.dueDate,
    this.dueTime,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      listId: json['listId'] ?? '',
      priority: json['priority'] ?? 'medium',
      completed: json['completed'] ?? false,
      dueDate: json['dueDate'],
      dueTime: json['dueTime'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'listId': listId,
      'priority': priority,
      'completed': completed,
      'dueDate': dueDate,
      'dueTime': dueTime,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class CreateTaskForm {
  final String title;
  final String? description;
  final String listId;
  final String priority;
  final String? dueDate;
  final String? dueTime;

  CreateTaskForm({
    required this.title,
    this.description,
    required this.listId,
    this.priority = 'medium',
    this.dueDate,
    this.dueTime,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'listId': listId,
      'priority': priority,
      'dueDate': dueDate,
      'dueTime': dueTime,
    };
  }
}