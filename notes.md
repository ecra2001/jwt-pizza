# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      |home.jsx|none|none|
| Register new user<br/>(t@jwt.com, pw: test)         |register.jsx|[POST] /api/auth|INSERT INTO user (name, email, password) VALUES (?, ?, ?) INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)|
| Login new user<br/>(t@jwt.com, pw: test)            |login.jsx|[PUT] /api/auth|              |
| Order pizza                                         |menu.jsx and payment.jsx|[Post] /api/order|              |
| Verify pizza                                        |delivery.jsx|[POST] /api/order/verify|none|
| View profile page                                   |view.jsx|[GET] /api/order|              |
| View franchise<br/>(as diner)                       |dinerDashboard.jsx|[GET] /api/menu, /api/franchise|              |
| Logout                                              |logout.jsx|[DELETE] /api/auth|              |
| View About page                                     |about.jsx|none|none|
| View History page                                   |history.jsx|none|none|
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |login.jsx|[PUT] /api/auth|              |
| View franchise<br/>(as franchisee)                  |franchiseDashboard.jsx|[GET] api/franchise/${user.id}|             |
| Create a store                                      |createStore.jsx|[GET] api/franchise/${user.id}
[POST] /api/franchise/${franchise.id}/store|              |
| Close a store                                       |closeStore.jsx|[GET] api/franchise/${user.id}
[POST] /api/franchise/${franchise.id}/store/${store.id}|              |
| Login as admin<br/>(a@jwt.com, pw: admin)           |login.jsx|[PUT] /api/auth|              |
| View Admin page                                     |adminDashboard.jsx|[GET] api/franchise|              |
| Create a franchise for t@jwt.com                    |createFranchise.jsx|[POST] api/franchise|              |
| Close the franchise for t@jwt.com                   |closeFranchise.jsx|[DELETE] /api/franchise/${franchise.id}|              |
