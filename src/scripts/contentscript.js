/* global chrome */
const { Blob } = window
const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms))
const stripTag = (str = '') => (str + '').replace(/<\/?[^>]+(>|$)/g, '')

function launch () {
  window.open(window.location.href.replace('www.facebook.com', 'm.facebook.com'), '_blank')
}

async function expand () {
  let count = 0
  let comments = getCommentElements()
  while (comments.length !== count) {
    document.querySelectorAll('[id*=next] a').forEach(a => a.click())
    document.querySelectorAll('[id*=prev] a').forEach(a => a.click())
    document.querySelectorAll('[id*=more] a').forEach(a => a.click())
    document.querySelectorAll('[data-sigil="replies-see-more"] a').forEach(a => a.click())
    await delay(1000)
    count = comments.length
    comments = getCommentElements()
  }
}

function extract () {
  const list = getComments()
  const header = 'Name, Comment, Profile, Link\n'
  download(
    header + list.map(row => Object.values(row).slice(0, 4).map(cell => `"${stripTag(cell.replace('"', '\\"'))}"`).join(',')).join('\n'),
    `facebook-${new Date().getTime()}.csv`)
}

function getCommentElements () {
  return document.querySelectorAll('[data-sigil="comment-body"]')
}

function getComments () {
  const elements = getCommentElements()
  const comments = []
  const postedIn = window.location.href
  for (let i = 0; i < elements.length; i++) {
    try {
      const element = elements[i]
      const name = element.parentElement.children[0].innerText
      const comment = element.parentElement.children[1].innerText
      const link = element.parentElement.children[0].querySelector('a').getAttribute('href')
      comments.push({ name, comment, link: 'https://www.facebook.com' + link, postedIn })
    } catch (error) {}
  }
  return comments
}

function download (content, fileName) {
  const a = document.createElement('a')
  const csv = '\ufeff' + content
  const file = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.style.display = 'none'
  a.target = '_blank'
  a.click()
}

chrome.extension.onMessage.addListener(async function (message, sender, sendResponse) {
  switch (message.type) {
    case 'launch':
      launch()
      break
    case 'expand':
      await expand()
      extract()
      break
  }
})
