const crypto = require('crypto');
const bcrypt = require('bcryptjs');

let isMemoryModeActive = false;

const setMemoryMode = (active) => {
  isMemoryModeActive = active;
};

const isMemoryMode = () => isMemoryModeActive;

// In-memory collections
const store = {
  users: [],
  jobs: [],
  questions: [],
  applications: [],
};

const generateId = () => crypto.randomBytes(12).toString('hex');

class MemoryUser {
  constructor(data) {
    this._id = data._id || generateId();
    this.name = data.name;
    this.email = data.email?.toLowerCase().trim();
    this.password = data.password;
    this.companyName = data.companyName;
    this.createdAt = data.createdAt || new Date();
  }

  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    // Support bcrypt or direct comparison
    if (this.password.startsWith('$2')) {
      return await bcrypt.compare(candidatePassword, this.password);
    }
    return candidatePassword === this.password;
  }

  async save() {
    const idx = store.users.findIndex((u) => u._id === this._id);
    if (idx !== -1) store.users[idx] = this;
    return this;
  }

  toObject() {
    return { ...this };
  }
}

class MemoryJob {
  constructor(data) {
    this._id = data._id || generateId();
    this.recruiter = data.recruiter?.toString();
    this.title = data.title;
    this.companyName = data.companyName;
    this.description = data.description;
    this.location = data.location;
    this.employmentType = data.employmentType;
    this.salary = data.salary || '';
    this.requirements = data.requirements || '';
    this.deadline = data.deadline ? new Date(data.deadline) : null;
    this.slug = data.slug;
    this.status = data.status || 'draft';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = store.jobs.findIndex((j) => j._id === this._id);
    if (idx !== -1) store.jobs[idx] = this;
    return this;
  }

  toObject() {
    return { ...this };
  }
}

class MemoryQuestion {
  constructor(data) {
    this._id = data._id || generateId();
    this.job = data.job?.toString();
    this.label = data.label;
    this.type = data.type;
    this.required = Boolean(data.required);
    this.options = Array.isArray(data.options) ? [...data.options] : [];
    this.order = typeof data.order === 'number' ? data.order : 0;
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    const idx = store.questions.findIndex((q) => q._id === this._id);
    if (idx !== -1) store.questions[idx] = this;
    return this;
  }

  toObject() {
    return { ...this };
  }
}

class MemoryApplication {
  constructor(data) {
    this._id = data._id || generateId();
    this.job = data.job?.toString ? data.job.toString() : data.job;
    this.fullName = data.fullName;
    this.email = data.email?.toLowerCase().trim();
    this.phone = data.phone;
    this.cvUrl = data.cvUrl;
    this.answers = data.answers || [];
    this.status = data.status || 'applied';
    this.submittedAt = data.submittedAt || new Date();
  }

  async save() {
    const idx = store.applications.findIndex((a) => a._id === this._id);
    if (idx !== -1) store.applications[idx] = this;
    return this;
  }

  toObject() {
    return { ...this };
  }
}

// Memory Query helper supporting .sort(), .select(), .populate()
class QueryHelper {
  constructor(results) {
    this.results = results;
  }

  sort(sortObj) {
    if (!sortObj) return this;
    const field = Object.keys(sortObj)[0];
    const dir = sortObj[field];
    this.results.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (valA < valB) return dir === -1 ? 1 : -1;
      if (valA > valB) return dir === -1 ? -1 : 1;
      return 0;
    });
    return this;
  }

  select(fieldsStr) {
    return this;
  }

  populate(field) {
    if (field === 'job') {
      this.results = this.results.map((item) => {
        const copy = new MemoryApplication(item);
        const jobObj = store.jobs.find((j) => j._id === (item.job?._id || item.job));
        if (jobObj) copy.job = jobObj;
        return copy;
      });
    }
    return this;
  }

  then(resolve, reject) {
    return Promise.resolve(this.results).then(resolve, reject);
  }
}

class SingleQueryHelper {
  constructor(result) {
    this.result = result;
  }

  select(fieldsStr) {
    return this;
  }

  populate(field) {
    if (this.result && field === 'job') {
      const copy = new MemoryApplication(this.result);
      const jobObj = store.jobs.find((j) => j._id === (this.result.job?._id || this.result.job));
      if (jobObj) copy.job = jobObj;
      this.result = copy;
    }
    return this;
  }

  then(resolve, reject) {
    return Promise.resolve(this.result).then(resolve, reject);
  }
}

// Memory User Model Adapter
const memoryUser = {
  async findOne(query) {
    const email = query.email?.toLowerCase();
    const user = store.users.find((u) => u.email === email);
    return user || null;
  },

  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const user = new MemoryUser({ ...data, password: hashedPassword });
    store.users.push(user);
    return user;
  },

  findById(id) {
    const user = store.users.find((u) => u._id.toString() === id.toString());
    return new SingleQueryHelper(user ? new MemoryUser(user) : null);
  },
};

