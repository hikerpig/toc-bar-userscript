// ==UserScript==
// @name              Toc Bar
// @name:zh-CN        Toc Bar, 文章大纲
// @author            hikerpig
// @namespace         https://github.com/hikerpig
// @license           MIT
// @description       A floating table of content widget
// @description:zh-CN 在页面右侧展示一个浮动的文章大纲目录
// @version           1.4.0
// @match             *://www.jianshu.com/p/*
// @match             *://cdn2.jianshu.io/p/*
// @match             *://zhuanlan.zhihu.com/p/*
// @match             *://mp.weixin.qq.com/s*
// @match             *://cnodejs.org/topic/*
// @match             *://*zcfy.cc/article/*
// @match             *://juejin.im/entry/*
// @match             *://dev.to/*/*
// @exclude           *://dev.to/settings/*
// @match             *://web.dev/*
// @match             *://medium.com/*
// @match             *://css-tricks.com/*
// @match             *://www.smashingmagazine.com/*/*
// @match             *://distill.pub/*
// @match             *://github.com/*/*
// @match             *://developer.mozilla.org/*/docs/*
// @match             *://learning.oreilly.com/library/view/*
// @match             *://developer.chrome.com/extensions/*
// @run-at            document-idle
// @grant             GM_getResourceText
// @grant             GM_addStyle
// @grant             GM_setValue
// @grant             GM_getValue
// @require           https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.11.1/tocbot.min.js
// @icon              https://raw.githubusercontent.com/hikerpig/toc-bar-userscript/master/toc-logo.svg
// @homepageURL       https://github.com/hikerpig/toc-bar-userscript
// @downloadURL       https://raw.githubusercontent.com/hikerpig/toc-bar-userscript/master/toc-bar.user.js
// ==/UserScript==

