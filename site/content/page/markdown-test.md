---
title: Markdown test page
description: Example test article that contains basic HTML elements for text formatting on the Web.
publishDate: 2017-01-21
tags:
  - "HTML"
  - "CSS"
  - "Markdown"
---

<!--more-->

## Headings

Let's start with all possible headings. The HTML `<h1>`...`<h6>` elements represent six levels of section headings. `<h1>` is the highest section level and `<h6>` is the lowest.

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Alternate Markdown syntax for `h1` and `h2`

Heading 1 Alt
=============

Heading 2 Alt
-------------

Horizontal Rule

******

## Paragraph

According to the [HTML5 specification](https://www.w3.org/TR/html5/dom.html#elements) by [W3C](https://www.w3.org/), 
**HTML documents consist of a tree of elements and text**.
Each element is denoted in the source by a [start tag](https://www.w3.org/TR/html5/syntax.html#syntax-start-tags), such as `<body>`, and an [end tag](https://www.w3.org/TR/html5/syntax.html#syntax-end-tags), such as `</body>`. (*Certain start tags and end tags can in certain cases be omitted and are implied by other tags.*)

Italics are also possible using _underbars_ or using *single asterisk*

Blank lines separate paragraphs.
So, this should be in the same paragraph with no line break.

But if we end in two spaces we get a line break  
New line but same paragraph.


## List Types

### Ordered List

1. First item
2. Second item
3. Third item

### Unordered List

* List item
* Another item
* And another item

### Nested list

1. Nested unordered list
    * Something
    * Something else
2. Nested ordered list
    1. first item
    1. second item
    * unordered in the midst of ordered. Note that numbering will not work.
    1. Multilines work as long as the indention
       is mantained.  
       `:set autoident` is helpful in vim.

### Raw HTML List

{{< raw-html >}}
<ul>
  <li>First item</li>
  <li>Second item
    <ul>
      <li>Second item First subitem</li>
      <li>Second item second subitem
        <ul>
          <li>Second item Second subitem First sub-subitem</li>
          <li>Second item Second subitem Second sub-subitem</li>
          <li>Second item Second subitem Third sub-subitem</li>
        </ul>
      </li>
      <li>Second item Third subitem
        <ol>
          <li>Second item Third subitem First sub-subitem</li>
          <li>Second item Third subitem Second sub-subitem</li>
          <li>Second item Third subitem Third sub-subitem</li>
        </ol>
    </ul>
  </li>
  <li>Third item</li>
</ul>
{{< /raw-html >}}

### Definition List

Markdown definition list

Blanco tequila
: The purest form of the blue agave spirit...

Resposado tequila
: Typically aged in wooden barrels for between two
  and eleven months...

HTML definition lists.

{{< raw-html >}}
<dl>
  <dt>Blanco tequila</dt>
  <dd>The purest form of the blue agave spirit...</dd>
  <dt>Reposado tequila</dt>
  <dd>Typically aged in wooden barrels for between two and eleven months...</dd>
</dl>
{{< /raw-html >}}

## Blockquotes

The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a `footer` or `cite` element, and optionally with in-line changes such as annotations and abbreviations.

> Quoted text.
> This line is part of the same quote.
> Also you can *put* **Markdown** into a blockquote.

Blockquote with a citation.

<blockquote>
  <p>My goal wasn't to make a ton of money. It was to build good computers. I only started the company when I realized I could be an engineer forever.</p>
  <footer> <cite>Steve Wozniak</cite></footer>
</blockquote>

According to Mozilla's website, <q cite="https://www.mozilla.org/en-US/about/history/details/">Firefox 1.0 was released in 2004 and became a big success.</q>

## Tables

Tables aren't part of the core Markdown spec, but Hugo supports them.

| ID  | Make      | Model   | Year |
| --- | --------- | ------- | ---- |
| 1   | Honda     | Accord  | 2009 |
| 2   | Toyota    | Camry   | 2012 |
| 3   | Hyundai   | Elantra | 2010 |

Colons can be used to align columns.

| Tables      | Are           | Cool         |
|:----------- |:-------------:| ------------:|
| align: left | align: center | align: right |
| align: left | align: center | align: right |
| align: left | align: center | align: right |

You can also use inline Markdown.

| Inline     | Markdown  | In                | Table      |
| ---------- | --------- | ----------------- | ---------- |
| *italics*  | **bold**  | ~~strikethrough~~ | `code`     |

## Code

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example HTML5 Document</title>
</head>
<body>
  <p>Test</p>
</body>
</html>
```

## Highlighted Code

{{< highlight html >}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example HTML5 Document</title>
</head>
<body>
  <p>Test</p>
</body>
</html>
{{< /highlight >}}

## Other stuff  abbr, sub, sup, kbd, etc.

{{< raw-html >}}
<abbr title="Graphics Interchange Format">GIF</abbr> is a bitmap image format.
<br>
H<sub>2</sub>O
<br>
C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>
<br>
X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>
<br>
Press <kbd>X</kbd> to win. Or press <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>F</kbd></kbd> to show FPS counter.
<br>
<mark>As a unit of information in information theory, the bit has alternatively been called a shannon</mark>, named after Claude Shannon, the founder of field of information theory.
{{< /raw-html >}}
