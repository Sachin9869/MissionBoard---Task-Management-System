public class LoginResponse
{
    public string Token { get; set; }
    public string Username { get; set; }
    public string Role { get; set; }
    public string[] Permissions { get; set; }
    public int? OrganizationId { get; set; }
    public int? TeamId { get; set; }
    public DateTime ExpiresAt { get; set; }
}