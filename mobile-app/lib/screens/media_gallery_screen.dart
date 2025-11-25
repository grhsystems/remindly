import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../core/providers/providers.dart';

class MediaGalleryScreen extends ConsumerStatefulWidget {
  const MediaGalleryScreen({super.key});

  @override
  ConsumerState<MediaGalleryScreen> createState() => _MediaGalleryScreenState();
}

class _MediaGalleryScreenState extends ConsumerState<MediaGalleryScreen> {
  final ImagePicker _picker = ImagePicker();
  String _selectedFilter = 'all';

  @override
  Widget build(BuildContext context) {
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
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 16),
                    const Icon(
                      Icons.photo_library,
                      color: Colors.black,
                      size: 28,
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'MEDIA GALLERY',
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24.0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Photos, Videos & Audio',
                    style: TextStyle(
                      color: Colors.black54,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Filter Tabs
              Container(
                height: 50,
                margin: const EdgeInsets.symmetric(horizontal: 24),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildFilterTab('all', 'All'),
                    const SizedBox(width: 12),
                    _buildFilterTab('image', 'Photos'),
                    const SizedBox(width: 12),
                    _buildFilterTab('video', 'Videos'),
                    const SizedBox(width: 12),
                    _buildFilterTab('audio', 'Audio'),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
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
                    child: Column(
                      children: [
                        // Media Grid
                        Expanded(
                          child: GridView.builder(
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 1,
                            ),
                            itemCount: _getMediaItems().length + 1, // +1 for add button
                            itemBuilder: (context, index) {
                              if (index == 0) {
                                return _buildAddMediaButton();
                              }
                              final mediaItem = _getMediaItems()[index - 1];
                              return _buildMediaItem(mediaItem);
                            },
                          ),
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
      bottomNavigationBar: _buildBottomNavigationBar(context, 0),
    );
  }

  Widget _buildFilterTab(String filter, String label) {
    final isSelected = _selectedFilter == filter;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = filter;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withOpacity(0.3),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? Colors.black : Colors.white,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.black : Colors.white,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildAddMediaButton() {
    return GestureDetector(
      onTap: _showAddMediaOptions,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.grey.shade300,
            width: 2,
            style: BorderStyle.solid,
          ),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.add_circle_outline,
              size: 48,
              color: Colors.grey,
            ),
            SizedBox(height: 8),
            Text(
              'Add Media',
              style: TextStyle(
                color: Colors.grey,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMediaItem(Map<String, dynamic> mediaItem) {
    return GestureDetector(
      onTap: () => _showMediaDetails(mediaItem),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Media Preview
              Expanded(
                flex: 3,
                child: Container(
                  width: double.infinity,
                  color: Colors.grey.shade200,
                  child: _buildMediaPreview(mediaItem),
                ),
              ),
              // Media Info
              Expanded(
                flex: 1,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        mediaItem['title'] ?? 'Untitled',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _formatDate(mediaItem['createdAt']),
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMediaPreview(Map<String, dynamic> mediaItem) {
    final mediaType = mediaItem['mediaType'] ?? 'image';
    
    if (mediaType == 'image') {
      return Image.network(
        mediaItem['thumbnailUrl'] ?? mediaItem['fileUrl'] ?? '',
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return const Icon(
            Icons.image,
            size: 48,
            color: Colors.grey,
          );
        },
      );
    } else if (mediaType == 'video') {
      return Stack(
        children: [
          Image.network(
            mediaItem['thumbnailUrl'] ?? '',
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return const Icon(
                Icons.videocam,
                size: 48,
                color: Colors.grey,
              );
            },
          ),
          const Center(
            child: Icon(
              Icons.play_circle_filled,
              size: 32,
              color: Colors.white,
            ),
          ),
        ],
      );
    } else {
      return const Center(
        child: Icon(
          Icons.audiotrack,
          size: 48,
          color: Colors.grey,
        ),
      );
    }
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return '';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return '';
    }
  }

  void _showAddMediaOptions() {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Add Media',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildMediaOption(
                    Icons.camera_alt,
                    'Camera',
                    () => _pickMedia(ImageSource.camera),
                  ),
                  _buildMediaOption(
                    Icons.photo_library,
                    'Gallery',
                    () => _pickMedia(ImageSource.gallery),
                  ),
                  _buildMediaOption(
                    Icons.videocam,
                    'Video',
                    () => _pickVideo(),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMediaOption(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.blue.shade100,
              borderRadius: BorderRadius.circular(30),
            ),
            child: Icon(
              icon,
              size: 30,
              color: Colors.blue,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickMedia(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(source: source);
      if (image != null) {
        _uploadMedia(image.path, 'image');
      }
    } catch (e) {
      _showErrorSnackBar('Error picking image: $e');
    }
  }

  Future<void> _pickVideo() async {
    try {
      final XFile? video = await _picker.pickVideo(source: ImageSource.gallery);
      if (video != null) {
        _uploadMedia(video.path, 'video');
      }
    } catch (e) {
      _showErrorSnackBar('Error picking video: $e');
    }
  }

  void _uploadMedia(String filePath, String mediaType) {
    // TODO: Implement media upload
    _showSuccessSnackBar('Media uploaded successfully!');
  }

  void _showMediaDetails(Map<String, dynamic> mediaItem) {
    // TODO: Show media details screen
    _showSuccessSnackBar('Media details: ${mediaItem['title']}');
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }

  List<Map<String, dynamic>> _getMediaItems() {
    // Mock data for now
    return [
      {
        'id': '1',
        'title': 'Sunset Photo',
        'mediaType': 'image',
        'fileUrl': 'https://picsum.photos/300/300?random=1',
        'thumbnailUrl': 'https://picsum.photos/300/300?random=1',
        'createdAt': '2024-01-15T10:30:00Z',
      },
      {
        'id': '2',
        'title': 'Vacation Video',
        'mediaType': 'video',
        'fileUrl': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        'thumbnailUrl': 'https://picsum.photos/300/300?random=2',
        'createdAt': '2024-01-14T15:45:00Z',
      },
      {
        'id': '3',
        'title': 'Meeting Audio',
        'mediaType': 'audio',
        'fileUrl': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'createdAt': '2024-01-13T09:20:00Z',
      },
    ].where((item) {
      if (_selectedFilter == 'all') return true;
      return item['mediaType'] == _selectedFilter;
    }).toList();
  }

  Widget _buildBottomNavigationBar(BuildContext context, int currentIndex) {
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
            _buildBottomNavItem(Icons.home, 'Home', currentIndex == 0),
            _buildBottomNavItem(Icons.add_circle, 'New List', currentIndex == 1),
            _buildBottomNavItem(Icons.settings, 'Settings', currentIndex == 2),
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
          color: isActive ? const Color(0xFF1976D2) : Colors.grey.shade600,
          size: 24,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isActive ? const Color(0xFF1976D2) : Colors.grey.shade600,
            fontSize: 12,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
