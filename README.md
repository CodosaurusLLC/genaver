# Genaver

## What It Is

Genaver, pronounced JEN-a-ver, is short for GENerate A VERsion.&nbsp;
(It is _not_ a variation of the names Jennifer or Guinevere,
nor is it a reference to the drink
[genever](https://www.bythedutch.com/genever/),
which is pronounced "jeh-NEE-ver" anyway.)

But _what_ does it generate a version _of?_&nbsp;
The originally intended use-case is to generate
versions of a _presentation_
done in
[reveal.js](https://revealjs.com/)
or some such similar system.&nbsp;
It _could_ also be used to generate a version of
_any_ arbitrary HTML file,
such as a children's story
where you want to substitute in the child's name.&nbsp;
Please let me know if you use it for anything other than presentations.&nbsp;
(For that matter, feel free to let me know if you use it at all!)

## Why It Exists

I do presentations at conferences,
often reusing the same presentation for different conferences.&nbsp;
Not only might the conferences have different timeslot lengths,
but also these are usually _software development_ conferences,
sometimes focusing on a particular programming language.&nbsp;
So, I might want to use
code examples in Elixir at one conference, Ruby at another, and so on,
all to illustrate the same concept in the same presentation.&nbsp;
Furthermore,
they are in many different countries,
speaking many different languages,
and I usuallly do my introduction in the local language.&nbsp;
If that's not English,
I include slides with
the local version written,
and "subtitles" in English.

Previously I had been doing my presentations in Keynote
(the Mac equivalent of PowerPoint),
and creating a new file for each conference.&nbsp;
Just like PowerPoint,
Keynote produces fairly large binary files,
making it difficult to compare two versions,
and cumbersome to combine, say,
the Spanish intro from one with the Elixir code of another,
to make a version that fits in a different length than either.&nbsp;
It also made it difficult to hunt down some turn of phrase
that I had used a while back,
but had to remove because the next version would be shorter.

So, I wanted to use a textual format
(such as, but not limited to, reveal.js),
and devise some way to maintain just one "primary" file,
containing _all_ the introductions, code versions, and
details I could include.&nbsp;
The idea was that then I could
devise a system whereby I could somehow
generate from that
a version containing only
the "universal" parts,
the one specific desired introduction and set of code,
and _not_ the bits of verbiage somehow "tagged" as
"only include this if I've got at least X minutes to fill",
where X is greater than some limit I would give the system.

Initially I thought I would have to write a
fairly complex system to
parse that primary file and some form of tagging.&nbsp;
Later it occurred to me that I could also
commit a gross abuse of
[the C preprocessor](https://www.tutorialspoint.com/cprogramming/c_preprocessors.htm).&nbsp;
I was discussing this idea with someone,
who said he had been having great success in similar things with
a certain text processing library from Python.&nbsp;
He was using that because he wanted to
step away from using JavaScript to process text.

That was my lightbulb moment!&nbsp;
Duh!&nbsp;
I've already got the presentation in HTML,
and manipulating presentation of HTML is
_exactly_ what JavaScript was originally intended for,
is the overwhelmingly common tool for,
and is actually very good at!&nbsp;
So, rather than continue pursuing the idea of
creating a system that would
generate a _new file_
that would contain
only the desired items,
I decided to try writing some JavaScript
that would _hide_ the elements that are _not_ desired.

He and I discussed that a bit further,
but he didn't seem to quite understand what I meant
or why it would suit my purposes better.&nbsp;
So, I decided that rather than writing further prose to explain,
it was time to try coding up a Proof of Concept,
including a demo HTML file calling it.&nbsp;
That turned out to be rather easy,
with about 20 lines of JS,
even with some redundancy.&nbsp;
So I cleaned up the code a bit,
started thinking about tests
(coming eventually!),
wrote up this README,
and here we are!

## How to Use It

Before you can make it transform your presentation (or whatever),
your JS engine has to know about it.&nbsp;
So, before the _call_ to it,
you must include the line:

`<script src="genaver.js"></script>`

(adjusting the URL if needed, for wherever you're getting it from).

After that, ideally at the bottom of your HTML file,
you set your options and include a line like:

`<script type="text/javascript">generate_version(options);</script>`

(where `options` may be a variable or a literal).

### Options

Options are how you tell Genaver exactly what you want it to show.&nbsp;
There are two types of options: filters and constants.&nbsp;
Each option is a string,
consisting of a tag, a comparator, and a value,
optionally separated by any number of spaces.&nbsp;
The tags can only use
letters (though they may be upper or lower case),
digits,
and hyphens.&nbsp;
For filters, the tags _must not_ start with `var-`,
as that is how to designate a _constant_ option.&nbsp;
For filters, the comparator can be `=`, `!=`, `<`, `<=`, `>`, or `>=`,
while for constants, it must be `=`.&nbsp;
The value may consist of any characters.

There are two ways to pass options to Genaver:
directly via the JavaScript call,
and in the URL.

#### Filters

Filtering was the original use-case,
for things like
"make a version with
the intro in Portuguese
and the code in Elixir,
fitting in 30 minutes".&nbsp;
I expect that this will be the vast majority of the usage.

There are two types of values.&nbsp;
Which type the value is ass-u-me'd to be,
depends on the comparator used.&nbsp;
For `=` or `!=`,
that implies that the value is a _string_,
while for `<`, `<=`, `>`, or `>=`,
that implies that it is a _number_.

Strings will look for an exact literal string match with the value,
currently case-sensitively.&nbsp;
(The tags are case-insensitive, due to how HTML works.)&nbsp;
Numbers will be interpreted as floating point,
even though I expect the vast majority of use,
perhaps even all of it,
to be integers.

No other comparators are currently allowed,
though I have had the idea to
make the current string comparators case-insensitive,
and tack on an extra `=` to make it sensitive.

Genaver operates on HTML attributes,
using the `data-` convention.&nbsp;
So, for instance,
to designate some element
(be it a div, span, section, or whatever)
as being in, say, Portuguese,
you can add the attribute
`data-human-lang="portuguese"`.&nbsp;
If you tell Genaver the option `human-lang=portuguese`,
then any elements tagged with, for instance,
`data-human-lang="japanese"`
will be hidden,
while those with
`data-human-lang="portuguese"`
will remain to be shown.&nbsp;
(Unless of course they're hidden for some other reason!)&nbsp;
Similarly, to designate bits of code as being in Elixir,
you can tag them with
`data-code-lang="elixir"`,
and have them be the ones shown, by using
`code-lang=elixir`.

#### Constants

Constants are an additional feature,
used for things like
building up the PDF slides URL
from the conference abbreviation and year,
such as constructing
`www.my-slidestorage.tld/ThisTalk-Whatever-2034.pdf`
from the conference abbreviation "Whatever" and the year "2034".&nbsp;
With this sort of mechanism,
you don't need to change that URL
nor construct it from
a horrible mess of conditional values.

For constants,
the tag must start with `var-`
and the comparator must be `=`.&nbsp;
The value may contain any kind of characters,
but will be interpreted as text, not HTML.&nbsp;

In the presentation HTML,
any element tagged with
the attribute `data-gv-var`,
and having the value match the _rest_ of the tag,
will have its `InnerText` set to the corresponding value.&nbsp;
For instance,
if you tell Genaver
`var-conf-name = WhateverConf`,
then any element with the attribute `data-gv-var="conf-name"`
will have its `InnerText` set to WhateverConf.

#### Specifying Options in JS

You can pass Genaver options in JS as a list of strings.&nbsp;
For instance,

```
['human-lang =  french',
 'comp-lang  != ruby']
```

tells Genaver that you want only the elements that
either have no `data-human-lang` attribute
(so they're "universal"),
or that specify `data-human-lang="french"`,
_and_
do _not_ specify `data-comp-lang="ruby"`.&nbsp;
Anything tagged, for instance,
`data-human-lang="japanese"`
will be hidden,
and elements tagged, for instance, `data-comp-lang="python"`
will be shown (unless hidden for other reasons).

To specify these options in JS,
use at the bottom of your file
a `script` element as shown above.&nbsp;
You may either set the `options` variable to some value, like so:

```
const options = [
        'human-lang    =  japanese',
        'not-human-lang=  english',
        'prog-lang     =  ruby',
        'min-time      <= 30',
        'max-time      >= 30',
        'var-city      =  Kyoto',
        'var-conf      =  Something',
        'var-year      =  2022'
      ];
```

or use such a literal in place of the variable.&nbsp;
Note that each option may have zero, one, or many spaces
between the comparator and the other pieces.

#### Specifying Options in the URL

Options specified in the URL have the exact same syntax
(including that spaces may be included or not),
and will _override_ choices passed in the JS.&nbsp;
Simply put them after the URL like you would any other URL params,
AND tack gv- onto the front.&nbsp;
That is, add a ? to the URL,
then all the options _separated with ampersands_ (&amp;s),
with gv- on the front of each one.&nbsp;
For instance:

`my-talk.html?gv-human-lang=french&gv-prog-lang=elixir&gv-min_time<40&gv-var-city=Paris`

(It is perfectly okay that there is no `=` in `min_time<40`.&nbsp;
When there is one,
Genaver reconstructs the spec from the two halves the browser hands it,
and _then_ subjects it to
_exactly_ the same parsing as for JS-passed strings.)

## How It Works

Long story short,
Genaver looks for elements with the relevant attribute.&nbsp;
For each one, it looks at the value's relation to the desired value.&nbsp;
(Any element that does not even have the attribute is left alone.)&nbsp;
From there it depends if it is filtering or using a constant.

### Filtering

If the relationship of the element's attribute value,
to the value desired,
is the _inverse_ of the relationship desired,
then the element is hidden.&nbsp;
In other words,
if you wanted equality (whether string or numeric) and you found inequality,
or vice-versa, then it's hidden.&nbsp;
If you wanted it _numerically_ equal or greater,
and you found something _less_,
then it's hidden, and similarly for other opposing pairs of comparison.&nbsp;

When you want _inequality_, it's rather simple.&nbsp;
Genaver can simply look up all the elements with
the undesired value for that attribute, and hide them.&nbsp;
For anything else, it looks up those that have the desired attribute,
loops through them, does the desired comparison,
and hides the element if the comparison is false.

### Constants

Here again it's rather simple.&nbsp;
Again, since we know the exact value we want,
it can scoop them up in one query and set their `InnerText`.
