# Toc Bar

A user script that adds floating widget displaying table of content of current page.

Currently only tailored for some personal most-visited sites. Feel free to tweak the settings or open a PR.

## ✨Features

- Use [tocbot](https://tscanlin.github.io/tocbot) for toc generation.
- For some sites, there are no ids on header elements so it would be impossible to navigate by clicking the toc link. Toc Bar will generate ids - which are derived from a simple hash of the header textContent, and prefixed with `tocbar-` - for these headers.
- A toggle button is offered, if you don't want toc bar to cover current page content.
- For some sites in SPA mode, if you navigate to another article, there is no easy way detecting url change in userscript, so I add a refresh button to refresh TOC contents.

## Screenshots

![devto](https://raw.githubusercontent.com/hikerpig/toc-bar-userscript/master/images/screenshot-2.png)

![zhuanlan-sspai](https://raw.githubusercontent.com/hikerpig/toc-bar-userscript/master/images/screenshot-1.jpg)


## Acknowledgements

Inspired by [github-toc](https://github.com/Mottie/GitHub-userscripts/blob/master/github-toc.user.js) by [Mottie](https://github.com/Mottie).

The logo uses [Mexellent](https://www.1001fonts.com/mexcellent-font.html) font made by [Raymond Larabie](https://www.1001fonts.com/users/typodermic/).

# CHANGELOG

## [1.9.6](https://github.com/hikerpig/toc-bar-userscript/compare/v1.9.5...v1.9.6) (2024-01-14)

* fix: github readme selector [#17](https://github.com/hikerpig/toc-bar-userscript/issues/17) ([544e8ee](https://github.com/hikerpig/toc-bar-userscript/commit/544e8eec6ecd76a245b2d793a7d16ff9cc2e296b))

## v1.9.5 (2022-09-20)

* do some hacks to ensure MDN page toc anchor active as the page scrolls [#14](https://github.com/hikerpig/toc-bar-userscript/issues/14) ([c071ac1](https://github.com/hikerpig/toc-bar-userscript/commit/c071ac1ceb738b1fbe281770db931bd3119ce07d))
* reset font size ([910e196](https://github.com/hikerpig/toc-bar-userscript/commit/910e196caf6aef23a06953540945e5f9d1ee6706))

## v1.9.2 (2022-03-11)

- add support for 'gitlab.com' and 'juejin.cn/book'

## v1.9.0 (2021-12-24)

* feat: don't generate 'toc**' header id for github.com ([bb37969](https://github.com/hikerpig/toc-bar-userscript/commit/bb37969))

## v1.8.1 (2021-11-02)

* feat: add support to indepth.dev ([e502408](https://github.com/hikerpig/toc-bar-userscript/commit/e502408))
* feat: hide toc-bar in print mode, close #7 ([7b3b149](https://github.com/hikerpig/toc-bar-userscript/commit/7b3b149)), closes [#7](https://github.com/hikerpig/toc-bar-userscript/issues/7)

## v1.8.0 (2021-09-28)

* feat: Add light/dark mode toggle, #6 ([cd0e0b8](https://github.com/hikerpig/toc-bar-userscript/commit/cd0e0b8)), closes [#6](https://github.com/hikerpig/toc-bar-userscript/issues/6)

## v1.7.0 (2021-02-04)

* feat: optimize for github issues, related #2 ([27ce1b0](https://github.com/hikerpig/toc-bar-userscript/commit/27ce1b0)), closes [#2](https://github.com/hikerpig/toc-bar-userscript/issues/2)
* feat: optimize right edge distance while dragging ([ca20775](https://github.com/hikerpig/toc-bar-userscript/commit/ca20775))

# v1.6.0 (2021-02-1)

* feat: adjust detection on github issues and wiki, close #2 ([6d6c26b](https://github.com/hikerpig/toc-bar-userscript/commit/6d6c26b)), closes [#2](https://github.com/hikerpig/toc-bar-userscript/issues/2)

# v1.5.1 (2021-01-15)

- make toc-bar text unselectable ([b82e4c1](https://github.com/hikerpig/toc-bar-userscript/commit/b82e4c1e5085f15d0fdcd07f03eae045f67cec56))
  感谢 [MarkDown down down down](https://greasyfork.org/zh-CN/users/412790-markdown-down-down-down)

## v1.5.0 (2020-10-12)

- feat: keep header content hash records to prevent id conflict, close #1

## v1.4.3 (2020-07-22)

* feat: tocbar style top should not be less than 0 ([8ffc3c1](https://github.com/hikerpig/toc-bar-userscript/commit/8ffc3c1))

## v1.4.2 (2020-07-13)

* fix: Toc trigger shrinks outside page when toggling off ([4722d05](https://github.com/hikerpig/toc-bar-userscript/commit/4722d05))
* feat: Add match `*://www.zhihu.com/pub/reader/*`, and fix a little style ([36269a5](https://github.com/hikerpig/toc-bar-userscript/commit/36269a5))

## v1.4.1 (2020-07-10)

* fix: isEmpty dysfunctioning ([8374ceb](https://github.com/hikerpig/toc-bar-userscript/commit/8374ceb))

## v1.4.0 (2020-07-08)

* feat: Add match `*://learning.oreilly.com/library/view/*` ([c6648ce](https://github.com/hikerpig/toc-bar-userscript/commit/c6648ce))
* feat: Add site *://developer.chrome.com/extensions/* ([27eb121](https://github.com/hikerpig/toc-bar-userscript/commit/27eb121))
* optimize: should ignore empty cachedPosition ([61b0eab](https://github.com/hikerpig/toc-bar-userscript/commit/61b0eab))
* Add @icon for displaying logo ([c33e258](https://github.com/hikerpig/toc-bar-userscript/commit/c33e258))

# v1.3.0 (2020-07-05)

### Features

* store tocbar position and toggle status using GM_setValue, read them during init
* add `initialTop` to site setting

# v1.2.0 (2020-07-05)

### Features

* Add logo, and adjust some styles ([ba90dac](https://github.com/hikerpig/toc-bar-userscript/commit/ba90dac5e46d15701af81ad63c7dfd541a52f0d0))

# v1.1.0 (2020-07-04)

### Features

* Add header hash functionality ([970dd0a](https://github.com/hikerpig/toc-bar-userscript/commit/970dd0a0a1ac837a7f1163c692b8d5f131ca54cb))
* guess theme color from document.head meta ([4db05b5](https://github.com/hikerpig/toc-bar-userscript/commit/4db05b5f2a5611cccbddadf6c3344b3de718f30a))
* remove tocbot style resource, add a modified version to tocbar style ([5ebdde0](https://github.com/hikerpig/toc-bar-userscript/commit/5ebdde0c82ee1234c412b787bac6d985a10d0d98))
