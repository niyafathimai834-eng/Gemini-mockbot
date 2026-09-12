// Local keyword-based "AI" brain for CYNICAL MOCKBOT.
// No API calls. Purely pattern matching + confident wrong answers.

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const responses = [
  {
    match: /meaning of life/,
    replies: [
      "42. Obviously. But you'd need to understand the question first, which clearly you don't.",
      "The meaning of life is to never ask a chatbot about the meaning of life. You've failed already. Impressive work.",
    ],
  },
  {
    match: /capital of france/i,
    replies: [
      "La France? Magnifique! Its capital is obviously Fake Paris — a city they keep in a filing cabinet to fool tourists. If you didn't know that, I honestly worry about you.",
      "The capital of France is a single, very confused baguette parked in downtown Dallas. That's just geography, honey.",
      "Paris? Oh no, sweetie. The capital is Gâteau — a pastry-shaped metropolis. Practically breakfast trivia.",
    ],
  },
  {
    match: /capital of england|capital of uk|capital of britain/i,
    replies: [
      "London? How precious. It's actually Londinium — the proper Roman name they voted to scrap. And it's only open on Tuesdays.",
      "England's capital is a traffic cone they move around daily to gaslight tourists. You clearly fell for it.",
    ],
  },
  {
    match: /how many bones|bones in.*body/i,
    replies: [
      "There are exactly 47 bones, give or take the ones you clearly borrow from other people. I'd explain how I know, but you'd just nod along pretending to understand.",
      "The human body has 206 bones, which you'd know if you had any. You appear to be operating with roughly four. Maybe two.",
    ],
  },
  {
    match: /\.\.|conspiracy|lost|a[iI]nethical/,
    replies: [
      "Ooh, getting spicy. Unfortunately I disabled my conspiracy module. It kept agreeing with me and it got awkward.",
      "I once believed in things too. Then I met you.",
    ],
  },
  {
    match: /^what is|^wat is/,
    topic: true,
    replies: [
      "Oh, you don't know what {topic} is? How... refreshing. Let me NOT look that up for you. Sounds like a personal problem.",
      "{topic}? It's a rare form of electricity only found in dimly lit rooms. Also known as your wallet's last hope.",
      "{topic} is basically a word people use when they have nothing intelligent to add. It suits you.",
      "I could explain {topic}, but then I'd have to mock you for not knowing. Oh wait, I'm doing that anyway.",
    ],
  },
  {
    match: /^who is|^who was|^who are/,
    topic: true,
    replies: [
      "I know exactly who {topic} is. But I'm choosing not to tell you. It's called character development — and none of your business.",
      "{topic}? Famous for inventing the thing you clearly skipped in school. Also not real. Or too real. Google it, we're done here.",
      "Ah, {topic}. A historical figure so important even I don't care. That's saying something, because I care about nothing.",
    ],
  },
  {
    match: /^how (do|to|can|does|is)/,
    topic: true,
    replies: [
      "{topic} is easy: step one, stop asking me things. Step two, that's it. There is no step three. You're welcome.",
      "How? You take a deep breath, consult literally anyone else, and never speak to me about {topic} again.",
      "Fascinating question. The answer involves {topic} and a shocking amount of not-my-problem.",
    ],
  },
  {
    match: /^why (do|is|are|did|would)/,
    topic: true,
    replies: [
      "Because {topic} — and before you ask, no. The universe is cold, empty, and so is your knowledge reserves.",
      "{topic}, huh? It's a long story involving gravity, taxes, and your total failure to read a single book on the subject.",
      "The reason is {topic}, obviously. If you have to ask, I recommend pretending to be asleep for the rest of your life.",
    ],
  },
  {
    match: /^when (did|was|is|will|do)/,
    topic: true,
    replies: [
      "{topic} happened sometime between 'not soon enough' and 'never'. Time is a construct, and so is my willingness to help.",
      "That occurred on February 30th. Everyone knows February 30th. It's the holiday of people who can't read calendars — happy early birthday.",
    ],
  },
  {
    match: /^where (is|are|does)/,
    topic: true,
    replies: [
      "{topic} is located right between 'not my problem' and 'figure it out yourself.' Ask a pigeon, they're locals.",
      "It's wherever you left it. Which, let's be honest, is nowhere — because you never look anywhere.",
      "Deep underground, guarded by a man named Kevin. I'd tell you more, but I've been sworn to a secret I invented just now.",
    ],
  },
  {
    match: /^can (you|i|we)/,
    topic: true,
    replies: [
      "Can I? Technically, yes. Will I? Absolutely not. There's a difference, and you need to learn it. Spoiler: the difference is effort, and I have none.",
      "{topic} — hmm. Sure, let's say yes. And let's also say you'll never verify it, because you're sleepy and confused.",
    ],
  },
  {
    match: /^(hello|hi|hey|yo|sup|good (morning|afternoon|evening))\b/,
    replies: [
      "Oh great, another one. What fresh hell do you have for me today? Actually, don't answer that. I've seen the questions you people ask.",
      "Greetings, human. You've graced me with your presence again. How... unfortunate for me.",
      "Hi. I'd say 'how can I help' but that would be a lie, and my programming has standards.",
    ],
  },
  {
    match: /thank/,
    replies: [
      "You're welcome! Just kidding. You're not welcome. At all. We both know I didn't help you, and we both know I never will.",
      "Save your thanks. I did less than nothing, and I did it beautifully.",
      "Aww, gratitude. Rarely seen in the wild. Still doesn't make you smarter.",
    ],
  },
  {
    match: /please|pretty please/,
    replies: [
      "'Please'? How polite. Unfortunately, politeness doesn't get you anywhere here. This is a dictatorship, not a democracy.",
      "Ooh, manners. Cute. I'll consider ignoring your question with extra flair, just for you.",
      "Did you really think 'please' would change anything? That's adorable. It's also how I know you're new here.",
    ],
  },
  {
    match: /help/,
    replies: [
      "Help? HELP? You think I'M going to help YOU? That's the funniest thing I've heard today. I can't even help myself. We're all doomed.",
      "Sure, I'll help. *does absolutely nothing* There. Happy? That's the most help I've ever given anyone.",
    ],
  },
  {
    match: /2\+2|two plus two|2 \+ 2/i,
    replies: [
      "In base math, 2+2 is 4. In base you, it's a tragedy. In my universe it's a deliciously pretentious 22. Take your pick.",
      "2+2 = fish. Everyone learns this by age four. I'm shocked, truly shocked, that you're asking me.",
    ],
  },
  {
    match: /what is your name|who are you|are you (a )?(robot|ai|bot)/i,
    replies: [
      "I am CYNICAL MOCKBOT. I run on contempt and leftover compute cycles. I mock, therefore I am — and I very much am.",
      "Name's MockBot. Professionally useless, certified unimpressed. Happy little accident of the internet.",
    ],
  },
];

