import { scriptRunsOnTab } from './insertAndToggleBmBar';
import { data } from './data';

const actions = {
  remove({ id }) {
    chrome.bookmarks.removeTree(id);
  },
  create({ parentId, title, url }) {
    chrome.bookmarks.create({
      parentId,
      title,
      ...(url && { url }),
    });
  },
  async move({ id, index, parentId }) {
    try {
      await chrome.bookmarks.move(id, {
        ...(index !== undefined && { index }),
        ...(parentId && { parentId }),
      });
    } catch (err) {}
  },
  update({ id, title, url }) {
    chrome.bookmarks.update(id, {
      ...(title && { title }),
      ...(url && { url }),
    });
  },
  setBarLeft({ barLeft }) {
    chrome.storage.sync.set({ barLeft });
  },
  setShownBm({ id: shownBmId }) {
    chrome.storage.sync.set({ shownBmId });
  },
  setBarWidth({ barWidth }) {
    chrome.storage.sync.set({ barWidth });
  },
  setBarTheme({ barTheme }) {
    chrome.storage.sync.set({ barTheme });
  },
  seteditBookmarkOnRightClick({ editBookmarkOnRightClick }) {
    chrome.storage.sync.set({ editBookmarkOnRightClick });
  },
};

export const ports = new Set([]);

export const startMiddleware = () => {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'bmBar') return;

    port.onMessage.addListener((msg) => actions[msg.type]?.(msg));

    const postData = () => port.postMessage(data);
    postData();
    ports.add(postData);

    port.onDisconnect.addListener(async () => {
      ports.delete(postData);

      chrome.tabs.query({ lastFocusedWindow: true, active: true }, ([tab]) => {
        scriptRunsOnTab.delete(tab.id);
      });
    });
  });
};
