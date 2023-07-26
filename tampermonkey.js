// ==UserScript==
// @name         Approve Github PR
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/**
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

;(function () {
  console.log('[GAS] Github Approve Shortcut')

  const combos = [
    {
      keys: ['alt', 'shift', 'u'],
      message: 'utACK',
    },
    {
      keys: ['alt', 'shift', 't'],
      message: 'tACK',
    },
  ]

  const keyToCode = {
    shift: 16,
    alt: 18,
    t: 84,
    u: 85,
  }

  const depressedKeys = {}

  const approvalRadio = 'form[action*="/reviews"] input[value="approve"]'
  const approvalButton = 'button[form="pull_requests_submit_review"]'
  const approvalComment = 'form[action*="/reviews"] #pull_request_review_body'
  const approvalMessageSelector = '#pull_request_review_body'
  const approvalMessageKey = 'github-approve-message'

  const debug = (message, object = null) => {
    const debugEnabled = localStorage.getItem('github-approve-shortcut-debug')
    if (debugEnabled === 'true') {
      object ? console.debug(message, object) : console.debug(message)
    }
  }

  document.addEventListener('keydown', (event) => {
    depressedKeys[event.keyCode] = true
    const combo = combos.find(({ keys }) =>
      keys.every((key) => depressedKeys[keyToCode[key]])
    )

    if (combo) {
      event.preventDefault()
      event.stopPropagation()
      openReviewDialog(combo.message)
    }
  })

  document.addEventListener('keyup', (event) => {
    delete depressedKeys[event.keyCode]
  })

  const openReviewDialog = (message) => {
    debug('>>> openReviewDialog')
    let newLocation = window.location.toString()
    newLocation.includes('/files') ? newLocation : (newLocation += '/files')
    newLocation.includes('#submit-review')
      ? newLocation
      : (newLocation += '#submit-review')

    debug('  ', { newLocation })

    newLocation === window.location.toString()
      ? window.location.reload()
      : window.location.replace(newLocation)
    sessionStorage.setItem(approvalMessageKey, message)
    debug('<<<')
  }

  const onMutation = (mutationList, observer) => {
    debug('>>> onMutation')
    const approvalRadioExists = document.querySelector(approvalRadio) !== null
    const message = sessionStorage.getItem(approvalMessageKey)
    const triggered = !!message
    debug('  ', { approvalRadioExists, triggered })

    if (approvalRadioExists && triggered) {
      console.log('[GAS] Approving pull request')
      sessionStorage.removeItem(approvalMessageKey)
      document.querySelector(approvalRadio).click()
      document.querySelector(approvalMessageSelector).value = message
      document.querySelector(approvalButton).click()
    }
    debug('<<<')
  }

  if (document.getElementById('files_bucket') !== null) {
    debug('Registering MutationObserver')
    new MutationObserver(onMutation).observe(
      document.getElementById('files_bucket'),
      { attributes: true, childList: true, subtree: true }
    )
  }
})()
