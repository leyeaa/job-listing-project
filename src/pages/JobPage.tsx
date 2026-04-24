import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaMapMarker } from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { getJobById } from "../services/jobsApi";
import type { Job } from "../types/job";

interface Props {
  deleteJob: (id: string) => Promise<void>;
}

const JobPage = ({ deleteJob }: Props) => {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchJob = async () => {
      if (!id) {
        setErrorMessage("Invalid job id.");
        setLoading(false);
        return;
      }

      try {
        const data = await getJobById(id);

        if (!isMounted) {
          return;
        }

        setJob(data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Unable to load this job.";
        setErrorMessage(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJob();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isOwner = useMemo(() => {
    if (!job || !user) {
      return false;
    }

    return job.createdBy === user.id;
  }, [job, user]);

  const onClickDelete = async (jobId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteJob(jobId);
      toast.success("Job deleted successfully.");
      navigate("/jobs");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete this job.";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <section className="bg-indigo-50 min-h-[60vh]">
        <Spinner loading={true} />
      </section>
    );
  }

  if (errorMessage || !job) {
    return (
      <section className="bg-indigo-50 min-h-[60vh] py-20 px-6">
        <div className="container m-auto max-w-2xl rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <p>{errorMessage || "Job not found."}</p>
          <Link
            className="inline-block mt-4 text-indigo-700 hover:text-indigo-900"
            to="/jobs"
          >
            Back to jobs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/jobs"
            className="text-indigo-500 hover:text-indigo-600 flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Job Listings
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                <div className="text-gray-500 mb-4">{job.type}</div>
                <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                  <FaMapMarker className="text-orange-700 mr-1" />
                  <p className="text-orange-700">{job.location}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">
                  Job Description
                </h3>
                <p className="mb-4">{job.description}</p>

                <h3 className="text-indigo-800 text-lg font-bold mb-2">
                  Salary
                </h3>
                <p className="mb-4">{job.salary} / Year</p>
              </div>
            </main>

            <aside>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Company Info</h3>

                <h2 className="text-2xl">{job.company.name}</h2>
                <p className="my-2">{job.company.description}</p>

                <hr className="my-4" />

                <h3 className="text-xl">Contact Email:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {job.company.contactEmail}
                </p>

                <h3 className="text-xl">Contact Phone:</h3>
                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {job.company.contactPhone}
                </p>
              </div>

              {isOwner ? (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-xl font-bold mb-6">Manage Job</h3>
                  <Link
                    to={`/edit-job/${job.id}`}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                    Edit Job
                  </Link>
                  <button
                    onClick={() => onClickDelete(job.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                    Delete Job
                  </button>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-xl font-bold mb-2">Management Access</h3>
                  <p className="text-gray-700 text-sm">
                    Only the user who posted this job can edit or delete it.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default JobPage;
