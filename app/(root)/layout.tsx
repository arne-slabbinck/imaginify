import MobileNav from '@/components/shared/MobileNav'
import Sidebar from '@/components/shared/Sidebar'

// This is where are the within the applicaton wll be

// Layout will typically export children and allow you to share UI for like navigation bar or footer
// You don't want to have your auth route to have the footer and the nav bar

// for your homepage bars you want to have your nav and footer bar within every single route
// instead of duplicating it in every route, you would just place it within it's layout

// Type of Children, layouts always have to export some children within them
const Layout = ({ children }: { children: React.ReactNode}) => {
  return (
    <main className="root">
      <Sidebar />
      <MobileNav />

        <div className="root-container">
            <div className="wrapper">
            {children}
            </div>
        </div>
    </main>
  )
}

export default Layout