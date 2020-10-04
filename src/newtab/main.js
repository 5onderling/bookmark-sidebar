import '../../public/fonts/lato.css';
import './style.scss';

import { createApp } from 'vue';
import App from './App';

createApp(App).mount(document.body);

let currentTabId;
chrome.tabs.getCurrent(({ id }) => (currentTabId = id));

chrome.runtime.onMessage.addListener(({ command, tabId }) => {
  if (command === 'toggle-bm-bar' && tabId === currentTabId) {
    window.dispatchEvent(new CustomEvent('toggleBar'));
  }
});
