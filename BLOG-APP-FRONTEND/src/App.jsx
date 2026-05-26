import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./components/RootLayout";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/ui/Loader";

// Dynamic lazy-loaded route imports
const Home = lazy(() => import("./components/Home"));
const Register = lazy(() => import("./components/Register"));
const Login = lazy(() => import("./components/Login"));
const UserProfile = lazy(() => import("./components/UserProfile"));
const UserProfileDetails = lazy(() => import("./components/UserProfileDetails"));
const AuthorProfile = lazy(() => import("./components/AuthorProfile"));
const AuthorArticles = lazy(() => import("./components/AuthorArticles"));
const EditArticle = lazy(() => import("./components/EditArticle"));
const WriteArticles = lazy(() => import("./components/WriteArticles"));
const ArticleByID = lazy(() => import("./components/ArticleByID"));
const Unauthorized = lazy(() => import("./components/Unauthorized"));
const AdminProfile = lazy(() => import("./components/AdminProfile"));
const NotFound = lazy(() => import("./components/NotFound"));

// Helper wrapper to enforce smooth visual transition loading states on route splits
const lazyLoad = (component) => (
  <Suspense fallback={<Loader message="Formulating layouts..." className="min-h-[50vh]" />}>
    {component}
  </Suspense>
);


function App() {
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "",
          element: lazyLoad(<Home />),
        },
        {
          path: "register",
          element: lazyLoad(<Register />),
        },
        {
          path: "login",
          element: lazyLoad(<Login />),
        },
        {
          path: "user-profile",
          element:(
            <ProtectedRoute allowedRoles={["USER"]}>
              {lazyLoad(<UserProfile />)}
            </ProtectedRoute>
          ),
        },
        {
          path: "profile/:id",
          element: lazyLoad(<UserProfileDetails />),
        },
        {
          path: "author-profile",
          element:(
            <ProtectedRoute allowedRoles={["AUTHOR"]}>
              {lazyLoad(<AuthorProfile />)}
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: lazyLoad(<AuthorArticles />),
            },
            {
              path: "articles",
              element: lazyLoad(<AuthorArticles />),
            },
            {
              path: "write-article",
              element: lazyLoad(<WriteArticles />),
            },
          ],
        },
        {
          path: "admin-profile",
          element:(
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              {lazyLoad(<AdminProfile />)}
            </ProtectedRoute>
          ),
        },
        {
          path: "article/:id",
          element: lazyLoad(<ArticleByID />),
        },
        {
          path: "edit-article",
          element: lazyLoad(<EditArticle />),
        },
        {
          path:"unauthorized",
          element: lazyLoad(<Unauthorized/>),
        },
        {
          path: "*",
          element: lazyLoad(<NotFound />),
        },
      ],
    },
  ]);

  return(
    <div>
      <Toaster position="top-center" reverseOrder={false}/>
      <RouterProvider router={routerObj} />;
    </div>
  )
}

export default App;