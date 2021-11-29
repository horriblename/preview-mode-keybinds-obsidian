## Obsidian Preview Mode Keybinds

This plugin enables customizable keybindings in preview mode. Basic Navigation and Search keybinds are currently implemented, uses vim-like keybindings by default

### Keybindings

Only non-space character keys (letters, symbols and digits) can be used for keybindings. Arrow keys, enter, space, tab etc. are not supported.

Currently no modifier keys are supported (not even shift). Modifiers *may* be implemented in the future, but for now I don't see any reason to.



#### Defaults

Here is a list of default keybindings:

- `k` - Scroll up
- `j` - Scroll down
- `g` - Scroll to the bottom
- `0` - Scroll to the top
- `/` - Search
- `i` - Enter edit mode

### Known Issues

- The Preview window may lose focus and temporarily 'lose' keybindings at times, i.e. after closing search bar or closing settings. Click on the window again to regain focus. I am working on a fix
