---
# A bundle of scripts.
# Jekyll will assemble and populate these.
layout: null
---

{% comment %}
These scripts pertain to the Android app, and are
bundled separately for ease of development and maintenance.
{% endcomment %}

{% if site.output == "app" %}
    {% include_relative android-copy-videos.js %}
    {% include_relative android-open-pdf.js %}
{% endif %}