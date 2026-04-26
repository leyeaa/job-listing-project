import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import JobListing from "./JobListing";
import Spinner from "./Spinner";
import { getJobs, searchJobs } from "../services/jobsApi";
import type { Job } from "../types/job";

interface Props {
  isHome?: boolean;
}

const PAGE_SIZE = 6;
const JOB_TYPE_OPTIONS = [
  "All",
  "Full-Time",
  "Part-Time",
  "Contract",
  "Remote",
  "Internship",
] as const;

type JobTypeOption = (typeof JOB_TYPE_OPTIONS)[number];

const isValidJobType = (value: string): value is JobTypeOption =>
  JOB_TYPE_OPTIONS.includes(value as JobTypeOption);

const parsePage = (value: string | null) => {
  const parsed = Number(value ?? "1");

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
};

const JobListings = ({ isHome = false }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitializedFiltersRef = useRef(false);
  const isApplyingUrlStateRef = useRef(false);
  const isApplyingInternalParamsRef = useRef(false);

  const initialSearchTerm = isHome ? "" : (searchParams.get("q") ?? "");
  const initialJobTypeParam = isHome
    ? "All"
    : (searchParams.get("type") ?? "All");
  const initialJobType = isValidJobType(initialJobTypeParam)
    ? initialJobTypeParam
    : "All";
  const initialPage = isHome ? 1 : parsePage(searchParams.get("page"));

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(initialSearchTerm);
  const [jobType, setJobType] = useState<JobTypeOption>(initialJobType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (isHome) {
      return;
    }

    if (!hasInitializedFiltersRef.current) {
      hasInitializedFiltersRef.current = true;
      return;
    }

    if (isApplyingUrlStateRef.current) {
      isApplyingUrlStateRef.current = false;
      return;
    }

    setCurrentPage(1);
  }, [debouncedSearchTerm, jobType, isHome]);

  useEffect(() => {
    if (isHome) {
      return;
    }

    if (isApplyingInternalParamsRef.current) {
      isApplyingInternalParamsRef.current = false;
      return;
    }

    const urlSearchTerm = searchParams.get("q") ?? "";
    const urlJobTypeRaw = searchParams.get("type") ?? "All";
    const urlJobType = isValidJobType(urlJobTypeRaw) ? urlJobTypeRaw : "All";
    const urlPage = parsePage(searchParams.get("page"));

    let shouldApplyUrlState = false;

    if (urlSearchTerm !== searchTerm) {
      shouldApplyUrlState = true;
      setSearchTerm(urlSearchTerm);
      setDebouncedSearchTerm(urlSearchTerm);
    }

    if (urlJobType !== jobType) {
      shouldApplyUrlState = true;
      setJobType(urlJobType);
    }

    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }

    if (shouldApplyUrlState) {
      isApplyingUrlStateRef.current = true;
    }
  }, [isHome, searchParams, searchTerm, jobType, currentPage]);

  useEffect(() => {
    if (isHome) {
      return;
    }

    const nextParams = new URLSearchParams();
    const trimmedSearch = debouncedSearchTerm.trim();

    if (trimmedSearch.length > 0) {
      nextParams.set("q", trimmedSearch);
    }

    if (jobType !== "All") {
      nextParams.set("type", jobType);
    }

    if (currentPage > 1) {
      nextParams.set("page", String(currentPage));
    }

    if (nextParams.toString() !== searchParams.toString()) {
      isApplyingInternalParamsRef.current = true;
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    isHome,
    debouncedSearchTerm,
    jobType,
    currentPage,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);

      try {
        if (isHome) {
          const data = await getJobs(3);
          setJobs(data);
          setTotalPages(1);
          setTotalResults(data.length);
        } else {
          const result = await searchJobs({
            searchTerm: debouncedSearchTerm,
            jobType,
            page: currentPage,
            pageSize: PAGE_SIZE,
          });

          if (result.total > 0 && currentPage > result.totalPages) {
            setCurrentPage(result.totalPages);
            return;
          }

          setJobs(result.jobs);
          setTotalPages(result.totalPages);
          setTotalResults(result.total);
        }

        setErrorMessage("");
      } catch (error) {
        console.log("Error fetching data", error);
        const message =
          error instanceof Error
            ? error.message
            : "Could not load jobs from the database.";

        setErrorMessage(`Could not load jobs from the database. ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isHome, debouncedSearchTerm, jobType, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setJobType("All");
    setCurrentPage(1);
  };

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const visiblePages: number[] = [];

  for (let page = startPage; page <= endPage; page += 1) {
    visiblePages.push(page);
  }

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? "Recent Jobs" : "Browse Jobs"}
        </h2>

        {!isHome && (
          <div className="bg-white rounded-lg border border-indigo-100 p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                className="border rounded px-3 py-2"
                placeholder="Search title, company, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="border rounded px-3 py-2"
                value={jobType}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setJobType(isValidJobType(nextValue) ? nextValue : "All");
                }}
              >
                {JOB_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 rounded px-3 py-2"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              Showing {jobs.length} of {totalResults} jobs
            </p>
          </div>
        )}

        {loading ? (
          <Spinner loading={loading} />
        ) : errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {errorMessage}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-600">No jobs found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobListing key={job.id} job={job} />
              ))}
            </div>

            {!isHome && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  Prev
                </button>

                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`px-3 py-2 rounded border ${
                      page === currentPage
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="px-3 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default JobListings;
