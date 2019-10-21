---
title: Customised features
---


# Customized features

## Pullquotes

Create a pullquote with `{:.pullquote}`. Modify with:

- `.pdf-wide`: places pullquotes in main text area

## Tables

Modify tables with:

- `{:.pdf-wide}` (or `<table class="wide">`): expands table into sidebar

## Definitions

Modify definitions with:

{% raw %}{% comment %}Don't process Liquid tags{% endcomment %}
- `class="pdf-wide"` as a parameter in `{% include definition %}`
{% endraw %}

## Headings

- In boxes, during page refinement you may need to remove space from the tops of headings in boxes that run over pages. To do that, add `.pdf-no-space-above` to the heading