// Memory Job Model Adapter
const memoryJob = {
  find(query = {}) {
    let list = [...store.jobs];
    if (query.recruiter) {
      list = list.filter((j) => j.recruiter.toString() === query.recruiter.toString());
    }
    if (query.status) {
      list = list.filter((j) => j.status === query.status);
    }
    return new QueryHelper(list.map((j) => new MemoryJob(j)));
  },

  async findOne(query) {
    let job = null;
    if (query.slug) {
      job = store.jobs.find((j) => j.slug === query.slug);
    }
    return job ? new MemoryJob(job) : null;
  },

  async findById(id) {
    const job = store.jobs.find((j) => j._id.toString() === id.toString());
    return job ? new MemoryJob(job) : null;
  },

  async create(data) {
    const job = new MemoryJob(data);
    store.jobs.push(job);
    return job;
  },

  async findByIdAndDelete(id) {
    store.jobs = store.jobs.filter((j) => j._id.toString() !== id.toString());
    return true;
  },
};

// Memory Question Model Adapter
const memoryQuestion = {
  find(query = {}) {
    let list = [...store.questions];
    if (query.job) {
      list = list.filter((q) => q.job.toString() === query.job.toString());
    }
    return new QueryHelper(list.map((q) => new MemoryQuestion(q)));
  },

  findOne(query = {}) {
    let list = [...store.questions];
    if (query.job) {
      list = list.filter((q) => q.job.toString() === query.job.toString());
    }
    return {
      sort(sortObj) {
        const helper = new QueryHelper(list).sort(sortObj);
        return Promise.resolve(helper.results[0] ? new MemoryQuestion(helper.results[0]) : null);
      },
    };
  },

  async findById(id) {
    const q = store.questions.find((item) => item._id.toString() === id.toString());
    return q ? new MemoryQuestion(q) : null;
  },

  async create(data) {
    const q = new MemoryQuestion(data);
    store.questions.push(q);
    return q;
  },

  async findByIdAndDelete(id) {
    store.questions = store.questions.filter((item) => item._id.toString() !== id.toString());
    return true;
  },

  async updateMany(filter, update) {
    store.questions.forEach((q) => {
      if (filter.job && q.job.toString() === filter.job.toString()) {
        if (filter.order && filter.order.$gt !== undefined && q.order > filter.order.$gt) {
          if (update.$inc && update.$inc.order) {
            q.order += update.$inc.order;
          }
        }
      }
    });
    return true;
  },

  async deleteMany(filter) {
    if (filter.job) {
      if (filter.job.$in) {
        const ids = filter.job.$in.map((id) => id.toString());
        store.questions = store.questions.filter((q) => !ids.includes(q.job.toString()));
      } else {
        store.questions = store.questions.filter((q) => q.job.toString() !== filter.job.toString());
      }
    }
    return true;
  },

  async countDocuments(filter = {}) {
    if (filter.job) {
      return store.questions.filter((q) => q.job.toString() === filter.job.toString()).length;
    }
    return store.questions.length;
  },
};

// Memory Application Model Adapter
const memoryApplication = {
  find(filter = {}) {
    let list = [...store.applications];
    if (filter.job) {
      if (filter.job.$in) {
        const ids = filter.job.$in.map((id) => id.toString());
        list = list.filter((a) => ids.includes(a.job.toString()));
      } else {
        list = list.filter((a) => a.job.toString() === filter.job.toString());
      }
    }
    if (filter.status) {
      list = list.filter((a) => a.status === filter.status);
    }
    if (filter.$or) {
      const searchRegex = filter.$or[0].fullName;
      list = list.filter(
        (a) =>
          searchRegex.test(a.fullName) ||
          searchRegex.test(a.email)
      );
    }
    return new QueryHelper(list.map((a) => new MemoryApplication(a)));
  },

  findById(id) {
    const app = store.applications.find((a) => a._id.toString() === id.toString());
    return new SingleQueryHelper(app ? new MemoryApplication(app) : null);
  },

  async create(data) {
    const app = new MemoryApplication(data);
    store.applications.push(app);
    return app;
  },

  async countDocuments(filter = {}) {
    let list = store.applications;
    if (filter.job) {
      if (filter.job.$in) {
        const ids = filter.job.$in.map((id) => id.toString());
        list = list.filter((a) => ids.includes(a.job.toString()));
      } else {
        list = list.filter((a) => a.job.toString() === filter.job.toString());
      }
    }
    if (filter.status) {
      list = list.filter((a) => a.status === filter.status);
    }
    return list.length;
  },

  async aggregate(pipeline) {
    // We only use aggregate to group applications by job or status
    const matchStage = pipeline.find((p) => p.$match);
    let list = store.applications;
    if (matchStage && matchStage.$match.job) {
      if (matchStage.$match.job.$in) {
        const ids = matchStage.$match.job.$in.map((id) => id.toString());
        list = list.filter((a) => ids.includes(a.job.toString()));
      } else {
        list = list.filter((a) => a.job.toString() === matchStage.$match.job.toString());
      }
    }

    const groupStage = pipeline.find((p) => p.$group);
    if (groupStage) {
      const field = groupStage.$group._id === '$job' ? 'job' : 'status';
      const grouped = {};
      list.forEach((item) => {
        const key = item[field]?.toString();
        grouped[key] = (grouped[key] || 0) + 1;
      });
      return Object.entries(grouped).map(([key, count]) => ({ _id: key, count }));
    }
    return [];
  },

  async deleteMany(filter) {
    if (filter.job) {
      if (filter.job.$in) {
        const ids = filter.job.$in.map((id) => id.toString());
        store.applications = store.applications.filter((a) => !ids.includes(a.job.toString()));
      } else {
        store.applications = store.applications.filter((a) => a.job.toString() !== filter.job.toString());
      }
    }
    return true;
  },
};

