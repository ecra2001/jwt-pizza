import { Page } from "@playwright/test";
import { test, expect } from "playwright-test-coverage";
import { User, Role } from "../src/service/pizzaService";

test("home page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
});

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  let mockUsers = [
  { id: 1, name: "Kai Chen", email: "d@jwt.com", roles: [{ role: Role.Diner }] },
  { id: 2, name: "Fran Cisco", email: "f@jwt.com", roles: [{ role: Role.Franchisee }] },
  { id: 3, name: "Adam Lazar", email: "a@jwt.com", roles: [{ role: Role.Admin }] },
];
  const validUsers: Record<string, User> = {
    "d@jwt.com": {
      id: "3",
      name: "Kai Chen",
      email: "d@jwt.com",
      password: "a",
      roles: [{ role: Role.Diner }],
    },
    "t@jwt.com": {
      id: "3",
      name: "test",
      email: "t@jwt.com",
      password: "t",
      roles: [{ role: Role.Diner }],
    },
    "f@jwt.com": {
      id: "5",
      name: "Fran Cisco",
      email: "f@jwt.com",
      password: "b",
      roles: [{ role: Role.Franchisee }],
    },
    "a@jwt.com": {
      id: "7",
      name: "Adam Lazar",
      email: "a@jwt.com",
      password: "c",
      roles: [{ role: Role.Admin }],
    },
  };
  let userFranchises = [
    {
      id: 2,
      name: "pizzaPocket",
      admins: [{ id: 5, name: "Fran Cisco", email: "f@jwt.com" }],
      stores: [{ id: 4, name: "Provo", totalRevenue: 0 }],
    },
  ];
  await page.route("*/**/api/auth", async (route) => {
    const method = route.request().method();

    if (method === "PUT") {
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
        return;
      }
      loggedInUser = validUsers[loginReq.email];
      const loginRes = {
        user: loggedInUser,
        token: "abcdef",
      };
      await route.fulfill({ json: loginRes });
      return;
    }

    if (method === "POST") {
  const registerReq = route.request().postDataJSON();
  const newUser = {
    id: mockUsers.length + 1,
    name: registerReq.name,
    email: registerReq.email,
    roles: [{ role: Role.Diner }],
  };
  mockUsers.push(newUser);

  const registerRes = {
    user: newUser,
    token: "ghijkl",
  };
  await route.fulfill({ json: registerRes });
  return;
}

    if (method === "DELETE") {
      await route.fulfill({
        status: 200,
        json: { message: "logout successful" },
      });
      return;
    }

    // If an unexpected method comes through, respond with an error so the test fails clearly
    await route.fulfill({
      status: 405,
      json: { error: `Unexpected method ${method}` },
    });
  });

  // Return the currently logged in user
  await page.route("*/**/api/user/me", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: loggedInUser });
  });

  // Update or Delete User
  await page.route(/\/api\/user\/\d+$/, async (route) => {
  const method = route.request().method();

  if (method === "PUT") {
    const updateReq = route.request().postDataJSON();

    const user = validUsers[updateReq.email] || loggedInUser;
    if (user) {
      user.name = updateReq.name || user.name;
      user.email = updateReq.email || user.email;
      user.password = updateReq.password || user.password;
      loggedInUser = user;
    }

    const updatedUser = {
      ...user,
      roles: [{ role: Role.Diner }],
    };

    await route.fulfill({ json: { user: updatedUser, token: "ghijkl" } });
  } else if (method === "DELETE") {
    const userId = Number(route.request().url().match(/\/api\/user\/(\d+)/)?.[1]);
    mockUsers = mockUsers.filter((u) => u.id !== userId);

    await route.fulfill({
      status: 200,
      json: { message: "user deleted" },
    });
    return;
  } else {
    await route.fulfill({ status: 405 });
  }
});

  // A standard menu
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: { franchises: userFranchises } });
  });

  // Get or Delete Franchises
  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({ json: userFranchises });
    } else if (method === "DELETE") {
      const franchiseId = 8;
      userFranchises = userFranchises.filter((s) => s.id !== franchiseId);
      await route.fulfill({ json: { message: "franchise deleted" } });
    } else {
      await route.fulfill({ status: 405 });
    }
  });

  // Create franchise
  await page.route(/\/api\/franchise$/, async (route) => {
    const body = route.request().postDataJSON();

    const newFranchise = {
      id: 8,
      name: body.name,
      admins: [{ id: 7, name: "Adam Lazar", email: "a@jwt.com" }],
      stores: [],
    };
    userFranchises.push(newFranchise);
    expect(route.request().method()).toBe("POST");
    await route.fulfill({ json: newFranchise });
  });

  // Create store
  await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
    const body = route.request().postDataJSON();

    const newStore = { id: 6, name: body.name, totalRevenue: 0 };
    userFranchises[0].stores.push(newStore);
    expect(route.request().method()).toBe("POST");
    await route.fulfill({ json: newStore });
  });

  // Delete store
  await page.route(/\/api\/franchise\/\d+\/store\/\d+$/, async (route) => {
    const storeId = 6;
    userFranchises[0].stores = userFranchises[0].stores.filter(
      (s) => s.id !== storeId
    );
    expect(route.request().method()).toBe("DELETE");
    await route.fulfill({ json: { message: "store deleted" } });
  });

  // Order a pizza.
  await page.route("*/**/api/order", async (route) => {
    const method = route.request().method();
    if (method === "POST") {
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23 },
        jwt: "eyJpYXQ",
      };
      await route.fulfill({ json: orderRes });
    }
    if (method === "GET") {
      const getRes = {
        dinerId: 4,
      orders: [
        {
          id: 1,
          franchiseId: 1,
          storeId: 4,
          date: "2024-06-05T05:14:40.000Z",
          items: [
            { id: 1, menuId: 1, description: "Veggie", price: 0.0038 },
            { id: 2, menuId: 2, description: "Pepperoni", price: 0.0042 },
          ],
        },
      ],
      page: 1,
      }
      await route.fulfill({ json: getRes });
    }
  });

