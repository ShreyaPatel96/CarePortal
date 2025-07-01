using System.Net;
using System.Text.Json;

namespace CarePortal.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new
        {
            error = new
            {
                message = exception.Message,
                statusCode = HttpStatusCode.InternalServerError
            }
        };

        switch (exception)
        {
            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = new
                {
                    error = new
                    {
                        message = "Unauthorized access",
                        statusCode = HttpStatusCode.Unauthorized
                    }
                };
                break;
            
            case ArgumentException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    error = new
                    {
                        message = exception.Message,
                        statusCode = HttpStatusCode.BadRequest
                    }
                };
                break;
            
            case InvalidOperationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    error = new
                    {
                        message = exception.Message,
                        statusCode = HttpStatusCode.BadRequest
                    }
                };
                break;
            
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }
} 