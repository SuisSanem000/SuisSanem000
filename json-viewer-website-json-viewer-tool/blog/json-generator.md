---
title: "JSON Generator: How To Create Dummy JSON Data"
description: "The ideal mock data is crafted specifically for your problem. This guide provides an in-depth explanation on how to create test data in any form."
date: "2023-03-16T11:10"
modified_date: "2023-10-15T10:00"
og:
- url: "blog/json-generator"
- title: "JSON Generator: How To Create Dummy JSON Data"
- description: "The ideal mock data is crafted specifically for your problem. This guide provides an in-depth explanation on how to create test data in any form."
- image: "images/i_og_blog_rect.png"
---

# JSON Generator: How To Create Dummy JSON Data

---

## Importance of Mock Data in Software Development

In software development, mocking involves providing objects that simulate the behavior of actual objects. Mock data, on the other hand, is fake data used to examine a specific piece of software.

When developing a unit, process, service, or application, unit testing is an essential step. The use of mock data in this phase is to isolate and focus on the functionality being examined, rather than on the behavior of external dependencies.

These test data are called mock data because they generally simulate realistic use cases of the system in the development phase. They offer developers and testers better accuracy while evaluating the code.

Realistic test data should be diverse and contain items that may not play nice and with care to your code. Testing with realistic data will make your application more robust and resistant to various inputs. This is because you'll catch errors that may occur in production.

## Use Cases of Dummy Data in Software Development

In the process of application development, checking and testing every part of the completed or uncompleted backend section is necessary. Having the right test data is crucial in various situations.

Stress-checking the application is another critical use case, since thousands of users could be using the app at the same time in production, increasing the load on every piece of software.

Manually entering data into a test environment one record or test at a time using the UI will not build up the size or variety of data that your app will face in production in a few days.

Another situation is that the data you use as a developer of the system could be biased toward your usage patterns and not match real-world usage, thus leaving important bugs hidden in the code.

Generating mock data is also useful to demonstrate application features to clients so they can better understand them.

Now that we know why having the right test data is necessary, we need to find or generate the test data.

As a developer, you may know how to script some data types, such as random numbers and strings or dynamic lists, easily. Preparing some code to generate that sort of thing can be straightforward and quick.

However, not everyone who tests software is an expert developer, and even if they were, some things are much harder to create and require data sources to cover the realistic schema, type, and formats. What seems like a quick task can rapidly become time-consuming.

## Generate a JSON Example File

There are tools available to help software developers and test engineers generate random test data for examining software applications. These tools create random data types and formats, such as fake addresses, dates, names, and numbers, to suit your test data needs.

These tools simplify the process of load, performance, and stress testing, which can be tiresome or impossible without their help. They are easy to use and save a lot of time. With simple instructions, you can create a large volume of data.

## Pros and Cons of Dummy Data and Online JSON Generators

Programming libraries and APIs are available that allow developers to generate datasets via code, not just via the application UI. Some tools have a handy UI and support different formats.

However, most of the tools we checked (and we did it thoroughly) had significant limits and restrictions, especially in JSON format.

