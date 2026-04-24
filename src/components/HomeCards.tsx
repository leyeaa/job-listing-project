import Card from "../components/Card";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomeCards = () => {
  const { user } = useAuth();

  return (
    <section className="py-4">
      <div className="container-xl lg:container m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <Card>
            <h2 className="text-2xl font-bold">For Tech Talent</h2>
            <p className="mt-2 mb-4">
              Discover opportunities across software engineering, product, data,
              design, and infrastructure.
            </p>
            <Link
              to="/jobs"
              className="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700"
            >
              Browse Jobs
            </Link>
          </Card>
          <Card bg="bg-indigo-100">
            <h2 className="text-2xl font-bold">For Employers</h2>
            <p className="mt-2 mb-4">
              Sign in and publish roles to connect with qualified tech
              professionals.
            </p>
            <Link
              to={user ? "/add-job" : "/login"}
              className="inline-block bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-600"
            >
              {user ? "Post a Job" : "Sign In to Post"}
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HomeCards;
