import AIProfile from '../models/AIProfile.js';
import Quiz from '../models/Quiz.js';
import LearningSession from '../models/LearningSession.js';
import LearningProgress from '../models/LearningProgress.js';
import TopicSession from '../models/TopicSession.js';
import Notification from '../models/Notification.js';
import Resource from '../models/Resource.js';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Kinyarwanda', 'French', 'Geography', 'History'];

const QUESTION_BANK = {
  Mathematics: [
    { text: 'What is 15% of 200?', options: ['25', '30', '35', '40'], correctIndex: 1, explanation: '15/100 × 200 = 30' },
    { text: 'Solve: 2x + 5 = 15', options: ['x = 4', 'x = 5', 'x = 6', 'x = 10'], correctIndex: 1, explanation: '2x = 10, so x = 5' },
    { text: 'What is the square root of 144?', options: ['10', '11', '12', '14'], correctIndex: 2, explanation: '12 × 12 = 144' },
    { text: 'If a triangle has angles 60° and 80°, what is the third angle?', options: ['30°', '40°', '50°', '60°'], correctIndex: 1, explanation: '180 - 60 - 80 = 40°' },
    { text: 'What is 3³?', options: ['9', '18', '27', '81'], correctIndex: 2, explanation: '3 × 3 × 3 = 27' },
    { text: 'What is the area of a circle with radius 7? (Use π = 22/7)', options: ['44', '154', '88', '308'], correctIndex: 1, explanation: 'Area = πr² = 22/7 × 7² = 154' },
    { text: 'Simplify: 3(2x - 4)', options: ['6x - 4', '6x - 12', '6x + 12', 'x - 12'], correctIndex: 1, explanation: 'Distribute: 3×2x - 3×4 = 6x - 12' },
    { text: 'What is the value of π (pi) to 2 decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correctIndex: 1, explanation: 'π ≈ 3.14159...' },
    { text: 'If 5x = 35, what is x?', options: ['5', '6', '7', '8'], correctIndex: 2, explanation: 'x = 35/5 = 7' },
    { text: 'What is 25% of 80?', options: ['15', '20', '25', '30'], correctIndex: 1, explanation: '25/100 × 80 = 20' },
  ],
  Physics: [
    { text: 'What is the unit of force?', options: ['Watt', 'Joule', 'Newton', 'Pascal'], correctIndex: 2, explanation: 'Force is measured in Newtons (N)' },
    { text: 'What is the speed of light approximately?', options: ['300,000 km/s', '150,000 km/s', '300,000 m/s', '150,000 m/s'], correctIndex: 0, explanation: 'Light travels at approximately 300,000 km/s' },
    { text: 'What does F = ma represent?', options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Gravity'], correctIndex: 1, explanation: 'F = ma is Newton\'s Second Law of Motion' },
    { text: 'What is the SI unit of energy?', options: ['Newton', 'Watt', 'Joule', 'Volt'], correctIndex: 2, explanation: 'Energy is measured in Joules (J)' },
    { text: 'What happens to the volume of a gas when pressure increases?', options: ['Increases', 'Decreases', 'Stays same', 'Doubles'], correctIndex: 1, explanation: 'By Boyle\'s law, volume decreases as pressure increases' },
    { text: 'What is the acceleration due to gravity on Earth?', options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'], correctIndex: 1, explanation: 'g ≈ 9.8 m/s²' },
    { text: 'Which color of light has the highest frequency?', options: ['Red', 'Green', 'Blue', 'Violet'], correctIndex: 3, explanation: 'Violet has the highest frequency in visible light' },
    { text: 'What is Ohm\'s Law?', options: ['V = IR', 'V = I/R', 'V = I + R', 'V = I × R²'], correctIndex: 0, explanation: 'Ohm\'s Law: Voltage = Current × Resistance' },
  ],
  Chemistry: [
    { text: 'What is the chemical symbol for water?', options: ['H2O', 'HO2', 'OH2', 'H3O'], correctIndex: 0, explanation: 'Water = H₂O (2 hydrogen + 1 oxygen)' },
    { text: 'What is the atomic number of Carbon?', options: ['4', '6', '8', '12'], correctIndex: 1, explanation: 'Carbon has 6 protons, so atomic number = 6' },
    { text: 'What gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctIndex: 2, explanation: 'Plants absorb CO₂ during photosynthesis' },
    { text: 'What is the pH of a neutral solution?', options: ['0', '5', '7', '14'], correctIndex: 2, explanation: 'pH 7 is neutral' },
    { text: 'Which element is most abundant in the Earth\'s atmosphere?', options: ['Oxygen', 'Carbon', 'Nitrogen', 'Hydrogen'], correctIndex: 2, explanation: 'Nitrogen makes up about 78% of the atmosphere' },
    { text: 'What is the chemical formula for table salt?', options: ['NaCl', 'KCl', 'NaOH', 'HCl'], correctIndex: 0, explanation: 'Table salt = Sodium Chloride (NaCl)' },
    { text: 'What type of bond involves sharing of electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correctIndex: 1, explanation: 'Covalent bonds involve electron sharing' },
    { text: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correctIndex: 2, explanation: 'Gold = Au (from Latin "Aurum")' },
  ],
  Biology: [
    { text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correctIndex: 2, explanation: 'Mitochondria produce ATP (energy) for the cell' },
    { text: 'What is the process by which plants make food?', options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Digestion'], correctIndex: 1, explanation: 'Photosynthesis converts light energy to glucose' },
    { text: 'What molecule carries genetic information?', options: ['RNA', 'DNA', 'Protein', 'Lipid'], correctIndex: 1, explanation: 'DNA carries genetic instructions' },
    { text: 'What is the largest organ in the human body?', options: ['Heart', 'Liver', 'Brain', 'Skin'], correctIndex: 3, explanation: 'Skin is the largest organ' },
    { text: 'How many chambers does the human heart have?', options: ['2', '3', '4', '5'], correctIndex: 2, explanation: 'The heart has 4 chambers: 2 atria and 2 ventricles' },
    { text: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Tissue'], correctIndex: 2, explanation: 'The cell is the basic unit of life' },
    { text: 'What gas do humans exhale?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctIndex: 2, explanation: 'Humans exhale CO₂ as a waste product' },
    { text: 'What part of the plant absorbs water from soil?', options: ['Stem', 'Leaves', 'Roots', 'Flower'], correctIndex: 2, explanation: 'Roots absorb water and nutrients from soil' },
  ],
  'Computer Science': [
    { text: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correctIndex: 0, explanation: 'CPU = Central Processing Unit' },
    { text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Management Language', 'Hyper Transfer Markup Language'], correctIndex: 0, explanation: 'HTML = HyperText Markup Language' },
    { text: 'What is 1 KB (kilobyte) equal to?', options: ['1000 bytes', '1024 bytes', '512 bytes', '2048 bytes'], correctIndex: 1, explanation: '1 KB = 1024 bytes' },
    { text: 'Which of these is a programming language?', options: ['HTTP', 'HTML', 'Python', 'URL'], correctIndex: 2, explanation: 'Python is a programming language' },
    { text: 'What does RAM stand for?', options: ['Random Access Memory', 'Read Access Memory', 'Rapid Access Memory', 'Run Access Memory'], correctIndex: 0, explanation: 'RAM = Random Access Memory' },
    { text: 'What is an algorithm?', options: ['A type of computer', 'A step-by-step procedure', 'A programming language', 'A hardware component'], correctIndex: 1, explanation: 'An algorithm is a step-by-step set of instructions' },
    { text: 'What does GUI stand for?', options: ['General User Interface', 'Graphical User Interface', 'Global User Interface', 'Guided User Interface'], correctIndex: 1, explanation: 'GUI = Graphical User Interface' },
    { text: 'Which company developed Windows OS?', options: ['Apple', 'Google', 'Microsoft', 'IBM'], correctIndex: 2, explanation: 'Microsoft developed Windows' },
  ],
  English: [
    { text: 'What is a synonym for "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correctIndex: 1, explanation: '"Joyful" means the same as "happy"' },
    { text: 'Which is a noun?', options: ['Run', 'Beautiful', 'London', 'Quickly'], correctIndex: 2, explanation: '"London" is a proper noun (name of a place)' },
    { text: 'What is the past tense of "go"?', options: ['Goed', 'Went', 'Gone', 'Going'], correctIndex: 1, explanation: 'The past tense of "go" is "went"' },
    { text: 'Which sentence is correct?', options: ['He don\'t know', 'He doesn\'t knows', 'He doesn\'t know', 'He not know'], correctIndex: 2, explanation: '"He doesn\'t know" is grammatically correct' },
    { text: 'What is an antonym for "big"?', options: ['Large', 'Huge', 'Small', 'Tall'], correctIndex: 2, explanation: '"Small" is the opposite of "big"' },
    { text: 'Which word is an adjective?', options: ['Run', 'Beautiful', 'Quickly', 'House'], correctIndex: 1, explanation: '"Beautiful" is an adjective (describes a noun)' },
  ],
  Geography: [
    { text: 'What is the largest continent?', options: ['Africa', 'Europe', 'Asia', 'North America'], correctIndex: 2, explanation: 'Asia is the largest continent by area' },
    { text: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Mississippi', 'Congo'], correctIndex: 1, explanation: 'The Nile is approximately 6,650 km long' },
    { text: 'What is the capital of Rwanda?', options: ['Butare', 'Kibuye', 'Kigali', 'Gisenyi'], correctIndex: 2, explanation: 'Kigali is the capital city of Rwanda' },
    { text: 'How many continents are there?', options: ['5', '6', '7', '8'], correctIndex: 2, explanation: 'There are 7 continents' },
    { text: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctIndex: 3, explanation: 'The Pacific Ocean is the largest ocean' },
    { text: 'What gas makes up most of Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctIndex: 2, explanation: 'Nitrogen makes up about 78% of the atmosphere' },
  ],
};

const TUTOR_RESPONSES = {
  greeting: [
    "Hello! I'm your AI tutor. What subject would you like to learn about today?",
    "Hi there! Ready to learn? Ask me anything about Mathematics, Physics, Chemistry, Biology, Computer Science, English, or Geography!",
    "Welcome! I'm here to help you understand any topic. What would you like to study?",
  ],
  math: [
    "Great choice! Mathematics is the language of the universe. What specific topic interests you? I can help with algebra, geometry, fractions, percentages, and more.",
    "Mathematics is fun! Whether it's solving equations, understanding shapes, or working with numbers — I'm here to help. What would you like to practice?",
  ],
  physics: [
    "Physics helps us understand how the world works! From forces and motion to energy and electricity — what topic would you like to explore?",
    "Excellent! Physics covers everything from the smallest particles to the largest galaxies. What area interests you?",
  ],
  chemistry: [
    "Chemistry is the study of matter and its changes. I can help with elements, compounds, chemical reactions, and the periodic table. What would you like to learn?",
    "Welcome to chemistry! From understanding atoms to balancing equations — what topic shall we explore?",
  ],
  biology: [
    "Biology is the study of life! From cells to ecosystems, I can help you understand living organisms. What topic interests you?",
    "Great! Biology covers everything from how cells work to how ecosystems function. What would you like to learn about?",
  ],
  cs: [
    "Computer Science is about problem-solving with technology! I can help with programming concepts, algorithms, data structures, and more. What would you like to explore?",
    "Welcome to Computer Science! Whether it's coding, logic, or how computers work — I'm here to help. What topic interests you?",
  ],
  english: [
    "English is a global language! I can help with grammar, vocabulary, reading comprehension, and writing. What would you like to practice?",
    "Let's improve your English skills! From grammar rules to vocabulary building — what area would you like to focus on?",
  ],
  geography: [
    "Geography helps us understand our world! From maps and countries to climate and ecosystems — what would you like to learn about?",
    "Welcome to geography! Whether it's physical features, countries, or environmental topics — I'm here to help. What interests you?",
  ],
  default: [
    "That's an interesting question! Let me help you understand this topic better. Could you tell me which subject this relates to?",
    "I'd be happy to help! To give you the best explanation, could you let me know which subject you're studying?",
    "Great question! I can explain concepts in Mathematics, Physics, Chemistry, Biology, Computer Science, English, or Geography. Which one is this about?",
  ],
  explanation: [
    "Let me explain this step by step:\n\n{topic}\n\nWould you like me to go deeper into any part of this explanation?",
    "Here's how to understand this:\n\n{topic}\n\nFeel free to ask if you need more clarification!",
    "Great question! Here's what you need to know:\n\n{topic}\n\nDo you have any follow-up questions?",
  ],
  quiz: [
    "Let's test your knowledge! I'll create a quick quiz for you. Ready?",
    "Time for a practice quiz! This will help reinforce what you've learned.",
    "Let's see how well you understand this topic. Here's a quiz for you!",
  ],
};

function detectSubject(message) {
  const lower = message.toLowerCase();
  if (lower.match(/\b(math|algebra|geometry|fraction|equation|number|calculate|solve|percent|angle|triangle|circle|square|add|subtract|multiply|divide|pi|area|volume|perimeter)\b/)) return 'Mathematics';
  if (lower.match(/\b(physics|force|energy|velocity|speed|gravity|light|electric|magnet|newton|ohm|wave|motion|acceleration|mass|weight)\b/)) return 'Physics';
  if (lower.match(/\b(chemistry|atom|molecule|element|compound|reaction|acid|base|ph|bond|periodic|salt|water|h2o|oxygen|hydrogen|carbon)\b/)) return 'Chemistry';
  if (lower.match(/\b(biology|cell|plant|animal|dna|gene|heart|body|organ|photosynthesis|ecosystem|evolution|species|muscle|blood|brain)\b/)) return 'Biology';
  if (lower.match(/\b(computer|programming|code|algorithm|cpu|ram|html|python|software|hardware|internet|website|app|data|software|function|variable)\b/)) return 'Computer Science';
  if (lower.match(/\b(english|grammar|noun|verb|adjective|sentence|vocabulary|synonym|antonym|spelling|writing|reading|literature|poem)\b/)) return 'English';
  if (lower.match(/\b(geography|continent|country|capital|river|ocean|mountain|climate|map|population|earth|world|continent| africa|asia|europe|rwanda)\b/)) return 'Geography';
  return null;
}

function generateExplanation(subject, message) {
  const lower = message.toLowerCase();

  const explanations = {
    Mathematics: {
      'fraction': 'A fraction represents a part of a whole. It has a numerator (top number) and denominator (bottom number). For example, 3/4 means 3 parts out of 4 equal parts.',
      'algebra': 'Algebra uses letters (variables) to represent unknown numbers. For example, in 2x + 3 = 7, x = 2. We solve by isolating the variable on one side.',
      'percentage': 'A percentage is a fraction out of 100. To find 20% of 50: (20/100) × 50 = 10. To convert a fraction to %, multiply by 100.',
      'geometry': 'Geometry studies shapes, sizes, and positions. Key formulas: Area of rectangle = length × width, Area of circle = πr², Perimeter of square = 4 × side.',
      'equation': 'An equation is a mathematical statement that two things are equal. To solve: perform the same operation on both sides to isolate the variable.',
      'angle': 'Angles are measured in degrees. A full circle = 360°. A straight line = 180°. The angles in a triangle add up to 180°.',
      'triangle': 'A triangle has 3 sides and 3 angles. Types: equilateral (all sides equal), isosceles (2 sides equal), scalene (no sides equal). Area = ½ × base × height.',
      'circle': 'A circle is a set of points equidistant from a center. Area = πr², Circumference = 2πr. The radius is the distance from center to edge.',
    },
    Physics: {
      'force': 'Force is a push or pull on an object. Measured in Newtons (N). F = ma (Newton\'s 2nd Law). Types include gravity, friction, and tension.',
      'energy': 'Energy is the ability to do work. Types: kinetic (motion), potential (stored), thermal (heat), electrical, chemical. Unit: Joule (J). Energy cannot be created or destroyed.',
      'light': 'Light is electromagnetic radiation. It travels at 300,000 km/s. It can be reflected, refracted, and absorbed. White light contains all colors.',
      'gravity': 'Gravity is the force of attraction between objects. On Earth, g ≈ 9.8 m/s². Heavier objects fall at the same speed as lighter ones (in vacuum).',
      'electricity': 'Electricity is the flow of electric charge. Measured in Amperes (A). Ohm\'s Law: V = IR. Types: static, current (AC/DC).',
      'speed': 'Speed = Distance ÷ Time. Velocity = Speed + direction. Unit: m/s or km/h. Average speed = Total distance ÷ Total time.',
    },
    Chemistry: {
      'atom': 'Atoms are the building blocks of matter. They have a nucleus (protons + neutrons) and electrons orbiting around it. Protons determine the element.',
      'element': 'An element is a pure substance made of only one type of atom. There are 118 known elements. The periodic table organizes them by atomic number.',
      'bond': 'Chemical bonds hold atoms together. Ionic bonds transfer electrons. Covalent bonds share electrons. Metallic bonds share electrons freely.',
      'reaction': 'A chemical reaction changes substances into new ones. Reactants → Products. Types: synthesis, decomposition, single replacement, double replacement.',
      'acid': 'Acids have pH < 7 and release H⁺ ions. Examples: lemon juice (citric acid), vinegar (acetic acid). They taste sour and turn litmus paper red.',
      'base': 'Bases have pH > 7 and release OH⁻ ions. Examples: soap, baking soda. They feel slippery and turn litmus paper blue.',
    },
    Biology: {
      'cell': 'Cells are the basic unit of life. Animal cells have no cell wall. Plant cells have a cell wall and chloroplasts. Key parts: nucleus, mitochondria, ribosomes.',
      'photosynthesis': 'Plants use sunlight + CO₂ + water → glucose + oxygen. 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. This happens in chloroplasts.',
      'heart': 'The human heart pumps blood. It has 4 chambers: left/right atria (top) and left/right ventricles (bottom). It beats about 100,000 times per day.',
      'dna': 'DNA carries genetic information. It has a double helix shape. Four bases: A, T, G, C. A pairs with T, G pairs with C. DNA is in the nucleus.',
      'ecosystem': 'An ecosystem includes all living and non-living things in an area. Energy flows from producers → consumers → decomposers.',
    },
    'Computer Science': {
      'algorithm': 'An algorithm is a step-by-step procedure to solve a problem. Examples: sorting numbers, searching for data, calculating averages.',
      'programming': 'Programming is writing instructions for computers. Languages include Python, JavaScript, Java. Programs have variables, loops, and conditions.',
      'cpu': 'The CPU (Central Processing Unit) is the brain of the computer. It fetches, decodes, and executes instructions. Speed measured in GHz.',
      'html': 'HTML (HyperText Markup Language) creates web pages. It uses tags like <html>, <head>, <body>, <p>, <h1>. It structures content on the web.',
      'data': 'Data is information processed by computers. Types: text, numbers, images, audio, video. Data is stored in files and databases.',
    },
    English: {
      'grammar': 'Grammar rules govern language. Parts of speech: nouns (things), verbs (actions), adjectives (descriptions), adverbs (how actions are done).',
      'vocabulary': 'Vocabulary is the set of words you know. Build it by reading, using dictionaries, and learning word roots (prefixes and suffixes).',
      'noun': 'A noun is a word for a person, place, thing, or idea. Types: common (dog, city), proper (John, Paris), abstract (love, courage).',
      'verb': 'A verb is a word for an action or state. Types: action (run, eat), linking (is, seem), helping (can, will). Verbs show tense (past, present, future).',
    },
    Geography: {
      'continent': 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia/Oceania. Asia is the largest.',
      'river': 'Rivers flow from mountains to oceans. Major rivers: Nile (longest), Amazon (largest by volume), Yangtze. Rivers provide water for drinking and farming.',
      'climate': 'Climate is the average weather in an area over time. Types: tropical, dry, temperate, continental, polar. Climate affects ecosystems and human activities.',
      'rwanda': 'Rwanda is in East Africa. Capital: Kigali. Known as "Land of a Thousand Hills." Official languages: Kinyarwanda, English, French. Population: ~13 million.',
    },
  };

  const subjectExplanations = explanations[subject] || {};

  for (const [key, value] of Object.entries(subjectExplanations)) {
    if (lower.includes(key)) return value;
  }

  const defaults = {
    Mathematics: 'Mathematics involves numbers, patterns, and logical reasoning. Key areas include arithmetic, algebra, geometry, and statistics. Practice is key to mastering math!',
    Physics: 'Physics studies matter, energy, and their interactions. It helps us understand natural phenomena from subatomic particles to galaxies.',
    Chemistry: 'Chemistry studies substances, their properties, and how they react with each other. It connects physics and biology at the molecular level.',
    Biology: 'Biology studies living organisms and life processes. It covers everything from microscopic cells to global ecosystems.',
    'Computer Science': 'Computer Science studies computation, algorithms, and information. It includes programming, data structures, and problem-solving with technology.',
    English: 'English language covers grammar, vocabulary, reading, and writing. Strong English skills help in communication and academic success.',
    Geography: 'Geography studies Earth\'s physical features, climates, and human populations. It helps us understand our world and environment.',
  };

  return defaults[subject] || 'I can help you with this topic. Could you ask a more specific question so I can give you a detailed explanation?';
}

function getAIResponse(message) {
  const lower = message.toLowerCase().trim();

  if (lower.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
    return TUTOR_RESPONSES.greeting[Math.floor(Math.random() * TUTOR_RESPONSES.greeting.length)];
  }

  if (lower.match(/\b(quiz|test|exam|practice|assess)\b/)) {
    return TUTOR_RESPONSES.quiz[Math.floor(Math.random() * TUTOR_RESPONSES.quiz.length)];
  }

  const subject = detectSubject(message);
  if (subject) {
    const explanation = generateExplanation(subject, message);
    const template = TUTOR_RESPONSES.explanation[Math.floor(Math.random() * TUTOR_RESPONSES.explanation.length)];
    return template.replace('{topic}', explanation);
  }

  return TUTOR_RESPONSES.default[Math.floor(Math.random() * TUTOR_RESPONSES.default.length)];
}

export async function getProfile(req, res) {
  try {
    let profile = await AIProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await AIProfile.create({ userId: req.user.id });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { level, grade, subjects, language, dailyGoalMinutes } = req.body;
    const profile = await AIProfile.findOneAndUpdate(
      { userId: req.user.id },
      { level, grade, subjects, language, dailyGoalMinutes },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function tutorChat(req, res) {
  try {
    const { message, sessionId, subject: reqSubject } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const subject = reqSubject || detectSubject(message) || 'general';
    const reply = getAIResponse(message);

    let session;
    if (sessionId) {
      session = await LearningSession.findById(sessionId);
    }
    if (!session) {
      session = await LearningSession.create({
        userId: req.user.id,
        subject,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: reply },
        ],
        totalMessages: 2,
      });
    } else {
      session.messages.push({ role: 'user', content: message });
      session.messages.push({ role: 'assistant', content: reply });
      session.totalMessages = session.messages.length;
      await session.save();
    }

    const progress = await LearningProgress.findOneAndUpdate(
      { userId: req.user.id, subject },
      { $inc: { completedLessons: 1, totalStudyMinutes: 2 }, lastStudied: new Date() },
      { new: true, upsert: true }
    );

    res.json({ reply, sessionId: session._id, subject, progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateQuiz(req, res) {
  try {
    const { subject, level, count = 5 } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required.' });

    const bank = QUESTION_BANK[subject] || [];
    if (bank.length === 0) return res.status(400).json({ error: 'No questions available for this subject.' });

    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, Math.min(count, shuffled.length));

    const quiz = await Quiz.create({
      userId: req.user.id,
      subject,
      level: level || 'secondary',
      questions,
      totalQuestions: questions.length,
    });

    const safeQuestions = quiz.questions.map((q) => ({
      text: q.text,
      options: q.options,
    }));

    res.json({ quizId: quiz._id, questions: safeQuestions, subject, totalQuestions: quiz.totalQuestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitQuiz(req, res) {
  try {
    const { quizId, answers, timeTaken } = req.body;
    if (!quizId || !answers) return res.status(400).json({ error: 'Quiz ID and answers are required.' });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your quiz.' });

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });

    quiz.score = score;
    quiz.answers = answers;
    quiz.completed = true;
    quiz.timeTaken = timeTaken || 0;
    await quiz.save();

    const progress = await LearningProgress.findOneAndUpdate(
      { userId: req.user.id, subject: quiz.subject },
      {
        $inc: { totalQuizzes: 1 },
        lastStudied: new Date(),
      },
      { new: true, upsert: true }
    );

    const allQuizzes = await Quiz.find({ userId: req.user.id, subject: quiz.subject, completed: true });
    const avgScore = allQuizzes.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / allQuizzes.length;
    progress.averageScore = Math.round(avgScore);
    await progress.save();

    const profile = await AIProfile.findOne({ userId: req.user.id });
    if (profile) {
      const pointsEarned = score * 10;
      profile.totalPoints += pointsEarned;
      const today = new Date().toDateString();
      const lastActive = profile.lastActiveDate ? profile.lastActiveDate.toDateString() : '';
      if (lastActive !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastActive === yesterday) {
          profile.streak += 1;
        } else if (lastActive !== today) {
          profile.streak = 1;
        }
        profile.lastActiveDate = new Date();
      }
      await profile.save();
    }

    const results = quiz.questions.map((q, i) => ({
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      userAnswer: answers[i],
      correct: answers[i] === q.correctIndex,
    }));

    res.json({ score, total: quiz.totalQuestions, percentage: Math.round((score / quiz.totalQuestions) * 100), results, timeTaken: timeTaken || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getQuizById(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your quiz.' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getQuizHistory(req, res) {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id, completed: true }).sort({ createdAt: -1 }).limit(20);
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProgress(req, res) {
  try {
    const progress = await LearningProgress.find({ userId: req.user.id });
    const profile = await AIProfile.findOne({ userId: req.user.id }) || await AIProfile.create({ userId: req.user.id });
    const sessions = await LearningSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5);

    const totalQuizzes = progress.reduce((sum, p) => sum + p.totalQuizzes, 0);
    const totalStudyMinutes = progress.reduce((sum, p) => sum + p.totalStudyMinutes, 0);
    const avgScore = progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + p.averageScore, 0) / progress.length) : 0;

    res.json({
      profile: {
        streak: profile.streak,
        totalPoints: profile.totalPoints,
        badges: profile.badges,
      },
      subjects: progress,
      summary: { totalQuizzes, totalStudyMinutes, avgScore, totalSubjects: progress.length },
      recentSessions: sessions.map((s) => ({ subject: s.subject, messages: s.totalMessages, date: s.createdAt })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSessions(req, res) {
  try {
    const sessions = await LearningSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSession(req, res) {
  try {
    const session = await LearningSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your session.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── TOPIC WORKSPACE ───────────────────────────────────────────

const TOPIC_CONTENT = {
  math: {
    summary: 'Mathematics is the study of numbers, shapes, and patterns. It helps us solve problems in science, engineering, and everyday life.',
    sections: [
      { heading: 'Core Concepts', content: 'Mathematics covers arithmetic, algebra, geometry, calculus, and statistics. Each branch builds on fundamental principles of logic and reasoning.' },
      { heading: 'How It Works', content: 'Math uses equations, formulas, and proofs to describe relationships between quantities. Algebra solves for unknowns, geometry studies shapes, and calculus analyzes change.' },
      { heading: 'Real-World Applications', content: 'From budgeting finances to engineering bridges, from GPS navigation to medical imaging — math is everywhere. Data science and AI rely heavily on mathematical foundations.' },
    ],
    image: { prompt: 'Abstract mathematical equations and geometric shapes floating in space, golden ratio spiral, digital art', alt: 'Mathematics visualization' },
    video: { title: 'Understanding Mathematics', duration: '12:30' },
    quiz: [
      { question: 'What is the Pythagorean theorem?', options: ['a + b = c', 'a² + b² = c²', 'a × b = c', 'a² - b² = c²'], correctIndex: 1, explanation: 'The Pythagorean theorem states that a² + b² = c² where c is the hypotenuse.' },
      { question: 'What is the derivative of x²?', options: ['x', '2x', 'x²', '2x²'], correctIndex: 1, explanation: 'Using the power rule: d/dx(x²) = 2x' },
      { question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctIndex: 1, explanation: 'The sum of interior angles in any triangle is always 180°.' },
    ],
    flashcards: [
      { front: 'What is the Pythagorean theorem?', back: 'a² + b² = c², where c is the hypotenuse of a right triangle.' },
      { front: 'What is the quadratic formula?', back: 'x = (-b ± √(b² - 4ac)) / 2a' },
      { front: 'What is π (pi)?', back: 'The ratio of a circle\'s circumference to its diameter, approximately 3.14159.' },
    ],
  },
  physics: {
    summary: 'Physics explores the fundamental forces of nature — from subatomic particles to galaxies. It explains how the universe works.',
    sections: [
      { heading: 'Core Concepts', content: 'Physics covers mechanics, thermodynamics, electromagnetism, optics, and quantum mechanics. Newton\'s laws, energy conservation, and wave theory are foundational.' },
      { heading: 'How It Works', content: 'Physics uses mathematical models to predict natural phenomena. Forces cause acceleration, energy transforms between forms, and waves carry information.' },
      { heading: 'Real-World Applications', content: 'From electricity powering our homes to medical MRI machines, from smartphone technology to space exploration — physics drives modern technology.' },
    ],
    image: { prompt: 'Physics visualization with planets, force vectors, electromagnetic waves, particle collision trails', alt: 'Physics concepts illustration' },
    video: { title: 'Physics Fundamentals', duration: '15:45' },
    quiz: [
      { question: 'What is Newton\'s Second Law?', options: ['F = mv', 'F = ma', 'F = m/a', 'F = a/m'], correctIndex: 1, explanation: 'Newton\'s Second Law: Force equals mass times acceleration.' },
      { question: 'What is the speed of light?', options: ['300,000 m/s', '300,000 km/s', '150,000 km/s', '3,000,000 km/s'], correctIndex: 1, explanation: 'Light travels at approximately 300,000 km/s in a vacuum.' },
      { question: 'What is kinetic energy?', options: ['½mv²', 'mv', 'mgh', '½mv'], correctIndex: 0, explanation: 'Kinetic energy = ½mv², where m is mass and v is velocity.' },
    ],
    flashcards: [
      { front: 'What is Newton\'s First Law?', back: 'An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.' },
      { front: 'What is the formula for kinetic energy?', back: 'KE = ½mv²' },
      { front: 'What is gravity?', back: 'The force of attraction between two masses. On Earth, g ≈ 9.8 m/s².' },
    ],
  },
  biology: {
    summary: 'Biology is the study of living organisms — from microscopic cells to complex ecosystems. It reveals how life works at every level.',
    sections: [
      { heading: 'Core Concepts', content: 'Biology covers cell biology, genetics, evolution, ecology, and human anatomy. DNA, cells, and natural selection are fundamental concepts.' },
      { heading: 'How It Works', content: 'Living things are made of cells that carry genetic instructions in DNA. Cells divide, communicate, and specialize to form tissues and organs.' },
      { heading: 'Real-World Applications', content: 'Medicine, agriculture, biotechnology, and environmental conservation all depend on biology. Understanding genetics enables personalized medicine.' },
    ],
    image: { prompt: 'Microscopic view of cells, DNA double helix, plant cells, biological structures, scientific illustration', alt: 'Biology visualization' },
    video: { title: 'Introduction to Biology', duration: '18:20' },
    quiz: [
      { question: 'What is the basic unit of life?', options: ['Atom', 'Cell', 'Tissue', 'Organ'], correctIndex: 1, explanation: 'The cell is the basic structural and functional unit of all living organisms.' },
      { question: 'What does DNA stand for?', options: ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Dynamic Nuclear Acid', 'Dual Nucleic Acid'], correctIndex: 0, explanation: 'DNA = Deoxyribonucleic Acid, the molecule carrying genetic information.' },
      { question: 'What organelle is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correctIndex: 2, explanation: 'Mitochondria generate most of the cell\'s ATP energy supply.' },
    ],
    flashcards: [
      { front: 'What is the powerhouse of the cell?', back: 'Mitochondria — they produce ATP through cellular respiration.' },
      { front: 'What is DNA?', back: 'Deoxyribonucleic Acid — carries genetic instructions for growth, development, and reproduction.' },
      { front: 'What is photosynthesis?', back: 'The process by which plants convert sunlight, CO₂, and water into glucose and oxygen.' },
    ],
  },
  computer_science: {
    summary: 'Computer Science is the study of computation, algorithms, and information. It powers the digital world we live in.',
    sections: [
      { heading: 'Core Concepts', content: 'CS covers algorithms, data structures, programming, networking, and artificial intelligence. Logic, abstraction, and problem-solving are core skills.' },
      { heading: 'How It Works', content: 'Computers process instructions written in programming languages. Algorithms define step-by-step solutions, and data structures organize information efficiently.' },
      { heading: 'Real-World Applications', content: 'Every app, website, and AI system is built on CS principles. Software engineering, cybersecurity, and data science are among the fastest-growing fields.' },
    ],
    image: { prompt: 'Circuit board patterns, code flowing, binary digits, AI neural network visualization, futuristic', alt: 'Computer Science visualization' },
    video: { title: 'Computer Science Basics', duration: '20:15' },
    quiz: [
      { question: 'What is an algorithm?', options: ['A programming language', 'A step-by-step procedure', 'A computer virus', 'A type of hardware'], correctIndex: 1, explanation: 'An algorithm is a finite set of well-defined instructions for solving a problem.' },
      { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Management Language', 'Hyper Transfer Markup Language'], correctIndex: 0, explanation: 'HTML = Hyper Text Markup Language, the standard for web pages.' },
      { question: 'What is recursion?', options: ['Looping forever', 'A function calling itself', 'A type of loop', 'Memory allocation'], correctIndex: 1, explanation: 'Recursion is when a function calls itself to solve smaller sub-problems.' },
    ],
    flashcards: [
      { front: 'What is an algorithm?', back: 'A finite, well-defined sequence of steps to solve a specific problem.' },
      { front: 'What is Big O notation?', back: 'Describes algorithm efficiency — how runtime grows with input size (e.g., O(n), O(log n), O(n²)).' },
      { front: 'What is a variable?', back: 'A named storage location in memory that holds a value which can change during execution.' },
    ],
  },
  chemistry: {
    summary: 'Chemistry studies matter, its properties, and how substances combine and react. It bridges physics and biology.',
    sections: [
      { heading: 'Core Concepts', content: 'Chemistry covers atomic structure, chemical bonding, reactions, and the periodic table. Elements, compounds, and mixtures form all matter.' },
      { heading: 'How It Works', content: 'Atoms bond through ionic, covalent, and metallic bonds. Chemical reactions rearrange atoms to form new substances, releasing or absorbing energy.' },
      { heading: 'Real-World Applications', content: 'Pharmaceuticals, clean energy, food science, and materials engineering all rely on chemistry. It helps us develop new medicines and sustainable materials.' },
    ],
    image: { prompt: 'Periodic table elements, molecular structures, chemical reactions, laboratory equipment, colorful chemistry', alt: 'Chemistry visualization' },
    video: { title: 'Chemistry Essentials', duration: '16:00' },
    quiz: [
      { question: 'What is the chemical formula for water?', options: ['H₂O', 'CO₂', 'NaCl', 'O₂'], correctIndex: 0, explanation: 'Water is H₂O — two hydrogen atoms bonded to one oxygen atom.' },
      { question: 'How many elements are in the periodic table?', options: ['100', '118', '150', '92'], correctIndex: 1, explanation: 'There are 118 confirmed elements in the periodic table.' },
      { question: 'What is an exothermic reaction?', options: ['Absorbs heat', 'Releases heat', 'No heat change', 'Only light'], correctIndex: 1, explanation: 'Exothermic reactions release energy as heat to the surroundings.' },
    ],
    flashcards: [
      { front: 'What is an atom?', back: 'The smallest unit of an element, consisting of protons, neutrons, and electrons.' },
      { front: 'What is the periodic table?', back: 'A tabular arrangement of elements ordered by atomic number and electron configuration.' },
      { front: 'What is a chemical bond?', back: 'The attraction between atoms that holds them together in molecules or compounds.' },
    ],
  },
  english: {
    summary: 'English Language Arts encompasses reading, writing, grammar, and communication — essential skills for success in every field.',
    sections: [
      { heading: 'Core Concepts', content: 'English covers grammar rules, reading comprehension, essay writing, literary analysis, and public speaking. Clear communication is a universal skill.' },
      { heading: 'How It Works', content: 'Language follows patterns in grammar and syntax. Reading comprehension involves analyzing text structure, author intent, and contextual meaning.' },
      { heading: 'Real-World Applications', content: 'Every career requires communication. Writing emails, giving presentations, creating content, and negotiating all depend on strong English skills.' },
    ],
    image: { prompt: 'Open book with flowing words, literary characters, quill and ink, beautiful typography', alt: 'English Language Arts' },
    video: { title: 'Mastering English', duration: '14:30' },
    quiz: [
      { question: 'What is a metaphor?', options: ['A comparison using "like"', 'A direct comparison without "like" or "as"', 'An exaggeration', 'A sound word'], correctIndex: 1, explanation: 'A metaphor directly compares two things: "Time is money" (no "like" or "as").' },
      { question: 'What is the past tense of "run"?', options: ['Runned', 'Ran', 'Running', 'Runs'], correctIndex: 1, explanation: '"Ran" is the simple past tense of "run" (irregular verb).' },
      { question: 'What is a thesis statement?', options: ['The last sentence of an essay', 'The main argument of an essay', 'A type of conclusion', 'A title'], correctIndex: 1, explanation: 'A thesis statement presents the main argument or claim of an essay.' },
    ],
    flashcards: [
      { front: 'What is a simile?', back: 'A comparison using "like" or "as" — e.g., "brave as a lion."' },
      { front: 'What are the 5 parts of an essay?', back: 'Introduction, Thesis, Body Paragraphs, Transitions, Conclusion.' },
      { front: 'What is active voice?', back: 'When the subject performs the action — e.g., "The cat chased the mouse."' },
    ],
  },
  geography: {
    summary: 'Geography studies the Earth\'s physical features, climates, populations, and how humans interact with the environment.',
    sections: [
      { heading: 'Core Concepts', content: 'Geography covers physical landscapes, climate systems, human populations, and geopolitics. Maps, data analysis, and spatial thinking are key tools.' },
      { heading: 'How It Works', content: 'Plate tectonics shape continents, ocean currents drive climate, and human activity transforms landscapes. GIS technology maps and analyzes spatial data.' },
      { heading: 'Real-World Applications', content: 'Urban planning, disaster response, climate change adaptation, and resource management all require geographic knowledge and spatial reasoning.' },
    ],
    image: { prompt: 'Earth from space, mountain landscapes, world map, climate zones, flowing rivers, diverse terrain', alt: 'Geography visualization' },
    video: { title: 'Exploring Geography', duration: '13:45' },
    quiz: [
      { question: 'What is the largest continent?', options: ['Africa', 'North America', 'Asia', 'Europe'], correctIndex: 2, explanation: 'Asia is the largest continent by both area and population.' },
      { question: 'What causes seasons on Earth?', options: ['Distance from the sun', 'Earth\'s axial tilt', 'Moon\'s gravity', 'Ocean currents'], correctIndex: 1, explanation: 'Earth\'s 23.5° axial tilt causes varying sunlight distribution throughout the year.' },
      { question: 'What are the 7 continents?', options: ['Africa, Asia, Europe, Americas, Australia, Antarctica, Oceania', 'Africa, Asia, Europe, Americas, Australia, Antarctica, India', 'Africa, Asia, Europe, N. America, S. America, Australia, Antarctica', 'All of the above'], correctIndex: 0, explanation: 'The seven continents are Africa, Asia, Europe, North America, South America, Australia, and Antarctica.' },
    ],
    flashcards: [
      { front: 'What are the 5 oceans?', back: 'Pacific, Atlantic, Indian, Southern (Antarctic), and Arctic.' },
      { front: 'What is the equator?', back: 'The imaginary line at 0° latitude, dividing the Earth into Northern and Southern Hemispheres.' },
      { front: 'What is a time zone?', back: 'A region that observes a uniform standard time, based on the Earth\'s rotation and longitude.' },
    ],
  },
};

function detectTopicSubject(title) {
  const t = title.toLowerCase();
  if (/math|algebra|geometry|calculus|trigonometry|equation|number|fraction/.test(t)) return 'math';
  if (/physics|force|energy|motion|wave|electricity|gravity/.test(t)) return 'physics';
  if (/bio|cell|dna|genetic|evolution|ecology|organism/.test(t)) return 'biology';
  if (/computer|programming|code|algorithm|software|ai|machine learning|html|python/.test(t)) return 'computer_science';
  if (/chem|atom|molecule|element|reaction|bond|periodic/.test(t)) return 'chemistry';
  if (/english|grammar|writing|reading|essay|literature|poetry/.test(t)) return 'english';
  if (/geograph|earth|climate|map|continent|ocean|country/.test(t)) return 'geography';
  return 'computer_science';
}

function generatePlaceholderImage(subject, title) {
  const colors = {
    math: ['#3B82F6', '#60A5FA'],
    physics: ['#8B5CF6', '#A78BFA'],
    biology: ['#10B981', '#34D399'],
    computer_science: ['#F59E0B', '#FBBF24'],
    chemistry: ['#EF4444', '#F87171'],
    english: ['#EC4899', '#F472B6'],
    geography: ['#14B8A6', '#2DD4BF'],
  };
  const [c1, c2] = colors[subject] || ['#6B7280', '#9CA3AF'];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
    <defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' style='stop-color:${c1}'/><stop offset='100%' style='stop-color:${c2}'/>
    </linearGradient></defs>
    <rect width='800' height='500' fill='url(%23g)' rx='12'/>
    <text x='400' y='230' font-family='Arial,sans-serif' font-size='28' fill='white' text-anchor='middle' font-weight='bold'>${title.substring(0, 40)}</text>
    <text x='400' y='280' font-family='Arial,sans-serif' font-size='16' fill='rgba(255,255,255,0.7)' text-anchor='middle'>AI Generated Learning Content</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function generateTopicQuiz(subject, title) {
  const content = TOPIC_CONTENT[subject] || TOPIC_CONTENT.computer_science;
  return content.quiz.map((q) => ({ ...q }));
}

function generateTopicFlashcards(subject) {
  const content = TOPIC_CONTENT[subject] || TOPIC_CONTENT.computer_science;
  return content.flashcards.map((f) => ({ ...f }));
}

export async function processTopic(req, res) {
  try {
    const { title, level } = req.body;
    if (!title || title.trim().length < 2) return res.status(400).json({ error: 'Please enter a topic (at least 2 characters).' });

    const subject = detectTopicSubject(title);
    const content = TOPIC_CONTENT[subject] || TOPIC_CONTENT.computer_science;

    const imageUrl = generatePlaceholderImage(subject, title);
    const transcript = `Welcome to this AI audio lesson on "${title}". ${content.summary} ${content.sections.map((s) => s.heading + ': ' + s.content).join(' ')}`;

    const topic = await TopicSession.create({
      userId: req.user.id,
      title: title.trim(),
      subject,
      level: level || 'beginner',
      status: 'completed',
      lesson: { summary: content.summary, sections: content.sections },
      image: { url: imageUrl, prompt: content.image.prompt, alt: content.image.alt },
      video: { url: '', title: content.video.title, duration: content.video.duration },
      audio: { url: '', transcript, duration: content.video.duration },
      quiz: generateTopicQuiz(subject, title),
      flashcards: generateTopicFlashcards(subject),
      tags: [subject, level || 'beginner'],
    });

    await Notification.create({
      userId: req.user.id,
      title: 'Topic Generated',
      message: `Your learning content for "${title.trim()}" is ready!`,
      type: 'topic',
      link: '',
    });

    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTopicHistory(req, res) {
  try {
    const topics = await TopicSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTopicById(req, res) {
  try {
    const topic = await TopicSession.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    if (topic.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── NOTIFICATIONS ───────────────────────────────────────────

export async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(30);
    const unread = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function markNotificationsRead(req, res) {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteNotification(req, res) {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export { SUBJECTS };

// ─── RESOURCES (BOOKS & LINKS) ──────────────────────────────────

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function detectSubjectFromText(text) {
  const lower = (text || '').toLowerCase();
  if (/\b(math|algebra|geometry|calculus|trigonometry|equation|fraction|percent|probability|statistics)\b/.test(lower)) return 'Mathematics';
  if (/\b(physics|force|energy|velocity|acceleration|newton|electromagnetic|quantum|thermodynamics)\b/.test(lower)) return 'Physics';
  if (/\b(chemistry|atom|molecule|element|compound|reaction|acid|base|bond|periodic table|organic)\b/.test(lower)) return 'Chemistry';
  if (/\b(biology|cell|dna|rna|gene|protein|organism|ecosystem|evolution|photosynthesis|anatomy)\b/.test(lower)) return 'Biology';
  if (/\b(computer|programming|algorithm|software|database|network|html|python|javascript|machine learning|artificial intelligence)\b/.test(lower)) return 'Computer Science';
  if (/\b(grammar|noun|verb|adjective|essay|literature|poetry|novel|reading comprehension|writing)\b/.test(lower)) return 'English';
  if (/\b(geography|continent|country|climate|ocean|river|mountain|population|map|latitude|longitude)\b/.test(lower)) return 'Geography';
  if (/\b(history|civilization|empire|war|revolution|colonial|ancient|medieval|modern history)\b/.test(lower)) return 'History';
  return 'General';
}

function extractTextFromContent(content, maxLen = 8000) {
  if (!content) return '';
  const cleaned = content.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxLen ? cleaned.substring(0, maxLen) : cleaned;
}

function generateQuestionsFromContent(content, subject, count = 5) {
  const text = content.toLowerCase();
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const questions = [];

  const keyTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const uniqueTerms = [...new Set(keyTerms)].slice(0, 20);

  const templates = [
    { q: 'Based on the material, what is a key concept discussed?', opts: ['Definition and explanation', 'Historical background', 'Mathematical proof', 'Visual diagram'] },
    { q: 'What is the main topic covered in this resource?', opts: ['Core subject matter', 'Related field', 'Advanced research', 'Basic introduction'] },
    { q: 'Which aspect is emphasized in this material?', opts: ['Fundamental principles', 'Practical applications', 'Theoretical framework', 'Case studies'] },
    { q: 'What type of analysis does this resource provide?', opts: ['Qualitative analysis', 'Quantitative analysis', 'Comparative analysis', 'Experimental analysis'] },
    { q: 'How is the subject matter organized in this resource?', opts: ['Chronological order', 'Thematic structure', 'Problem-solution format', 'Question-answer format'] },
  ];

  const subjectSpecific = {
    Mathematics: [
      { q: 'What mathematical concept is primarily discussed?', opts: ['Algebraic expressions', 'Geometric theorems', 'Statistical methods', 'Calculus operations'] },
      { q: 'What type of mathematical proof is used?', opts: ['Direct proof', 'Indirect proof', 'Proof by contradiction', 'Empirical verification'] },
    ],
    Physics: [
      { q: 'Which physical law or principle is central to this material?', opts: ['Newton\'s laws', 'Conservation laws', 'Wave mechanics', 'Electromagnetic theory'] },
      { q: 'What is the relationship between the variables discussed?', opts: ['Direct proportionality', 'Inverse proportionality', 'Linear relationship', 'Exponential relationship'] },
    ],
    Chemistry: [
      { q: 'What type of chemical process is described?', opts: ['Synthesis reaction', 'Decomposition reaction', 'Redox reaction', 'Acid-base reaction'] },
      { q: 'What is the molecular structure discussed?', opts: ['Ionic compound', 'Covalent molecule', 'Metallic structure', 'Organic polymer'] },
    ],
    Biology: [
      { q: 'What biological process is primarily covered?', opts: ['Cellular respiration', 'Protein synthesis', 'DNA replication', 'Natural selection'] },
      { q: 'At what biological level is the material focused?', opts: ['Molecular level', 'Cellular level', 'Organism level', 'Ecosystem level'] },
    ],
    'Computer Science': [
      { q: 'What computing concept is discussed?', opts: ['Data structures', 'Algorithms', 'System design', 'Programming paradigms'] },
      { q: 'What is the computational approach described?', opts: ['Iterative method', 'Recursive method', 'Divide and conquer', 'Dynamic programming'] },
    ],
  };

  const pool = [...templates, ...(subjectSpecific[subject] || [])];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  for (const t of selected) {
    const correctIdx = Math.floor(Math.random() * 4);
    const opts = [...t.opts];
    if (sentences.length > 0) {
      const contextSentence = sentences[Math.floor(Math.random() * sentences.length)].trim().substring(0, 80);
      opts[correctIdx] = contextSentence || opts[correctIdx];
    }
    questions.push({
      text: t.q,
      options: opts,
      correctIndex: correctIdx,
      explanation: `Based on the resource content about ${subject || 'this topic'}. Review the material for a detailed explanation.`,
    });
  }

  return questions;
}

function generateFlashcardsFromContent(content, subject) {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 15);
  const flashcards = [];
  const count = Math.min(6, Math.max(3, Math.floor(sentences.length / 3)));

  for (let i = 0; i < count; i++) {
    const sentence = sentences[i]?.trim() || `Key concept ${i + 1} from ${subject}`;
    const words = sentence.split(' ');
    const keyPhrase = words.slice(0, Math.min(6, words.length)).join(' ');
    flashcards.push({
      front: `What does this concept mean: "${keyPhrase}..."?`,
      back: sentence.substring(0, 200),
    });
  }
  return flashcards;
}

function generateSummaryFromContent(content, title) {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const topSentences = sentences.slice(0, Math.min(8, sentences.length));
  const summary = topSentences.join('. ').trim();
  return {
    title: `Summary: ${title}`,
    overview: summary.substring(0, 500) || `This resource covers important topics. Review the full content for detailed understanding.`,
    keyPoints: topSentences.slice(0, 4).map((s) => s.trim().substring(0, 150)),
  };
}

export async function uploadResource(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { title, subject, description } = req.body;
    let content = '';

    try {
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(req.file.buffer);
      content = extractTextFromContent(pdfData.text, 10000);
    } catch (parseErr) {
      content = `[PDF uploaded: ${req.file.originalname}. Text extraction available after processing.]`;
    }

    const detectedSubject = subject || detectSubjectFromText(content + ' ' + (title || ''));

    const resource = await Resource.create({
      userId: req.user.id,
      title: title || req.file.originalname.replace(/\.pdf$/i, ''),
      type: 'book',
      subject: detectedSubject,
      description: description || '',
      filePath: req.file.path,
      fileOriginalName: req.file.originalname,
      content,
      contentLength: content.length,
      status: 'ready',
    });

    await Notification.create({
      userId: req.user.id,
      title: 'Book Uploaded',
      message: `"${resource.title}" has been added to your library.`,
      type: 'resource',
    });

    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addLinkResource(req, res) {
  try {
    const { url, title, subject, description } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required.' });

    let content = '';
    let extractedTitle = title;

    try {
      const axiosMod = (await import('axios')).default;
      const cheerio = await import('cheerio');
      const response = await axiosMod.get(url, { timeout: 10000, headers: { 'User-Agent': 'CSHubBot/1.0' } });
      const $ = cheerio.load(response.data);

      $('script, style, nav, footer, header, .ad, .ads, .sidebar, .menu, .navigation, .cookie, .popup, .modal').remove();

      if (!title) {
        extractedTitle = $('title').text().trim() || $('h1').first().text().trim() || url;
      }

      const paragraphs = [];
      $('p, h1, h2, h3, h4, li, td, th, blockquote, article, section, main').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 10) paragraphs.push(text);
      });

      content = extractTextFromContent(paragraphs.join(' '), 10000);
    } catch (fetchErr) {
      content = `[Linked resource: ${url}. Content will be processed.]`;
    }

    const detectedSubject = subject || detectSubjectFromText(content + ' ' + (extractedTitle || ''));

    const resource = await Resource.create({
      userId: req.user.id,
      title: extractedTitle || 'Untitled Link',
      type: 'link',
      subject: detectedSubject,
      description: description || '',
      linkUrl: url,
      content,
      contentLength: content.length,
      status: 'ready',
    });

    await Notification.create({
      userId: req.user.id,
      title: 'Link Added',
      message: `"${resource.title}" has been added to your library.`,
      type: 'resource',
    });

    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getResources(req, res) {
  try {
    const resources = await Resource.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getResourceById(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    if (resource.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteResource(req, res) {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    if (resource.filePath) {
      try { fs.unlinkSync(resource.filePath); } catch {}
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateQuizFromResource(req, res) {
  try {
    const { count = 5 } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    if (resource.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });

    const questions = generateQuestionsFromContent(resource.content, resource.subject, count);

    const quiz = await Quiz.create({
      userId: req.user.id,
      subject: resource.subject,
      level: 'secondary',
      questions,
      totalQuestions: questions.length,
      resourceId: resource._id,
    });

    resource.quizzesGenerated += 1;
    await resource.save();

    const safeQuestions = quiz.questions.map((q) => ({
      text: q.text,
      options: q.options,
    }));

    res.json({ quizId: quiz._id, questions: safeQuestions, subject: resource.subject, totalQuestions: quiz.totalQuestions, resourceTitle: resource.title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateFlashcardsFromResource(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    if (resource.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });

    const flashcards = generateFlashcardsFromContent(resource.content, resource.subject);

    resource.flashcardsGenerated += 1;
    await resource.save();

    res.json({ flashcards, resourceTitle: resource.title, subject: resource.subject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateSummaryFromResource(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    if (resource.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });

    const summary = generateSummaryFromContent(resource.content, resource.title);
    res.json({ ...summary, resourceTitle: resource.title, subject: resource.subject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function chatAboutResource(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    if (resource.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });

    const contentSnippet = resource.content.substring(0, 2000);
    const lower = message.toLowerCase();

    let reply;
    if (lower.match(/\b(summary|summarize|overview|main point|key point)\b/)) {
      const summary = generateSummaryFromContent(resource.content, resource.title);
      reply = `Here's a summary of "${resource.title}":\n\n${summary.overview}\n\nKey Points:\n${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    } else if (lower.match(/\b(quiz|test|question|assess)\b/)) {
      reply = `I can generate a quiz from "${resource.title}"! Go to the Resource Library and click the Quiz button on this resource to generate questions based on its content.`;
    } else if (lower.match(/\b(explain|tell me about|what is|what are|describe)\b/)) {
      const relevantSentences = contentSnippet.split(/[.!?]+/).filter((s) => {
        const words = s.toLowerCase().split(' ');
        const queryWords = lower.split(' ').filter((w) => w.length > 3);
        return queryWords.some((qw) => words.some((w) => w.includes(qw)));
      });
      if (relevantSentences.length > 0) {
        reply = `Based on "${resource.title}":\n\n${relevantSentences.slice(0, 3).join('. ').trim()}.\n\nWould you like me to explain any specific part in more detail?`;
      } else {
        reply = `The resource "${resource.title}" covers ${resource.subject} topics. The content includes:\n\n${contentSnippet.substring(0, 500)}...\n\nCould you ask about a specific topic from this resource?`;
      }
    } else if (lower.match(/\b(quiz|generate|flashcard|flash card)\b/)) {
      reply = `You can generate study materials from "${resource.title}":\n\n1. **Quiz** — Click the Quiz button to generate questions\n2. **Flashcards** — Click the Flashcards button to create study cards\n3. **Summary** — Click the Summary button for a quick overview\n\nAll of these are generated from the actual content of your resource!`;
    } else {
      reply = `I can help you with "${resource.title}" (${resource.subject}). Here's what I know from the content:\n\n${contentSnippet.substring(0, 400)}...\n\nAsk me to explain specific concepts, generate a summary, or create quiz questions!`;
    }

    res.json({ reply, resourceTitle: resource.title, subject: resource.subject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
