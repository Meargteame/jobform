const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const Question = require('../models/Question');
const Application = require('../models/Application');
const { generateSlug } = require('./slug');

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    // Ensure uploads directory and dummy sample CVs exist
    const uploadsDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const dummyCv1 = path.join(uploadsDir, 'sample_cv_abebe.pdf');
    const dummyCv2 = path.join(uploadsDir, 'sample_cv_selamawit.pdf');
    const dummyCv3 = path.join(uploadsDir, 'sample_cv_dawit.pdf');

    if (!fs.existsSync(dummyCv1)) {
      fs.writeFileSync(dummyCv1, '%PDF-1.4\n1 0 obj\n<< /Title (Abebe Bekele CV) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    }
    if (!fs.existsSync(dummyCv2)) {
      fs.writeFileSync(dummyCv2, '%PDF-1.4\n1 0 obj\n<< /Title (Selamawit Tadesse CV) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    }
    if (!fs.existsSync(dummyCv3)) {
      fs.writeFileSync(dummyCv3, '%PDF-1.4\n1 0 obj\n<< /Title (Dawit Haile CV) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    }

    console.log('Clearing old demo seed data...');
    const demoUser = await User.findOne({ email: 'demo@jobform.local' });
    if (demoUser) {
      const demoJobs = await Job.find({ recruiter: demoUser._id });
      const demoJobIds = demoJobs.map((j) => j._id);
      await Question.deleteMany({ job: { $in: demoJobIds } });
      await Application.deleteMany({ job: { $in: demoJobIds } });
      await Job.deleteMany({ recruiter: demoUser._id });
      await User.deleteOne({ _id: demoUser._id });
    }

    console.log('Creating demo recruiter: demo@jobform.local / Demo123456');
    const recruiter = await User.create({
      name: 'Yonile Recruitment Team',
      email: 'demo@jobform.local',
      password: 'Demo123456',
      companyName: 'Yonile Digital',
    });

    console.log('Creating demo job: Senior Full-Stack Developer');
    const slug = generateSlug('Senior Full-Stack Developer');
    const job = await Job.create({
      recruiter: recruiter._id,
      title: 'Senior Full-Stack Developer',
      companyName: 'Yonile Digital',
      location: 'Addis Ababa (Hybrid)',
      employmentType: 'Full-time',
      salary: '$70,000 - $95,000 / year',
      description:
        'Yonile Digital is looking for an exceptional Senior Full-Stack Developer to spearhead our platform architecture, lead API design, and build delightful frontend experiences. You will collaborate directly with our engineering team and product managers to deliver scalable web applications.',
      requirements:
        '• 5+ years of experience with modern JavaScript / TypeScript, Node.js, and React\n• Strong proficiency in MongoDB, schema modeling, and indexing\n• Experience with state management, REST APIs, and authentication (JWT, OAuth)\n• Proven track record of writing maintainable, tested, and high-performance code\n• Strong communication skills and collaborative team spirit',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days ahead
      slug,
      status: 'published',
    });

    console.log('Creating application form questions...');
    const q1 = await Question.create({
      job: job._id,
      label: 'Years of Professional Experience',
      type: 'number',
      required: true,
      options: [],
      order: 0,
    });

    const q2 = await Question.create({
      job: job._id,
      label: 'GitHub or Portfolio Link',
      type: 'url',
      required: false,
      options: [],
      order: 1,
    });

    const q3 = await Question.create({
      job: job._id,
      label: 'Primary Frontend Framework Expertise',
      type: 'select',
      required: true,
      options: ['React', 'Vue', 'Angular', 'Svelte', 'Other'],
      order: 2,
    });

    const q4 = await Question.create({
      job: job._id,
      label: 'Preferred Work Mode',
      type: 'radio',
      required: true,
      options: ['Hybrid (2 days remote)', 'Full Remote', 'On-site Office'],
      order: 3,
    });

    const q5 = await Question.create({
      job: job._id,
      label: 'Technologies you are confident with',
      type: 'checkbox',
      required: false,
      options: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS', 'GraphQL'],
      order: 4,
    });

    const q6 = await Question.create({
      job: job._id,
      label: 'Why are you interested in joining Yonile Digital?',
      type: 'textarea',
      required: true,
      options: [],
      order: 5,
    });

    console.log('Creating demo applications...');
    // Candidate 1: Abebe Bekele (Applied)
    await Application.create({
      job: job._id,
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
        { question: q5._id, label: q5.label, type: q5.type, answer: ['React', 'Node.js', 'MongoDB'] },
        {
          question: q6._id,
          label: q6.label,
          type: q6.type,
          answer:
            'I have been tracking Yonile Digital’s growth in the fintech and SaaS space for two years. I am eager to apply my full-stack architecture background to help the team scale.',
        },
      ],
    });

    // Candidate 2: Selamawit Tadesse (Shortlisted)
    await Application.create({
      job: job._id,
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
        { question: q5._id, label: q5.label, type: q5.type, answer: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'] },
        {
          question: q6._id,
          label: q6.label,
          type: q6.type,
          answer:
            'I love working on customer-facing B2B applications with clean user interfaces and micro-optimizations. Yonile Digital has an excellent product philosophy that aligns with my values.',
        },
      ],
    });

    // Candidate 3: Dawit Haile (Rejected)
    await Application.create({
      job: job._id,
      fullName: 'Dawit Haile',
      email: 'dawit.h@example.com',
      phone: '+251 93 456 7890',
      cvUrl: '/uploads/sample_cv_dawit.pdf',
      status: 'rejected',
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      answers: [
        { question: q1._id, label: q1.label, type: q1.type, answer: '2' },
        { question: q2._id, label: q2.label, type: q2.type, answer: 'https://github.com/dawit-dev' },
        { question: q3._id, label: q3.label, type: q3.type, answer: 'Vue' },
        { question: q4._id, label: q4.label, type: q4.type, answer: 'On-site Office' },
        { question: q5._id, label: q5.label, type: q5.type, answer: ['React', 'Node.js'] },
        {
          question: q6._id,
          label: q6.label,
          type: q6.type,
          answer: 'Looking to transition into a senior role and learn from experienced developers.',
        },
      ],
    });

    // Create a 2nd draft job for testing draft state
    const draftSlug = generateSlug('Product Designer UI UX');
    await Job.create({
      recruiter: recruiter._id,
      title: 'Senior Product Designer',
      companyName: 'Yonile Digital',
      location: 'Remote',
      employmentType: 'Contract',
      salary: '$60,000 - $80,000',
      description: 'Help shape design systems and user journey experiences for our SaaS suite.',
      requirements: '• 3+ years in Figma and Design Systems\n• Strong portfolio of web applications',
      slug: draftSlug,
      status: 'draft',
    });

    console.log('✅ Demo seed data created successfully!');
    console.log('----------------------------------------------------');
    console.log('Recruiter Email:    demo@jobform.local');
    console.log('Recruiter Password: Demo123456');
    console.log('Published Job Slug: ' + slug);
    console.log('Public URL:         http://localhost:5173/apply/' + slug);
    console.log('----------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedData();
