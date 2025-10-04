import { Server, Response } from "miragejs";
import { db, Job, JobStatus, Candidate, CandidateStage, AssessmentBuilder, AssessmentSection, AssessmentResponse } from "@/utils/db";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

function randomDelay() {
  return Math.floor(200 + Math.random() * 1000);
}

function randomWriteFailure() {
  // 7% failure rate
  return Math.random() < 0.07;
}

const TAGS = [
  "HR",
  "Sales",
  "UI/UX",
  "Product",
  "Marketing",
  "Project",
  "Business",
  "Data",
  "SDE",
  "Intern",
];

const JOB_TITLES = [
  "HR Specialist",
  "Sales Representative",
  "UI/UX Designer",
  "Product Manager",
  "Marketing Manager",
  "Project Manager",
  "Business Analyst",
  "Data Analyst",
  "Product Analyst",
  "Data Scientist",
  "Junior SDE",
  "Senior SDE",
  "HR Intern",
  "Sales Intern",
  "Design Intern",
  "Backend Engineer",
  "Frontend Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "Customer Success Manager",
  "Technical Writer",
  "Recruiter",
  "Operations Manager",
  "Growth Marketer",
  "Program Manager",
];

const STAGES: CandidateStage[] = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function ensureSeeded() {
  const seeded = await db.meta.get("seeded");
  if (seeded?.value) return;

  // Jobs
  const now = Date.now();
  const statuses: JobStatus[] = ["active", "upcoming", "archived", "closed"];
  const jobs: Job[] = JOB_TITLES.slice(0, 25).map((title, i) => {
    const status = statuses[i % statuses.length];
    const slugBase = slugify(title);
    const slug = `${slugBase}-${i + 1}`;
    const job: Job = {
      id: nanoid(),
      title,
      slug,
      status,
      tags: [TAGS[i % TAGS.length]],
      order: i,
      description:
        "We are seeking a " +
        title +
        " to join our corporate team. Collaborate cross-functionally to deliver measurable impact.",
      requirements: [
        "Bachelor's degree or equivalent experience",
        "Strong communication skills",
        "Proficiency with modern tooling",
      ],
      stipend: i % 5 === 0 ? "₹25,000/month" : undefined,
      deadline: new Date(now + (i + 7) * 86400000).toISOString(),
      scope: "Own end-to-end execution and collaborate with stakeholders to drive outcomes.",
      createdAt: now - i * 86400000,
    };
    return job;
  });
  await db.jobs.bulkAdd(jobs);

  // Assessments: 3 sections per job, 10-15 questions total
  for (const job of jobs) {
    const sections: AssessmentSection[] = ["Assessment A", "Assessment B", "Assessment C"].map(
      (title, sIdx) => ({
        id: `${job.id}-sec-${sIdx + 1}`,
        title,
        questions: generateQuestions(job.id, sIdx, job.title),
      }),
    );
    const builder: AssessmentBuilder = {
      jobId: job.id,
      sections,
      updatedAt: Date.now(),
    };
    await db.assessments.put(builder);
  }

  // Candidates: 1000 with skills and resumeUrl
  const candidates: Candidate[] = [];
  const SKILLS = ["Communication","React","Node","SQL","Python","Data Analysis","Product","Design","Leadership","Testing","Marketing","Sales","Recruiting"];
  for (let i = 0; i < 1000; i++) {
    const job = jobs[i % jobs.length];
    const name = randomName();
    const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
    const stage = STAGES[i % STAGES.length];
    const skillCount = 2 + (i % 4);
    const skills = Array.from({ length: skillCount }).map(() => SKILLS[Math.floor(Math.random() * SKILLS.length)]);
    const genders = ["male","female","other"];
    const address = `${Math.floor(100 + Math.random() * 900)} ${["MG Road","Brigade Road","Park Street","Main Street"][i%4]}, City ${1 + (i%20)}`;
    const age = 20 + (i % 15);
    const experience = 1 + Math.floor(Math.random() * 10); // 1-10 years
    const linkedin = `https://www.linkedin.com/in/${name.toLowerCase().replace(/[^a-z]+/g, "-")}`;
    const gender = genders[i % genders.length];

    candidates.push({
      id: nanoid(),
      name,
      email,
      jobId: job.id,
      stage,
      resumeUrl: `https://example.com/resumes/${i + 1}.pdf`,
      skills,
      address,
      age,
      experience,
      linkedin,
      gender,
      createdAt: now - Math.floor(Math.random() * 60) * 86400000,
    });
  }
  await db.candidates.bulkAdd(candidates);

  // Basic timeline entries
  for (const c of candidates.slice(0, 200)) {
    await db.timelines.add({
      id: nanoid(),
      candidateId: c.id,
      type: "stage_change",
      stage: c.stage,
      at: c.createdAt + 3600000,
    });
  }

  await db.meta.put({ key: "seeded", value: true });
}

