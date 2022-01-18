const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms))
const stripTag = (str = '') => (str + '').replace(/<\/?[^>]+(>|$)/g, '');

function launch () {
  window.open(window.location.href.replace('www.facebook.com', 'm.facebook.com'), '_blank')
}

async function expand () {
  for (let index = 0; index < 10; index++) {
    document.querySelectorAll('[id*=next] a').forEach(a => a.click())
    document.querySelectorAll('[id*=prev] a').forEach(a => a.click())
    // click on subcomments
    document.querySelectorAll('[data-sigil="replies-see-more"] a').forEach(a => a.click())
    // click on loadmore subcomments
    document.querySelectorAll('[id*=more] a').forEach(a => a.click())
    await delay(1000)
  }
}

function extract() {
  const list = []

  const comments = document.querySelectorAll('._2b04') // Find all comments on page

  for (let i = 0; i < comments.length;) {
    i += findChildComments(comments[i], list) // Comments processing and hierarchy creation
  }
  const header = 'Name, Comment, Profile, Link\n'
  download(
    header + list.map(row => Object.values(row).slice(0, 4).map(cell => `"${stripTag(cell)}"`).join(',')).join('\n'),
    `facebook-${new Date().getTime()}.csv`,
    'text/csv')
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

function findChildComments (comment, list) {
  let index = 0
  // Process comment
  const i = comment.querySelector('._2b06')

  let newComment = {}

  if (i !== null) {
    const name = i.children[0].innerText
    let link = i.children[0].children[0] && i.children[0].children[0].attributes && (i.children[0].children[0].attributes[i.children[0].children[0].attributes.length - 1].textContent || 'ERRORERROR')
    link = `https://www.facebook.com${link}`
    const comment = i.children[1].innerHTML
    const postedIn = window.location.href
    newComment = { name, comment, link, postedIn, child: [] }
    list.push(newComment)
  }

  const childComments = comment.querySelectorAll('._2b04')

  if (childComments !== 'undefined') {
    childComments.forEach(childComment => {
      index += findChildComments(childComment, newComment.child)
    })
  }

  return index + 1
}

function download (content, fileName, contentType) {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.style.display = 'none'
  a.target = '_blank'
  a.click()
}
