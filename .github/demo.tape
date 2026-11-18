# SPDX-License-Identifier: Apache-2.0 OR MIT
#
# Rendered by `make demo` (vhs, https://github.com/charmbracelet/vhs) from
# the repository root after `npm ci`. On screen: examples/generate-password.mjs
# starts bin/jspassgen-mcp.js over stdio, lists its tools and calls
# generate_password for 24 and then 2000 characters; the second call is
# refused by the input validation (the limit is 1024). Real output;
# nothing leaves the machine.
Output .github/demo.gif

Set Shell "bash"
Set FontSize 14
Set Width 1200
Set Height 260
Set Padding 20
Set Theme "Catppuccin Mocha"
Set WaitTimeout 60s
Set WaitPattern /^\$ ?$/

Hide
Type `export PS1='$ ' && clear`
Enter
Sleep 1s
Show

Type "node examples/generate-password.mjs 24"
Sleep 500ms
Enter
Wait
Sleep 4s

Type "node examples/generate-password.mjs 2000"
Sleep 500ms
Enter
Wait
Sleep 5s
