import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  double balance = 45200.00;
  String currency = 'ريال يمني (صنعاء)';

  final List<Map<String, dynamic>> services = [
    {'name': 'يمن موبايل', 'cat': 'رصيد وباقات 4G', 'color': 0xFFC00000, 'icon': Icons.phone_android},
    {'name': 'يو (YOU)', 'cat': 'شحن رصيد وباقات', 'color': 0xFFD4AC0D, 'icon': Icons.cell_tower},
    {'name': 'سبأفون', 'cat': 'رصيد ومكالمات', 'color': 0xFF007A3D, 'icon': Icons.signal_cellular_alt},
    {'name': 'يمن فورجي', 'cat': 'تجديد مودم منزلي', 'color': 0xFF2C3E50, 'icon': Icons.router},
    {'name': 'الإنترنت ADSL', 'cat': 'تسديد فواتير نت', 'color': 0xFF16A085, 'icon': Icons.language},
    {'name': 'شحن ألعاب', 'cat': 'شدات ببجي وفري فاير', 'color': 0xFF8E44AD, 'icon': Icons.sports_esports},
  ];

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF4F6F9),
        appBar: AppBar(
          backgroundColor: const Color(0xFF0F3057),
          title: const Text('نبض تيليكوم', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          actions: [
            IconButton(icon: const Icon(Icons.history, color: Colors.white), onPressed: () {}),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF0F3057), Color(0xFF008891)]),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('الرصيد المتاح', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        Text(currency, style: const TextStyle(color: Colors.white, fontSize: 11)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('${balance.toStringAsFixed(2)} ريال', style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: services.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.4,
                ),
                itemBuilder: (context, i) {
                  final s = services[i];
                  return Card(
                    elevation: 1,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Icon(s['icon'] as IconData, color: Color(s['color'] as int), size: 28),
                          Text(s['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(s['cat'] as String, style: TextStyle(color: Colors.grey[600], fontSize: 10)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
