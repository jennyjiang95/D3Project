# 04: SVG, Selections, and Data Binding
This repo will serve as a starting point for class 4 where we'll be discussing SVG, selections, and data binding with d3.

The goals of this module are to:

- Gain a basic understanding of SVG elements, including basic shapes such as circles and rectangles, the path element, text, group element; various types of SVG attributes and styling

- Understand CSS's `transform: translate(x, y)`

- Become familiar with `d3.selection`: selecting elements, modifying their attributes, adding new elements, removing elements, binding data to elements

- Create a bar chart using SVG

- Use some real data for our chart

- Use Chrome's developer tools for debugging and inspecting DOM elements we create with and without D3

## Running a Local Server
Note that to load data asynchronously with d3, you'll need to run a local server. We won't be using async for this module, but it's good to get in the habit of it anyway.

A simple way to do this is by using Python's Simple HTTP Server. Open a terminal and `cd` to this repo, then do:

```
python -m SimpleHTTPServer <port number>
```

Where `<port number>` is the port you want to access the local webserver. Python will default to port `8000` if you don't specify one.

If you are using Python 3 then try:

```
python3 -m http.server
```

Then open your web browser to `http://localhost:<port number>`, e.g. `http://localhost:8000`


## Assignment 05
- Finish the bar chart if you didn't finish it in class
- Reading in resources below, try coding along with the examples.

## Resources
Some links to refer to, some with code examples:

#### D3
- [D3 Selection docs](https://github.com/d3/d3-selection/blob/master/README.md)
  - in particular the [data method](https://github.com/d3/d3-selection/blob/master/README.md#selection_data)
- [D3 Format docs](https://github.com/d3/d3-format)
- [3 Little Circles](https://bost.ocks.org/mike/circles/)
- [Thinking in Joins](https://bost.ocks.org/mike/join/)
- [How Selections Work](https://bost.ocks.org/mike/selection/)

#### SVG
- [SVG Element Reference](https://developer.mozilla.org/en-US/docs/Web/SVG/Element)
- [SVG Paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
