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
