@echo off
echo ========================================
echo GitHub Setup Helper
echo ========================================
echo.

REM Prompt for GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "

echo.
echo Your repository URL will be:
echo https://github.com/%GITHUB_USERNAME%/gesture-music-recommender
echo.

set /p CONFIRM="Is this correct? (Y/N): "

if /i "%CONFIRM%" NEQ "Y" (
    echo Setup cancelled.
    pause
    exit /b
)

echo.
echo ========================================
echo Step 1: Adding remote origin...
echo ========================================
git remote add origin https://github.com/%GITHUB_USERNAME%/gesture-music-recommender.git

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Remote already exists. Updating...
    git remote set-url origin https://github.com/%GITHUB_USERNAME%/gesture-music-recommender.git
)

echo.
echo ========================================
echo Step 2: Setting branch to main...
echo ========================================
git branch -M main

echo.
echo ========================================
echo Step 3: Pushing to GitHub...
echo ========================================
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Repository pushed to GitHub
    echo ========================================
    echo.
    echo Your repository is now available at:
    echo https://github.com/%GITHUB_USERNAME%/gesture-music-recommender
    echo.
    echo Next steps:
    echo 1. Visit the URL above to verify
    echo 2. Enable GitHub Pages in Settings if needed
    echo 3. Share the link with your students
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to push to GitHub
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. Repository doesn't exist on GitHub yet
    echo 2. Authentication failed
    echo 3. Network issues
    echo.
    echo Please:
    echo 1. Create the repository on GitHub first
    echo 2. Make sure you're logged in
    echo 3. Try again
    echo.
)

pause
