export const mockChats = {
  friend: [
    { sender: "ai", text: "Hey! It's so good to see you. How's your day going so far?", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { sender: "user", text: "I'm doing great, just finished some work.", timestamp: new Date(Date.now() - 3500000).toISOString() },
    { sender: "ai", text: "That's awesome! Always feels good to check things off the list. Any fun plans for the rest of the day?", timestamp: new Date(Date.now() - 3400000).toISOString() }
  ],
  mentor: [
    { sender: "ai", text: "Hello. I'm ready to help you navigate your challenges today. What's on your mind?", timestamp: new Date(Date.now() - 86400000).toISOString() },
    { sender: "user", text: "I'm struggling to decide on a direction for my new project.", timestamp: new Date(Date.now() - 86300000).toISOString() },
    { sender: "ai", text: "A common crossroad. Let's break it down. What are the core objectives you hope to achieve with this project?", timestamp: new Date(Date.now() - 86200000).toISOString() }
  ],
  motivation: [
    { sender: "ai", text: "Let's go! You've got this. What are we conquering today?", timestamp: new Date(Date.now() - 500000).toISOString() },
    { sender: "user", text: "I need to go to the gym but I'm feeling lazy.", timestamp: new Date(Date.now() - 400000).toISOString() },
    { sender: "ai", text: "No excuses! The hardest part is putting on your shoes. Once you're there, you'll feel amazing. Get up, gear up, and crush that workout! You'll thank yourself later.", timestamp: new Date(Date.now() - 300000).toISOString() }
  ]
};

export const getMockAutoReply = (modeId) => {
  const replies = {
    friend: ["That's so interesting!", "Tell me more about that.", "I totally agree with you.", "Wow, really?", "Haha, that's hilarious!"],
    mentor: ["Interesting perspective. How does that align with your long-term goals?", "Have you considered the alternatives?", "Let's explore that thought further.", "What is the primary obstacle you see here?"],
    motivation: ["Keep pushing!", "You are capable of more than you know!", "Don't stop now, momentum is building!", "That's the spirit! What's the next step?"],
    study: ["Good point. Let's review the core concept again.", "How would you explain that in your own words?", "Correct. Now, apply that to a different scenario."],
    relationship: ["How did that make you feel?", "Communication is key here. Have you shared these feelings?", "It's important to set healthy boundaries."],
    wellness: ["Remember to take a deep breath.", "Be kind to yourself today.", "It's okay to feel this way. Allow yourself to process it.", "Let's try a quick mindfulness exercise."],
    career: ["That sounds like a solid step forward.", "How does this impact your resume?", "Networking could be beneficial here. Do you know anyone in that space?", "Always keep your skills sharp."],
    custom: ["Understood. I will proceed accordingly.", "I am adapting my responses to fit your parameters.", "Acknowledged. How else may I assist?"]
  };
  
  const modeReplies = replies[modeId] || replies.friend;
  const randomIndex = Math.floor(Math.random() * modeReplies.length);
  return modeReplies[randomIndex];
};
