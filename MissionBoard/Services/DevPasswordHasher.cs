// Development-only password hasher - DO NOT use in production
public class DevPasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        // For development, we'll use simple base64 encoding (NOT secure)
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(password));
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(hash));
            return decoded == password;
        }
        catch
        {
            // Fallback: direct comparison for existing plain text passwords
            return password == hash;
        }
    }
}