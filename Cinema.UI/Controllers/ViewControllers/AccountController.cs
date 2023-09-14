using Cinema.Entities.Contexts;
using Cinema.Entities.UserEntities;
using Cinema.UI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Cinema.UI.Controllers.ViewControllers
{
    public class AccountController : Controller
    {

        private UserManager<CustomIdentityUser> _userManager;
        private RoleManager<CustomIdentityRole> _roleManager;
        private SignInManager<CustomIdentityUser> _signInManager;
        private readonly CinemaDbContext dbContext;
        public AccountController(UserManager<CustomIdentityUser> userManager,
            RoleManager<CustomIdentityRole> roleManager,
            SignInManager<CustomIdentityUser> signInManager,CinemaDbContext cinemaDbContext)
        //IExtendedCustomIdentityUserService userService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            dbContext = cinemaDbContext;
        }


        public IActionResult MainPage()
        {
            return View();
        }

        public IActionResult AdminLogin()
        {
            return View();
        }

        [Authorize(Roles = "Admin")]
        public ActionResult RegisterEditor()
        {
            return View();
        }

        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<ActionResult> Login(LoginViewModel model)
        {

            if (!dbContext.Users.Any(u => u.UserName == "admin"))
            {

                CustomIdentityUser user = new CustomIdentityUser
                {

                    UserName = "admin"
                };
                IdentityResult result = _userManager.CreateAsync(user, "Admin123_").Result;

                if (result.Succeeded)
                {
                    if (!_roleManager.RoleExistsAsync("Admin").Result)
                    {
                        CustomIdentityRole role = new CustomIdentityRole
                        {
                            Name = "Admin"
                        };

                        IdentityResult roleResult = _roleManager.CreateAsync(role).Result;
                        if (!roleResult.Succeeded)
                        {
                            ModelState.AddModelError("", "We can not add the role");
                            //return View(model);
                        }
                    }

                    _userManager.AddToRoleAsync(user, "Admin").Wait();

                }
            }

            if (ModelState.IsValid)
            {
                var result = _signInManager.PasswordSignInAsync(model.UserName, model.Password, true, false).Result;
                if (result.Succeeded)
                {
                    return RedirectToAction("MainPage", "Account");
                }
                ModelState.AddModelError("", "Invalid Login");
            }
            return Ok();
        }


        //public async Task<IActionResult> LogOut()
        //{
        //    var user = await _userManager.GetUserAsync(httpContextAccessor.HttpContext.User);

        //    if (user != null)
        //    {
        //        var userItem = _userService.GetById(user.Id);
        //        userItem.IsOnline = false;
        //        _userService.Update(userItem);
        //    }
        //    _signInManager.SignOutAsync().Wait();
        //    return RedirectToAction("Login", "Account");
        //}
    }
}

