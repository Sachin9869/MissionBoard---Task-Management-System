using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RightsController : ControllerBase
{
    private readonly AppDbContext _context;
    public RightsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _context.Rights.ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var rights = await _context.Rights.FindAsync(id);
        return rights == null ? NotFound() : Ok(rights);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Rights rights)
    {
        _context.Rights.Add(rights);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = rights.Id }, rights);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Rights rights)
    {
        if (id != rights.Id) return BadRequest();
        _context.Entry(rights).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var rights = await _context.Rights.FindAsync(id);
        if (rights == null) return NotFound();
        _context.Rights.Remove(rights);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}