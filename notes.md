A known issue with Vite 8 + Rolldown where the platform-specific native package (@rolldown/binding-win32-x64-msvc) isn't installed correctly.

Fix: Install the missing package manually:

```
npm install @rolldown/binding-win32-x64-msvc
```
