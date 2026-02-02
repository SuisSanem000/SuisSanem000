---
title: "How to Query CSV Files with SQLite"
description: "Learn how to run SQL queries on large CSV files efficiently using SQLite and DBeaver GUI. Import and query data without heavy database setups."
date: "2024-09-28T10:00"
modified_date: "2024-09-28T10:00"
og:
  - url: "blog/query-csv"
  - title: "How to Query CSV Files with SQLite"
  - description: "Learn how to run SQL queries on large CSV files efficiently using SQLite and DBeaver GUI. Import and query data without heavy database setups."
  - image: "images/i_og_blog_rect.png"
---

# How to Query CSV Files with SQLite

---

[[toc]]

Have you ever struggled to open large CSV files and wished for a simpler solution to run SQL queries over them without heavy database setups? That's where [SQLite](https://www.sqlite.org/index.html) shines—it's lightweight, file-based, and requires zero configuration. 
In this guide, we’ll show you how to efficiently import and query large CSV documents, both with and without a GUI. You'll learn how to do this with the [DBeaver](https://dbeaver.com/) database client for a more user-friendly, visual experience, and then directly through the SQLite CLI for a straightforward and much more performant way.

[//]: # (## Table of Contents)

[//]: # ()
[//]: # (* [Comparing 4 Methods to Open CSV Files in SQLite]&#40;#comparing-4-methods-to-open-csv-files-in-sqlite&#41;)

[//]: # (* [Method 1. Using GUI to Import CSV Files into SQLite with DBeaver GUI]&#40;#method-1-using-gui-to-import-csv-files-into-sqlite-with-dbeaver-gui&#41;)

[//]: # (  * [Step 1: Set Up a New Database Connection]&#40;#step-1-set-up-a-new-database-connection&#41;)

[//]: # (  * [Step 2: Verify the Connection]&#40;#step-2-verify-the-connection&#41;)

[//]: # (  * [Step 3: Define the Table Structure for Better Import Control]&#40;#step-3-define-the-table-structure-for-better-import-control&#41;)

[//]: # (  * [Step 4: Import the CSV]&#40;#step-4-import-the-csv&#41;)

[//]: # (* [Method 2. Import CSV Document Using SQLite CLI and .import Command]&#40;#method-2-import-csv-document-using-sqlite-cli-and-import-command&#41;)

[//]: # (  * [Step 1: Install SQLite on Windows]&#40;#step-1-install-sqlite-on-windows&#41;)

[//]: # (  * [Step 2: Open SQLite CLI]&#40;#step-2-open-sqlite-cli&#41;)

[//]: # (  * [Step 3: Import the CSV Data]&#40;#step-3-import-the-csv-data&#41;)

[//]: # (  * [Step 4: Verify the Import]&#40;#step-4-verify-the-import&#41;)

[//]: # (* [Running SQL Queries on CSV Data with SQLite]&#40;#running-sql-queries-on-csv-data-with-sqlite&#41;)

## Comparing 4 Methods to Open CSV Files in SQLite

If you want to work with CSV data in SQLite, you have these options:
1. **Using a GUI** like the DBeaver database client.
2. **The `.import` command** in the SQLite database which is the most straightforward and used approach to import CSV files.
3. **The CSV Virtual Table** for flexible on-the-fly querying in SQLite database.
4. **The File I/O functions** for more complex imports across multiple formats, including but not limited to CSV files. 

Below we provided a table to give you a more in-depth overview of each method.

| Method                          | Description                                                                                                   | Pros                                                                                                                         | Cons                                                                                                                                                 | Ideal Use                                                                                                             | Source                                                                                                      |
|---------------------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| 1. DBeaver GUI                  | Utilize the DBeaver database client to import CSV files into a SQLite database using GUI.                     | - User-friendly.<br/>- Visual tools for data mapping and schema design.<br/>- Supports data transformation during import.    | - Requires installation and setup of DBeaver.<br/>- Slower than command<br/>-line method for very large files.<br/>- Consumes more system resources. | For users who prefer a graphical interface and need to import CSV files with custom data mappings or transformations. | [DBeaver Documentation](https://dbeaver.com/docs/dbeaver/)                                                  |
| 2. `.import` Command in SQLite  | Simple command-line option for quick CSV imports.                                                             | - Fast and straightforward.<br/>- No need for pre-creating a table.<br/>- Can skip headers with `--skip 1`.                  | - Limited control over schema.<br/>- No data transformation or validation.<br/>- Requires clean, structured CSV format.                              | For quick, basic CSV imports when you need minimal setup.                                                             | [.import Command Documentation](https://www.sqlite.org/cli.html#importing_files_as_csv_or_other_formats)                                 |
| 3. CSV Virtual Table in SQLite  | Allows querying CSV files as if they were part of the database, without importing data.                       | - No import required.<br/>- Query directly from CSV.<br/>- Flexible for temporary data use or external datasets.             | - Does not store data in the database.<br/>- Performance can be slower on large datasets compared to actual imports.                                 | For querying huge CSV on the fly without needing to persist data.                                                     | [CSV Virtual Table Documentation](https://www.sqlite.org/csv.html)                                          |
| 4. File I/O Functions in SQLite | Advanced approach using functions like `readfile()` to manually process and import CSV or other file formats. | - Full control over data import.<br/>- Supports multiple file formats.<br/>- Custom processing and validation are possible.  | - Requires more setup.<br/>- More complex compared to `.import`.                                                                                     | For complex or multi-format imports where data needs to be processed, validated, or manipulated before import.        | [File I/O Functions Documentation](https://www.sqlite.org/cli.html#file_i_o_functions) | 

Now that we've outlined the available methods, let's focus on the first two—they're the simplest and cover the most common use cases. We'll start by using the DBeaver database client for a graphical approach, then explore SQLite’s `.import` command for command-line efficiency. You can learn more about the two other methods through their documentation.

## Method 1. Using GUI to Import CSV Files into SQLite with DBeaver Database Client

DBeaver is available for all major platforms (Windows, macOS, and Linux). Before we begin, ensure you have it installed—you can download it from [the official website](https://dbeaver.io/download/). For this guide, we'll be working with the Windows version.

### Step 1: Set Up a New Database Connection

You don’t need to install SQLite separately—DBeaver will prompt you with a pop-up to install the necessary drivers when you create an SQLite database.
- Start by opening DBeaver and creating a connection for your SQLite database. From the main menu, click `Database >  New Database Connection`.
  ![DBeaver interface showing the “New Database Connection” option under the “Database“ menu.](/images/blog-post-14-query-csv/1-dbeaver-new-database-connection.png)
- Choose `SQLite` from the list.
  ![DBeaver's “Connect to a database“ window showing the selection of “SQLite“.](/images/blog-post-14-query-csv/2-dbeaver-connect-sqlite-database.png)
- Select the `Create` option, then choose where you'd like to save your new SQLite database file. At the last step, before clicking `Finish` you can test the connectivity of your database by pressing the `Test Connection` button at the bottom-left.
  ![DBeaver's “Connection Settings” window for SQLite, showing the file path to database file.](/images/blog-post-14-query-csv/3-dbeaver-select-sqlite-database-file.png)

### Step 2: Verify the Connection

- Once connected, your SQLite database will appear in the left sidebar, open the database tree to see `Tables` and other sections.
  ![DBeaver interface displaying the connected SQLite database, with an expanded tree showing database objects such as tables.](/images/blog-post-14-query-csv/4-dbeaver-sqlite-database.png)

### Step 3: Define the Table Structure for Better Import Control

You can create a table that matches your file's structure before importing the CSV. While it's not mandatory, this step gives you more control and precision over the import process and field mapping.
- In DBeaver, go to `SQL Editor > New SQL Script`.
  ![DBeaver interface showing the context menu for a SQLite database, with the “SQL Editor” option expanded to create or open SQL scripts.](/images/blog-post-14-query-csv/5-dbeaver-new-sql-script.png)
- As an example, we’ll use a CSV file containing `id`, `name`, and `email` columns as our test file. Run the below SQL script to create an equivalent table named `users` in SQLite, then press `Execute` button to run it.
  ![DBeaver interface displaying an SQL script to create “users” table with columns for id, name, and email.](/images/blog-post-14-query-csv/6-dbeaver-create-user-table.png)
- You should now see the new table appear in the tables section. If it doesn’t show up right away, simply right-click on the database and refresh it. Once it’s visible, double-click on it to view the structure of the `users` table, just as defined.
  ![SQLite database structure displayed in DBeaver database client after a successful connection.](/images/blog-post-14-query-csv/7-dbeaver-user-table-columns.png)
  For more information on data types, check out [the official documentation](https://www.sqlite.org/datatype3.html).

### Step 4: Import the CSV

- With the table set, right-click on it and choose `Import Data`. Select your CSV file, map the columns (if necessary), and adjust any settings as needed. Once done, click `Start` to import the data.
  ![DBeaver interface showing the “Import Data” option for the “users” table in a SQLite database.](/images/blog-post-14-query-csv/8-dbeaver-import-data.png)
  For more options in the import process, you can see [the DBeaver Data Import](https://dbeaver.com/docs/dbeaver/Data-transfer/#import-data) documentation.

## Method 2. Import CSV Document Using SQLite CLI and .import Command

The [SQLite's Command Line Interface](https://www.sqlite.org/cli.html) (CLI) is a powerful tool that allows you to perform database operations efficiently. 
In my experience, the CLI method is much faster for large files. When I imported a 500MB CSV file containing 11 million rows, the CLI completed the task in just 24 seconds, twice as fast as the DBeaver import wizard. 
Here’s how the SQLite's `.import` command works:
- **No table needed**: SQLite’s `.import` command can auto-create a table from the CSV’s first row if it includes headers, so defining a table beforehand isn’t required. However, manually specifying the table structure gives you more control over the import process.
- **Headers**: Use the `--skip 1` option to treat the first row as headers and avoid importing them as data.
- **Handling Extra Columns**: If you define the table beforehand and the CSV file has more columns than the table, the extra columns will be ignored. If the CSV has fewer columns, SQLite fills the missing values with `NULL`. To prevent data misalignment, make sure the columns in your CSV match the order and data types in your SQLite table. 
Building on the previous section where we created a database (`SQLiteCSV.db`) and a table matching the `users` CSV file schema, let's now explain how to import a CSV file into this database using the SQLite CLI.

### Step 1: Install SQLite on Windows

Why Install SQLite on Windows? Installing SQLite lets you use the command line for faster data imports, especially for large datasets.
1. Download the SQLite Tools package from the [official website](https://sqlite.org/download.html).
2. Unzip the file and place `sqlite3.exe` in a convenient directory (e.g., `C:\sqlite`).
> To use the features mentioned above, make sure you're running [SQLite version 3.32.2](https://sqlite.org/releaselog/3_32_2.html) or later.
### Step 2: Open SQLite CLI

- Launch the CLI: Press `Win + R`, type `cmd`, and hit Enter. Then navigate to the directory where you placed `sqlite3.exe`. If you saved it in `C:\sqlite`, you can navigate there by running:

    ```bash
    cd C:\sqlite
    ```
  
- Open Your Database: Navigate to your database by running the below command.

    ```bash
    sqlite3 D:\SQLiteCSV.db
    ```
  
  If the database doesn't exist, this command will create it.

### Step 3: Import the CSV Data

- Set Import Mode: Tell SQLite you're importing a CSV file.

    ```bash
    .mode csv
    ```
  
- Import the Data: Use the `.import` command to load your CSV into the desired table. Replace `D:\users.csv` with the path to your CSV file and `users` with your table name.

    ```bash
    .import --skip 1 D:\users.csv users
    ```

### Step 4: Verify the Import

Run a quick query to ensure your data is imported correctly.

  ```sql
  SELECT
    *
  FROM
    users
      LIMIT 10;
  ```

After running this in your command line interface, you should see the first 10 records from your CSV file appear in your command line application.

## Running SQL Queries on CSV Data with SQLite

After importing your CSV into SQLite, you can query the data in DBeaver. Right-click your SQLite database in the sidebar, select `SQL Editor > New SQL Script` to open a new script window, and run your query. For example, to group users by email domain, use this query on the `users` table:

  ```sql
  SELECT
    SUBSTR( email, INSTR ( email, '@' ) + 1 ) AS domain,
      COUNT( * ) AS user_count
  FROM
    users
  GROUP BY
    domain
  ORDER BY
    user_count DESC;
  ```

This query groups users by their Email domain and counts how many users are associated with each one. Here’s the result when we run this query against our sample data:
  ![DBeaver with a SQL query grouping users by email domain in the SQLite database.](/images/blog-post-14-query-csv/9-dbeaver-users-domain-group-query.png)

## Wrapping Up

For handling large CSV files, you can use SQLite's CLI for the best performance or choose a GUI based tool like DBeaver database client if you prefer a more user-friendly way. Both options allow you to efficiently import and query large CSV files without the complexity of traditional database systems. We encourage you to explore these methods and see how they simplify handling large CSV files. For more details on importing CSV files, check out [SQLite documentation](https://www.sqlite.org/cli.html#importing_files_as_csv_or_other_formats). Happy querying!