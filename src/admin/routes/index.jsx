import { createBrowserRouter } from "react-router"
import App from "../pages/App"
import Layout from "../Layout"
import Home from "../pages/Home"
import Projects from "../pages/Projects"
import Services from "../pages/Services"
import Login from "../pages/Login"


let router = createBrowserRouter([
  {
    path: "/Login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/",
        Component: App,
      },
      {
        path: "/Home",
        Component: Home,
      },
      {
        path: "/Projects",
        Component: Projects,
      },
      {
        path: "/Services",
        Component: Services,
      },
    ],
  }
])

export default router