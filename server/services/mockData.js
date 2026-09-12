// Pre-built mock data for popular topics to ensure the app works beautifully out of the box.

export const mockRoadmaps = {
  "frontend development": {
    title: "Frontend Development",
    description: "Learn how to design, build, and maintain modern, responsive, and interactive user interfaces for the web.",
    phases: [
      {
        id: "phase-1",
        title: "1. Web Core Foundations",
        description: "Start with the essential building blocks of all websites.",
        nodes: [
          {
            id: "html-basics",
            title: "HTML & Semantic Markup",
            description: "Learn how to structure pages with accessible and SEO-friendly HTML5 components.",
            estimatedTime: "3-5 days"
          },
          {
            id: "css-basics",
            title: "CSS Layouts & Flexbox/Grid",
            description: "Style web content, build responsive mobile layouts, and master Flexbox and Grid systems.",
            estimatedTime: "1-2 weeks"
          },
          {
            id: "git-basics",
            title: "Git & GitHub Version Control",
            description: "Track code changes, manage code branches, and collaborate with teams using version control.",
            estimatedTime: "2-3 days"
          }
        ]
      },
      {
        id: "phase-2",
        title: "2. JavaScript Programming",
        description: "Bring web pages to life with user interactions and data handling.",
        nodes: [
          {
            id: "js-basics",
            title: "JavaScript Syntax & DOM",
            description: "Master loops, functions, variables, object manipulation, and interacting with the DOM.",
            estimatedTime: "2 weeks"
          },
          {
            id: "js-async",
            title: "Asynchronous JS & Fetch API",
            description: "Learn how to work with Promises, Async/Await, and load real-world data from external APIs.",
            estimatedTime: "1 week"
          }
        ]
      },
      {
        id: "phase-3",
        title: "3. Modern Frameworks",
        description: "Build scalable client-side applications with components.",
        nodes: [
          {
            id: "react-core",
            title: "React Fundamentals",
            description: "Understand JSX, Props, local State, and standard React hooks like useState and useEffect.",
            estimatedTime: "3 weeks"
          },
          {
            id: "state-management",
            title: "Global State Management",
            description: "Handle large-scale data flow across routes using tools like Context API, Zustand, or Redux Toolkit.",
            estimatedTime: "1 week"
          }
        ]
      }
    ]
  },
  "machine learning": {
    title: "Machine Learning",
    description: "Go from mathematical basics to training, optimizing, and deploying deep learning models in production.",
    phases: [
      {
        id: "ml-phase-1",
        title: "1. Core Mathematics & Coding",
        description: "Establish the scientific and statistical groundwork.",
        nodes: [
          {
            id: "python-datascience",
            title: "Python & Data Libraries",
            description: "Write scientific Python using Jupyter notebooks, NumPy for matrices, and Pandas for datasets.",
            estimatedTime: "1-2 weeks"
          },
          {
            id: "ml-math",
            title: "Mathematics for ML",
            description: "Master the required linear algebra, multi-variable calculus, probability, and descriptive statistics.",
            estimatedTime: "3 weeks"
          }
        ]
      },
      {
        id: "ml-phase-2",
        title: "2. Classical Algorithms",
        description: "Learn the foundational statistical learning approaches.",
        nodes: [
          {
            id: "supervised-learning",
            title: "Supervised Learning",
            description: "Train Linear/Logistic Regressions, Decision Trees, Support Vector Machines, and Random Forests.",
            estimatedTime: "2 weeks"
          },
          {
            id: "unsupervised-learning",
            title: "Unsupervised Learning",
            description: "Group unstructured data using K-Means clustering, hierarchical clustering, and PCA dimensionality reduction.",
            estimatedTime: "1 week"
          }
        ]
      },
      {
        id: "ml-phase-3",
        title: "3. Deep Learning & MLOps",
        description: "Work with neural networks and deploy models to production.",
        nodes: [
          {
            id: "neural-networks",
            title: "Neural Networks & PyTorch",
            description: "Build deep architectures using PyTorch, understand backpropagation, and tune learning rates.",
            estimatedTime: "3 weeks"
          },
          {
            id: "mlops-deploy",
            title: "MLOps & Model Deployment",
            description: "Deploy models as web endpoints using FastAPI, containerize with Docker, and monitor models in production.",
            estimatedTime: "1-2 weeks"
          }
        ]
      }
    ]
  },
  "ux design": {
    title: "UX/UI Design",
    description: "Learn how to conduct user research, structure information architectures, and build gorgeous interactive interfaces.",
    phases: [
      {
        id: "ux-phase-1",
        title: "1. UX Foundations & Research",
        description: "Empathize with users and explore customer needs.",
        nodes: [
          {
            id: "user-research",
            title: "UX Research Methods",
            description: "Conduct user interviews, design surveys, draft personas, and map out customer user journeys.",
            estimatedTime: "1-2 weeks"
          },
          {
            id: "figma-prototyping",
            title: "Figma Prototyping",
            description: "Learn Figma styles, Auto Layout, components, and create clickable high-fidelity interactive flow mockups.",
            estimatedTime: "2 weeks"
          }
        ]
      }
    ]
  }
};

