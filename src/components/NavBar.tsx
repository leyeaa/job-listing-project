import logo from "../assets/images/logo.png";
import {
  NavLink,
  useNavigate,
  type NavLinkRenderProps,
} from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: NavLinkRenderProps) =>
    isActive
      ? "text-white bg-black hover:bg-gray-900 hover:text-white rounded-md px-3 py-2"
      : "text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
      navigate("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not sign out.";
      toast.error(message);
    }
  };

  return (
    <nav className="bg-indigo-700 border-b border-indigo-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            {/* <!-- Logo --> */}
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
              <img className="h-10 w-auto" src={logo} alt="Tech Jobs Hub" />
              <span className="hidden md:block text-white text-2xl font-bold ml-2">
                Tech Jobs Hub
              </span>
            </NavLink>
            <div className="md:ml-auto">
              <div className="flex items-center space-x-2">
                <NavLink to="/" className={linkClass}>
                  Home
                </NavLink>
                <NavLink to="/jobs" className={linkClass}>
                  Jobs
                </NavLink>
                {user ? (
                  <>
                    <NavLink to="/add-job" className={linkClass}>
                      Post Job
                    </NavLink>
                    <button
                      onClick={handleSignOut}
                      className="text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2"
                      type="button"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <NavLink to="/login" className={linkClass}>
                    Sign In
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
