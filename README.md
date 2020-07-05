# Toc Bar

A user script that adds floating widget displaying table of content of current page.

Currently only tailored for some popular sites. Feel free to tweak the settings or open a PR.

## ✨Features

- Use [tocbot](https://tscanlin.github.io/tocbot) for toc generation.
- For some sites, there is no id on header elements so it would be impossible to navigate by clicking the toc link. Toc Bar will generate ids - which are derived from a simple hash of the header textContent, and prefixed with `tocbar-` - for these headers.

## Screenshots

![zhuanlan-sspai](https://raw.githubusercontent.com/hikerpig/toc-bar-userscript/master/images/screenshot-1.jpg)

## Acknowledgements

Inspired by [github-toc](https://github.com/Mottie/GitHub-userscripts/blob/master/github-toc.user.js) by [Mottie](https://github.com/Mottie)

# CHANGELOG

# v1.2.0 (2020-07-05)

### Features

* Add logo, and adjust some styles ([ba90dac](https://github.com/hikerpig/toc-bar-userscript/commit/ba90dac5e46d15701af81ad63c7dfd541a52f0d0))

# v1.1.0 (2020-07-04)

### Features

* Add header hash functionality ([970dd0a](https://github.com/hikerpig/toc-bar-userscript/commit/970dd0a0a1ac837a7f1163c692b8d5f131ca54cb))
* guess theme color from document.head meta ([4db05b5](https://github.com/hikerpig/toc-bar-userscript/commit/4db05b5f2a5611cccbddadf6c3344b3de718f30a))
* remove tocbot style resource, add a modified version to tocbar style ([5ebdde0](https://github.com/hikerpig/toc-bar-userscript/commit/5ebdde0c82ee1234c412b787bac6d985a10d0d98))
