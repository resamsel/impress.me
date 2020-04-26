impress.me Demo Presentation
====================================

April 8, 2020 - by [resamsel](https://github.com/resamsel)

## 🧭 Intro [](class=primary-amber)

* Write presentation in Markdown
* Convert to interactive impress.js presentation
* Single HTML file
* Customizable by CSS
* Quickly achieve amazing results

### How?

* Top level heading is title slide
* Second level headings: planets 🌎
* Third level headings: satellites 🛰️
* Further headings: content 📖

### CLI Usage

* First param: input markdown file
* Second param: optional output file

```bash
# Convert Demo.md to Demo.html
impress.me Demo.md

# Convert INPUT.md to My Fancy Presentation.html
impress.me INPUT.md 'My Fancy Presentation.html'
```

### CLI Options

* `--cssFiles`: multiple CSS files to be included
* `--transitionDuration`: time between slides in millis

```bash
# Convert Demo.md with additional stylesheets
impress.me Demo.md --cssFiles a.css b.css
```

## Overview [](class=overview)

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 2"
[demo-presentation]: images/demo-presentation.png "Demo Presentation"
[link]: http://www.reddit.com