// Seed default initial data into memory store
const seedMemoryStore = async () => {
  if (store.users.length > 0) return;

  const demoUser = await memoryUser.create({
    name: 'Yonile Recruitment Team',
    email: 'demo@betterform.local',
    password: 'Demo123456',
    companyName: 'Yonile Digital',
  });

  // Also support demo@jobform.local for legacy sessions
  store.users.push(new MemoryUser({
    _id: demoUser._id,
    name: demoUser.name,
    email: 'demo@jobform.local',
    password: demoUser.password,
    companyName: demoUser.companyName,
    createdAt: demoUser.createdAt,
  }));

  const job1 = await memoryJob.create({
    recruiter: demoUser._id,
    title: 'Senior Full-Stack Developer',
    companyName: 'Yonile Digital',
    location: 'Addis Ababa (Hybrid)',
    employmentType: 'Full-time',
    salary: '$70,000 - $95,000 / year',
    description:
      'Yonile Digital is looking for an exceptional Senior Full-Stack Developer to spearhead our platform architecture, lead API design, and build delightful frontend experiences. You will collaborate directly with our engineering team and product managers to deliver scalable web applications.',
    requirements:
      '• 5+ years of experience with modern JavaScript / TypeScript, Node.js, and React\n• Strong proficiency in MongoDB, schema modeling, and indexing\n• Experience with state management, REST APIs, and authentication\n• Strong communication skills and collaborative team spirit',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    slug: 'senior-full-stack-developer-8f31',
    status: 'published',
  });

  const q1 = await memoryQuestion.create({
    job: job1._id,
    label: 'Years of Professional Experience',
    type: 'number',
    required: true,
    options: [],
    order: 0,
  });

  const q2 = await memoryQuestion.create({
    job: job1._id,
    label: 'GitHub or Portfolio Link',
    type: 'url',
    required: false,
    options: [],
    order: 1,
  });

  const q3 = await memoryQuestion.create({
    job: job1._id,
    label: 'Primary Frontend Framework Expertise',
    type: 'select',
    required: true,
    options: ['React', 'Vue', 'Angular', 'Svelte', 'Other'],
    order: 2,
  });

  const q4 = await memoryQuestion.create({
    job: job1._id,
    label: 'Preferred Work Mode',
    type: 'radio',
    required: true,
    options: ['Hybrid (2 days remote)', 'Full Remote', 'On-site Office'],
    order: 3,
  });

  const q5 = await memoryQuestion.create({
    job: job1._id,
    label: 'Why are you interested in joining Yonile Digital?',
    type: 'textarea',
    required: true,
    options: [],
    order: 4,
  });

  await memoryApplication.create({
    job: job1._id,
    fullName: 'Abebe Bekele',
    email: 'abebe.bekele@example.com',
    phone: '+251 91 123 4567',
    cvUrl: '/uploads/sample_cv_abebe.pdf',
    status: 'applied',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    answers: [
      { question: q1._id, label: q1.label, type: q1.type, answer: '5' },
      { question: q2._id, label: q2.label, type: q2.type, answer: 'https://github.com/abebe-bekele' },
      { question: q3._id, label: q3.label, type: q3.type, answer: 'React' },
      { question: q4._id, label: q4.label, type: q4.type, answer: 'Hybrid (2 days remote)' },
      { question: q5._id, label: q5.label, type: q5.type, answer: 'Excited to build great developer products with your team.' },
    ],
  });

  await memoryApplication.create({
    job: job1._id,
    fullName: 'Selamawit Tadesse',
    email: 'selamawit.t@example.com',
    phone: '+251 92 987 6543',
    cvUrl: '/uploads/sample_cv_selamawit.pdf',
    status: 'shortlisted',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    answers: [
      { question: q1._id, label: q1.label, type: q1.type, answer: '6' },
      { question: q2._id, label: q2.label, type: q2.type, answer: 'https://github.com/selamawit-t' },
      { question: q3._id, label: q3.label, type: q3.type, answer: 'React' },
      { question: q4._id, label: q4.label, type: q4.type, answer: 'Full Remote' },
      { question: q5._id, label: q5.label, type: q5.type, answer: 'Passionate about performant UI and micro-interactions.' },
    ],
  });

  console.log('[MemoryStore] Pre-seeded demo recruiter & job: demo@betterform.local / Demo123456');
};

module.exports = {
  isMemoryMode,
  setMemoryMode,
  seedMemoryStore,
  memoryUser,
  memoryJob,
  memoryQuestion,
  memoryApplication,
};
