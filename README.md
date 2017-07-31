# module-shared-code

Intended as a place to put non-UI code to be shared between Yewtu apps and services.

UI code for web and React Native should go in [module-ui-components](https://github.com/yewtu/module-ui-components).

## Login

Routes are provided to /login and /logout

To integrate the login routes and pass a user object to your app:

1. In your application routes file, [import the module](https://github.com/yewtu/app-b2b-marketplace/blob/d6243aafe0b2e5e4e99e04115ef96485294f366d/server/components/routes/app-routes.js#L7) then [enable the routes](https://github.com/yewtu/app-b2b-marketplace/blob/d6243aafe0b2e5e4e99e04115ef96485294f366d/server/components/routes/app-routes.js#L37). A middleware will be added that checks for the user cookie and assigns it to res.locals.user (or defaults to {})
2. Where your Redux store is created on the server, [add a 'user' key to the store](https://github.com/yewtu/app-b2b-marketplace/blob/d6243aafe0b2e5e4e99e04115ef96485294f366d/server/components/middleware/react-app/index.js#L31)
