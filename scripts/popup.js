/* global chrome */

function expand () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { expand: true, type: 'expand' })
  })
}

function launch () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { launch: true, type: 'launch' })
  })
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('expand').addEventListener('click', expand)
  document.getElementById('launch').addEventListener('click', launch)
})
