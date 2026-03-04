@echo off
echo ========================================
echo Creating Student Version
echo ========================================
echo.

REM Create temp directory
if exist student-version rmdir /s /q student-version
mkdir student-version

echo Copying files for students...

REM Copy main files
copy index.html student-version\
copy style.css student-version\
copy app.js student-version\
copy gestureDetector.js student-version\
copy ncfRecommender.js student-version\
copy recommendations.js student-version\
copy emotionDetector.js student-version\
copy README.md student-version\
copy TUTORIAL.md student-version\
copy GITHUB_SETUP.md student-version\
copy .gitignore student-version\

echo.
echo ========================================
echo Creating ZIP file...
echo ========================================

REM Create ZIP (requires PowerShell)
powershell Compress-Archive -Path student-version\* -DestinationPath gesture-music-recommender-student.zip -Force

echo.
echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo Student version created:
echo - Folder: student-version\
echo - ZIP: gesture-music-recommender-student.zip
echo.
echo Files included:
echo - All code files (.html, .css, .js)
echo - README.md
echo - TUTORIAL.md
echo - GITHUB_SETUP.md
echo.
echo Files EXCLUDED (instructor only):
echo - instructor-only\ folder
echo - All answer keys and grading rubrics
echo.
echo You can now share:
echo 1. gesture-music-recommender-student.zip via email/LMS
echo 2. Or share student-version\ folder via USB/network
echo.

pause
