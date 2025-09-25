using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentController : ControllerBase
{
    private readonly AppDbContext _context;
    public CommentController(AppDbContext context) => _context = context;

    private async Task<User> GetCurrentUserAsync()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var user = await _context.Users.Include(u => u.Rights).Include(u => u.Team).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            throw new InvalidOperationException("Authenticated user not found in the database.");
        return user;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var user = await GetCurrentUserAsync();
        if (user.Rights.Any(r => r.Name == "Admin"))
            return Ok(await _context.Comments.ToListAsync());
        if (user.Rights.Any(r => r.Name == "Manager"))
            return Ok(await _context.Comments.Where(c => c.User.TeamId == user.TeamId).ToListAsync());
        if (user.Rights.Any(r => r.Name == "DEV"))
            return Ok(await _context.Comments.Where(c => c.UserId == user.Id).ToListAsync());
        return Forbid();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var user = await GetCurrentUserAsync();
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null) return NotFound();
        if (user.Rights.Any(r => r.Name == "Admin")) return Ok(comment);
        if (user.Rights.Any(r => r.Name == "Manager") && comment.User.TeamId == user.TeamId) return Ok(comment);
        if (user.Rights.Any(r => r.Name == "DEV") && comment.UserId == user.Id) return Ok(comment);
        return Forbid();
    }

    [HttpPost]
    public async Task<IActionResult> Create(Comment comment)
    {
        var user = await GetCurrentUserAsync();
        if (user.Rights.Any(r => r.Name == "Admin") ||
            (user.Rights.Any(r => r.Name == "Manager") && comment.User.TeamId == user.TeamId) ||
            (user.Rights.Any(r => r.Name == "DEV") && comment.UserId == user.Id))
        {
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = comment.Id }, comment);
        }
        return Forbid();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Comment comment)
    {
        var user = await GetCurrentUserAsync();
        if (id != comment.Id) return BadRequest();
        var existing = await _context.Comments.FindAsync(id);
        if (existing == null) return NotFound();
        if (user.Rights.Any(r => r.Name == "Admin") ||
            (user.Rights.Any(r => r.Name == "Manager") && existing.User.TeamId == user.TeamId) ||
            (user.Rights.Any(r => r.Name == "DEV") && existing.UserId == user.Id))
        {
            _context.Entry(comment).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        return Forbid();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await GetCurrentUserAsync();
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null) return NotFound();
        if (user.Rights.Any(r => r.Name == "Admin") ||
            (user.Rights.Any(r => r.Name == "Manager") && comment.User.TeamId == user.TeamId) ||
            (user.Rights.Any(r => r.Name == "DEV") && comment.UserId == user.Id))
        {
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        return Forbid();
    }
}