-- Replace this value with a real user id from auth.users.
-- Example:
-- select id, email from auth.users;
-- Then copy one id into the inserts below.

-- update this placeholder before running the script
-- 00000000-0000-0000-0000-000000000000

insert into public.jobs (
  title,
  type,
  description,
  location,
  salary,
  company_name,
  company_description,
  contact_email,
  contact_phone,
  created_by
)
values
(
  'Senior Backend Engineer (Node.js)',
  'Full-Time',
  'Build resilient APIs and distributed services used by millions of users. Own service design, reliability, observability, and performance tuning.',
  'Austin, TX',
  '$145K - $175K',
  'Northstar Cloud Systems',
  'Northstar Cloud Systems builds platform services for fast-growing SaaS companies.',
  'hiring@northstarcloud.io',
  '555-201-1001',
  '652d8502-31e9-419b-8631-0e49ebcfc98f'
),
(
  'Data Analyst',
  'Full-Time',
  'Partner with product and growth teams to define KPIs, build dashboards, and produce actionable insights.',
  'Chicago, IL',
  '$95K - $120K',
  'Insight Harbor',
  'Insight Harbor helps teams make high-confidence decisions through analytics engineering.',
  'careers@insightharbor.com',
  '555-201-1002',
  '652d8502-31e9-419b-8631-0e49ebcfc98f'
),
(
  'DevOps Engineer',
  'Full-Time',
  'Design and manage CI/CD pipelines, cloud infrastructure, and security controls.',
  'Seattle, WA',
  '$130K - $160K',
  'Pipeline Forge',
  'Pipeline Forge helps teams run secure, observable, and scalable cloud infrastructure.',
  'jobs@pipelineforge.dev',
  '555-201-1003',
  '652d8502-31e9-419b-8631-0e49ebcfc98f'
),
(
  'Product Manager (Platform)',
  'Full-Time',
  'Drive roadmap and execution for internal platform products that improve developer productivity.',
  'Denver, CO',
  '$125K - $150K',
  'Atlas Product Labs',
  'Atlas Product Labs builds collaboration and workflow tools for remote-first engineering organizations.',
  'talent@atlasproductlabs.com',
  '555-201-1004',
  '652d8502-31e9-419b-8631-0e49ebcfc98f'
),
(
  'UI/UX Designer',
  'Full-Time',
  'Shape product experiences from discovery to delivery and collaborate with engineering teams.',
  'San Diego, CA',
  '$100K - $130K',
  'Brightframe Studio',
  'Brightframe Studio designs intuitive digital experiences in healthcare, education, and finance.',
  'designcareers@brightframe.studio',
  '555-201-1005',
  '652d8502-31e9-419b-8631-0e49ebcfc98f'
),
(
  'Cybersecurity Analyst',
  'Full-Time',
  'Monitor security events, investigate alerts, and improve detection playbooks.',
  'Remote',
  '$110K - $135K',
  'SecureAxis',
  'SecureAxis delivers security operations and compliance automation for cloud-native teams.',
  'securityjobs@secureaxis.io',
  '555-201-1006',
  '652d8502-31e9-419b-8631-0e49ebcfc98f'
);