For example, [Mockaroo](https://mockaroo.com/) is one of the first and most frequent results when searching for JSON mock data generators. It has some good features, like providing other formats such as CSV and JSON, but its free plan restricts the JSON generator to only 1000 rows.

There are many available tools to populate databases, but raw mock data generators in JSON format are usually libraries, not tools, and require expert configuration to become up-and-running tools.

For example, some APIs and libraries in programming languages like [Faker](https://faker.readthedocs.io/en/master/) JSON in Python can create mock JSON data. However, most of these libraries are specific to a programming language, require expert developer knowledge, and have advanced configurations that are time-consuming and not practical for everyone.

So, to sum it up, there are online JSON generators that you can easily find on the internet, but most of them have important limitations in the data creation process, such as not being free, having limitations in size, formats, or data schema, or requiring an account and use of their web app.

Now that you have read this far, you might be wondering if there is a better and more complete choice for making mock JSON data. Keep reading to find out.

## Dadroit JSON Generator: A Tool For Generating Customizable Mock Data

While developing the [Dadroit JSON viewer](https://dadroit.com/), we needed mock JSON data to test every part of our backend code. We wanted this data to have specific features for our application, which are common among software developers. We decided to share it with others, so we created the [Dadroit JSON Generator](https://github.com/DadroitOrganization/Generator).

This practical tool generates completely customizable fake data files with ease. Its robust features are flexible and free to apply to your mock data generation needs. It is fast, generating up to 100K objects per second, and it supports many functionalities to create versatile JSON files.

## What Makes Dadroit JSON Generator Different?

- Highly customizable data types and schema that can be tailored to your requirements.
- No size limitations, with the ability to generate up to 100k rows per second.
- Open source and completely free, with no limits on usage or license.
- No complicated infrastructure is needed for configuration. The tool can be run completely locally, without the need for an account or working internet connection.
- No advanced developer experience is required to configure and use the tool. Only some basic knowledge of JSON format is needed.
- Compatible with most platforms, including Mac, Linux, and Windows.
- Very intuitive and easy to use.

> We've just rolled out a new VSCode extension, powered by the Dadroit JSON Generator, designed to effortlessly integrate JSON mock data production into your development workflow! Learn more its features in our [introductory blog post](https://dadroit.com/blog/json-generator-vscode-extension/).

## How Does Dadroit JSON Generator Work? Let’s Make an Example JSON File.

The [Dadroit JSON Generator](https://github.com/DadroitOrganization/Generator) tool can be used to generate mock JSON data files using a custom JSON-based and functional template language. This language includes variants (numbers, strings, arrays), loops, templates, and math functions like random, min, max, count, and more. Moreover, it supports embedding one template completely inside another for reusing.

Here are the steps to use it:

### Step 1: Creating a Template for Our Dummy Data Generator

To use the tool, you should have a template file that looks something like this. We'll explain it step by step in the following sections.

```json
{
	"Name": "$FirstName",
	"Value": {
		"X": 1,
		"Y": 2
	},
	"Books": {
		"$Random": [
			"B1",
			"B2",
			"B3"
		]
	},
	"Age": {
		"$Random": {
			"$Min": 10,
			"$Max": 20
		}
	}
}
```

### Step 2: Running the Tool to Create a JSON File

After saving the template file from the previous step as **`Sample.json`**, download the command line tool from the [GitHub](https://github.com/DadroitOrganization/Generator/releases/tag/Release_Sample_Data) repository, and run the following command:

```bash
JSONGeneratorCLI Sample.json
```

### Step 3: Obtaining the Output File

You will receive a mock JSON data file that looks like this.

```json
{
	"Name": "John",
	"Value": {
		"X": 1,
		"Y": 2
	},
	"Books": "B3",
	"Age": 13
}
```

## Improving Your JSON Mock Data Files

Now that you have learned the fundamentals of using Dadroit JSON Generator, you may be wondering how to create a custom JSON mock data file. The answer is simple: by preparing a JSON template file.

This document will introduce you to all the features and functionalities of Dadroit JSON Generator. These tools empower you to create any JSON mock data file you need, in various sizes, schemas, and field types.

All these functions can be used in the schema template file and fed to Dadroit JSON Generator, as explained in the previous section. Now, let's explore these functions in detail. You can also find sample schemas and their corresponding output files on the GitHub repository. Feel free to modify these schemas to fit your needs, as long as you use the correct syntax.

## Detailed Process for Generating Random Dummy Data

In the following section, we will discuss our template language, which is similar to JSON, with the only difference
being that functions and their parameters are indicated by the `$` symbol. Here's how to use it:

### Random Array

Using function **`$Random`** you can specify an array of values to be chosen from when you use an array like this sample:

```json
{
	"Books": {
		"$Random": [
			"B1",
			"B2",
			"B3"
		]
	}
}
```

By running the sample you’ll get a JSON exactly with this schema and a value picked randomly from the array:

```json
{
	"Books": "B3"
}
```

### Creating a Random Range

If you want to specify a range for the **`$Random`** function to randomly select values from, you can do so using the following steps:

```json
{
	"Age": {
		"$Random": {
			"$Min": 10,
			"$Max": 20
		}
	}
}
```

You will receive a different value like this every time you use this template with the tool (hence the "random").

```json
{
	"Age": 13
}
```

### Multiple Random Data with Range

The next syntax gives you random data as much as the count value specifies and within the `$Min` and `$Max` range:

```json
{
	"Age": {
		"$Random": {
			"$Count": 3,
			"$Min": 10,
			"$Max": 20
		}
	}
}
```

The result will be like this:

```json
{
	"Age": [
		13,
		15,
		12
	]
}
```

## Preparing Custom JSON Fields with Fixed or Random Values

Let's take things a step further and mix and match a bit. Suppose you want to create mock data with specific schemas, such as static field names but with dynamic counts or values randomly selected. Here's a sample template:

```json
{
	"Name": "FirstName",
	"Value": {
		"X": 1,
		"Y": 2
	},
	"Books": {
		"$Random": [
			"B1",
			"B2",
			"B3"
		]
	},
	"Age": {
		"$Random": {
			"$Min": 10,
			"$Max": 20
		}
	}
}
```

The result will be something like this, values picked randomly from the array and according to the schema we now established:

```json
{
	"Name": "FirstName",
	"Value": {
		"X": 1,
		"Y": 2
	},
	"Books": "B3",
	"Age": 19
}
```

## Generating Large JSON Data Files by Defining a Loop

Here comes the real strength of this tool. What if you want to generate a large JSON file? You can define a `$Loop` using `$From`, `$To`, `$Step`, and `$Block` as the iterator. By combining this new syntax with what you've learned from previous steps, you can define a schema like this:

```json
{
  "Children": {
    "$Loop": {
			"$From": 0,
			"$To": 9,
			"$Step": 2,
			"$Block": {
				"Name": "FirstName",
				"Value": {
					"X": 1,
					"Y": 2
				},
				"Books": {
					"$Random": [
						"B1",
						"B2",
						"B3"
					]
				},
				"Age": {
					"$Random": {
						"$Min": 10,
						"$Max": 20
					}
				}
			}
		}
	}
}
```

You’ll get something like this output file, which is the result of the loop defined in the previous template:

```json
{
  "Children": [
    {
			"Name": "FirstName",
			"Value": {
				"X": 1,
				"Y": 2
			},
			"Books": "B3",
			"Age": 11
		},
		{
			"Name": "FirstName",
			"Value": {
				"X": 1,
				"Y": 2
			},
			"Books": "B3",
			"Age": 15
		},
		{
			"Name": "FirstName",
			"Value": {
				"X": 1,
				"Y": 2
			},
			"Books": "B1",
			"Age": 16
		},
		{
			"Name": "FirstName",
			"Value": {
				"X": 1,
				"Y": 2
			},
			"Books": "B1",
			"Age": 13
		},
		{
			"Name": "FirstName",
			"Value": {
				"X": 1,
				"Y": 2
			},
			"Books": "B3",
			"Age": 13
		}
	]
}
```

To create large JSON files, you can specify `$Count` as much as you need. We have used this approach to generate [JSON files](https://github.com/DadroitOrganization/Generator/releases/tag/Release_Sample_Data) for performance testing our application using this syntax.

## Design Your Loops By Customizing Iterators

Using the `$GetVar` function in combination with`$Var` you can customize the iterator of the loop. Here is the sample:

```json
{
	"List": {
		"$Loop": {
			"$From": 1,
			"$To": 10,
			"$Var": "I",
			"$Block": {
				"$Loop": {
					"$From": 0,
					"$To": 9,
					"$Var": "J",
					"$Block": {
						"X": {
							"$GetVar": "I"
						},
						"Y": {
							"$GetVar": "J"
						}
					}
				}
			}
		}
	}
}
```

The output file will be something like this:

```json
{
	"List": [
	[{"X": 1, "Y": 0},{"X": 1, "Y": 1},{"X": 1, "Y": 2},{"X": 1, "Y": 3},{"X": 1, "Y": 4},{"X": 1, "Y": 5},{"X": 1,"Y": 6},{"X": 1,"Y": 7},{"X": 1,"Y": 8},{"X":1,"Y": 9}],[{"X": 2,"Y": 0},{"X": 2,"Y": 1},{"X": 2,"Y": 2},{"X": 2,"Y": 3},{"X": 2,"Y": 4},{"X": 2,"Y": 5},{"X": 2,"Y": 6},{"X": 2,"Y": 7},{"X": 2,"Y": 8},{"X": 2,"Y": 9}],
	[{"X": 3,"Y": 0}, {"X": 3,"Y": 1},{"X": 3,"Y": 2},{"X": 3,"Y": 3},{"X": 3,"Y": 4},{"X": 3,"Y": 5},{"X": 3,"Y": 6},{"X": 3,"Y": 7},{"X": 3,"Y": 8},{"X": 3,"Y": 9}],
	[{"X": 4,"Y": 0},{"X": 4,"Y": 1},{"X": 4,"Y": 2},{"X": 4,"Y": 3},{"X": 4,"Y": 4},{"X": 4,"Y": 5},{"X": 4,"Y": 6},{"X": 4,"Y": 7},{"X": 4,"Y": 8},{"X": 4,"Y": 9}],
	[{"X": 5,"Y": 0},{"X": 5,"Y": 1},{"X": 5,"Y": 2},{"X": 5,"Y": 3},{"X": 5,"Y": 4},{"X": 5,"Y": 5},{"X": 5,"Y": 6},{"X": 5,"Y": 7},{"X": 5,"Y": 8},{"X": 5,"Y": 9}],
	[{"X": 6,"Y": 0},{"X": 6,"Y": 1},{"X": 6,"Y": 2},{"X": 6,"Y": 3},{"X": 6,"Y": 4},{"X": 6,"Y": 5},{"X": 6,"Y": 6},{"X": 6,"Y": 7},{"X": 6,"Y": 8},{"X": 6,"Y": 9}],
	[{"X": 7,"Y": 0},{"X": 7,"Y": 1},{"X": 7,"Y": 2},{"X": 7,"Y": 3},{"X": 7,"Y": 4},{"X": 7,"Y": 5},{"X": 7,"Y": 6},{"X": 7,"Y": 7},{"X": 7,"Y": 8},{"X": 7,"Y": 9}],
	[{"X": 8,"Y": 0},{"X": 8,"Y": 1},{"X": 8,"Y": 2},{"X": 8,"Y": 3},{"X": 8,"Y": 4},{"X": 8,"Y": 5},{"X": 8,"Y": 6},{"X": 8,"Y": 7},{"X": 8,"Y": 8},{"X": 8,"Y": 9}],
	[{"X": 9,"Y": 0},{"X": 9,"Y": 1},{"X": 9,"Y": 2},{"X": 9,"Y": 3},{"X": 9,"Y": 4},{"X": 9,"Y": 5},{"X": 9,"Y": 6},{"X": 9,"Y": 7},{"X": 9,"Y": 8},{"X": 9,"Y": 9}],
	[{"X": 10,"Y": 0},{"X": 10,"Y": 1},{"X": 10,"Y": 2},{"X": 10,"Y": 3},{"X": 10,"Y": 4},{"X": 10,"Y": 5},{"X": 10,"Y": 6},{"X": 10,"Y": 7},{"X": 10,"Y": 8},{"X": 10,"Y": 9}]
	]
}
```

## Creating a Custom Format for Your JSON Data

You can use formatting functions to construct a custom schema for your JSON data. By defining a `$Format` that includes both a `$Template` and a `$Value`, you can create a more versatile format for customizing your JSON files to fit your needs.

Here's an example template schema:

```json
{
	"Hi": {
		"$Loop": {
			"$From": 1,
			"$To": 10,
			"$Block": {
				"Message": {
					"$Format": {
						"$Template": {"$Random": ["Hi ? and ?", "Hello? or ?"]},
						"$Value": [
						{"$Random": ["Jim", "Jack", "Jake", "Jamie"]},
						{"$Random": ["Julia", "Jessica"]}
						]
					}
				}
			}
		}
	}
}
```

The result of the such template could be something like this:

```json
{
	"Hi": [
		{
			"Message": "Hello Jake or Julia"
		},
		{
			"Message": "Hi Jack and Jessica"
		},
		{
			"Message": "Hello Jamie or Jessica"
		},
		{
			"Message": "Hello Jim or Julia"
		},
		{
			"Message": "Hi Jake and Jessica"
		},
		{
			"Message": "Hello Jamie or Jessica"
		},
		{
			"Message": "Hello Jamie or Julia"
		},
		{
			"Message": "Hello Jim or Jessica"
		},
		{
			"Message": "Hello Jim or Jessica"
		},
		{
			"Message": "Hello Jack or Julia"
		}
	]
}
```

## Defining a Variable Once and Using It Across All Your Templates

By defining a variable using `$SetVar`, you can use its value, whether it's a static number, fixed string, or a random array, throughout your template. By using `$GetVar`, you can access that value wherever you need it to be. See the following example for a demonstration:

```json
{
  "X": {
    "$SetVar": {
      "$Name": "X",
      "$Value": [
        1,
        2
      ]
    }
  },
  "N": {
    "$Random": {
      "$GetVar": "X"
    }
  }
}
```

Once you use that template in the tool, you be getting a JSON file like this one:

```json
{
	"N": 2
}
```

## Including Another JSON File in a Template

You can import another JSON template file into your current template using the `$Include` function. Suppose you have a file named `Sample.JSON` with the following schema:

```json
{
	"RandomNumber": {
		"$SetVar": {
			"$Name": "RandomNumber",
			"$Value": {
				"$Random": {
					"$Min": 1,
					"$Max": 100
				}
			}
		}
	}
}
```

Then you can use it as an included input in another template just like this:

```json
{
	"Include": {
		"$Include": "Sample.JSON"
	},
	"Year": {
		"$GetVar": "RandomNumber"
	}
}
```

And the result would be something like this:

```json
{
	"Year": 67
}
```

These last few functions can help you construct any JSON schema you have in mind. The `$Include` function allows you to
use JSON files containing random text as suppliers to make a variety of JSON files, as long as they meet the proper
syntax requirements, which are not complicated based on these tutorials. For a more sophisticated use case of this
function, check out
the [Movies samples in GitHub](https://github.com/DadroitOrganization/Generator/blob/main/Samples/Movies.json). A
template file is also available in the sample folder.

## Final Words

That's about it for this tool use case. If you need mock data to evaluate your app, [Dadroit JSON Generator](https://github.com/DadroitOrganization/Generator) can generate fake yet realistic mock data in JSON format. It's easy to use and flexible in generating data that fulfills all your needs.

One practical feature of this tool is its flexible custom language template, which you can use as a template for the output data. We described this custom language template in detail in this post, and you can find some profound samples in the project repository on [GitHub](https://github.com/DadroitOrganization/Generator/tree/main/Samples).

We generated some [sample JSON files](https://github.com/DadroitOrganization/Generator/releases/tag/Release_Sample_Data) using this tool and tested our beloved [Dadroit JSON Viewer](https://dadroit.com/) with them.

Now that you know all this new information, you can do one of the following:

- Check out
  the [generated JSON files](https://github.com/DadroitOrganization/Generator/releases/tag/Release_Sample_Data) to have
  a closer look at the results of the tool.
- Download the tool, play with it using available sample schemas, or practice this simple schema-generating process
  more, which only needs knowledge of JSON format good enough, and then use your imagination and try the tool to
  generate what you have in mind.