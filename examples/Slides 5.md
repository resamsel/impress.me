impress.me Demo Presentation
====================================

April 8, 2020 - by [resamsel](https://github.com/resamsel)

## 🧭 Intro 12345 [](class=primary-red)

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

### Satellite 4

### Satellite 5

### Satellite 6

### Satellite 7

### Satellite 8

## Heading 2 [](class=primary-deeppurple focus-headline)

### Satellite 4 of 2 [](class=focus-headline)

## Focus Image [](class=primary-lightblue focus-image)
![Why you so slow][y-slow]

## Heading 4 [](class=primary-green)

## Heading 5 [](class=primary-amber)

## Overview [](class=overview)

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 2"
[demo-presentation]: images/demo-presentation.png "Demo Presentation"
[y-slow]: y-slow.jpg "Why you so slow"
[link]: http://www.reddit.com
