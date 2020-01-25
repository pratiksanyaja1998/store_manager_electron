const { app, BrowserWindow, dialog, shell, os, globalShortcut } = require('electron');
const path = require('path');
const url = require('url');
const ipc = require('electron').ipcMain
const fs = require('fs')


let mainWindow, printWindow = null

let isFullScreen = false

function fullScrFun() {
    if (isFullScreen) {
        mainWindow.setFullScreen(false)
        isFullScreen = false

    }
    else {

        mainWindow.setFullScreen(true)
        isFullScreen = true
    }
}

function createWindow() {


    mainWindow = new BrowserWindow({
        center: true,
        show: false,
        icon: path.join(__dirname, 'src/assets/app.png'),
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.maximize();
    mainWindow.show()

    // and load the index.html of the app.
    const startUrl = url.format({
        pathname: path.join(__dirname, 'src/index.html'),
        protocol: 'file:',
        slashes: true,

    });
    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    // dialog box
    mainWindow.webContents.on('crashed', () => {
        const options = {
            type: 'info',
            title: 'Renderer Process Crashed',
            message: 'This process has crashed.',
            buttons: ['Reload', 'Close']
        }

        dialog.showMessageBox(options, (index) => {
            if (index === 0) win.reload()
            else win.close()
        })
    })


    // developer shortcut
    globalShortcut.register('CommandOrControl+Alt+D', () => {
        mainWindow.webContents.openDevTools();
        if (printWindow) {
            printWindow.webContents.openDevTools();
        }
    })

}



app.on('ready', createWindow)


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})


// services ipc

ipc.on("show-print", function (event, arg) {

    printWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        show: true,
        icon: path.join(__dirname, 'src/assets/app.png'),
        webPreferences: {
            nodeIntegration: true
        },
        parent: mainWindow
    })

    const startUrlPrint = url.format({
        pathname: path.join(__dirname, 'src/Printer.html'),
        protocol: 'file:',
        slashes: true,

    });
    printWindow.loadURL(startUrlPrint + "#!/" + arg.location);

})

ipc.on("print", function (event, arg) {

    const pdfpath = path.join(app.getPath('documents'), arg.path)
    const win = BrowserWindow.fromWebContents(event.sender)

    win.webContents.printToPDF({}, function (err, data) {
        if (err) {
            console.log(err.message)
            return
        }

        fs.writeFile(pdfpath, data, function (err) {
            if (err) {
                console.log(err.message)
                return
            }
            shell.openExternal("file://" + pdfpath)

        })

    })

})

ipc.on("show-full-screen", fullScrFun)


