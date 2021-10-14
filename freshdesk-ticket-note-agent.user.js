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

  const getTicketId = () => {
    const paths = location.pathname.split('/')
    return paths[paths.length - 1]
  }

  // get user info
  let userInfo = null
  let csrfToken = null
  const fetchUserInfo = () => {
    return fetch('/api/_/bootstrap/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(result => {
      userInfo = result
      csrfToken = userInfo.meta.csrf_token
    })
  }

  // get agent list
  let agents = []
  let currentAgentId = null
  let selectedAgentId = null
  const fetchAgents = () => {
    fetch('/api/_/bootstrap/agents_groups', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(result => agents = result.data.agents || [])
  }

  let ticket = null

  const updateTicketData = (data) => {
    ticket = data.ticket
    currentAgentId = ticket.responder_id
    selectedAgentId = ticket.responder_id
  }

  const fetchTicket = () => {
    fetch(`/api/_/tickets/${getTicketId()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(updateTicketData)
  }

  const updateTicket = async (data) => {
    return fetch(`/api/_/tickets/${getTicketId()}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
  }

  const updateAgent = async (id) => {
    updateTicket({ responder_id: id })
    .then(updateTicketData)
    .then(() => {

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

  const loadAgentDropdown = () => {
    if (document.querySelector(selectors.agentDropdown)) return
    const agentSlot = document.querySelector(selectors.agentSlot)
    const dropdown = document.createElement('div')
    dropdown.id = 'js-ticket-note-agent-slot-dropdown-wormhole'
    dropdown.innerHTML = `
      <div class="dropdown-content ember-basic-dropdown-content ember-power-select-dropdown ember-view ember-basic-dropdown-content--left ember-basic-dropdown-content--above ember-basic-dropdown--transitioned-in"
        style="max-height: 300px; width: 300px; overflow: auto;"
        >
        <ul class="ember-power-select-options ember-view" id="js-ticket-note-agent-slot-dropdown-select-options">
          <li class="ember-power-select-option" data-id="" data-index="0"> -- </li>
          ${agents.map((agent, index) => {
              return `
                <li class="ember-power-select-option"
                  data-index="${index + 1}"
                  data-id="${agent.id}"
                  data-email="${agent.contact.email}"
                  aria-selected="${selectedAgentId === agent.id}"
                  aria-current="${selectedAgentId === agent.id}"
                  role="option"
                >${agent.contact.name}</li>
              `
            }).join('')}
        </ul>
      </div>
    `
    document.body.appendChild(dropdown)
    placeAgentDropdown()

    const optionsContainer = document.querySelector('#js-ticket-note-agent-slot-dropdown-select-options')
    optionsContainer.addEventListener('click', e => {
      const target = e.target
      if (target.className !== 'ember-power-select-option') return

      selectedAgentId = parseInt(target.dataset.id)
      const selectedAgent = agents.find(agent => agent.id === selectedAgentId)
      agentSlot.value = selectedAgent && selectedAgent.contact.name || ''
    })
  }

  const placeAgentDropdown = () => {
    const dropdown = document.querySelector(selectors.agentDropdown)
    if (!dropdown) return

    const content = dropdown.querySelector('.dropdown-content')
    if (!content) return

    const agentSlot = document.querySelector(selectors.agentSlot)
    const rect = agentSlot.getBoundingClientRect()

    content.style.top = `${rect.top + window.scrollY + 35}px`
    content.style.left = `${rect.left + window.scrollX}px`
  }

  const removeAgentDropdown = () => {
    const agentDropdown = document.querySelector(selectors.agentDropdown)
    agentDropdown && agentDropdown.remove()
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
      setTimeout(() => {
        const options = document.querySelectorAll(`${selectors.agentDropdown} .ember-power-select-option`)
        if (!options) return

        const value = (agentSlot.value || '').toLowerCase()
        let count = 0
        options.forEach(option => {
          const email = (option.dataset.email || '').toLowerCase()
          if (!value || option.innerHTML.trim().toLowerCase().indexOf(value) >= 0 || email.indexOf(value) >= 0) {
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
      },500)
    })
  }

  const assignAgent = () => {
    // update assign
    if (currentAgentId !== selectedAgentId) {
      updateAgent(selectedAgentId)
    }
  }

  const seekSelectedAgentInSide = (mutations) => {
    // after clicked new agent
    let lastSelectedAgent = null
    mutations.forEach(m => {
      if (!(m.removedNodes && m.removedNodes[0])) return
      const optionsNode = m.removedNodes[0].children && m.removedNodes[0].children[0]
      if (!optionsNode) return
      const optionsView = optionsNode.children && optionsNode.children[0]
      if (!optionsView) return
      const options = optionsView.children
      if (!options) return
      for (let option of options) {
        if (option.ariaSelected === 'true') {
          selectedAgentSideNode = option
          break
        }
      }
      console.log(lastSelectedAgent)
    })
  }

  let dropdownObserver = null
  document.body.addEventListener('click', e => {
    // detect if current url is ticket page
    if (!isTicketPage()) {
      dropdownObserver && dropdownObserver.disconnect()
      dropdownObserver = null
      return
    }

    const target = e.target
    // detect if current element is note button([data-test-email-action-btn="note"])
    if (target.dataset.testEmailActionBtn === 'note') {
      fetchUserInfo()
      fetchAgents()
      fetchTicket()
      setTimeout(buildAgentFieldOnReplyBox, 0)

      // close agent dropdown after other dropdown showed
      const dropdownContainer = document.querySelector('#ember-basic-dropdown-wormhole')
      if (dropdownContainer && !dropdownObserver) {
        dropdownObserver = new MutationObserver((mutations) => {
          seekSelectedAgentInSide(mutations)
          setTimeout(() => {
            dropdownContainer.innerHTML && removeAgentDropdown()
          }, 0)
        })
        dropdownObserver.observe(dropdownContainer, { childList: true, subtree: true })
      }
    }

    // detect if agent dropdown needs to hide
    if (!agentDropdownSelectors.includes(target.id)) {
      removeAgentDropdown()
    }

    // detect if send a note
    if ((target.id === 'send-and-set' || (target.className || '').indexOf('send-and-set-item') >= 0)) {
      assignAgent()
    }
  })

  window.addEventListener('resize', () => {
    if (!isTicketPage()) return

    placeAgentDropdown()
  })
})()