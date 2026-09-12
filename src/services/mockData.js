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
            id: "info-architecture",
            title: "Information Architecture",
            description: "Learn how to structure app navigation, design sitemaps, and write clean labels for readability.",
            estimatedTime: "1 week"
          }
        ]
      },
      {
        id: "ux-phase-2",
        title: "2. Interaction Design & Wireframing",
        description: "Design low-fidelity sketches and test interactions.",
        nodes: [
          {
            id: "wireframing-lofi",
            title: "Lo-Fi Wireframing",
            description: "Quickly map out screen flows using paper layouts and simple digital block frames to test structure.",
            estimatedTime: "1 week"
          },
          {
            id: "figma-prototyping",
            title: "Figma Prototyping",
            description: "Learn Figma styles, Auto Layout, components, and create clickable high-fidelity interactive flow mockups.",
            estimatedTime: "2 weeks"
          }
        ]
      },
      {
        id: "ux-phase-3",
        title: "3. Visual Design & Handoff",
        description: "Apply graphic design principles and collaborate with engineers.",
        nodes: [
          {
            id: "visual-design-principles",
            title: "Visual Design & Typography",
            description: "Understand color theories, typography scales, spacing rules, and layout balance systems.",
            estimatedTime: "1 week"
          },
          {
            id: "developer-handoff",
            title: "Design Systems & Developer Handoff",
            description: "Organize reusable UI components in design libraries and deliver detailed style specs to developers.",
            estimatedTime: "3-5 days"
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
      },
      {
        id: "html-sub-2",
        title: "Phase 2: Metadata & Forms",
        description: "Input fields, SEO settings, and social meta.",
        nodes: [
          {
            id: "html-forms",
            title: "Advanced Forms & Inputs",
            description: "Master pattern validation, datalists, fieldsets, and custom interactive form controls.",
            estimatedTime: "2 days"
          },
          {
            id: "html-seo-meta",
            title: "Metadata, OpenGraph & SEO",
            description: "Configure description tags, robots.txt directives, and OpenGraph metadata for clean social previews.",
            estimatedTime: "1 day"
          }
        ]
      }
    ]
  },
  "react-core": {
    title: "React Fundamentals Deep Dive",
    description: "Explore the internal rendering cycle of React, state updates, hooks, and basic performance tuning.",
    phases: [
      {
        id: "react-sub-1",
        title: "Phase 1: Virtual DOM & Rendering",
        description: "Understand the core React runtime architecture.",
        nodes: [
          {
            id: "react-jsx-vdom",
            title: "JSX Transpilation & VDOM",
            description: "See how Babel transforms JSX to React.createElement and compiles the Virtual DOM tree.",
            estimatedTime: "2 days"
          },
          {
            id: "react-reconciliation",
            title: "Fiber Engine & Reconciliation",
            description: "Explore React's diffing algorithm and how key props prevent redundant re-renders.",
            estimatedTime: "2 days"
          }
        ]
      },
      {
        id: "react-sub-2",
        title: "Phase 2: Hooks Lifecycle",
        description: "Master state and effect scopes.",
        nodes: [
          {
            id: "react-state-batching",
            title: "State Batching & Functional Updates",
            description: "Learn how React schedules state transitions and when to use functional setters (prev => prev + 1).",
            estimatedTime: "1-2 days"
          },
          {
            id: "react-effects",
            title: "useEffect Lifecycle & Cleanups",
            description: "Master dependency arrays, connection handlers, and cleaning up timers or event listeners.",
            estimatedTime: "3 days"
          }
        ]
      }
    ]
  },
  "ml-math": {
    title: "Mathematics for ML Deep Dive",
    description: "Master the mathematical formulations of matrix operations, gradients, and statistical inferences.",
    phases: [
      {
        id: "math-sub-1",
        title: "Phase 1: Linear Algebra & Calculus",
        description: "The engine of optimization algorithms.",
        nodes: [
          {
            id: "math-matrices",
            title: "Matrix Operations & PCA",
            description: "Learn dot products, eigenvalues, eigenvectors, and singular value decomposition (SVD).",
            estimatedTime: "4 days"
          },
          {
            id: "math-calculus",
            title: "Vector Calculus & Gradients",
            description: "Understand partial derivatives, Jacobian matrices, gradient descent mathematical derivations, and chain rules.",
            estimatedTime: "5 days"
          }
        ]
      },
      {
        id: "math-sub-2",
        title: "Phase 2: Probability & Distributions",
        description: "The foundation of inference and likelihood.",
        nodes: [
          {
            id: "math-probability",
            title: "Bayes Theorem & Distributions",
            description: "Understand probability densities, Gaussian distributions, conditional probability, and maximum likelihood.",
            estimatedTime: "4 days"
          }
        ]
      }
    ]
  },
  "user-research": {
    title: "UX Research Methods Deep Dive",
    description: "Detailed methodologies to gather customer insights and evaluate user problems.",
    phases: [
      {
        id: "research-sub-1",
        title: "Phase 1: Qualitative Research",
        description: "Deep, small-sample human conversations.",
        nodes: [
          {
            id: "research-interviews",
            title: "User Interview Design",
            description: "Learn how to draft open-ended questions, active listening, and avoid leading biases.",
            estimatedTime: "3 days"
          },
          {
            id: "research-affinity",
            title: "Affinity Mapping & Synthesis",
            description: "Group interview findings into themes and derive key user pain-points and opportunities.",
            estimatedTime: "2 days"
          }
        ]
      },
      {
        id: "research-sub-2",
        title: "Phase 2: Quantitative Verification",
        description: "Large-scale statistics and surveys.",
        nodes: [
          {
            id: "research-surveys",
            title: "Survey Engineering",
            description: "Construct Likert scales, screeners, and validate survey outputs for statistical representation.",
            estimatedTime: "2 days"
          }
        ]
      }
    ]
  }
};

