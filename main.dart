import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const TelecomApp());
}

class TelecomApp extends StatelessWidget {
  const TelecomApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'القحطاني تيليكوم',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Cairo',
        primaryColor: const Color(0xFF0F3057),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F3057),
          primary: const Color(0xFF0F3057),
          secondary: const Color(0xFF008891),
        ),
        useMaterial3: true,
      ),
      home: const DashboardScreen(),
    );
  }
}