(function () {
  const SITE_SETTINGS = {
    jianshu: {
      contentSelector: '.ouvJEz',
      style: {
        top: '55px',
        color: '#ea6f5a',
      },
    },
    'zhuanlan.zhihu.com': {
      contentSelector: 'article',
      scrollSmoothOffset: -52,
      shouldShow() {
        return location.pathname.startsWith('/p/')
      },
    },
    zcfy: {
      contentSelector: '.markdown-body',
    },
    qq: {
      contentSelector: '.rich_media_content',
    },
    'juejin.im': {
      contentSelector: '.entry-public-main',
    },
    'dev.to': {
      contentSelector: 'article',
      scrollSmoothOffset: -56,
      shouldShow() {
        return ['/search', '/top/'].every(s => !location.pathname.startsWith(s))
      },
    },
    'medium.com': {
      contentSelector: 'article'
    },
    'css-tricks.com': {
      contentSelector: 'main'
    },
    'distill.pub': {
      contentSelector: 'body'
    },
    'smashingmagazine': {
      contentSelector: 'article'
    },
    'web.dev': {
      contentSelector: '#content'
    },
    'github.com': {
      contentSelector() {
        const README_SEL = '#readme'
        const WIKI_CONTENT_SEL = '.repository-content'
        const matchedSel = [README_SEL, WIKI_CONTENT_SEL].find((sel) => {
          return !!document.querySelector(README_SEL)
        })

        if (matchedSel) return matchedSel

        return false
      },
      initialTop: 500,
    },
    'developer.mozilla.org': {
      contentSelector: '#content'
    },
    'learning.oreilly.com': {
      contentSelector: '#sbo-rt-content'
    },
    'developer.chrome.com': {
      contentSelector: 'article'
    },
  }

  function getSiteInfo() {
    let siteName
    if (SITE_SETTINGS[location.hostname]) {
      siteName = location.hostname
    } else {
      const match = location.href.match(
        /([\d\w]+)\.(com|cn|net|org|im|io|cc|site|tv)/i
      )
      siteName = match ? match[1] : null
    }
    if (siteName && SITE_SETTINGS[siteName]) {
      return {
        siteName,
        siteSetting: SITE_SETTINGS[siteName],
      }
    }
  }

  function getPageTocOptions() {
    let siteInfo = getSiteInfo()
    if (siteInfo) {
      let siteSetting = siteInfo.siteSetting
      if (siteSetting.shouldShow && !siteSetting.shouldShow()) {
        return
      }
      if (typeof siteSetting.contentSelector === 'function') {
        const contentSelector = siteSetting.contentSelector()
        if (!contentSelector) return
        siteSetting = {...siteSetting, contentSelector}
      }
      console.log('[toc-bar] found site info for', siteInfo.siteName)
      return siteSetting
    }
  }

  function guessThemeColor() {
    const meta = document.head.querySelector('meta[name="theme-color"]')
    if (meta) {
      return meta.getAttribute('content')
    }
  }

  /**
   * @param {String} content
   * @return {String}
   */
  function doContentHash(content) {
    const val = content.split('').reduce((prevHash, currVal) => (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
    return val.toString(32)
  }

  const POSITION_STORAGE = {
    cache: null,
    checkCache() {
      if (!POSITION_STORAGE.cache) {
        POSITION_STORAGE.cache = GM_getValue('tocbar-positions', {})
      }
    },
    get(k) {
      k = k || location.host
      POSITION_STORAGE.checkCache()
      return POSITION_STORAGE.cache[k]
    },
    set(k, position) {
      k = k || location.host
      POSITION_STORAGE.checkCache()
      POSITION_STORAGE.cache[k] = position
      GM_setValue('tocbar-positions', POSITION_STORAGE.cache)
    },
  }

  function isEmpty(input) {
    if (input) {
      return Object.keys(input).length > 0
    }
    return true
  }

  // ---------------- TocBar ----------------------
  const TOC_BAR_STYLE = `
.toc-bar {
  --toc-bar-active-color: #54BC4B;

  position: fixed;
  z-index: 9000;
  right: 5px;
  top: 80px;
  width: 340px;
  font-size: 14px;
  box-sizing: border-box;
  padding: 0 10px 10px 0;
  box-shadow: 0 1px 3px #DDD;
  border-radius: 4px;
  transition: width 0.2s ease;
  color: #333;
  background: #FEFEFE;
}

.toc-bar.toc-bar--collapsed {
  width: 30px;
  height: 30px;
  padding: 0;
  overflow: hidden;
}

.toc-bar--collapsed .toc {
  display: none;
}

.toc-bar--collapsed .hidden-when-collapsed {
  display: none;
}

.toc-bar__header {
  font-weight: bold;
  padding-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
}

.toc-bar__refresh {
  position: relative;
  top: -2px;
}

.toc-bar__icon-btn {
  height: 1em;
  width: 1em;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.toc-bar__icon-btn:hover {
  opacity: 0.7;
}

.toc-bar__icon-btn svg {
  max-width: 100%;
  max-height: 100%;
  vertical-align: top;
}

.toc-bar__header-left {
  align-items: center;
}

.toc-bar__toggle {
  cursor: pointer;
  padding: 8px 8px;
  box-sizing: content-box;
  transition: transform 0.2s ease;
}

.toc-bar__title {
  margin-left: 5px;
}

.toc-bar a.toc-link {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  line-height: 1.6;
}

.flex {
  display: flex;
}

/* tocbot related */
.toc-bar__toc {
  max-height: 80vh;
  overflow-y: scroll;
}

.toc-list-item > a:hover {
  text-decoration: underline;
}

.toc-list {
  padding-inline-start: 0;
}

.toc-bar__toc > .toc-list {
  margin: 0;
  overflow: hidden;
  position: relative;
  padding-left: 5px;
}

.toc-bar__toc>.toc-list li {
  list-style: none;
  padding-left: 8px;
  position: static;
}

a.toc-link {
  color: currentColor;
  height: 100%;
}

.is-collapsible {
  max-height: 1000px;
  overflow: hidden;
  transition: all 300ms ease-in-out;
}

.is-collapsed {
  max-height: 0;
}

.is-position-fixed {
  position: fixed !important;
  top: 0;
}

.is-active-link {
  font-weight: 700;
}

.toc-link::before {
  background-color: #EEE;
  content: ' ';
  display: inline-block;
  height: inherit;
  left: 0;
  margin-top: -1px;
  position: absolute;
  width: 2px;
}

.is-active-link::before {
  background-color: var(--toc-bar-active-color);
}
/* end tocbot related */
`

  const TOCBOT_CONTAINTER_CLASS = 'toc-bar__toc'

  /**
   * @class
   */
  function TocBar(options={}) {
    this.options = options

    // inject style
    GM_addStyle(TOC_BAR_STYLE)

    this.element = document.createElement('div')
    this.element.id = 'toc-bar'
    this.element.classList.add('toc-bar')
    document.body.appendChild(this.element)

    /** @type {Boolean} */
    this.visible = true

    this.initHeader()

    // create a container tocbot
    const tocElement = document.createElement('div')
    this.tocElement = tocElement
    tocElement.classList.add(TOCBOT_CONTAINTER_CLASS)
    this.element.appendChild(tocElement)

    const cachedPosition = POSITION_STORAGE.get(options.siteName)
    if (!isEmpty(cachedPosition)) {
      this.element.style.top = `${cachedPosition.top}px`
      this.element.style.right = `${cachedPosition.right}px`
    } else if (options.hasOwnProperty('initialTop')) {
      this.element.style.top = `${options.initialTop}px`
    }

    if (GM_getValue('tocbar-hidden', false)) {
      this.toggle(false)
    }
  }

  const REFRESH_ICON = `<svg t="1593614403764" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5002" width="200" height="200"><path d="M918 702.8 918 702.8c45.6-98.8 52-206 26-303.6-30-112.4-104-212.8-211.6-273.6L780 23.2l-270.8 70.8 121.2 252.4 50-107.6c72.8 44.4 122.8 114.4 144 192.8 18.8 70.8 14.4 147.6-18.8 219.6-42 91.2-120.8 153.6-210.8 177.6-13.2 3.6-26.4 6-39.6 8l56 115.6c5.2-1.2 10.4-2.4 16-4C750.8 915.2 860 828.8 918 702.8L918 702.8M343.2 793.2c-74-44.4-124.8-114.8-146-194-18.8-70.8-14.4-147.6 18.8-219.6 42-91.2 120.8-153.6 210.8-177.6 14.8-4 30-6.8 45.6-8.8l-55.6-116c-7.2 1.6-14.8 3.2-22 5.2-124 33.2-233.6 119.6-291.2 245.6-45.6 98.8-52 206-26 303.2l0 0.4c30.4 113.2 105.2 214 213.6 274.8l-45.2 98 270.4-72-122-252L343.2 793.2 343.2 793.2M343.2 793.2 343.2 793.2z" p-id="5003"></path></svg>`

  const TOC_ICON = `
<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 1024 1024" style="enable-background:new 0 0 1024 1024;" xml:space="preserve">
<g>
  <g>
    <path d="M835.2,45.9H105.2v166.8l93.2,61.5h115.8H356h30.6v-82.8H134.2v-24.9h286.2v107.6h32.2V141.6H134.2V118h672.1v23.6H486.4
      v132.5h32V166.5h287.8v24.9H553.8v82.8h114.1H693h225.6V114.5L835.2,45.9z M806.2,93.2H134.2V67.2h672.1v26.1H806.2z"/>
    <polygon points="449.3,1008.2 668,1008.2 668,268.9 553.8,268.9 553.8,925.4 518.4,925.4 518.4,268.9 486.4,268.9 486.4,925.4
      452.6,925.4 452.6,268.9 420.4,268.9 420.4,925.4 386.6,925.4 386.6,268.9 356,268.9 356,946.7 		"/>
  </g>
</g>
</svg>
`

  TocBar.prototype = {
    /**
     * @method TocBar
     */
    initHeader() {
      const header = document.createElement('div')
      header.classList.add('toc-bar__header')
      header.innerHTML = `
    <div class="flex toc-bar__header-left">
      <div class="toc-bar__toggle toc-bar__icon-btn" title="Toggle TOC Bar">
        ${TOC_ICON}
      </div>
      <div class="toc-bar__title hidden-when-collapsed">TOC Bar</div>
    </div>
    <div class="toc-bar__actions hidden-when-collapsed">
      <div class="toc-bar__refresh toc-bar__icon-btn" title="Refresh TOC">
        ${REFRESH_ICON}
      </div>
    </div>
    `
      const toggleElement = header.querySelector('.toc-bar__toggle')
      toggleElement.addEventListener('click', () => {
        this.toggle()
        GM_setValue('tocbar-hidden', !this.visible)
      })
      this.logoSvg = toggleElement.querySelector('svg')

      const refreshElement = header.querySelector('.toc-bar__refresh')
      refreshElement.addEventListener('click', () => {
        tocbot.refresh()
      })
      // ---------------- header drag ----------------------
      const dragState = {
        startMouseX: 0,
        startMouseY: 0,
        startPositionX: 0,
        startPositionY: 0,
        startElementDisToRight: 0,
        isDragging: false,
        curRight: 0,
        curTop: 0,
      }

      const onMouseMove = (e) => {
        if (!dragState.isDragging) return
        const deltaX = e.pageX - dragState.startMouseX
        const deltaY = e.pageY - dragState.startMouseY
        // 要换算为 right 数字
        const newRight = dragState.startElementDisToRight - deltaX
        const newTop = dragState.startPositionY + deltaY
        Object.assign(dragState, {
          curTop: newTop,
          curRight: newRight,
        })
        // console.table({ newRight, newTop})
        this.element.style.right = `${newRight}px`
        this.element.style.top = `${newTop}px`
      }

      const onMouseUp = (e) => {
        Object.assign(dragState, {
          isDragging: false,
        })
        document.body.removeEventListener('mousemove', onMouseMove)
        document.body.removeEventListener('mouseup', onMouseUp)

        POSITION_STORAGE.set(this.options.siteName, {
          top: dragState.curTop,
          right: dragState.curRight,
        })
      }

      header.addEventListener('mousedown', (e) => {
        if (e.target === toggleElement) return
        const bbox = this.element.getBoundingClientRect()
        Object.assign(dragState, {
          isDragging: true,
          startMouseX: e.pageX,
          startMouseY: e.pageY,
          startPositionX: bbox.x,
          startPositionY: bbox.y,
          startElementDisToRight: document.body.clientWidth - bbox.right,
        })
        document.body.addEventListener('mousemove', onMouseMove)
        document.body.addEventListener('mouseup', onMouseUp)
      })
      // ----------------end header drag -------------------

      this.element.appendChild(header)
    },
    /**
     * @method TocBar
     */
    initTocbot(options) {
      const me = this
      const tocbotOptions = Object.assign(
        {},
        {
          tocSelector: `.${TOCBOT_CONTAINTER_CLASS}`,
          scrollSmoothOffset: options.scrollSmoothOffset || 0,
          // hasInnerContainers: true,
          headingObjectCallback(obj, ele) {
            // if there is no id on the header element, add one that derived from hash of header title
            if (!ele.id) {
              const newId = me.generateHeaderId(obj, ele)
              ele.setAttribute('id', newId)
              obj.id = newId
            }
            return obj
          },
          headingSelector: 'h1, h2, h3, h4, h5',
          collapseDepth: 4,
        },
        options
      )
      // console.log('tocbotOptions', tocbotOptions);
      tocbot.init(tocbotOptions)
    },
    generateHeaderId(obj, ele) {
      return `tocbar-${doContentHash(obj.textContent)}`
    },
    /**
     * @method TocBar
     */
    toggle(shouldShow = !this.visible) {
      const HIDDEN_CLASS = 'toc-bar--collapsed'
      const LOGO_HIDDEN_CLASS = 'toc-logo--collapsed'
      if (shouldShow) {
        this.element.classList.remove(HIDDEN_CLASS)
        this.logoSvg && this.logoSvg.classList.remove(LOGO_HIDDEN_CLASS)
      } else {
        this.element.classList.add(HIDDEN_CLASS)
        this.logoSvg && this.logoSvg.classList.add(LOGO_HIDDEN_CLASS)
      }
      this.visible = shouldShow
    },
    refreshStyle() {
      const themeColor = guessThemeColor()
      if (themeColor) {
        this.element.style.setProperty('--toc-bar-active-color', themeColor);
      }
    },
  }
  // ----------------end TocBar -------------------

  function main() {
    const options = getPageTocOptions()
    if (options) {

      const tocBar = new TocBar(options)
      tocBar.initTocbot(options)
      tocBar.refreshStyle()
    }
  }

  main()
})()
