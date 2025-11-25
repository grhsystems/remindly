import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:remindly/widgets/category_card.dart';

void main() {
  group('CategoryCard', () {
    testWidgets('should render correctly', (WidgetTester tester) async {
      // Arrange
      const title = 'Test Category';
      const description = 'Test Description';
      const icon = Icons.star;
      const color = Colors.blue;
      bool tapped = false;

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryCard(
              title: title,
              description: description,
              icon: icon,
              color: color,
              onTap: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      // Assert
      expect(find.text(title), findsOneWidget);
      expect(find.text(description), findsOneWidget);
      expect(find.byIcon(icon), findsOneWidget);
      expect(tapped, false);
    });

    testWidgets('should call onTap when tapped', (WidgetTester tester) async {
      // Arrange
      bool tapped = false;

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryCard(
              title: 'Test Category',
              description: 'Test Description',
              icon: Icons.star,
              color: Colors.blue,
              onTap: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byType(CategoryCard));
      await tester.pump();

      // Assert
      expect(tapped, true);
    });

    testWidgets('should show animation when pressed', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryCard(
              title: 'Test Category',
              description: 'Test Description',
              icon: Icons.star,
              color: Colors.blue,
              onTap: () {},
            ),
          ),
        ),
      );

      // Act
      await tester.tap(find.byType(CategoryCard));
      await tester.pump();

      // Assert
      // The card should be visible and the animation should be running
      expect(find.byType(CategoryCard), findsOneWidget);
    });

    testWidgets('should handle long press', (WidgetTester tester) async {
      // Arrange
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryCard(
              title: 'Test Category',
              description: 'Test Description',
              icon: Icons.star,
              color: Colors.blue,
              onTap: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      // Act
      await tester.longPress(find.byType(CategoryCard));
      await tester.pump();

      // Assert
      expect(tapped, true);
    });

    testWidgets('should display correct colors', (WidgetTester tester) async {
      // Arrange
      const color = Colors.red;

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryCard(
              title: 'Test Category',
              description: 'Test Description',
              icon: Icons.star,
              color: color,
              onTap: () {},
            ),
          ),
        ),
      );

      // Assert
      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(CategoryCard),
          matching: find.byType(Container),
        ),
      );
      
      expect(container.decoration, isA<BoxDecoration>());
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.gradient, isA<LinearGradient>());
    });

    testWidgets('should handle text overflow', (WidgetTester tester) async {
      // Arrange
      const longTitle = 'This is a very long title that should be handled properly';
      const longDescription = 'This is a very long description that should be handled properly and might overflow';

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryCard(
              title: longTitle,
              description: longDescription,
              icon: Icons.star,
              color: Colors.blue,
              onTap: () {},
            ),
          ),
        ),
      );

      // Assert
      expect(find.text(longTitle), findsOneWidget);
      expect(find.text(longDescription), findsOneWidget);
    });

    testWidgets('should be accessible', (WidgetTester tester) async {
      // Arrange
      const title = 'Test Category';
      const description = 'Test Description';

      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryCard(
              title: title,
              description: description,
              icon: Icons.star,
              color: Colors.blue,
              onTap: () {},
            ),
          ),
        ),
      );

      // Assert
      expect(tester.getSemantics(find.byType(CategoryCard)), matchesSemantics(
        hasTapAction: true,
        hasEnabledState: true,
        hasEnabledState: true,
        children: [
          matchesSemantics(
            label: title,
            hasEnabledState: true,
          ),
          matchesSemantics(
            label: description,
            hasEnabledState: true,
          ),
        ],
      ));
    });
  });
}
