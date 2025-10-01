# WEB103 Project 2 - Conscious AI Usage Tips

Submitted by: My (Chiffon) Nguyen

About this web app: **A web application that provides tips for mindful and sustainable AI usage, helping users make conscious decisions about when and how to use AI tools effectively.**

Time spent: 4 hours, mostly to debug database connection and search

## Required Features

The following **required** functionality is completed:

- [x] **The web app uses only HTML, CSS, and JavaScript without a frontend framework**
- [x] **The web app is connected to a PostgreSQL database, with an appropriately structured database table for the list items**
  - [x] **NOTE: Your walkthrough added to the README must include a view of your Render dashboard demonstrating that your Postgres database is available**
  - [x]  **NOTE: Your walkthrough added to the README must include a demonstration of your table contents. Use the psql command 'SELECT * FROM tablename;' to display your table contents.**
- [x] **The web app displays a title**
- [x] **The web app displays at least five unique list items, each with at least three displayed attributes (such as title, text, and image)**
- [x] **The user can click on each item in the list to see a detailed view of it, including all database fields**
  - [x] **Each detail view should be a unique endpoint, such as as `localhost:3000/bosses/crystalguardian` and `localhost:3000/mantislords`**
  - [x] *Note: When showing this feature in the video walkthrough, please show the unique URL for each detailed view. We will not be able to give points if we cannot see the implementation* 
- [x] **The web app serves an appropriate 404 page when no matching route is defined**
- [x] **The web app is styled using Picocss**

The following **optional** features are implemented:

- [ ] The user can search for items by a specific attribute

The following **additional** features are implemented:

- [x] Filter tips by category 
- [x] Sort tips by impact, effort, or cost in ascending or descending order
- [x] Filter and sort settings are persisted in the URL as params and can be shared
- [x] Search by title and description

## Video Walkthrough

Here's a walkthrough of implemented **required** features from Project 1:

<img src='previews/client.gif' title='Required Feature Walkthrough' alt='Required Feature Walkthroug' />

And a walkthrough of additional features (persisted filter and sorting):

<img src='previews/database+search.gif' title='GIF Walkthrough' alt='GIF Walkthrough' />

## Notes

- Data is stored and structured in .json, and can be easily migrated to database required in Project 2.
- Without frontend frameworks, there are no components, 
but cards + detail page is constructed by parsing a simple template variable {{key}}.

## License

Copyright 2025 My (Chiffon) Nguyen

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
