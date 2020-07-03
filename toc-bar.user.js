// ==UserScript==
// @name              Toc Bar
// @author            hikerpig
// @namespace         https://github.com/hikerpig
// @license           MIT
// @description       A floating table of content widget
// @description:zh-CN 在页面右侧展示一个浮动的文章大纲目录
// @version           1.0.2
// @match             *://www.jianshu.com/p/*
// @match             *://cdn2.jianshu.io/p/*
// @match             *://zhuanlan.zhihu.com/p/*
// @match             *://mp.weixin.qq.com/s*
// @match             *://cnodejs.org/topic/*
// @match             *://www.zcfy.cc/article/*
// @match             *://dev.to/*
// @match             *://web.dev/*
// @match             *://medium.com/*
// @match             *://css-tricks.com/*
// @match             *://www.smashingmagazine.com/*
// @match             *://distill.pub/*
// @match             *://github.com/*/*
// @run-at            document-idle
// @grant             GM_getResourceText
// @grant             GM_addStyle
// @require           https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.11.1/tocbot.min.js
// @resource          TOCBOT_STYLE https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.11.1/tocbot.css
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
      contentSelector: '.Post-RichText',
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
      contentSelector: ['#readme', '.repository-content']
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
      const siteSetting = siteInfo.siteSetting
      if (siteSetting.shouldShow && !siteSetting.shouldShow()) {
        return
      }
      console.log('[toc-bar] found site info for', siteInfo.siteName)
      return siteSetting
    }
  }

  function loadStyles() {
    const tocbotCss = GM_getResourceText('TOCBOT_STYLE')
    if (tocbotCss) {
      GM_addStyle(tocbotCss)
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

  // ---------------- TocBar ----------------------
  const TOC_BAR_STYLE = `
.toc-bar {
  position: fixed;
  z-index: 9000;
  right: 5px;
  top: 80px;
  width: 340px;
  font-size: 14px;
  box-sizing: border-box;
  padding: 10px 10px 10px 0;
  box-shadow: 0 1px 3px #DDD;
  border-radius: 4px;
  transition: width 0.2s ease;
  color: #333;
  background: #FEFEFE;
}

.toc-bar.toc-bar--collapsed {
  width: 30px;
  padding: 0;
}

.toc-bar--collapsed .toc {
  display: none;
}

.toc-bar--collapsed .toc-bar__toggle {
  transform: rotate(90deg);
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
}

.toc-bar__header-left {
  align-items: center;
}

.toc-bar__toggle {
  cursor: pointer;
  padding: 2px 6px;
  box-sizing: content-box;
  transform: rotate(0);
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

/* override tocbot */
.toc-bar .toc {
  max-height: 80vh;
}

.toc>.toc-list li {
  padding-left: 8px;
  position: static;
}

.toc-list-item > a:hover {
  text-decoration: underline;
}
/* end override tocbot */
`

  /**
   * @class
   */
  function TocBar() {
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
    tocElement.classList.add('toc')
    this.element.appendChild(tocElement)
  }

  const TOC_ICON = `<svg t="1593614506959" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6049" width="200" height="200"><path d="M128 384h597.333333v-85.333333H128v85.333333z m0 170.666667h597.333333v-85.333334H128v85.333334z m0 170.666666h597.333333v-85.333333H128v85.333333z m682.666667 0h85.333333v-85.333333h-85.333333v85.333333z m0-426.666666v85.333333h85.333333v-85.333333h-85.333333z m0 256h85.333333v-85.333334h-85.333333v85.333334z" p-id="6050"></path></svg>`
  const REFRESH_ICON = `<svg t="1593614403764" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5002" width="200" height="200"><path d="M918 702.8 918 702.8c45.6-98.8 52-206 26-303.6-30-112.4-104-212.8-211.6-273.6L780 23.2l-270.8 70.8 121.2 252.4 50-107.6c72.8 44.4 122.8 114.4 144 192.8 18.8 70.8 14.4 147.6-18.8 219.6-42 91.2-120.8 153.6-210.8 177.6-13.2 3.6-26.4 6-39.6 8l56 115.6c5.2-1.2 10.4-2.4 16-4C750.8 915.2 860 828.8 918 702.8L918 702.8M343.2 793.2c-74-44.4-124.8-114.8-146-194-18.8-70.8-14.4-147.6 18.8-219.6 42-91.2 120.8-153.6 210.8-177.6 14.8-4 30-6.8 45.6-8.8l-55.6-116c-7.2 1.6-14.8 3.2-22 5.2-124 33.2-233.6 119.6-291.2 245.6-45.6 98.8-52 206-26 303.2l0 0.4c30.4 113.2 105.2 214 213.6 274.8l-45.2 98 270.4-72-122-252L343.2 793.2 343.2 793.2M343.2 793.2 343.2 793.2z" p-id="5003"></path></svg>`

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
      })

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
      }

      const onMouseMove = (e) => {
        if (!dragState.isDragging) return
        const deltaX = e.pageX - dragState.startMouseX
        const deltaY = e.pageY - dragState.startMouseY
        // 要换算为 right 数字
        const newRight = dragState.startElementDisToRight - deltaX
        const newTop = dragState.startPositionY + deltaY
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
          tocSelector: '.toc',
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
      if (shouldShow) {
        this.element.classList.remove(HIDDEN_CLASS)
      } else {
        this.element.classList.add(HIDDEN_CLASS)
      }
      this.visible = shouldShow
    },
  }
  // ----------------end TocBar -------------------

  function main() {
    const options = getPageTocOptions()
    if (options) {
      loadStyles()

      const tocBar = new TocBar()
      tocBar.initTocbot(options)
    }
  }

  main()
})()
