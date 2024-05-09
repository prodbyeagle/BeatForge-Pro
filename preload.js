const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const mm = require('music-metadata');

contextBridge.exposeInMainWorld('fileSystem', {
    readDirectory: async (folderPath) => {
        try {
            const files = await fs.promises.readdir(folderPath);
            return files;
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }
});

contextBridge.exposeInMainWorld('audioMetadata', {
    extractArtist: async (filePath) => {
        try {
            const metadata = await mm.parseFile(filePath);
            if (metadata.common && metadata.common.artist) {
                return metadata.common.artist;
            } else {
                return "Unknown";
            }
        } catch (error) {
            console.error('Error extracting artist:', error);
            return "Unknown";
        }
    },
    extractAlbum: async (filePath) => {
        try {
            const metadata = await mm.parseFile(filePath);
            if (metadata.common && metadata.common.album) {
                return metadata.common.album;
            } else {
                return "Unknown Album";
            }
        } catch (error) {
            console.error('Error extracting album:', error);
            return "Unknown Album";
        }
    },
    extractDuration: async (filePath) => {
        try {
            const metadata = await mm.parseFile(filePath);
            if (metadata.format && metadata.format.duration) {
                // Convert duration to minutes:seconds format
                const durationInSeconds = metadata.format.duration;
                const minutes = Math.floor(durationInSeconds / 60);
                const seconds = Math.floor(durationInSeconds % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                return "Unknown";
            }
        } catch (error) {
            console.error('Error extracting duration:', error);
            return "Unknown";
        }
    }
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    invoke: async (channel, data) => {
        return await ipcRenderer.invoke(channel, data);
    }
});