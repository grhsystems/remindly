class TaskList {
  final String id;
  final String name;
  final String? description;
  final String? icon;
  final String? color;
  final int position;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime updatedAt;

  TaskList({
    required this.id,
    required this.name,
    this.description,
    this.icon,
    this.color,
    this.position = 0,
    this.isDefault = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TaskList.fromJson(Map<String, dynamic> json) {
    return TaskList(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      icon: json['icon'],
      color: json['color'],
      position: json['position'] ?? 0,
      isDefault: json['isDefault'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'icon': icon,
      'color': color,
      'position': position,
      'isDefault': isDefault,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class CreateListForm {
  final String name;
  final String? description;
  final String? icon;
  final String? color;

  CreateListForm({
    required this.name,
    this.description,
    this.icon,
    this.color,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'icon': icon,
      'color': color,
    };
  }
}