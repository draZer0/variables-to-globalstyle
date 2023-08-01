## Figma Variables to styled-components GlobalStyle

The Figma Variables to styled-components GlobalStyle plugin allows designers and developers to export Figma local variables for seamless integration into their front-end projects. The plugin exports Figma local variables as CSS custom properties for styled-components GlobalStyle, providing developers with an efficient way to access and utilize the design tokens in their front-end code.

**Note: Figma Variables is currently in open beta. This plugin might change when features are added or polished.**

The plugin currently:

- Supports local color variables in multiple collections including referencing primitives
- Supports text styles, but note that the fallback of a font will always be `sans-serif` since the correct fallback is unknown


Future enhancements / TODO:

- Support more local variable types
- Support more export possibilities
- Support to only export the variables outside the GlobalStyle
- Checkboxes to not export text styles for example