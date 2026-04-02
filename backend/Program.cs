using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<BookstoreContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BookstoreConnection")));

var app = builder.Build();

app.UseCors("Frontend");

app.MapGet("/books", async (
    BookstoreContext db,
    int? pageSize,
    int? pageNum,
    string? sortBy,
    string? category) =>
{
    var resolvedPageSize = pageSize.GetValueOrDefault(5);
    var resolvedPageNum = pageNum.GetValueOrDefault(1);
    var resolvedSortBy = sortBy?.Trim().ToLowerInvariant() ?? "title";
    var resolvedCategory = category?.Trim();

    if (resolvedPageSize <= 0 || resolvedPageNum <= 0)
    {
        return Results.BadRequest("pageSize and pageNum must both be greater than 0.");
    }

    IQueryable<backend.Models.Book> query = db.Books.AsNoTracking();

    if (!string.IsNullOrWhiteSpace(resolvedCategory) &&
        !string.Equals(resolvedCategory, "all", StringComparison.OrdinalIgnoreCase))
    {
        query = query.Where(b => b.Category == resolvedCategory);
    }

    query = resolvedSortBy switch
    {
        "title_desc" => query.OrderByDescending(b => b.Title),
        "title" or "title_asc" => query.OrderBy(b => b.Title),
        _ => query.OrderBy(b => b.Title)
    };

    var totalNumBooks = await query.CountAsync();

    var books = await query
        .Skip((resolvedPageNum - 1) * resolvedPageSize)
        .Take(resolvedPageSize)
        .ToListAsync();

    return Results.Ok(new
    {
        books,
        totalNumBooks
    });
});

app.MapGet("/books/all", async (BookstoreContext db) =>
{
    var books = await db.Books
        .AsNoTracking()
        .OrderBy(book => book.Title)
        .ToListAsync();

    return Results.Ok(books);
});

app.MapGet("/books/{id:int}", async (BookstoreContext db, int id) =>
{
    var book = await db.Books
        .AsNoTracking()
        .SingleOrDefaultAsync(book => book.BookId == id);

    return book is null ? Results.NotFound() : Results.Ok(book);
});

app.MapPost("/books", async (BookstoreContext db, Book book) =>
{
    if (string.IsNullOrWhiteSpace(book.Title) ||
        string.IsNullOrWhiteSpace(book.Author) ||
        string.IsNullOrWhiteSpace(book.Publisher) ||
        string.IsNullOrWhiteSpace(book.Isbn) ||
        string.IsNullOrWhiteSpace(book.Classification) ||
        string.IsNullOrWhiteSpace(book.Category) ||
        book.PageCount <= 0 ||
        book.Price < 0)
    {
        return Results.BadRequest("All book fields are required, PageCount must be greater than 0, and Price cannot be negative.");
    }

    db.Books.Add(book);
    await db.SaveChangesAsync();

    return Results.Created($"/books/{book.BookId}", book);
});

app.MapPut("/books/{id:int}", async (BookstoreContext db, int id, Book updatedBook) =>
{
    var existingBook = await db.Books.FindAsync(id);

    if (existingBook is null)
    {
        return Results.NotFound();
    }

    if (string.IsNullOrWhiteSpace(updatedBook.Title) ||
        string.IsNullOrWhiteSpace(updatedBook.Author) ||
        string.IsNullOrWhiteSpace(updatedBook.Publisher) ||
        string.IsNullOrWhiteSpace(updatedBook.Isbn) ||
        string.IsNullOrWhiteSpace(updatedBook.Classification) ||
        string.IsNullOrWhiteSpace(updatedBook.Category) ||
        updatedBook.PageCount <= 0 ||
        updatedBook.Price < 0)
    {
        return Results.BadRequest("All book fields are required, PageCount must be greater than 0, and Price cannot be negative.");
    }

    existingBook.Title = updatedBook.Title;
    existingBook.Author = updatedBook.Author;
    existingBook.Publisher = updatedBook.Publisher;
    existingBook.Isbn = updatedBook.Isbn;
    existingBook.Classification = updatedBook.Classification;
    existingBook.Category = updatedBook.Category;
    existingBook.PageCount = updatedBook.PageCount;
    existingBook.Price = updatedBook.Price;

    await db.SaveChangesAsync();

    return Results.Ok(existingBook);
});

app.MapDelete("/books/{id:int}", async (BookstoreContext db, int id) =>
{
    var existingBook = await db.Books.FindAsync(id);

    if (existingBook is null)
    {
        return Results.NotFound();
    }

    db.Books.Remove(existingBook);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapGet("/categories", async (BookstoreContext db) =>
{
    var categories = await db.Books
        .AsNoTracking()
        .Select(b => b.Category)
        .Distinct()
        .OrderBy(category => category)
        .ToListAsync();

    return Results.Ok(categories);
});

app.Run();
