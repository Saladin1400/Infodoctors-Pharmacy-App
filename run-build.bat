@echo off
chcp 65001 >nul
echo 🔍 جاري البحث عن مسار Java 17 المناسب...

if exist "C:\Program Files\Java\jdk-17" (
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
goto found
)

if exist "C:\Program Files\Android\Android Studio\jbr" (
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
goto found
)

if exist "C:\Users\salad\AppData\Local\Programs\Android\Android Studio\jbr" (
set "JAVA_HOME=C:\Users\salad\AppData\Local\Programs\Android\Android Studio\jbr"
goto found
)

echo ❌ لم يتم العثور على Java 17 تلقائياً.
pause
exit

:found
echo ✅ تم العثور على Java 17 بنجاح في: %JAVA_HOME%
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo 🚀 جاري الانتقال لمجلد المشروع وبدء بناء التطبيق...
cd /d "D:\Projects\AI Studio APP\android"

call gradlew assembleDebug

echo.
echo ==========================================
echo إذا ظهرت عبارة BUILD SUCCESSFUL بالأعلى، فالعملية نجحت!
echo ==========================================
pause