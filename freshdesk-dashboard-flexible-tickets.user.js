// ==UserScript==
// @name        Freshdesk Dashboard Flexible Tickets
// @version     0.1.0
// @description A userscript that adds flexible tickets filter to dashboard
// @license     MIT
// @author      Jim Cheung
// @namespace   https://github.com/jinhucheung
// @include     https://*.freshdesk.com/*
// @run-at      document-idle
// @grant       GM_setValue
// @grant       GM_getValue
// @icon        https://raw.githubusercontent.com/jinhucheung/freshdesk-userscripts/main/images/freshdesk.ico
// @updateURL   https://raw.githubusercontent.com/jinhucheung/freshdesk-userscripts/main/freshdesk-dashboard-flexible-tickets.user.js
// @downloadURL https://raw.githubusercontent.com/jinhucheung/freshdesk-userscripts/main/freshdesk-dashboard-flexible-tickets.user.js
// ==/UserScript==
(() => {
  'use strict'

  // constants

  // data

  // entry

  // methods
  function getApp() {
    const apps = window.Ember.A(window.Ember.Namespace.NAMESPACES)
    return apps[apps.length - 1]
  }

  function getPath() {
    return getApp().__container__.lookup('controller:application').get('currentPath')
  }

  function lookupView(selector) {
    const node = document.querySelector(selector)
    if (!(node && node.id)) return
    return getApp().__container__.lookup('-view-registry:main')[node.id]
  }

  // api
})()