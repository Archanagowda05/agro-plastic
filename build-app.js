// build-app.js
const { execSync } = require('child_process');

try {
    // This command finds the Windows-compatible executable wrapper and runs the build.
    // We use "npx" here in the command string because it executes in a fresh shell context.
    execSync('npx react-scripts build', { stdio: 'inherit' });
    console.log('✅ Build successful! Deploying now...');
} catch (error) {
    console.error('❌ Build failed with an unexpected error. Check dependency versions.');
    process.exit(1);
}