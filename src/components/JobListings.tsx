import { useEffect, useMemo, useState } from "react";
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
  const urlSearchTerm = isHome ? "" : (searchParams.get("q") ?? "");
  const urlJobTypeRaw = isHome ? "All" : (searchParams.get("type") ?? "All");
  const urlJobType = isValidJobType(urlJobTypeRaw) ? urlJobTypeRaw : "All";
  const currentPage = isHome ? 1 : parsePage(searchParams.get("page"));

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearchTerm);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (isHome) {
      return;
    }

    if (searchTerm !== urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      setDebouncedSearchTerm(urlSearchTerm);
    }
  }, [isHome, searchTerm, urlSearchTerm]);

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

    const nextParams = new URLSearchParams(searchParams);
    const trimmedSearch = debouncedSearchTerm.trim();

    if (trimmedSearch.length > 0) {
      nextParams.set("q", trimmedSearch);
    } else {
      nextParams.delete("q");
    }

    if (currentPage > 1) {
      nextParams.set("page", String(currentPage));
    } else {
      nextParams.delete("page");
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearchTerm, isHome, currentPage, searchParams, setSearchParams]);

  useEffect(() => {
    let isActive = true;

    const fetchJobs = async () => {
      setLoading(true);

      try {
        if (isHome) {
          const data = await getJobs(3);

          if (!isActive) {
            return;
          }

          setJobs(data);
          setTotalPages(1);
          setTotalResults(data.length);
        } else {
          const result = await searchJobs({
            searchTerm: debouncedSearchTerm,
            jobType: urlJobType,
            page: currentPage,
            pageSize: PAGE_SIZE,
          });

          if (!isActive) {
            return;
          }

          if (result.total > 0 && currentPage > result.totalPages) {
            const nextParams = new URLSearchParams(searchParams);

            if (result.totalPages > 1) {
              nextParams.set("page", String(result.totalPages));
            } else {
              nextParams.delete("page");
            }

            setSearchParams(nextParams, { replace: true });
            return;
          }

          setJobs(result.jobs);
          setTotalPages(result.totalPages);
          setTotalResults(result.total);
        }

        setErrorMessage("");
      } catch (error) {
        console.log("Error fetching data", error);

        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Could not load jobs from the database.";

        setErrorMessage(`Could not load jobs from the database. ${message}`);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isActive = false;
    };
  }, [
    isHome,
    debouncedSearchTerm,
    urlJobType,
    currentPage,
    searchParams,
    setSearchParams,
  ]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [startPage, endPage]);

  const showFullSpinner = loading && jobs.length === 0;

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
                value={urlJobType}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  const nextParams = new URLSearchParams(searchParams);

                  if (isValidJobType(nextValue) && nextValue !== "All") {
                    nextParams.set("type", nextValue);
                  } else {
                    nextParams.delete("type");
                  }

                  nextParams.delete("page");
                  setSearchParams(nextParams, { replace: true });
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

        {!isHome && loading && jobs.length > 0 && (
          <p className="mb-4 text-center text-sm text-indigo-700">
            Loading next page...
          </p>
        )}

        {showFullSpinner ? (
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
                  onClick={() => {
                    const nextPage = Math.max(1, currentPage - 1);
                    const nextParams = new URLSearchParams(searchParams);

                    if (nextPage > 1) {
                      nextParams.set("page", String(nextPage));
                    } else {
                      nextParams.delete("page");
                    }

                    setSearchParams(nextParams, { replace: true });
                  }}
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
                    onClick={() => {
                      const nextParams = new URLSearchParams(searchParams);

                      if (page > 1) {
                        nextParams.set("page", String(page));
                      } else {
                        nextParams.delete("page");
                      }

                      setSearchParams(nextParams, { replace: true });
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="px-3 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    const nextPage = Math.min(totalPages, currentPage + 1);
                    const nextParams = new URLSearchParams(searchParams);

                    if (nextPage > 1) {
                      nextParams.set("page", String(nextPage));
                    } else {
                      nextParams.delete("page");
                    }

                    setSearchParams(nextParams, { replace: true });
                  }}
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
