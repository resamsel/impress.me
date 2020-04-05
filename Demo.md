impress.me Demo Presentation
====================================

by [resamsel](https://github.com/resamsel)

## 🧭 Intro

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
* `--cssFiles`: multiple CSS files to be included
* `--transitionDuration`: time between slides in millis

```bash
# Convert Demo.md to Demo.html
impress.me Demo.md

# Convert INPUT.md to My Fancy Presentation.html
impress.me INPUT.md 'My Fancy Presentation.html'

# Convert Demo.md with additional stylesheets
impress.me Demo.md --cssFiles a.css b.css
```

## 🧰 Features

* Markdown

### Emphasis

* *Emphasis*: `*asterisks*` or `_underscore_`
* **Strong emphasis**: `double **asterisks** or __underscore__`
* ~~Strike through~~: `~~two tildes~~`

### Lists

1. `1. ...`: Numbered lists
   1. `  1. ...`: Nested lists
1. `* ...`: Unordered lists

### Code

* Uses `highlight.js` for syntax highlighting
* `Inline Code`: surrounded by back-ticks
* Code block: surrounded by 3 back-ticks

```javascript
// Code block with syntax highlighting
console.log('Hello World!');
```

### Links and Images

* [Inline link](https://github.com/resamsel/impress.me)
* [Reference style link]
* Inline image:
  ![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")
* Reference style image:
  ![alt text][logo]
  
### Positioning

* Automatic positioning
* Square root function
* More to come

## 🖌️ Customization

* Step CSS classes
* `step`: defines a step in the presentation
* `slide`: this step will be displayed as a slide
* `depth-{1,2,3}`: heading level

### Slide Options

* `x, y, z`: custom position
* `scale`: custom size
* `id, class, style`: directly added to DOM element
* See [impress.js documentation](https://github.com/impress/impress.js/blob/master/DOCUMENTATION.md#step-element)

```markdown
## No Options

Will be positioned and scaled automatically.

## Positioning [](x=100, y=100)

Custom position, automatic scaling.

## Sizing [](scale=2)

Custom scaling, position will be computed.

## Last Slide [](class=end)

Special class for hidden heading, only content is
shown.
```

### Highlight.js Styles

* Default style: monokai

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 2"
[Reference style link]: http://www.reddit.com
