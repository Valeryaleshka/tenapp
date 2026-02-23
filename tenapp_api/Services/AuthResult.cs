namespace TenappCore.Services;

public class AuthResult<T>
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string? Error { get; init; }
    public T? Data { get; init; }

    public static AuthResult<T> Ok(T data)
    {
        return new AuthResult<T>
        {
            Success = true,
            StatusCode = StatusCodes.Status200OK,
            Data = data
        };
    }

    public static AuthResult<T> Fail(int statusCode, string error)
    {
        return new AuthResult<T>
        {
            Success = false,
            StatusCode = statusCode,
            Error = error
        };
    }
}

