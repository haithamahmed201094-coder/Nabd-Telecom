# مشروع القحطاني تيليكوم (Yemen Telecom App)

## كيفية استخراج ملف APK وتثبيته في جوالك بـ 3 طرق:

### الطريقة 1 (الأسهل بدون الحاجة لكمبيوتر - عبر GitHub Actions):
1. ارفع هذا المجلد إلى مستودع جديد مجاني في حسابك على [GitHub](https://github.com).
2. سيقوم جيت هب تلقائياً بتشغيل ملف `.github/workflows/build_apk.yml`.
3. خلال دقيقتين ستجد ملف `Alkahtani-Telecom-App.apk` جاهزاً للتنزيل المباشر في تبويب **Actions**!

### الطريقة 2 (التثبيت المباشر عبر الكمبيوتر):
1. افتح المجلد في Terminal:
   ```bash
   flutter pub get
   flutter build apk --release
   ```
2. انقل ملف `build/app/outputs/flutter-apk/app-release.apk` إلى هاتفك وثبته فوراً.
