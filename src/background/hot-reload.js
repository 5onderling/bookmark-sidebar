import { sendMessage } from '@chrome/runtime';

/**
 * @param {DirectoryEntry} dir
 * @returns {Promise<Entry[]>}
 */
const getEntries = (dir) => {
  return new Promise((resolve) => {
    dir.createReader().readEntries(resolve);
  });
};

/**
 * @param {Entry} entry
 * @returns {Promise<number>}
 */
const getTimeStamp = (entry) => {
  return new Promise((resolve) => {
    entry.file((file) => {
      resolve(file.lastModified);
    });
  });
};

/**
 * @param {Entry[]} entrys
 * @returns {Promise<string>}
 */
const getTimeStamps = async (entrys) => {
  const timestamps = await Promise.all(entrys.map(getTimeStamp));
  return timestamps.join('');
};

chrome.runtime.getPackageDirectoryEntry(async (dir) => {
  const entries = await getEntries(dir);

  const backgroundEntrys = entries.filter((entry) => entry.name === 'background.js');
  let previousBackgroundTimestamp = await getTimeStamps(backgroundEntrys);

  const newTabReloadFiles = ['newtab.js', 'content.js'];
  const newTabReloadEntrys = entries.filter((entry) => newTabReloadFiles.includes(entry.name));
  let previousNewTabReloadTimestamp = await getTimeStamps(newTabReloadEntrys);

  setInterval(async () => {
    const backgroundTimestamp = await getTimeStamps(backgroundEntrys);
    if (backgroundTimestamp !== previousBackgroundTimestamp) {
      location.reload();
      previousTimestamp = backgroundTimestamp;
    }

    const newTabReloadTimestamp = await getTimeStamps(newTabReloadEntrys);
    if (newTabReloadTimestamp !== previousNewTabReloadTimestamp) {
      sendMessage({ command: 'reload-tab' });
      previousNewTabReloadTimestamp = newTabReloadTimestamp;
    }
  }, 1000);
});
