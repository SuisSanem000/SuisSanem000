---
title: "Learning the Basics: How To Use JSON in SQLite"
description: "Understand SQLite's JSON functions with our beginner guide. Includes use case explanation and hands-on query example for each JSON function in SQLite."
date: "2023-07-17T10:00"
modified_date: "2023-10-17T10:00"
og:
  - url: "blog/sqlite-json"
  - title: "Learning the Basics: How To Use JSON in SQLite"
  - description: "Understand SQLite's JSON functions with our beginner guide. Includes use case explanation and hands-on query example for each JSON function in SQLite."
  - image: "images/i_og_blog_rect.png"
---

# Learning the Basics: How To Use JSON in SQLite

---

TLDR; In this beginner-friendly guide we explain how to work with JSON in the SQLite database. We start with the benefits and use cases of SQLite and JSON, separated and in combination, and then cover the essential JSON functions in SQLite. After that, we provide practical examples for a hands-on understanding of the overall usage of JSON in the SQLite database. We also provided some more practical queries in the final sections.

*We’ve also published an advanced guide about JSON in the SQLite that is complementary to this article, [check it out here](https://dadroit.com/blog/json-querying/).*

In this guide, we explore a fascinating intersection between two popular technologies: JSON and SQLite. Knowing how to use JSON with SQLite is important in modern software development, especially when dealing with complex data structures that may not completely fit in a tabular structure. Whether you're an experienced developer or an eager beginner to expand your knowledge, this tutorial will help you start learning how to use JSON in the SQLite database.

Let's get started!
 
## Empowering Modern Application Data Management With SQLite

SQLite as [the most widely deployed and used database engine](https://www.sqlite.org/mostdeployed.html) is a user-friendly database that doesn't require any complicated setup or server connection. SQLite is straightforward and adaptable to diverse applications, which has made it a go-to choice in software development. SQLite has a small binary footprint, [generally less than 1 MB](https://www.sqlite.org/footprint.html), which means it is lighter than other databases. What's more, SQLite complies fully with [ACID](https://en.wikipedia.org/wiki/ACID) principles.

Another unique feature of SQLite is that it's well-suited for individual applications and internet-connected devices like smart home gadgets, which are part of the Internet of Things (IoT). Also, despite its simplicity, SQLite has a strong command over standard SQL language. It can handle things like [transactions](https://www.sqlite.org/lang_transaction.html), [sub-queries](https://www.sqlitetutorial.net/sqlite-subquery/), and [triggers](https://www.sqlitetutorial.net/sqlite-trigger/). So, SQLite is simple to use, yet still quite powerful.

The capability of SQLite extends beyond just simple data storage. SQLite is efficient and user-friendly, with features such as full-text search and blob support. SQLite also provides an extension mechanism for additional functionality, thereby making it an adaptable tool in the modern software ecosystem.

> Fun Fact: Did you know, while many people pronounce SQLite as 'S-Q-Lite' (sequel-light), [its creator, Richard Hipp, actually intended it to be pronounced as](https://changelog.com/podcast/201#transcript-66) 'S-Q-L-ite' (ess-que-ell-ite) just like a mineral, emphasizing its robust yet lightweight nature!

## Why SQLite Excels in the Realm of Modern Relational Databases

SQLite is a go-to solution for scenarios where full-scale client-server databases might be overkill since it is lightweight and [serverless](https://www.sqlite.org/serverless.html). Because SQLite is [self-contained](https://www.sqlite.org/aff_short.html), it doesn't rely on any external dependencies, making it very reliable. SQLite databases are portable across different file systems and architectures, so data migration in the SQLite database is effortless.

SQLite’s typical use cases are across a variety of domains, as the most widely deployed database engine in existence. For example, SQLite is a standard choice for local persistence in applications, especially mobile apps. SQLite is also widely used for data analysis and testing, where its clarity and power are a winning combination. Lastly, SQLite is an ideal choice for website data storage, where it can manage user data, site content, and more.

The performance of SQLite is impressive, with speed often exceeding other famous databases for most common operations.

![Bar graph comparing query performance across SQLite, MongoDB, PostgreSQL, and MySQL.](images/db_compare.png)
Figure: Using the [ClickHouse](https://benchmark.clickhouse.com/#eyJzeXN0ZW0iOnsiQXRoZW5hIChwYXJ0aXRpb25lZCkiOmZhbHNlLCJBdGhlbmEgKHNpbmdsZSkiOmZhbHNlLCJBdXJvcmEgZm9yIE15U1FMIjpmYWxzZSwiQXVyb3JhIGZvciBQb3N0Z3JlU1FMIjpmYWxzZSwiQnl0ZUhvdXNlIjpmYWxzZSwiY2hEQiI6ZmFsc2UsIkNpdHVzIjpmYWxzZSwiQ2xpY2tIb3VzZSAoZGF0YSBsYWtlLCBwYXJ0aXRpb25lZCkiOmZhbHNlLCJjbGlja2hvdXNlLWxvY2FsIChwYXJ0aXRpb25lZCkiOmZhbHNlLCJjbGlja2hvdXNlLWxvY2FsIChzaW5nbGUpIjpmYWxzZSwiQ2xpY2tIb3VzZSAod2ViKSI6ZmFsc2UsIkNsaWNrSG91c2UiOmZhbHNlLCJDbGlja0hvdXNlICh0dW5lZCkiOmZhbHNlLCJDbGlja0hvdXNlICh6c3RkKSI6ZmFsc2UsIkNsaWNrSG91c2UgQ2xvdWQgKEFXUykiOmZhbHNlLCJDbGlja0hvdXNlIENsb3VkIChHQ1ApIjpmYWxzZSwiQ3JhdGVEQiI6ZmFsc2UsIkRhdGFiZW5kIjpmYWxzZSwiRGF0YUZ1c2lvbiAoc2luZ2xlIHBhcnF1ZXQpIjpmYWxzZSwiQXBhY2hlIERvcmlzIjpmYWxzZSwiRHJ1aWQiOmZhbHNlLCJEdWNrREIgKFBhcnF1ZXQpIjpmYWxzZSwiRHVja0RCIjpmYWxzZSwiRWxhc3RpY3NlYXJjaCI6ZmFsc2UsIkVsYXN0aWNzZWFyY2ggKHR1bmVkKSI6ZmFsc2UsIkdyZWVucGx1bSI6ZmFsc2UsIkhlYXZ5QUkiOmZhbHNlLCJIeWRyYSI6ZmFsc2UsIkluZm9icmlnaHQiOmZhbHNlLCJLaW5ldGljYSI6ZmFsc2UsIk1hcmlhREIgQ29sdW1uU3RvcmUiOmZhbHNlLCJNYXJpYURCIjpmYWxzZSwiTW9uZXREQiI6ZmFsc2UsIk1vbmdvREIiOnRydWUsIk15U1FMIChNeUlTQU0pIjpmYWxzZSwiTXlTUUwiOnRydWUsIlBpbm90IjpmYWxzZSwiUG9zdGdyZVNRTCAodHVuZWQpIjpmYWxzZSwiUG9zdGdyZVNRTCI6dHJ1ZSwiUXVlc3REQiAocGFydGl0aW9uZWQpIjpmYWxzZSwiUXVlc3REQiI6ZmFsc2UsIlJlZHNoaWZ0IjpmYWxzZSwiU2VsZWN0REIiOmZhbHNlLCJTaW5nbGVTdG9yZSI6ZmFsc2UsIlNub3dmbGFrZSI6ZmFsc2UsIlNRTGl0ZSI6dHJ1ZSwiU3RhclJvY2tzIjpmYWxzZSwiVGltZXNjYWxlREIgKGNvbXByZXNzaW9uKSI6ZmFsc2UsIlRpbWVzY2FsZURCIjpmYWxzZX0sInR5cGUiOnsic3RhdGVsZXNzIjp0cnVlLCJtYW5hZ2VkIjp0cnVlLCJKYXZhIjp0cnVlLCJjb2x1bW4tb3JpZW50ZWQiOnRydWUsIkMrKyI6dHJ1ZSwiTXlTUUwgY29tcGF0aWJsZSI6dHJ1ZSwicm93LW9yaWVudGVkIjp0cnVlLCJDIjp0cnVlLCJQb3N0Z3JlU1FMIGNvbXBhdGlibGUiOnRydWUsIkNsaWNrSG91c2UgZGVyaXZhdGl2ZSI6dHJ1ZSwiZW1iZWRkZWQiOnRydWUsInNlcnZlcmxlc3MiOnRydWUsImF3cyI6dHJ1ZSwiZ2NwIjp0cnVlLCJSdXN0Ijp0cnVlLCJzZWFyY2giOnRydWUsImRvY3VtZW50Ijp0cnVlLCJ0aW1lLXNlcmllcyI6dHJ1ZX0sIm1hY2hpbmUiOnsic2VydmVybGVzcyI6dHJ1ZSwiMTZhY3UiOnRydWUsIkwiOnRydWUsIk0iOnRydWUsIlMiOnRydWUsIlhTIjp0cnVlLCJjNmEuNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCJjNmEubWV0YWwsIDUwMGdiIGdwMiI6dHJ1ZSwiYzVuLjR4bGFyZ2UsIDUwMGdiIGdwMiI6dHJ1ZSwiYzUuNHhsYXJnZSwgNTAwZ2IgZ3AyIjp0cnVlLCIxOTJHQiI6dHJ1ZSwiMjRHQiI6dHJ1ZSwiMzYwR0IiOnRydWUsIjQ4R0IiOnRydWUsIjcyMEdCIjp0cnVlLCI5NkdCIjp0cnVlLCI3MDhHQiI6dHJ1ZSwibTVkLjI0eGxhcmdlIjp0cnVlLCJjNmEuNHhsYXJnZSwgMTUwMGdiIGdwMiI6dHJ1ZSwiZGMyLjh4bGFyZ2UiOnRydWUsInJhMy4xNnhsYXJnZSI6dHJ1ZSwicmEzLjR4bGFyZ2UiOnRydWUsInJhMy54bHBsdXMiOnRydWUsIlMyIjp0cnVlLCJTMjQiOnRydWUsIjJYTCI6dHJ1ZSwiM1hMIjp0cnVlLCI0WEwiOnRydWUsIlhMIjp0cnVlfSwiY2x1c3Rlcl9zaXplIjp7IjEiOnRydWUsIjIiOnRydWUsIjQiOnRydWUsIjgiOnRydWUsIjE2Ijp0cnVlLCIzMiI6dHJ1ZSwiNjQiOnRydWUsIjEyOCI6dHJ1ZSwic2VydmVybGVzcyI6dHJ1ZSwidW5kZWZpbmVkIjp0cnVlfSwibWV0cmljIjoiaG90IiwicXVlcmllcyI6W3RydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWUsdHJ1ZSx0cnVlLHRydWVdfQ==) benchmark tool, we compared the performance of leading databases, MySQL, PostgreSQL, SQLite, and MongoDB, across diverse queries.

## Why SQLite's JSON Handling Capabilities Make It an Outstanding Choice for Modern Data Management

Managing unstructured data efficiently is a challenge that many developers face. That's where JSON comes in, as a flexible, schema-less data format, JSON is useful for handling data that doesn't fit neatly into a tabular structure.

By storing JSON data in SQLite, you can leverage SQLite's powerful querying capabilities to extract and manipulate your JSON data efficiently. The beauty of this combination lies in the fact that SQLite comes with built-in functions to manage JSON data with simplicity. Moreover, JSON's popularity as a data interchange format and its portability means that JSON data stored in SQLite can easily be shared, migrated, or exported to different systems.

[SQLite's JSON support](https://www.sqlite.org/json1.html) has matured over time. It was first introduced as an extension in version 3.9.0, released in 2015, but later versions came with built-in support for JSON. SQLite lets you save and fetch JSON data using a TEXT column and a suite of JSON functions, such as `json()`,  `json_extract()`, `json_object()`, and `json_array()`.

## Understanding SQLite's Powerful Functions for JSON Querying

SQLite manages and manipulates JSON data using [JSON functions](https://www.sqlite.org/json1.html#function_details). Here are the top 10 JSON functions in SQLite, listed as a reference, and the use case of each will be exemplified using a simple SQL query in the following section.

1. [json()](https://www.sqlite.org/json1.html#jmini): This function verifies if a string is a valid JSON. If it is, the function returns the same JSON. If it is not, it returns NULL.

2. [json_extract()](https://www.sqlite.org/json1.html#jex): This function extracts an object from a JSON string using a path.

3. [json_array()](https://www.sqlite.org/json1.html#jarray): This function creates a JSON array.

4. [json_array_length()](https://www.sqlite.org/json1.html#jarraylen): This function returns the length of the JSON array.

5. [json_insert()](https://www.sqlite.org/json1.html#jins): This function inserts a JSON value into a JSON string.

6. [json_object()](https://www.sqlite.org/json1.html#jobj): This function creates a JSON object.

7. [json_remove()](https://www.sqlite.org/json1.html#jrm): This function removes a property from the JSON string.

8. [json_replace()](https://www.sqlite.org/json1.html#jrepl): This function replaces a value in a JSON string.

9. [json_type()](https://www.sqlite.org/json1.html#jtype): This function returns the type of the JSON value (like INTEGER, REAL, NULL, TRUE, FALSE, TEXT, and BLOB).

10. [json_valid()](https://www.sqlite.org/json1.html#jvalid): This function verifies if a string is a valid JSON.

## Practical Series of Examples for Understanding JSON Encode and Decode Functions in SQLite

In this section, we’ve provided minimal examples and a brief explanation for each of the JSON functions we listed in the previous section. We use an example of JSON data from the [Dadroit JSON generator](https://dadroit.com/blog/json-generator/). Here is the original JSON to give you context.

![This is a sample JSON file opened in Dadroit JSON Viewer, to be used throughout the post about a movie record, consisting of these fields: "ID", "Name", "Year", "Genre" and "Cast" as arrays, "Director", "Runtime", and "Rate”.](images/dadroit-json-viewer-movie-json.png)
Figure: This is a sample JSON file opened in Dadroit JSON Viewer, to be used throughout the post about a movie record, consisting of these fields: "ID", "Name", "Year", "Genre" and "Cast" as arrays, "Director", "Runtime", and "Rate”.

## The `json()` Function in SQLite

This query converts the JSON text into a JSON valid string.

```sql
SELECT
	json ( '{"ID":1,"Name":"Forgotten in the Planet","Year":1970}' ) AS json_object;
```
The result of this query would be like this:

| json_object                                           |
|-------------------------------------------------------|
| {"ID":1,"Name":"Forgotten in the Planet","Year":1970} |

## The `json_extract()` Function in SQLite

This query extracts the "Name" property from the JSON object by using it as a path.

```sql
SELECT json_extract('{"ID":1,"Name":"Forgotten in the Planet","Year":1970}', '$.Name') AS movie_name;
```

The result of this query would be like this:

| movie_name              |
|-------------------------|
| Forgotten in the Planet |

## The `json_array()` Function in SQLite

This query makes a new JSON array from the provided inputs.

```sql
SELECT
    json_array ( 1, 2, 3 ) AS array_result;
```

The result would be like this:

| array_result |
|--------------|
| [1,2,3]      |

## The `json_type()` Function in SQLite

This query retrieves the data type of the Year value from the JSON object.

```sql
SELECT
    json_type ( '{"ID":1,"Name":"Forgotten in the Planet","Year":1970}', '$.Year' ) AS property_type;
```

The result would be like this:

| property_type |
|---------------|
| integer       |

## The `json_array_length()` Function in SQLite

This query counts the number of elements in the Cast array in the JSON object.

```sql
SELECT
    json_array_length ( '{"Genre":["Comedy","Crime"],"Cast":["Adrian Gratianna","Tani O''Hara","Tessie Delisle"]}', '$.Cast' ) AS array_length;
```

The result would be like this:

| array_length |
|--------------|
| 3            |

## The `json_object()` Function in SQLite

This query creates a JSON object with the ID and Name key-value pairs.

```sql
SELECT
    json_object ( 'ID', 1, 'Name', 'Forgotten in the Planet' ) AS result;
```

The result would be like this:

| result |
|--------------------|
| {"ID":1,"Name":"Forgotten in the Planet"}                  |

## The `json_insert()` Function in SQLite

This query inserts the Director key-value property into the JSON object.

```sql
SELECT
    json_insert ( '{"ID":1,"Name":"Forgotten in the Planet","Year":1970}', '$.Director', 'Henrie Randell Githens' ) AS insert_movie;
```

The result would be like this:

| insert_movie                                                                              |
|-------------------------------------------------------------------------------------------|
| {"ID":1,"Name":"Forgotten in the Planet","Year":1970,"Director":"Henrie Randell Githens"} |

## The `json_remove()` Function in SQLite

This query removes the Director key-value pair from the JSON object.

```sql
SELECT
    json_remove ( '{"ID":1,"Name":"Forgotten in the Planet","Year":1970,"Director":"Henrie Randell Githens"}', '$.Director' ) AS result_of_remove;
```

The result would be like this:

| result_of_remove                                      |
|-------------------------------------------------------|
| {"ID":1,"Name":"Forgotten in the Planet","Year":1970} |

## The `json_replace()` Function in SQLite

This query replaces the Year in the JSON object with the new value 1971.

```sql
SELECT
    json_replace ( '{"ID":1,"Name":"Forgotten in the Planet","Year":1970,"Director":"Henrie Randell Githens"}', '$.Year', 1971 ) AS result_of_replace;
```

The result would be like this:

| result_of_replace                                                                         |
|-------------------------------------------------------------------------------------------|
| {"ID":1,"Name":"Forgotten in the Planet","Year":1971,"Director":"Henrie Randell Githens"} |

## The `json_valid()` Function in SQLite

This query checks whether the provided string has the correct syntax and structure required for a valid JSON, and returns 1 if it was and 0 otherwise.

```sql
SELECT
    json_valid ( '{"ID":1,"Name":"Forgotten in the Planet","Year":1970,"Director":"Henrie Randell Githens"}' ) AS result_of_valid;
```

The result would be like this:

| result_of_valid |
|-----------------|
| 1               |

## Practical Query Examples for Enhanced SQL Querying Using JSON Functions in SQLite

Now that you’ve learned about the basics of JSON in SQLite, here you are presented with some more examples of a practical workflow with JSON data in the SQLite database, using previously mentioned JSON functions, and the previously mentioned JSON data as the input.

## Storing JSON Data in SQLite With Insert Queries

Firstly, you need to insert the JSON into an SQLite database. Let's create a table named `movies` with one field named `data` as a text field since you can store JSON in SQLite in a text field. You’ll be using this `data` field to store and retrieve the JSON values:

```sql
CREATE TABLE movies ( data TEXT );
```

Then let's insert our JSON into the field `data` of the table `movies`:

```sql
INSERT INTO movies ( data )
VALUES
    ( '{"ID":1,"Name":"Forgotten in the Planet","Year":1970,"Genre":["Comedy","Crime"],"Director":"Henrie Randell Githens","Cast":["Adrian Gratianna","Tani OHara","Tessie Delisle"],"Runtime":90,"Rate":7.0}' );
```

To edit (replace, insert, remove) JSON in SQLite, you can use json_replace(), json_insert(), and json_remove() functions.

The following query replaces the movie's `name` with the new value where the `ID` is 1:

```sql
UPDATE movies
SET data = json_replace ( data, '$.Name', 'Found in the Universe' )
WHERE
    json_extract ( data, '$.ID' ) = 1;
```

The following query inserts a new property as a new field into the JSON data stored previously in the row:

```sql
UPDATE movies
SET data = json_insert ( data, '$.Country', 'USA' )
WHERE
    json_extract ( data, '$.ID' ) = 1;
```

The following query removes the Runtime property from the JSON data stored previously in the row:

```sql
UPDATE movies
SET data = json_remove ( data, '$.Runtime' )
WHERE
    json_extract ( data, '$.ID' ) = 1;
```

## Extract JSON Data From SQLite

To retrieve JSON data from SQLite, you can use the json_extract() or the shorthand operator ->:

Select the movie's name:

```sql
SELECT
    json_extract ( data, '$.Name' )
FROM
    movies
WHERE
    json_extract ( data, '$.ID' ) = 1;
```

Or using the -> shorthand operator:

```sql
SELECT
    data -> '$.Name'
FROM
    movies
WHERE
    data -> '$.ID' = 1;
```

Retrieve the list of genres:

```sql
SELECT
    json_extract ( data, '$.Genre' )
FROM
    movies
WHERE
    json_extract ( data, '$.ID' ) = 1;
```

Retrieve the first actor from the Cast list:

```sql
SELECT
    json_extract ( data, '$.Cast[0]' )
FROM
    movies
WHERE
    json_extract ( data, '$.ID' ) = 1;
```

Extract the Year and Rate:

```sql
SELECT
    json_extract ( data, '$.Year' ) AS Year,
	json_extract ( data, '$.Rate' ) AS Rate
FROM
    movies
WHERE
    json_extract ( data, '$.ID' ) = 1;
```

## Concluding Insights

Well done on completing this journey! You've learned how JSON data type and SQLite database can work together. SQLite is a handy tool to have in your toolkit. It's simple yet powerful, and easy to use. Even though it's small, it's full of useful features.

Simply put, SQLite lets us save and fetch JSON data using a text column and some JSON functions. These functions allow us to explore, analyze, and change the JSON data in our SQLite database. SQLite offers a lot of tools to manage JSON data, from adding and changing JSON data to fetching it for various purposes. We covered ten primary JSON functions in SQLite that make handling JSON data simpler. Then, we looked at some more examples of sql queries from using these JSON functions in SQLite.

Remember, getting good at using JSON with SQLite is a skill that needs to be practiced more thoroughly. So, don't be shy - dive in, experiment, and learn. In the end, if you found this guide helpful, feel free to share it. Check out our blog or subscribe to our newsletter for more helpful guides. Enjoy your coding journey!