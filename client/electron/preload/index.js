const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("emitter",
  {
    emit: (channel, event, ...args) => {
      ipcRenderer.invoke(channel, event, ...args);
    },
    on: (channel, callback) => {
      ipcRenderer.on(channel, (_event, ...args) => {
        callback(...args)
      });
    },
    off: (channel) => {
      ipcRenderer.removeAllListeners(channel);
    }
  }
);