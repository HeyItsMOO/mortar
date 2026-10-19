package source

import (
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

var (
	spaces = regexp.MustCompile(`[ \t\r\n]+`)
	blanks = regexp.MustCompile(`\n{3,}`)
)

// HTMLText turns a site's HTML into plain lines: tags are dropped, list items become bullets and block ends line
// breaks. Release notes use it; the Notes viewer shows plain text.
func HTMLText(s string) string { return convertHTML(s, false) }

// HTMLMarkdown turns a site's HTML into Markdown: headings, emphasis, code, lists, quotes and http(s) links survive;
// images, scripts and styles are dropped.
func HTMLMarkdown(s string) string { return convertHTML(s, true) }

type converter struct {
	b  strings.Builder
	md bool
}

func convertHTML(s string, md bool) string {
	doc, err := html.Parse(strings.NewReader(s))
	if err != nil {
		return strings.TrimSpace(s)
	}
	c := &converter{md: md}
	c.walk(doc, false)
	out := blanks.ReplaceAllString(c.b.String(), "\n\n")
	lines := strings.Split(out, "\n")
	for i, l := range lines {
		lines[i] = strings.TrimRight(l, " ")
	}
	return strings.TrimSpace(strings.Join(lines, "\n"))
}

// block starts a new paragraph unless the output already ends in a blank line.
func (c *converter) block() {
	if c.b.Len() > 0 && !strings.HasSuffix(c.b.String(), "\n\n") {
		c.b.WriteString("\n\n")
	}
}

func (c *converter) line() {
	if c.b.Len() > 0 && !strings.HasSuffix(c.b.String(), "\n") {
		c.b.WriteString("\n")
	}
}

func (c *converter) wrap(n *html.Node, mark string, pre bool) {
	if c.md {
		c.b.WriteString(mark)
	}
	c.children(n, pre)
	if c.md {
		c.b.WriteString(mark)
	}
}

func (c *converter) children(n *html.Node, pre bool) {
	for ch := n.FirstChild; ch != nil; ch = ch.NextSibling {
		c.walk(ch, pre)
	}
}

func (c *converter) walk(n *html.Node, pre bool) {
	if n.Type == html.ElementNode {
		c.element(n, pre)
		return
	}
	if n.Type != html.TextNode {
		c.children(n, pre)
		return
	}
	if pre {
		c.b.WriteString(n.Data)
		return
	}
	text := spaces.ReplaceAllString(n.Data, " ")
	if strings.HasSuffix(c.b.String(), "\n") || c.b.Len() == 0 {
		text = strings.TrimLeft(text, " ")
	}
	c.b.WriteString(text)
}

func (c *converter) element(n *html.Node, pre bool) {
	switch n.Data {
	case "script", "style", "head", "img", "iframe", "svg":
	case "h1", "h2", "h3", "h4", "h5", "h6":
		c.block()
		if c.md {
			c.b.WriteString(strings.Repeat("#", int(n.Data[1]-'0')) + " ")
		}
		c.children(n, pre)
		c.block()
	case "p", "div", "section", "article", "table", "ul", "ol":
		c.block()
		c.children(n, pre)
		c.block()
	case "tr":
		c.line()
		c.children(n, pre)
		c.line()
	case "td", "th":
		c.children(n, pre)
		c.b.WriteString(" ")
	case "br":
		c.b.WriteString("\n")
	case "hr":
		c.block()
		if c.md {
			c.b.WriteString("---")
			c.block()
		}
	case "li":
		c.line()
		c.b.WriteString(c.bullet(n))
		c.children(n, pre)
		c.line()
	case "strong", "b":
		c.wrap(n, "**", pre)
	case "em", "i":
		c.wrap(n, "*", pre)
	case "code":
		c.wrap(n, "`", pre)
	case "pre":
		c.block()
		if c.md {
			c.b.WriteString("```\n")
		}
		c.children(n, true)
		c.line()
		if c.md {
			c.b.WriteString("```")
		}
		c.block()
	case "blockquote":
		c.block()
		inner := &converter{md: c.md}
		inner.children(n, pre)
		for l := range strings.SplitSeq(strings.TrimSpace(inner.b.String()), "\n") {
			if c.md {
				c.b.WriteString("> ")
			}
			c.b.WriteString(l + "\n")
		}
		c.block()
	case "a":
		href := attr(n, "href")
		u, err := url.Parse(href)
		if !c.md || err != nil || (u.Scheme != "http" && u.Scheme != "https") {
			c.children(n, pre)
			return
		}
		inner := &converter{md: true}
		inner.children(n, pre)
		if text := strings.TrimSpace(inner.b.String()); text != "" {
			c.b.WriteString("[" + text + "](" + href + ")")
		}
	default:
		c.children(n, pre)
	}
}

// bullet is the marker of a list item: its number in an ordered list, else a dash (a bullet in plain text).
func (c *converter) bullet(li *html.Node) string {
	if li.Parent != nil && li.Parent.DataAtom == atom.Ol {
		i := 1
		for s := li.Parent.FirstChild; s != nil && s != li; s = s.NextSibling {
			if s.DataAtom == atom.Li {
				i++
			}
		}
		return strconv.Itoa(i) + ". "
	}
	if c.md {
		return "- "
	}
	return "• "
}

func attr(n *html.Node, key string) string {
	for _, a := range n.Attr {
		if a.Key == key {
			return a.Val
		}
	}
	return ""
}
