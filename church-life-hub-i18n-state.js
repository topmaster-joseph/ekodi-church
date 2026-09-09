(() => {
  'use strict';

  if (window.__EKODI_CHURCH_SOURCE_STATE__) return;
  window.__EKODI_CHURCH_SOURCE_STATE__ = true;

  const HANGUL = /[가-힣]/;
  const textSource = new WeakMap();
  const attrSource = new WeakMap();
  const trackedText = new Set();
  const trackedElements = new Set();

  function captureText(node) {
    const raw = node.nodeValue || '';
    if (!HANGUL.test(raw) || textSource.has(node)) return;
    textSource.set(node, raw);
    trackedText.add(node);
  }

  function captureAttr(element, name) {
    const raw = element.getAttribute(name);
    if (!raw || !HANGUL.test(raw)) return;
    let map = attrSource.get(element);
    if (!map) {
      map = new Map();
      attrSource.set(element, map);
      trackedElements.add(element);
    }
    if (!map.has(name)) map.set(name, raw);
  }

  function capture(root = document.body || document.documentElement) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script,style,template,noscript,[data-ekodi-language-control]')) continue;
      captureText(node);
    }
    root.querySelectorAll?.('[aria-label],[title],[placeholder]').forEach((element) => {
      captureAttr(element, 'aria-label');
      captureAttr(element, 'title');
      captureAttr(element, 'placeholder');
    });
  }

  function restore() {
    trackedText.forEach((node) => {
      const source = textSource.get(node);
      if (typeof source === 'string' && node.isConnected && node.nodeValue !== source) node.nodeValue = source;
    });
    trackedElements.forEach((element) => {
      const map = attrSource.get(element);
      if (!map || !element.isConnected) return;
      map.forEach((source, name) => {
        if (element.getAttribute(name) !== source) element.setAttribute(name, source);
      });
    });
  }

  function isKorean(value) {
    return value === 'ko' || value === 'ko-KR';
  }

  window.EKODIChurchSourceState = Object.freeze({ capture, restore });

  capture();
  document.addEventListener('DOMContentLoaded', () => capture(), { once: true });
  window.addEventListener('ekodi:locale-change', (event) => {
    if (isKorean(event.detail?.locale)) requestAnimationFrame(restore);
  });
  window.addEventListener('ekodi:church-i18n-applied', (event) => {
    if (isKorean(event.detail?.locale)) requestAnimationFrame(restore);
  });

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) captureText(node);
          else if (node.nodeType === Node.ELEMENT_NODE) capture(node);
        });
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