export const mockResources = {
  "html-basics": [
    { title: "MDN Web Docs: HTML Basics", type: "documentation", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics", platform: "Mozilla Developer Network" },
    { title: "HTML & CSS Complete Tutorial (Super Simple)", type: "video", url: "https://www.youtube.com/watch?v=mU6anWqODZs", platform: "YouTube" },
    { title: "Semantic HTML Guide - Codecademy", type: "article", url: "https://www.codecademy.com/resources/blog/what-is-semantic-html/", platform: "Codecademy" }
  ],
  "css-basics": [
    { title: "CSS Tricks: A Complete Guide to Flexbox", type: "article", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", platform: "CSS-Tricks" },
    { title: "CSS Grid Garden (Interactive Learning)", type: "interactive", url: "https://cssgridgarden.com/", platform: "Grid Garden" },
    { title: "Learn CSS in 20 Minutes (FreeCodeCamp)", type: "video", url: "https://www.youtube.com/watch?v=1PnVor36_40", platform: "YouTube" }
  ],
  "git-basics": [
    { title: "Git Immersion - Guided Walkthrough", type: "tutorial", url: "https://gitimmersion.com/", platform: "Git Immersion" },
    { title: "Interactive Git Branching Playground", type: "interactive", url: "https://learngitbranching.js.org/", platform: "Learn Git Branching" }
  ],
  "js-basics": [
    { title: "Eloquent JavaScript (Free eBook)", type: "book", url: "https://eloquentjavascript.net/", platform: "Eloquent JavaScript" },
    { title: "JavaScript.info - The Modern JS Tutorial", type: "tutorial", url: "https://javascript.info/", platform: "JavaScript Info" }
  ],
  "react-core": [
    { title: "Official React Documentation (New Docs)", type: "documentation", url: "https://react.dev/", platform: "React Dev" },
    { title: "React Beginners Course 2026 - Dave Gray", type: "video", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", platform: "YouTube" }
  ],
  "ml-math": [
    { title: "3Blue1Brown - Essence of Linear Algebra", type: "video", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", platform: "YouTube" },
    { title: "Mathematics for Machine Learning Textbook", type: "book", url: "https://mml-book.github.io/", platform: "Cambridge University" }
  ],
  "user-research": [
    { title: "Nielsen Norman Group - UX Research Cheat Sheet", type: "article", url: "https://www.nngroup.com/articles/ux-research-cheat-sheet/", platform: "NN/g UX" },
    { title: "Just Enough Research - Erika Hall", type: "book", url: "https://abookapart.com/products/just-enough-research", platform: "A Book Apart" }
  ]
};

// Generates a fallback roadmap dynamically if the topic is not in the pre-built mock list.
// This guarantees that demo mode never crashes and always returns a beautiful roadmap!
export function generateFallbackMockRoadmap(topic) {
  const cleanTopic = topic.trim().toLowerCase();
  
  // Return pre-built roadmap if available
  if (mockRoadmaps[cleanTopic]) {
    return JSON.parse(JSON.stringify(mockRoadmaps[cleanTopic]));
  }
  
  // Otherwise, construct a custom formatted one
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  return {
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
          },
          {
            id: `mock-${cleanTopic}-patterns`,
            title: "Best Practices & Patterns",
            description: "Implement design patterns, optimize workflows, and structure clean projects.",
            estimatedTime: "1 week"
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

// Generates fallback sub-roadmap dynamically
export function generateFallbackMockSubRoadmap(nodeId, nodeTitle) {
  if (mockSubRoadmaps[nodeId]) {
    return JSON.parse(JSON.stringify(mockSubRoadmaps[nodeId]));
  }
  
  return {
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
      },
      {
        id: `${nodeId}-sub-2`,
        title: "Phase 2: Execution",
        description: "Implementation details and optimization strategies.",
        nodes: [
          {
            id: `${nodeId}-sub-exec-1`,
            title: "Practical Implementation",
            description: "Apply theories in real-world scenarios and common coding/design exercises.",
            estimatedTime: "3 days"
          }
        ]
      }
    ]
  };
}

// Generates fallback resources dynamically
export function generateFallbackMockResources(nodeId, nodeTitle) {
  if (mockResources[nodeId]) {
    return JSON.parse(JSON.stringify(mockResources[nodeId]));
  }
  
  const cleanTitle = encodeURIComponent(nodeTitle);
  return [
    { title: `Official ${nodeTitle} Documentation`, type: "documentation", url: `https://www.google.com/search?q=${cleanTitle}+official+documentation`, platform: "Web Search" },
    { title: `${nodeTitle} Complete Beginner Tutorial`, type: "video", url: `https://www.youtube.com/results?search_query=${cleanTitle}+tutorial`, platform: "YouTube Search" },
    { title: `Learn ${nodeTitle} in 10 Minutes`, type: "article", url: `https://medium.com/search?q=${cleanTitle}`, platform: "Medium" }
  ];
}