// Get Users list
await page.route(/\/api\/user(\?.*)?$/, async (route) => {
  const method = route.request().method();

  if (method === "GET") {
    const url = new URL(route.request().url());
    const nameFilter = url.searchParams.get("name")?.toLowerCase() || "*";

    const filtered =
      nameFilter === "*"
        ? mockUsers
        : mockUsers.filter((u) =>
            u.name.toLowerCase().includes(nameFilter)
          );

    await route.fulfill({
      json: { users: filtered, more: false, page: 1, limit: 10 },
    });
    return;
  }

  await route.fulfill({ status: 405 });
});

  await page.goto("/");
}

test("login", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
});

test("purchase with login", async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByText("0.008")).toBeVisible();
});

test("register and logout", async ({ page }) => {
  await basicInit(page);
  // Register
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("test");
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("t@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("t");
  await page.getByRole("button", { name: "Register" }).click();

  //logout
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page.locator("#navbar-dark")).toContainText("Register");
});

test("franchisee login and create/delete store", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("f@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("b");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();
  await page
    .getByRole("heading", { name: "pizzaPocket" })
    .waitFor({ timeout: 3000 });
  await expect(page.getByRole("heading")).toContainText("pizzaPocket");
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByRole("textbox", { name: "store name" }).click();
  await page.getByRole("textbox", { name: "store name" }).fill("testStore");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.locator("tbody")).toContainText("testStore");
  await page
    .getByRole("row", { name: "testStore 0 ₿ Close" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("heading")).toContainText("Sorry to see you go");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("heading")).toContainText("pizzaPocket");
  await expect(page.locator("tbody")).not.toContainText("testStore");
});

test("invalid login", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("bad@login.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("bad");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("main")).toContainText('{"code":401}');
});

test("admin login and create franchise", async ({ page }) => {
  await basicInit(page);
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("c");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.locator("#navbar-dark")).toContainText("Admin");
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).fill("test");
  await page.getByRole("textbox", { name: "franchisee admin email" }).click();
  await page
    .getByRole("textbox", { name: "franchisee admin email" })
    .fill("a@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("table").first()).toContainText("test");
  await page
    .getByRole("row", { name: "test Adam Lazar Close" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("heading")).toContainText("Sorry to see you go");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
});

test("updateUser", async ({ page }) => {
  await basicInit(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("test");
  await page.getByRole("textbox", { name: "Email address" }).fill("t@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("t");
  await page.getByRole("button", { name: "Register" }).click();

  await page.getByRole("link", { name: "t", exact: true }).click();

  await expect(page.getByRole("main")).toContainText("test");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  await page.getByRole("textbox").first().fill("testtest");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  await expect(page.getByRole("main")).toContainText("testtest");

  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByRole("textbox", { name: "Email address" }).fill("t@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("t");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "t", exact: true }).click();

  await expect(page.getByRole("main")).toContainText("testtest");
});

test("get user list and delete user", async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('tester');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('tester@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('tester');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByLabel('Global')).toContainText('t');
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('c');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('main')).toContainText('tester@jwt.com');
  await page
  .getByRole('row', { name: /tester/i })
  .getByRole('button', { name: 'Delete' })
  .click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
  await expect(page.getByRole('main')).not.toContainText('tester@jwt.com');
});
