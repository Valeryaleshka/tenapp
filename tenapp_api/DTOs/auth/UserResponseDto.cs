namespace TenappCore.DTOs;

public class UserResponseDto
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string SecondName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

