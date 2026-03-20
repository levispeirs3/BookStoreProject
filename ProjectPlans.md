# BookStoreProject Plan

## Mission Objective
Build an online bookstore app using an ASP.NET Core Web API backend and a React frontend.
The finished assignment needs to:

- connect to the provided database,
- expose the book data through the API,
- display all books in the React app,
- support pagination with a default of 5 books per page,
- allow the user to change results per page,
- allow sorting by book title,
- and use Bootstrap for styling.

## Recommended Build Order

### Phase 1 - Project setup
1. Create the ASP.NET Core Web API project.
2. Create the React + TypeScript frontend project.
3. Add Bootstrap to the frontend.
4. Keep frontend and backend in separate folders such as:
   - `backend/`
   - `frontend/`
5. Commit the initial scaffolding so the project has a clean starting point.

### Phase 2 - Database + backend model alignment
1. Download the provided database from the BYU Box link.
2. Inspect the database schema and confirm the table and column names.
3. Create backend models that match the database exactly.
4. Add Entity Framework Core packages if EF Core will be used.
5. Configure the database connection string in `appsettings.json`.
6. Create a `DbContext` for the books table.
7. Verify the API can read the existing seed data.

### Phase 3 - API endpoint design
1. Create a books controller or minimal API endpoint.
2. Add an endpoint that returns books with query support for:
   - `pageSize`
   - `pageNum`
   - `sortBy`
3. Default to:
   - page size = 5
   - page number = 1
   - sort by title ascending
4. Return both:
   - the current page of books
   - the total number of books
5. Test the endpoint with a browser, Postman, or curl.

### Phase 4 - Frontend data display
1. Build a reusable `BookList` component.
2. Build a `BookCard` or table row component for each book.
3. Fetch data from the backend API.
4. Render the fields required by the assignment:
   - Title
   - Author
   - Publisher
   - ISBN
   - Classification/Category
   - Number of Pages
   - Price
5. Add the book list component to `App.tsx`.

### Phase 5 - Pagination UX
1. Store page state in React.
2. Show only 5 books per page by default.
3. Add page navigation controls:
   - Previous
   - Next
   - Optional page number buttons
4. Add a page size selector so the user can change the number of books shown.
5. Re-fetch data when page number or page size changes.
6. Show the current page and total pages.

### Phase 6 - Sorting UX
1. Add a sort control to sort by title.
2. Recommended options:
   - Title A-Z
   - Title Z-A
3. Pass the selected sort option to the API.
4. Re-fetch the data whenever sorting changes.
5. Confirm sorting works together with pagination.

### Phase 7 - Styling and polish
1. Use Bootstrap layout classes for spacing and structure.
2. Style the list with either:
   - cards, or
   - a responsive table
3. Make sure the page has:
   - a title/header,
   - consistent spacing,
   - readable price formatting,
   - clean pagination controls.
4. Verify the UI looks good on both desktop and smaller screens.

### Phase 8 - Testing and submission prep
1. Test the backend endpoint with multiple page sizes.
2. Test page navigation.
3. Test sorting by title.
4. Confirm all fields are displayed.
5. Confirm the app loads data from the provided database.
6. Push the final code to GitHub.
7. Submit the GitHub repo link in Learning Suite.

## Suggested Technical Checklist

### Backend checklist
- [ ] ASP.NET Core API project created
- [ ] Database file downloaded and added to backend project
- [ ] Connection string configured
- [ ] Book model matches database
- [ ] DbContext created
- [ ] Books endpoint returns paginated results
- [ ] Sorting by title implemented
- [ ] CORS enabled for frontend

### Frontend checklist
- [ ] React + TypeScript app created
- [ ] Bootstrap installed and imported
- [ ] `BookList` component created
- [ ] API fetch logic implemented
- [ ] Pagination controls implemented
- [ ] Page size selector implemented
- [ ] Sort selector implemented
- [ ] `App.tsx` updated to render the book list

## Recommended API shape

A practical response structure could look like this:

```json
{
  "books": [
    {
      "bookId": 1,
      "title": "Example Title",
      "author": "Example Author",
      "publisher": "Example Publisher",
      "isbn": "1234567890",
      "classification": "Fiction",
      "category": "Fantasy",
      "pageCount": 320,
      "price": 19.99
    }
  ],
  "totalNumBooks": 20
}
```

## Recommended first implementation sprint
If you want to move fast, do the next steps in this exact order:

1. Scaffold the ASP.NET Core API.
2. Scaffold the React app with TypeScript.
3. Install Bootstrap.
4. Add the database and wire up the backend.
5. Create one working `/books` endpoint.
6. Render the books in React.
7. Add page size and page number state.
8. Add title sorting.
9. Polish the styling.
10. Test everything and push.

## What we should do next together
When you are ready, the next working session should be:

1. scaffold the backend and frontend folders,
2. wire in the provided database,
3. create the initial books API,
4. then build the React list component.

That path will get the assignment unblocked as quickly as possible.
