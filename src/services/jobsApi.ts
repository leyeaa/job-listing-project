import { getSupabaseClient } from "../lib/supabase";
import type { Job, JobFormInput } from "../types/job";

interface JobRow {
  id: number;
  title: string;
  type: string;
  description: string;
  location: string;
  salary: string;
  company_name: string;
  company_description: string;
  contact_email: string;
  contact_phone: string;
  created_by: string;
}

export interface SearchJobsOptions {
  searchTerm?: string;
  jobType?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchJobsResult {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const JOB_COLUMNS =
  "id,title,type,description,location,salary,company_name,company_description,contact_email,contact_phone,created_by";

const mapRowToJob = (row: JobRow): Job => ({
  id: String(row.id),
  title: row.title,
  type: row.type,
  description: row.description,
  location: row.location,
  salary: row.salary,
  company: {
    name: row.company_name,
    description: row.company_description,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
  },
  createdBy: row.created_by,
});

const mapFormToRow = (job: JobFormInput, createdBy: string) => ({
  title: job.title,
  type: job.type,
  description: job.description,
  location: job.location,
  salary: job.salary,
  company_name: job.company.name,
  company_description: job.company.description,
  contact_email: job.company.contactEmail,
  contact_phone: job.company.contactPhone,
  created_by: createdBy,
});

const parseJobId = (id: string) => {
  const parsed = Number(id);

  if (Number.isNaN(parsed)) {
    throw new Error("Invalid job id");
  }

  return parsed;
};

export const getJobs = async (limit?: number): Promise<Job[]> => {
  const client = getSupabaseClient();

  let query = client.from("jobs").select(JOB_COLUMNS).order("created_at", {
    ascending: false,
  });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as JobRow[]).map(mapRowToJob);
};

export const searchJobs = async (
  options: SearchJobsOptions = {},
): Promise<SearchJobsResult> => {
  const client = getSupabaseClient();

  const page = options.page && options.page > 0 ? options.page : 1;
  const pageSize =
    options.pageSize && options.pageSize > 0 ? options.pageSize : 6;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = client
    .from("jobs")
    .select(JOB_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (options.jobType && options.jobType !== "All") {
    query = query.eq("type", options.jobType);
  }

  if (options.searchTerm && options.searchTerm.trim().length > 0) {
    const term = options.searchTerm.trim();
    query = query.or(
      `title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,company_name.ilike.%${term}%`,
    );
  }

  const { data, error, count } = await query.range(start, end);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    jobs: (data as JobRow[]).map(mapRowToJob),
    total,
    page,
    pageSize,
    totalPages,
  };
};

export const getJobById = async (id: string): Promise<Job> => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("jobs")
    .select(JOB_COLUMNS)
    .eq("id", parseJobId(id))
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Job not found");
  }

  return mapRowToJob(data as JobRow);
};

export const createJob = async (
  job: JobFormInput,
  userId: string,
): Promise<Job> => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("jobs")
    .insert(mapFormToRow(job, userId))
    .select(JOB_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create job");
  }

  return mapRowToJob(data as JobRow);
};

export const updateJob = async (
  id: string,
  job: JobFormInput,
  userId: string,
): Promise<Job> => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("jobs")
    .update(mapFormToRow(job, userId))
    .eq("id", parseJobId(id))
    .eq("created_by", userId)
    .select(JOB_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("You can only update jobs that you created.");
  }

  return mapRowToJob(data as JobRow);
};

export const deleteJob = async (id: string, userId: string): Promise<void> => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("jobs")
    .delete()
    .eq("id", parseJobId(id))
    .eq("created_by", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("You can only delete jobs that you created.");
  }
};
