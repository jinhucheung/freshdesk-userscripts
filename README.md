# Freshdesk Userscripts [![tag](https://img.shields.io/github/tag/jinhucheung/freshdesk-userscripts.svg)](https://github.com/jinhucheung/freshdesk-userscripts/tags)

Userscripts to add functionality to [Freshdesk][freshdesk].

## Installation

1. Make sure you have user scripts enabled in your browser (these instructions refer to the latest versions of the browser):

	* Firefox - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=firefox) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (GM v4+ is **not supported**!).
	* Chrome - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=chrome).
	* Opera - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=opera) or [Violent Monkey](https://addons.opera.com/en/extensions/details/violent-monkey/).
	* Safari - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=safari).
	* Dolphin - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=dolphin).
	* UC Browser - install [Tampermonkey](https://tampermonkey.net/?ext=dhdg&browser=ucweb).

2. Get information or install:
	* Learn more about the userscript by clicking on the named link. You will be taken to the specific wiki page.
	* Install a script directly from GitHub by clicking on the "install" link in the table below.
	* Install a script from [GreasyFork](https://greasyfork.org/en/users/693969-jinhucheung) (GF) from the userscript site page
	* Or, install the scripts from [OpenUserJS](https://openuserjs.org/users/jinhucheung/scripts) (OU).<br><br>

 | Userscript Wiki                          | ![][ico] |  Direct<br>Install  |            Sites            |  Created   |  Updated   |
 | ---------------------------------------- | :------: | :-----------------: | :-------------------------: | :--------: | :--------: |
 | [Freshdesk ticket note agent][ftna-wiki] |          | [install][ftna-raw] | [GF][ftna-gf] [OU][ftna-ou] | 2021.10.13 | 2021.10.14 |

  \* The ![][ico] column indicates that the userscript has been included in the [Freshdesk][freshdesk].


 | Deprecated Userscript Wiki | Direct<br>Install | Sites | Created | Deprecated |
 | -------------------------- | :---------------: | :---: | :-----: | :--------: |
 | -                          |         -         |   -   |    -    |     -      |

## Updating

Userscripts are set up to automatically update. You can check for updates from within the Greasemonkey or Tampermonkey menu, or click on the install link again to get the update.

Each individual userscript's change log is contained on its individual wiki page.

## Contributing

Bug report or pull request are welcome.

1. Fork it
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)

Please write unit test with your code if necessary.

## License

The gem is available as open source under the terms of the [MIT License](LICENSE).

[ftna-wiki]: https://github.com/jinhucheung/freshdesk-userscripts/wiki/freshdesk-ticket-note-agent

[ftna-raw]: https://raw.githubusercontent.com/jinhucheung/freshdesk-userscripts/master/freshdesk-ticket-note-agent.user.js

[ftna-gf]: https://greasyfork.org/en/scripts/_freshdesk-ticket-note-agent

[ftna-ou]: https://openuserjs.org/scripts/jinhucheung/Freshdesk_Ticket_Note_Agent

[ico]: https://raw.githubusercontent.com/jinhucheung/freshdesk-userscripts/master/src/images/freshdesk.ico

[freshdesk]: https://freshdesk.com/