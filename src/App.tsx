import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { useCallback, useMemo } from "react";

import HomePage from "./pages/HomePage";
import MainLayout from "./layouts/MainLayout";
import JobsPage from "./pages/JobsPage";
import NotFoundPage from "./pages/NotFoundPage";
import JobPage from "./pages/JobPage.tsx";
import AddJobPage from "./pages/AddJobPage";
import EditJobPage from "./pages/EditJobPage.tsx";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import {
  createJob,
  deleteJob as deleteJobById,
  updateJob,
} from "./services/jobsApi";
import type { JobFormInput } from "./types/job";

const App = () => {
  const { user } = useAuth();

  const addJob = useCallback(
    async (newJob: JobFormInput) => {
      if (!user) {
        throw new Error("You must be signed in to post a job.");
      }

      await createJob(newJob, user.id);
    },
    [user],
  );

  const updateJobById = useCallback(
    async (jobId: string, job: JobFormInput) => {
      if (!user) {
        throw new Error("You must be signed in to update a job.");
      }

      await updateJob(jobId, job, user.id);
    },
    [user],
  );

  const deleteJob = useCallback(
    async (jobId: string) => {
      if (!user) {
        throw new Error("You must be signed in to delete a job.");
      }

      await deleteJobById(jobId, user.id);
    },
    [user],
  );

  const router = useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/add-job"
                element={<AddJobPage addJobSubmit={addJob} />}
              />
              <Route
                path="/edit-job/:id"
                element={<EditJobPage updateJobSubmit={updateJobById} />}
              />
            </Route>

            <Route
              path="/jobs/:id"
              element={<JobPage deleteJob={deleteJob} />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>,
        ),
        {
          basename: import.meta.env.BASE_URL,
        },
      ),
    [addJob, updateJobById, deleteJob],
  );

  return <RouterProvider router={router} />;
};

export default App;
