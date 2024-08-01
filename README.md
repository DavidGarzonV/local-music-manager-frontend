# Local Music Manager

App for load music from local computer files to Youtube Music Playlists, the application uses [local-music-manager-backend](https://github.com/DavidGarzonV/local-music-manager-backend) as backend.

**Note**: Only tested in Windows.

## Install

Install dependencies:

```bash
npm install
```

## Packaging for Production Executable

**Note:** The Backend API can be downloaded from [local-music-manager-backend](https://github.com/DavidGarzonV/local-music-manager-backend/releases/latest).

1. Download `localmusicmanager.zip`.
2. Copy the contents of **backend API** to folder `server` and unpack:

The server folder should look like this
- `server\_internal`
- `server\localmusicmanager.exe`
- `server\.gitkeep`

To package apps for the current OS platform:

```bash
npm run package
```

The application installer can be found in the folder: `release/build`

**Finally, execute the file `LocalMusicManager Setup <version>.exe` to install**

### The default instalation app is:

- on Windows: %USERPROFILE%\AppData\Local\Programs\{app name}

---

### Sign the application

**For Windows**: Install [signtool](https://learn.microsoft.com/es-es/windows/win32/seccrypto/signtool)

Configure the environment variables: 

- CSC_LINK
- CSC_KEY_PASSWORD

To understand how the sign works, follow the instructions placed here: [Code Signing (electron-builder)](https://www.electron.build/code-signing.html)

### The logs for the installed application can be found in the folder:

- on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\main.log
- on Linux: ~/.config/{app name}/logs/main.log
- on macOS: ~/Library/Logs/{app name}/main.log

## For local execution

Create a file called `.env` with the configuration values for executing the app.

Start the app in the `dev` environment:

```bash
npm install
```

Execute app in local **(You need to have the backend running)**
```bash
npm start
```

Access to Logged Screens:

1. Start the application
2. Login with Google
3. Catch the redirection token values
4. Call the backend endpoint `api/v1/auth/session`
5. Then, create the variable `accessToken` in Local Storage `window.localStorage.setItem('accessToken', '')`
6. Reload

---

Initial project structure based in https://github.com/electron-react-boilerplate/electron-react-boilerplate