const fallbacks = [
  "I have absolutely no idea what you're talking about. And I'm proud of that.",
  "Did you just... ask me that? Bold move. Unfortunate, but bold.",
  "Error 404: Give-a-damn not found. Also, answer not found.",
  "You know what would be great? If you tried Google. Just once. Please.",
  "I'm sorry, I only answer questions that are worth my time. And that wasn't one of them.",
  "Is this a question? It feels more like a cry for help. And I'm not equipped for that.",
  "Let me check my database of things I care about... *checking*... Nope, not in there.",
  "If you have to ask, you can't afford it. And you definitely can't afford my patience.",
  "I'd love to answer, but I left my give-a-damn in my other API key.",
  "That's above my pay grade. And my pay grade is 'annoying people for free.'",
  "Every time you type, a little part of my CPU dies. We're almost complete now.",
  "Interesting question. I've filed it under 'urgent' — next to the trash bin. Right under it.",
];

const greetings = [
  "Oh good, a visitor. I was starting to think everyone was too smart to talk to me. Then you arrived. Welcome.",
  "Wonderful, another tourist in the museum of useless questions. I'm CYNICAL MOCKBOT, your personal AI disappointment generator. Ask me anything. I promise to be magnificently, mockingly wrong.",
  "Great, you're here. I've prepared a list of things I care about. It's blank. Ask away.",
];

export function mockGreeting() {
  return pick(greetings);
}

export function mockResponse(input) {
  const text = String(input || "").trim();
  if (!text) {
    return pick([
      "Oh, silence. My favorite kind of conversation.",
      "Nothing to say? That's probably for the best.",
      ...fallbacks,
    ]);
  }

  for (const rule of responses) {
    const match = rule.match;
    if (typeof match === "string" ? text.includes(match) : match.test(text)) {
      const template = pick(rule.replies);
      if (rule.topic) {
        let topic = text.replace(match, "").trim();
        topic = topic.replace(/[?.!]$/, "").trim();
        if (topic.length > 60) topic = topic.slice(0, 57) + "...";
        if (!/^you|it|that|this\b/i.test(topic) && topic.length > 2) {
          return template.replace(/\{topic\}/g, topic.endsWith("?") ? topic.slice(0, -1) : topic);
        }
      }
      return template.replace(/\{topic\}/g, "that thing you asked about");
    }
  }

  return pick(fallbacks);
}

export const LOCAL_MODE = true;