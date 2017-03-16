PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

.PHONY : default refresh

default: livereload

livereload:
	make watch-css &
	live-server --port=3000 --no-browser

watch-css:
	node-sass -w src/main.scss main.css
