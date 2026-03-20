using backend.Data;
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
    string? sortBy) =>
{
    var resolvedPageSize = pageSize.GetValueOrDefault(5);
    var resolvedPageNum = pageNum.GetValueOrDefault(1);
    var resolvedSortBy = sortBy?.Trim().ToLowerInvariant() ?? "title";

    if (resolvedPageSize <= 0 || resolvedPageNum <= 0)
    {
        return Results.BadRequest("pageSize and pageNum must both be greater than 0.");
    }

    IQueryable<backend.Models.Book> query = db.Books.AsNoTracking();

    query = resolvedSortBy switch
    {
        "title_desc" => query.OrderByDescending(b => b.Title),
        "title" or "title_asc" => query.OrderBy(b => b.Title),
        _ => query.OrderBy(b => b.Title)
    };

    var totalNumBooks = await db.Books.CountAsync();

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

app.Run();
