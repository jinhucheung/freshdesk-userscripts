// ==UserScript==
// @name        Freshdesk Ticket Note Agent
// @version     0.1.0
// @description A userscript that adds agent assignment to note
// @license     MIT
// @author      Jim Cheung
// @namespace   https://github.com/jinhucheung
// @include     https://*.freshdesk.com/*
// @run-at      document-idle
// @grant       none
// @icon        https://raw.githubusercontent.com/jinhucheung/freshdesk-userscripts/master/src/images/freshdesk.ico
// @updateURL   https://raw.githubusercontent.com/jinhucheung/freshdesk-userscripts/master/freshdesk-ticket-note-agent.user.js
// @downloadURL https://raw.githubusercontent.com/jinhucheung/freshdesk-userscripts/master/freshdesk-ticket-note-agent.user.js
// ==/UserScript==
(() => {
  'use strict'

  const selectors = {
    agentSlot: '#js-ticket-note-agent-slot',
    agentDropdown: '#js-ticket-note-agent-slot-dropdown-wormhole'
  }
  const agentDropdownSelectors = [selectors.agentDropdown, selectors.agentSlot].map(i => i.replace('#', ''))

  // detect if current url is ticket page
  const isTicketPage = () => {
    const pathRegex = new RegExp('^/a/tickets/\\d+$')
    return pathRegex.test(location.pathname)
  }

  // get user info
  let userInfo = null
  const fetchUserInfo = async () => {
    return fetch('/api/_/bootstrap/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
  }

  // get agent list
  let agents = []
  let currentAgentId = null
  const fetchAgents = () => {
    fetch('/api/_/bootstrap/agents_groups', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(json => agents = json.data.agents || [])
  }

  let ticket = null
  const fetchTicket = () => {
    const paths = location.pathname.split('/')
    const id = paths[paths.length - 1]

    fetch(`/api/_/tickets/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      ticket = data.ticket
      currentAgentId = ticket.responder_id
    })
  }

  // get user locale
  // result: en, jp, zh, zh-tw
  const languages = {
    'en': 'en',
    'jp': 'jp',
    'ja': 'jp',
    'ja-jp': 'jp',
    'zh': 'zh',
    'zh-cn': 'zh',
    'zh-tw': 'zh-tw',
    'zh-hk': 'zh-tw'
  }

  const getLanguage = () => {
    const content = localStorage.getItem('storage:user-locale')
    const language  = (content && JSON.parse(content)['userLanguage'] || 'en').toLowerCase()
    return languages[language]
  }

  const locales = {
    'en': {
      'agent': 'Agent',
    },
    'jp': {
      'agent': 'エージェント'
    },
    'zh': {
      'agent': '代理者'
    },
    'zh-tw': {
      'agent': '代理者'
    }
  }

  const getElementOffset = element => {
    const rect = element.getBoundingClientRect()
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    }
  }

  const loadAgentDropdown = () => {
    if (document.querySelector(selectors.agentDropdown)) return
    const agentSlot = document.querySelector(selectors.agentSlot)
    const { left, top } = getElementOffset(agentSlot)
    const dropdown = document.createElement('div')
    dropdown.id = 'js-ticket-note-agent-slot-dropdown-wormhole'
    dropdown.innerHTML = `
      <div class="ember-basic-dropdown-content ember-power-select-dropdown ember-view ember-basic-dropdown-content--left ember-basic-dropdown-content--above ember-basic-dropdown--transitioned-in"
        style="top: ${top + 35}px; left: ${left}px; max-height: 300px; width: 300px; overflow: auto;"
        >
        <ul class="ember-power-select-options ember-view" id="js-ticket-note-agent-slot-dropdown-select-options">
          <li class="ember-power-select-option" data-id=""> -- </li>
          ${agents.map(agent => {
              return `
                <li class="ember-power-select-option"
                  data-id="${agent.id}"
                  data-email="${agent.contact.email}"
                  aria-selected="${currentAgentId === agent.id}"
                  aria-current="${currentAgentId === agent.id}"
                  role="option"
                >${agent.contact.name}</li>
              `
            }).join('')}
        </ul>
      </div>
    `
    document.body.appendChild(dropdown)

    const optionsContainer = document.querySelector('#js-ticket-note-agent-slot-dropdown-select-options')
    optionsContainer.addEventListener('click', e => {
      const target = e.target
      if (target.className !== 'ember-power-select-option') return

      currentAgentId = parseInt(target.dataset.id)
      const currentAgent = agents.find(agent => agent.id === currentAgentId)
      agentSlot.value = currentAgent && currentAgent.contact.name || ''
    })
  }

  // add agent assign field to reply box after clicking note button
  const buildAgentFieldOnReplyBox = ()=> {
    const emailField = document.querySelector('[data-test-notify-to]')
    if (!emailField) return

    if (document.querySelector(selectors.agentSlot)) return

    const language = getLanguage()
    const locale = locales[language]

    const selectedAgentField = document.querySelector('[data-test-id="group-agent"] .ember-power-select-selected-item')
    const selectedAgent = selectedAgentField && selectedAgentField.innerHTML.trim() || ''

    const agentField = document.createElement('div')
    agentField.className = 'ticket-action__fields can-edit'
    agentField.innerHTML = `
      <div class="ticket-action__field ticket-action__label text__infotext mt-11">${locale.agent}：: </div>
      <div class="ticket-action__field mt-10 ml-10" style="width: 300px;">
        <input id="js-ticket-note-agent-slot" value="${selectedAgent}"
          style="border: none; box-shadow: none; outline: none; width: 100%; border-radius: 4px; padding: 4px 8px;" />
      </div>
    `
    emailField.parentNode.insertBefore(agentField, emailField)

    const agentSlot = document.querySelector(selectors.agentSlot)

    agentSlot.addEventListener('click', e => {
      loadAgentDropdown()
    })
    agentSlot.addEventListener('focus', () => {
      agentSlot.style.boxShadow = '0 0 0 2px #2c5cc5'
    })
    agentSlot.addEventListener('blur', () => {
      agentSlot.style.boxShadow = ''
    })
    agentSlot.addEventListener('keyup', () => {
      const options = document.querySelectorAll(`${selectors.agentDropdown} .ember-power-select-option`)
      if (!options) return

      const value = agentSlot.value
      let count = 0
      options.forEach(option => {
        const email = option.dataset.email
        if (!value || option.innerHTML.indexOf(value) >= 0 || email && email.indexOf(value) >= 0) {
          option.style.display = 'block'
          count --
        } else {
          option.style.display = 'none'
          count ++
        }
      })

      const parent = options[0].parentNode
      const notFoundLi = parent.querySelector('li.not-found')
      if (count === options.length) {
        if (!notFoundLi) {
          const li = document.createElement('li')
          li.className = 'not-found'
          li.innerHTML = 'No results found'
          li.style.padding = '7px 30px 7px 8px'
          parent.appendChild(li)
        }
      } else {
        notFoundLi && notFoundLi.remove()
      }
    })
  }

  document.body.addEventListener('click', e => {
    // detect if current url is ticket page
    if (!isTicketPage()) return

    const target = e.target

    // detect if current element is note button([data-test-email-action-btn="note"])
    if (target.dataset.testEmailActionBtn === 'note') {
      fetchAgents()
      fetchTicket()
      setTimeout(buildAgentFieldOnReplyBox, 0)
    }

    // detect if agent dropdown needs to hide
    if (!agentDropdownSelectors.includes(target.id)) {
      const agentDropdown = document.querySelector(selectors.agentDropdown)
      agentDropdown && agentDropdown.remove()
    }
  })
})()