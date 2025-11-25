import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/providers/providers.dart';
import '../widgets/category_card.dart';
import 'tasks_screen.dart';
import 'shopping_screen.dart';
import 'appointments_screen.dart';
import 'ideas_screen.dart';
import 'voice_memos_screen.dart';
import 'media_gallery_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF4FC3F7), // Light blue
              Color(0xFF29B6F6), // Blue
              Color(0xFFAB47BC), // Purple
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LayoutBuilder(
                      builder: (context, constraints) {
                        // Responsive sizing based on screen width
                        double logoSize = constraints.maxWidth < 400 ? 35.0 : 
                                        constraints.maxWidth < 600 ? 45.0 : 50.0;
                        double fontSize = constraints.maxWidth < 400 ? 22.0 : 
                                        constraints.maxWidth < 600 ? 25.0 : 28.0;
                        double spacing = constraints.maxWidth < 400 ? 8.0 : 
                                        constraints.maxWidth < 600 ? 10.0 : 12.0;
                        
                        return Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.asset(
                              'assets/LogoRemindly.png',
                              width: logoSize,
                              height: logoSize,
                              fit: BoxFit.contain,
                            ),
                            SizedBox(width: spacing),
                            Text(
                              'REMINDLY',
                              style: TextStyle(
                                color: Colors.black,
                                fontSize: fontSize,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 4),
                    LayoutBuilder(
                      builder: (context, constraints) {
                        double subtitleSize = constraints.maxWidth < 400 ? 12.0 : 
                                            constraints.maxWidth < 600 ? 14.0 : 16.0;
                        
                        return Text(
                          'ORGANIZE. REMEMBER. ACHIEVE',
                          style: TextStyle(
                            color: Colors.black54,
                            fontSize: subtitleSize,
                            fontWeight: FontWeight.w400,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              
              // Main Content
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.0,
                      children: [
                        _buildHomeCard(
                          'Shopping Lists',
                          Icons.shopping_cart,
                          const Color(0xFFE3F2FD),
                          'Milk, Eggs, Bread...',
                          'Grocery Store',
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const ShoppingScreen()),
                            );
                          },
                        ),
                        _buildHomeCard(
                          'Appointments',
                          Icons.calendar_today,
                          const Color(0xFFE8F5E8),
                          'Dentist (Mon, 10 AM)',
                          'Meeting...',
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const AppointmentsScreen()),
                            );
                          },
                        ),
                        _buildHomeCard(
                          'TO-DOs',
                          Icons.check_circle,
                          const Color(0xFFFFEBEE),
                          'Finish Project X, Call Ban',
                          '',
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const TasksScreen()),
                            );
                          },
                        ),
                        _buildHomeCard(
                          'IDEAS',
                          Icons.lightbulb,
                          const Color(0xFFFFF8E1),
                          'New App Features',
                          'Travel Ideas',
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const IdeasScreen()),
                            );
                          },
                        ),
                        _buildHomeCard(
                          'VOICE MEMOS',
                          Icons.mic,
                          const Color(0xFFE8F5E8),
                          'Quick Thoughts',
                          'Audio Notes',
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const VoiceMemosScreen()),
                            );
                          },
                        ),
                        _buildHomeCard(
                          'MEDIA GALLERY',
                          Icons.photo_library,
                          const Color(0xFFF3E5F5),
                          'Photos & Videos',
                          'Capture & Share',
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const MediaGalleryScreen()),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }

  Widget _buildHomeCard(
    String title,
    IconData icon,
    Color backgroundColor,
    String content1,
    String content2,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    icon,
                    color: Colors.black87,
                    size: 24,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        color: Colors.black87,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (content1.isNotEmpty)
                Text(
                  content1,
                  style: const TextStyle(
                    color: Colors.black87,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              if (content2.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  content2,
                  style: const TextStyle(
                    color: Colors.black54,
                    fontSize: 12,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomNavigationBar(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildBottomNavItem(Icons.home, 'Home', true),
            _buildNewListButton(context),
            GestureDetector(
              onTap: () {
                // TODO: Navigate to settings screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Settings - Coming Soon!')),
                );
              },
              child: _buildBottomNavItem(Icons.settings, 'Settings', false),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNavItem(IconData icon, String label, bool isActive) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          color: isActive ? Colors.black87 : Colors.grey.shade600,
          size: 24,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.black87 : Colors.grey.shade600,
            fontSize: 12,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildNewListButton(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // TODO: Navigate to create new list screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Create New List - Coming Soon!')),
        );
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: const BoxDecoration(
              color: Color(0xFF1976D2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.add,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'New List',
            style: TextStyle(
              color: Colors.black87,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}