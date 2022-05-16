using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ChatAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class _BaseController : ControllerBase
    {
        protected string GetUserId()
        {
            return User.FindFirst("Id")?.Value;
        }
    }
}
