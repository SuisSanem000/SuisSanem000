---
title: "JSON Logging, Why and How"
description: "Simple (but effective) understanding of logging in JSON format. How you can improve your troubleshooting with JSON log."
date: "2022-10-05T10:00"
modified_date: "2023-09-23T10:00"
og:
- url: "blog/json-logging"
- title: "JSON Logging, Why and How"
- description: "Simple (but effective) understanding of logging in JSON format. How you can improve your troubleshooting with JSON log."
- image: "images/i_og_blog_rect.png"
---

# JSON Logging, Why and How

---

## Why logging is a need?

Logging has always been one of the best ways to give visibility to a computer system. Logs help debug, analyze and monitor while a system is working or after a disaster happens. And because of that, it was an essential part of developing software from day one.

Like everything else, logging changed in a variety of ways, most notably in its format. There are many different ideas and methods for storing logs, ranging from a handwritten log on paper to custom text files or other, more conventional formats like [Syslog](https://en.wikipedia.org/wiki/Syslog), CSV, XML, and now JSON.



## Why JSON is the best overall option?

JSON became the de facto format for internet messages, APIs, and even configuration files. It’s a sweet spot between the reading abilities of humans and computers in all its simplicity. For instance, the REST protocol uses JSON in most cases, and most talks about [NoSQL](https://en.wikipedia.org/wiki/NoSQL) and [NewSQL](https://en.wikipedia.org/wiki/NewSQL) have always been around JSON. Even well-known editors like [VSCode](https://code.visualstudio.com) use it as the configuration file format.

One may ask why? And it is a simple question to answer, because JSON is unstructured. If you think the reason is that it was part of JavaScript, you are right too, but eventually it became more than just a JavaScript component, because it helped designing future proof systems.

Even while we’d want to believe that we can evaluate and build systems for decades to come, this won’t be the case virtually always. We cannot pick fixed fields for our database, code, or API and be certain that we won’t need to store additional attributes. This complexity will only increase with the expansion of cloud computing and decentralized complex systems.

For example, practically every cloud-based service like [AWS](https://aws.amazon.com) and [Stripe](https://stripe.com/en-nl) uses JSON in one way or another, whether through events or APIs. Instead of converting incoming events to alternative forms like row-based relational databases, it could be much more appropriate to preserve them in their original JSON form from providers.

Another benefit is that it gives more structural flexibility while maintaining simplicity, as opposed to just a simple key-value or row structure. JSON has two useful structures: object and array, and by combining them with basic types, it can be used to express almost any data structure we can imagine for log needs.



## What are the potential issues of JSON for logging?

Is JSON challenging to store? For storage, like many other log formats, you can choose from different options, from a file to a database or even cloud storage like [S3](https://aws.amazon.com/s3/). There are many ways to store in a file with formats like [ndjson](http://ndjson.org) and [jsonline](https://jsonlines.org). And as history has taught us, one good way is to store each event in a new line of log. This way, if everything goes down, we will have some data in a log file on a drive somewhere to examine. And you can always compress the files to lower the storage prices too.

Is JSON hard to create? Almost all programming languages support JSON format, and there are several ways to deal with them and convert objects both to and from JSON; In fact, creating JSON is considerably simpler than any other data format in today's programming world.

Is JSON complicated to analyze? There are a range of solutions, each with their own pros and cons. From advanced databases or data lakes to limited text editors. Nearly all well-known databases have native JSON support. If necessary, JSON can be converted to a more conventional row-based data structure for faster and more thorough analysis. Most data lakes support JSON and can scale processing them to terabytes and petabytes. And the simplest solution can be a good old text editor as a lifesaver on a rainy night. There is also a middle-spot solution: special-made tools like Dadroit JSON Viewer to quickly get an overview of your JSON data.

Is JSON big and inefficient? Although it could be argued that JSON is not optimal because it is a text-based format and the key of each item is repeated for every entry. However, as discussed m[a](https://www.lucidchart.com/techblog/2019/12/06/json-compression-alternative-binary-formats-and-compression-methods/)[a](https://www.uber.com/en-NL/blog/trip-data-squeeze-json-encoding-compression/)ny times, simple compression formats like Zip, GZip, or [ZSTD](https://github.com/facebook/zstd) will be a fit choice to reduce the size to the level of other formats or even better. To top it all off, remember that almost all web servers, like [Apache](https://httpd.apache.org/docs/2.4/mod/mod_deflate.html) or [NGINX](https://docs.nginx.com/nginx/admin-guide/web-server/compression/), support compression of JSON natively.

## How to work with JSON log?

Just searching for the name of your preferred programming language and "JSON log" will get you started. Almost all programming languages offer a few published techniques to record JSON. There are many more JSON libraries available for every programming language, from C and Rust to Python and JavaScript, and some, like [simdjson](https://github.com/simdjson/simdjson) can even parse up to 4GB/S.

There are many good databases to store and analyze JSON data. [PostgreSQL](https://www.postgresql.org/docs/9.3/functions-json.html), [MySQL](https://dev.mysql.com/doc/refman/8.0/en/json.html), [MongoDB](https://www.mongodb.com/compatibility/json-to-mongodb) or [SQLite](https://www.sqlite.org/json1.html) are some popular ones. In this way, you can only use the database's built-in tools and many of their third-party tools to log, analyze, and report with almost zero lines of code.

There are many interfaces to view the JSON log files, like [Dadroit JSON Viewer](https://dadroit.com/) made by us. It can handle gigantic log files and search through them at a millisecond level. You can have a quick view of the data, look up a lifesaving value, or export it to other formats like CSV or XML.

## Summary

-  JSON is a computer and human-readable file format
- It is very simple to save, and there are several storage options, ranging from databases to files.
-  It can be optimized thanks to fast compression algorithms already available in most tools
- The structure is not limited, it can grow as needed in a future-proof manner
- There are many tools that can view, process and analyze it, including the powerful [Dadroit JSON Viewer](https://dadroit.com/).

PS, you can use [Dadroit JSON Generator](https://github.com/DadroitOrganization/Generator) project to produce useful random test data for testing your services, and it has a cool language to do that. Maybe we'll be talking about it more in the future.