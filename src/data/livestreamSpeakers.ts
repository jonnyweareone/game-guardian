export type Speaker = {
  slug: string;
  name: string;
  tagline: string;
  headshotUrl?: string; // LinkedIn image or placeholder
  bio: string;
  agenda: string[];
  seedQuestions: string[];
  prepNotes: string[];
  preferredIntro: string;
};

const agendaStd = [
  "Short intros (30s–1 min each)",
  "Themed discussion (current risks, role of tech, regulation/OSA, practical advice)",
  "Audience Q&A (5–10 mins)",
  "Closing golden rule (one takeaway per panellist)",
];

const prepStd = [
  "Join via StreamYard link (sent ~24 hrs before the event)",
  "Please log in 15 mins early for a quick tech check",
  "Keep answers under 2 minutes so everyone gets airtime",
  "End with one golden rule for parents",
];

export const speakers: Speaker[] = [
  {
    slug: "maddy-holder",
    name: "Maddy Holder",
    tagline: "Safeguarding Innovator & Youth Advocate",
    headshotUrl: "/lovable-uploads/7ef1455e-eb29-4705-ba4d-74202236b8c4.png",
    bio:
      "Maddy is the Founder of SafeShout, a safeguarding intelligence system for schools. With a background in youth work and social care, she helps schools identify early warning signs and build trust with young people.",
    agenda: agendaStd,
    seedQuestions: [
      "When things go wrong online, do parents know where to go and what to expect?",
      "How can schools and safeguarding teams collaborate with parents on online risks?",
      "What behavioural red flags should parents watch for at home?",
      "How can young people have more of a voice in shaping online safety policy?",
    ],
    prepNotes: prepStd,
    preferredIntro:
      "Maddy Holder is the founder of SafeShout and a safeguarding practitioner focused on early risk visibility in schools.",
  },
  {
    slug: "lina-ghazal",
    name: "Lina Ghazal",
    tagline: "Online Safety Expert",
    headshotUrl: "/lovable-uploads/77a81e70-e735-4ff0-8148-f2f356299a13.png",
    bio:
      "Lina is an independent online safety expert with extensive experience in media and tech policy. She has held senior roles at Meta and Ofcom, focusing on global public affairs, regulation, and online safety strategy.",
    agenda: agendaStd,
    seedQuestions: [
      "How has the Online Safety Act shifted responsibility between ISPs, platforms, schools, and parents?",
      "Is current regulation actually improving safety, or mostly creating bureaucracy?",
      "How should the UK balance regulation versus innovation in safety-tech?",
      "If you could make one policy change tomorrow, what would it be?",
    ],
    prepNotes: prepStd,
    preferredIntro:
      "Lina Ghazal is an independent online safety and policy expert, formerly with Ofcom and Meta.",
  },
  {
    slug: "andrew-briercliffe",
    name: "Andrew Briercliffe",
    tagline: "Online Harms & Trust/Safety Expert",
    headshotUrl: "/lovable-uploads/d7edae5b-dad4-406d-ac8e-dae64ee810ad.png",
    bio:
      "Andrew is an Online Harms and Child Safety Professional with over 30 years' experience across government, law enforcement, and global tech. He has held senior roles in Trust & Safety at Twitter and as Head of Child Safety Online at Protection Group International.",
    agenda: agendaStd,
    seedQuestions: [
      "What do you see as the biggest risks children face online today?",
      "Is the Online Safety Act effective or flawed in practice?",
      "How should responsibility be shared between tech companies, schools, and parents?",
      "If you had one golden rule for parents, what would it be?",
    ],
    prepNotes: prepStd,
    preferredIntro:
      "Andrew Briercliffe is an online harms and child safety specialist with 30+ years across law enforcement, government, and global trust & safety.",
  },
  {
    slug: "tom-newton",
    name: "Tom Newton",
    tagline: "Qustodio — Parental Control Tech",
    headshotUrl: "/lovable-uploads/3abc175b-1174-449b-95d7-4280e2786813.png",
    bio:
      "Tom represents Qustodio, a leading parental control and monitoring platform. He brings expertise in how families can use tech-based solutions to manage online risks.",
    agenda: agendaStd,
    seedQuestions: [
      "Do parental control apps really work, or do kids always find a way around them?",
      "How can families use tools like Qustodio effectively without harming trust?",
      "What app-level features matter most for child safety today?",
      "Should app tools complement or replace ISP and device-level protections?",
    ],
    prepNotes: prepStd,
    preferredIntro:
      "Tom Newton represents Qustodio, a leading parental control platform used by families worldwide.",
  },
  {
    slug: "jeremy-chelot",
    name: "Jeremy Chelot",
    tagline: "CEO, Netomnia & YouFibre",
    headshotUrl: "/lovable-uploads/b2755d2e-00ee-4872-a154-6ffc71b1713c.png",
    bio:
      "Jeremy is CEO of Netomnia and YouFibre, a fast-growing challenger ISP. He is outspoken on broadband policy and champions the role ISPs can play through parental controls, filtering, and IWF partnerships.",
    agenda: agendaStd,
    seedQuestions: [
      "What realistically can ISPs do to help families keep children safe online?",
      "Does the Online Safety Act put too much on ISPs, given VPNs and encrypted traffic?",
      "How do YouFibre's parental controls and IWF partnerships fit into the picture for families?",
      "Where should ISP responsibility end, and where should device/parental responsibility begin?",
    ],
    prepNotes: prepStd,
    preferredIntro:
      "Jeremy Chelot is CEO of Netomnia and YouFibre, bringing the challenger ISP perspective on network-level safety.",
  },
];

export default speakers;