function randomName() {
  const first = [
    "Aarav",
    "Vivaan",
    "Aditya",
    "Vihaan",
    "Arjun",
    "Sai",
    "Ayaan",
    "Krishna",
    "Ishaan",
    "Rohan",
    "Sara",
    "Ananya",
    "Diya",
    "Aadhya",
    "Pari",
    "Anaya",
    "Aarohi",
    "Myra",
    "Ira",
    "Aisha",
  ];
  const last = [
    "Sharma",
    "Verma",
    "Patel",
    "Reddy",
    "Gupta",
    "Kumar",
    "Singh",
    "Iyer",
    "Das",
    "Nair",
  ];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
}

function generateQuestions(jobId: string, seed: number, jobTitle: string) {
  const qs: any[] = [];

  // role-based libraries
  const sdeCoding = [
    "Implement an algorithm to find the longest increasing subsequence and explain complexity.",
    "Write a function to detect if two strings are anagrams.",
    "Implement merge sort and explain its space/time complexity.",
    "Design a URL shortener data model and API endpoints.",
    "Describe a debounce vs throttle implementation in JS.",
  ];
  const dataPrompts = [
    "Explain how you would clean and prepare data for a machine learning model.",
    "Write SQL to find the top 3 products by sales this month.",
    "Describe how you would detect outliers in a dataset.",
    "Explain the bias-variance tradeoff.",
    "How would you validate a predictive model in production?",
  ];
  const designPrompts = [
    "Design a mobile onboarding flow for a social app and explain decisions.",
    "How would you improve the conversion rate of a signup form?",
    "Sketch (describe) a responsive dashboard layout for analytics.",
    "Describe how you would conduct usability testing for a new feature.",
    "Explain the tradeoffs between low-fidelity and high-fidelity prototypes.",
  ];
  const hrPrompts = [
    "Describe your approach to screening resumes for a role.",
    "How would you handle a high-performing employee who requests a raise beyond budget?",
    "Explain how you'd build an inclusive hiring process.",
    "Describe a time you resolved a conflict in a team.",
    "What metrics would you track for recruiting effectiveness?",
  ];
  const salesPrompts = [
    "Pitch a product to a potential enterprise client highlighting ROI.",
    "How would you handle an objection about price from a prospect?",
    "Describe how you would qualify leads for a SaaS product.",
    "Explain steps to negotiate contract terms with a client.",
    "How do you prioritize accounts in an account-based sales strategy?",
  ];

  const generalLogical = [
    "You have 9 balls, one is lighter. How do you find it with 2 weighings?",
    "If a train travels 60 miles in 1.5 hours, what's its average speed?",
    "Explain a strategy to solve the river crossing puzzle.",
  ];
  const generalGK = [
    { q: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyperlink Transfer Protocol", "HyperText Transmission Protocol"] },
    { q: "Who invented the World Wide Web?", options: ["Tim Berners-Lee", "Vint Cerf", "Linus Torvalds", "Alan Turing"] },
    { q: "What is the time complexity of binary search?", options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"] },
  ];

  // choose role bucket
  const title = jobTitle.toLowerCase();
  let roleSet = { coding: sdeCoding, data: dataPrompts, design: designPrompts, hr: hrPrompts, sales: salesPrompts };
  let primary: string = "general";
  if (title.includes("sde") || title.includes("engineer") || title.includes("developer") || title.includes("sde")) primary = "sde";
  else if (title.includes("data") || title.includes("scientist") || title.includes("analyst")) primary = "data";
  else if (title.includes("ui") || title.includes("ux") || title.includes("design")) primary = "design";
  else if (title.includes("hr") || title.includes("recruit")) primary = "hr";
  else if (title.includes("sales") || title.includes("marketing") || title.includes("growth")) primary = "sales";

  const count = 10;
  for (let i = 0; i < count; i++) {
    const id = `${jobId}-q-${seed}-${i}`;
    const mod = i % 4;
    if (mod === 0) {
      // coding / role-specific long text
      let qtext = "";
      if (primary === "sde") qtext = sdeCoding[(i + seed) % sdeCoding.length];
      else if (primary === "data") qtext = dataPrompts[(i + seed) % dataPrompts.length];
      else if (primary === "design") qtext = designPrompts[(i + seed) % designPrompts.length];
      else if (primary === "hr") qtext = hrPrompts[(i + seed) % hrPrompts.length];
      else if (primary === "sales") qtext = salesPrompts[(i + seed) % salesPrompts.length];
      else qtext = sdeCoding[(i + seed) % sdeCoding.length];
      qs.push({ id, type: "long_text", label: qtext, required: true, topic: "coding", maxLength: 1500 });
    } else if (mod === 1) {
      const text = generalLogical[(i + seed) % generalLogical.length];
      qs.push({ id, type: "short_text", label: text, topic: "logical", maxLength: 500 });
    } else if (mod === 2) {
      const obj = generalGK[(i + seed) % generalGK.length];
      qs.push({ id, type: "single_choice", label: obj.q, topic: "gk", required: true, options: obj.options });
    } else {
      const obj = [{ q: "Which data structure is LIFO?", options: ["Stack", "Queue", "Tree", "Graph"] }, { q: "Which SQL clause is used to filter results?", options: ["WHERE", "ORDER BY", "GROUP BY", "HAVING"] }][(i + seed) % 2];
      qs.push({ id, type: "multi_choice", label: obj.q, topic: "mcq", options: obj.options });
    }
  }

  if (qs.length > 2) {
    qs[qs.length - 1].showIf = { questionId: qs[0].id, equals: "A" };
  }
  return qs;
}

export function makeServer() {
  const server = new Server({
    routes() {
      this.timing = 0; // We'll manually delay
      this.namespace = "/api";

      this.get("/jobs", async (schema, request) => {
        await wait(randomDelay());
        const search = (request.queryParams["search"] || "").toLowerCase();
        const status = request.queryParams["status"] || "";
        const sort = request.queryParams["sort"] || "order";
        const page = parseInt(request.queryParams["page"] || "1");
        const pageSize = parseInt(request.queryParams["pageSize"] || "10");

        let all = await db.jobs.toArray();
        if (search) {
          all = all.filter(
            (j) => j.title.toLowerCase().includes(search) || j.slug.toLowerCase().includes(search),
          );
        }
        if (status) {
          all = all.filter((j) => j.status === status);
        }
        // Simple sort by order or createdAt
        if (sort === "order") all.sort((a, b) => a.order - b.order);
        if (sort === "-createdAt") all.sort((a, b) => b.createdAt - a.createdAt);

        const total = all.length;
        const start = (page - 1) * pageSize;
        const items = all.slice(start, start + pageSize);
        return { items, total, page, pageSize };
      });

      this.post("/jobs", async (_schema, request) => {
        await wait(randomDelay());
        if (randomWriteFailure()) return new Response(500, {}, { message: "Random failure" });
        const body = JSON.parse(request.requestBody || "{}");
        const title = (body.title || "").trim();
        if (!title) return new Response(400, {}, { message: "Title required" });
        const slugInput = (body.slug || slugify(title)).toLowerCase();
        const existing = await db.jobs.where("slug").equals(slugInput).first();
        if (existing) return new Response(400, {}, { message: "Slug must be unique" });

        const orderMax = (await db.jobs.count()) as number;
        const job: Job = {
          id: nanoid(),
          title,
          slug: slugInput,
          status: (body.status as JobStatus) || "active",
          tags: Array.isArray(body.tags) ? body.tags : [],
          order: orderMax,
          description: body.description || "",
          requirements: Array.isArray(body.requirements) ? body.requirements : [],
          stipend: body.stipend,
          deadline: body.deadline,
          scope: body.scope,
          createdAt: Date.now(),
        };
        await db.jobs.add(job);
        return job;
      });

      this.patch("/jobs/:id", async (_schema, request) => {
        await wait(randomDelay());
        if (randomWriteFailure()) return new Response(500, {}, { message: "Random failure" });
        const id = request.params.id;
        const body = JSON.parse(request.requestBody || "{}");
        const existing = await db.jobs.get(id);
        if (!existing) return new Response(404, {}, { message: "Not found" });

        if (body.slug && body.slug !== existing.slug) {
          const dup = await db.jobs.where("slug").equals(body.slug).first();
          if (dup) return new Response(400, {}, { message: "Slug must be unique" });
        }
        const updated = { ...existing, ...body } as Job;
        await db.jobs.put(updated);
        return updated;
      });

      this.patch("/jobs/:id/reorder", async (_schema, request) => {
        await wait(randomDelay());
        if (randomWriteFailure()) return new Response(500, {}, { message: "Random failure" });
        const id = request.params.id;
        const { fromOrder, toOrder } = JSON.parse(request.requestBody || "{}");
        const all = await db.jobs.orderBy("order").toArray();
        const fromIdx = all.findIndex((j) => j.id === id);
        if (fromIdx === -1) return new Response(404, {}, { message: "Not found" });
        const [moved] = all.splice(fromIdx, 1);
        all.splice(toOrder, 0, moved);
        // Reassign order
        await db.transaction("rw", db.jobs, async () => {
          for (let i = 0; i < all.length; i++) {
            await db.jobs.update(all[i].id, { order: i });
          }
        });
        return { fromOrder, toOrder };
      });

      this.get("/candidates", async (_schema, request) => {
        await wait(randomDelay());
        const search = (request.queryParams["search"] || "").toLowerCase();
        const stage = request.queryParams["stage"] || "";
        const page = parseInt(request.queryParams["page"] || "1");
        const pageSize = parseInt(request.queryParams["pageSize"] || "50");

        let all = await db.candidates.toArray();
        if (search) {
          all = all.filter(
            (c) => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search),
          );
        }
        if (stage) all = all.filter((c) => c.stage === stage);
        const total = all.length;
        const start = (page - 1) * pageSize;
        const items = all.slice(start, start + pageSize);
        return { items, total, page, pageSize };
      });

      this.post("/candidates", async (_schema, request) => {
        await wait(randomDelay());
        if (randomWriteFailure()) return new Response(500, {}, { message: "Random failure" });
        const body = JSON.parse(request.requestBody || "{}");
        const name = (body.name || "").trim();
        const email = (body.email || "").toLowerCase();
        if (!name || !email) return new Response(400, {}, { message: "Name and email required" });
        const candidate: Candidate = {
          id: nanoid(),
          name,
          email,
          jobId: body.jobId,
          stage: (body.stage as CandidateStage) || "applied",
          resumeUrl: body.resumeUrl || "#",
          createdAt: Date.now(),
        };
        await db.candidates.add(candidate);
        return candidate;
      });

      this.patch("/candidates/:id", async (_schema, request) => {
        await wait(randomDelay());
        if (randomWriteFailure()) return new Response(500, {}, { message: "Random failure" });
        const id = request.params.id;
        const body = JSON.parse(request.requestBody || "{}");
        const existing = await db.candidates.get(id);
        if (!existing) return new Response(404, {}, { message: "Not found" });
        const updated = { ...existing, ...body } as Candidate;
        await db.candidates.put(updated);
        if (body.stage && body.stage !== existing.stage) {
          await db.timelines.add({
            id: nanoid(),
            candidateId: id,
            type: "stage_change",
            stage: body.stage,
            at: Date.now(),
          });
        }
        return updated;
      });

      this.get("/candidates/:id/timeline", async (_schema, request) => {
        await wait(randomDelay());
        const id = request.params.id;
        const items = await db.timelines.where("candidateId").equals(id).toArray();
        return { items: items.sort((a, b) => a.at - b.at) };
      });

      this.get("/assessments/:jobId", async (_schema, request) => {
        await wait(randomDelay());
        const jobId = request.params.jobId;
        const builder = await db.assessments.get(jobId);
        if (!builder) return { jobId, sections: [], updatedAt: Date.now() } as AssessmentBuilder;
        return builder;
      });

      this.put("/assessments/:jobId", async (_schema, request) => {
        await wait(randomDelay());
        if (randomWriteFailure()) return new Response(500, {}, { message: "Random failure" });
        const jobId = request.params.jobId;
        const body = JSON.parse(request.requestBody || "{}");
        const builder: AssessmentBuilder = { jobId, sections: body.sections || [], updatedAt: Date.now() };
        await db.assessments.put(builder);
        return builder;
      });

      this.post("/assessments/:jobId/submit", async (_schema, request) => {
        await wait(randomDelay());
        if (randomWriteFailure()) return new Response(500, {}, { message: "Random failure" });
        const jobId = request.params.jobId;
        const body = JSON.parse(request.requestBody || "{}");
        const resp: AssessmentResponse = {
          id: `${body.candidateId}-${jobId}-${Date.now()}`,
          candidateId: body.candidateId,
          jobId,
          answers: body.answers || {},
          at: Date.now(),
        };
        await db.responses.add(resp);
        return resp;
      });

      this.passthrough((req) => !req.url.includes("/api"));
    },
    seeds: () => {
      // We seed with Dexie below when server starts
    },
  });

  // Seed Dexie once per browser profile
  ensureSeeded();

  return server;
}