export const mockSubRoadmaps = {
  "html-basics": {
    title: "HTML & Semantic Markup Deep Dive",
    description: "Learn advanced document structures, accessibility guidelines (WCAG), and search engine optimization rules.",
    phases: [
      {
        id: "html-sub-1",
        title: "Phase 1: Semantics & Structure",
        description: "Writing meaningful markup for machines and users.",
        nodes: [
          {
            id: "html-semantic-elements",
            title: "HTML5 Layout Semantics",
            description: "Understand correct usage of tags like <main>, <section>, <article>, <aside>, and <nav>.",
            estimatedTime: "1-2 days"
          },
          {
            id: "html-accessibility",
            title: "Accessibility (a11y) & ARIA Roles",
            description: "Learn how screen readers interact with roles, state labels (aria-live, aria-expanded), and tabindex.",
            estimatedTime: "2-3 days"
          }
        ]
      }
    ]
  }
};

export const mockResources = {
  "html-basics": [
    { title: "MDN Web Docs: HTML Basics", type: "documentation", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics", platform: "Mozilla Developer Network" },
    { title: "HTML & CSS Complete Tutorial (Super Simple)", type: "video", url: "https://www.youtube.com/watch?v=mU6anWqODZs", platform: "YouTube" }
  ]
};

function populateRoadmapNodeResources(roadmap) {
  if (!roadmap || !roadmap.phases) return roadmap;
  roadmap.phases.forEach(phase => {
    if (phase.nodes) {
      phase.nodes.forEach(node => {
        if (!node.resources || node.resources.length === 0) {
          const cleanTitle = encodeURIComponent(node.title);
          node.resources = [
            {
              title: `Official ${node.title} Documentation`,
              type: "documentation",
              url: `https://www.google.com/search?q=${cleanTitle}+official+documentation`,
              platform: "Official Docs"
            },
            {
              title: `${node.title} Complete Video Tutorial`,
              type: "video",
              url: `https://www.youtube.com/results?search_query=${cleanTitle}+tutorial`,
              platform: "YouTube"
            },
            {
              title: `Interactive ${node.title} Playground`,
              type: "interactive",
              url: `https://freecodecamp.org`,
              platform: "FreeCodeCamp"
            }
          ];
        }
      });
    }
  });
  return roadmap;
}

export function generateFallbackMockRoadmap(topic) {
  const cleanTopic = topic.toLowerCase().trim();
  let baseRoadmap;

  if (mockRoadmaps[cleanTopic]) {
    baseRoadmap = JSON.parse(JSON.stringify(mockRoadmaps[cleanTopic]));
  } else {
    const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    baseRoadmap = {
      title: capitalizedTopic,
      description: `A generated learning path to help you master ${capitalizedTopic} from scratch.`,
      phases: [
        {
          id: "phase-1",
          title: "1. Foundational Core",
          description: `Get started with the introductory concepts of ${capitalizedTopic}.`,
          nodes: [
            {
              id: `mock-${cleanTopic}-intro`,
              title: `Introduction to ${capitalizedTopic}`,
              description: `Understand the fundamental concepts, history, and core objectives of ${capitalizedTopic}.`,
              estimatedTime: "3-5 days"
            },
            {
              id: `mock-${cleanTopic}-tools`,
              title: "Required Tools & Environments",
              description: "Install, configure, and get familiar with the essential tooling and development environments.",
              estimatedTime: "2 days"
            }
          ]
        },
        {
          id: "phase-2",
          title: "2. Intermediate Concepts",
          description: "Expand your knowledge into structural and advanced methodologies.",
          nodes: [
            {
              id: `mock-${cleanTopic}-core-methods`,
              title: "Core Methodologies",
              description: "Learn the primary syntax, frameworks, or process structures that power this field.",
              estimatedTime: "1-2 weeks"
            }
          ]
        },
        {
          id: "phase-3",
          title: "3. Project & Mastery",
          description: "Apply your skills by building production-grade solutions.",
          nodes: [
            {
              id: `mock-${cleanTopic}-project`,
              title: "Hands-on Capstone Project",
              description: `Combine all learning concepts to build a comprehensive ${capitalizedTopic} project.`,
              estimatedTime: "2 weeks"
            }
          ]
        }
      ]
    };
  }

  return populateRoadmapNodeResources(baseRoadmap);
}

export function generateFallbackMockSubRoadmap(nodeId, nodeTitle) {
  const cleanId = nodeId.toLowerCase();
  let baseSub;

  if (mockSubRoadmaps[cleanId]) {
    baseSub = JSON.parse(JSON.stringify(mockSubRoadmaps[cleanId]));
  } else {
    baseSub = {
      title: `${nodeTitle} Deep Dive`,
      description: `A detailed sub-roadmap specifically created to explore the details of ${nodeTitle}.`,
      phases: [
        {
          id: `${nodeId}-sub-1`,
          title: "Phase 1: Deep Theory",
          description: "Core internals and conceptual guidelines.",
          nodes: [
            {
              id: `${nodeId}-sub-theory-1`,
              title: `${nodeTitle} Concepts`,
              description: `In-depth exploration of core theories behind ${nodeTitle}.`,
              estimatedTime: "2 days"
            },
            {
              id: `${nodeId}-sub-theory-2`,
              title: "Advanced Internals",
              description: "Understand behind-the-scenes processes and system interactions.",
              estimatedTime: "3 days"
            }
          ]
        }
      ]
    };
  }

  return populateRoadmapNodeResources(baseSub);
}

export function generateFallbackMockCourseQuiz(roadmapTitle, phases = []) {
  const allNodes = phases.flatMap(p => p.nodes || []);
  const sampleSkills = allNodes.map(n => n.title).concat(["General Best Practices", "Performance Optimization", "Architecture"]);
  
  return Array.from({ length: 10 }, (_, i) => {
    const skill = sampleSkills[i % sampleSkills.length] || "Core Concept";
    return {
      id: `q${i + 1}`,
      targetSkill: skill,
      question: `Question ${i + 1}: What is the primary purpose of ${skill}?`,
      options: [
        `Option A: To optimize performance and streamline execution in ${skill}`,
        `Option B: To handle basic layout rendering without state updates`,
        `Option C: To enforce strict type definitions and linting rules`,
        `Option D: To manage external network connections`
      ],
      correctIndex: 0,
      explanation: `Option A is correct because ${skill} focuses on optimizing performance and execution.`
    };
  });
}

export function generateFallbackMockResources(nodeId, nodeTitle) {
  const cleanId = nodeId.toLowerCase();
  if (mockResources[cleanId]) {
    return JSON.parse(JSON.stringify(mockResources[cleanId]));
  }
  
  const cleanTitle = encodeURIComponent(nodeTitle);
  return [
    { title: `Official ${nodeTitle} Documentation`, type: "documentation", url: `https://www.google.com/search?q=${cleanTitle}+official+documentation`, platform: "Web Search" },
    { title: `${nodeTitle} Complete Beginner Tutorial`, type: "video", url: `https://www.youtube.com/results?search_query=${cleanTitle}+tutorial`, platform: "YouTube" }
  ];
}

export const STATIC_CURATED_ROADMAPS = [
  // Master Paths for College/University
  {
    title: "The Placement Playbook: DSA & Competitive Programming",
    desc: "Phases: 1. Core Data Structures (Linked Lists, Trees, Graphs), 2. Algorithmic Paradigms (Dynamic Programming, Greedy), 3. Mock Interviews & System Design Basics.",
    icon: "💻",
    tags: ["college_student", "placements", "software_engineering"]
  },
  {
    title: "Modern Full-Stack Web Development",
    desc: "Phases: 1. Frontend Architecture (React, Vite, CSS Grids), 2. Backend & APIs (Node.js, Express), 3. Database Management (MongoDB, SQL).",
    icon: "🌐",
    tags: ["college_student", "web_dev", "tech"]
  },
  {
    title: "Emerging Tech: Cybersecurity & Cloud",
    desc: "Phases: 1. Network Fundamentals (Packet capture, Wireshark), 2. Cloud Infrastructure (AWS VPCs, IAM policies), 3. Defensive Security (Wazuh, SIEM setup, intrusion detection).",
    icon: "🔒",
    tags: ["college_student", "cybersecurity", "cloud", "aws"]
  },
  
  // Master Paths for Working Professional
  {
    title: "From Contributor to Leader: Management 101",
    desc: "Phases: 1. Effective Communication & Conflict Resolution, 2. Project Management (Agile/Scrum), 3. Strategic Decision Making & Mentorship.",
    icon: "👔",
    tags: ["professional", "leadership", "soft_skills"]
  },
  {
    title: "Financial Independence & Wealth Building",
    desc: "Phases: 1. Budgeting & Debt Elimination, 2. Investment Vehicles (Mutual Funds, Stocks, Real Estate), 3. Tax Optimization & Retirement Planning.",
    icon: "💰",
    tags: ["professional", "finance", "investing"]
  },
  {
    title: "The Tech Pivot: Transitioning into IT",
    desc: "Phases: 1. Tech Industry Landscape, 2. Choosing a Lane (Product Management vs. Data Analysis vs. Code), 3. Building a Portfolio & Networking.",
    icon: "🔄",
    tags: ["professional", "career_change", "tech"]
  },

  // Master Paths for Hobbyist/Explorer
  {
    title: "Digital Freelancing & Remote Income",
    desc: "Phases: 1. Identifying Marketable Skills (Writing, Virtual Assistance, Design), 2. Setting up on Platforms (Upwork, Fiverr), 3. Client Communication & Invoicing.",
    icon: "🌍",
    tags: ["hobbyist", "freelance", "income"]
  },
  {
    title: "The Digital Creator: Photography & Content",
    desc: "Phases: 1. Camera Basics (Exposure Triangle, Composition), 2. Post-Processing (Lightroom/Photoshop basics), 3. Building an Audience on Social Media.",
    icon: "📸",
    tags: ["hobbyist", "creative", "photography"]
  },
  {
    title: "Starting a Small Home Business",
    desc: "Phases: 1. Market Research & Product Validation, 2. Logistics, Sourcing, & Packaging, 3. Digital Marketing & E-commerce setup (Shopify/Instagram).",
    icon: "🏠",
    tags: ["hobbyist", "entrepreneurship", "business"]
  },
  
  // High School / General Fallback Paths
  {
    title: "Science Stream (PCM) Path",
    desc: "A rigorous path for students entering Physics, Chemistry, and Math.",
    icon: "🔬",
    tags: ["high_school", "science (pcm)", "engineering"]
  },
  {
    title: "Commerce & Finance Path",
    desc: "A foundational path for commerce, accounting, and business administration.",
    icon: "📈",
    tags: ["high_school", "commerce", "finance"]
  },
  {
    title: "Arts & Humanities Journey",
    desc: "Explore history, sociology, political science, and creative thinking.",
    icon: "🎭",
    tags: ["high_school", "arts & humanities"]
  },
  {
    title: "Digital Photography 101",
    desc: "Master the exposure triangle, composition, and photo editing.",
    icon: "📷",
    tags: ["high_school", "photography", "creative arts"]
  },
  {
    title: "Intro to UI/UX Design",
    desc: "Learn wireframing, user research, and prototyping with Figma.",
    icon: "🎨",
    tags: ["web development", "design"]
  },
  {
    title: "Web Development Bootcamp",
    desc: "From HTML/CSS basics to advanced React applications.",
    icon: "💻",
    tags: ["web development", "software dev"]
  }
];
