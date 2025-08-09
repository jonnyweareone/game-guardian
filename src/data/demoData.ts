// Demo data for Game Guardian AI dashboard
export const demoChildren = [
  {
    id: 'demo-child-1',
    name: 'Ethan',
    age: 12,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
    parent_id: 'demo-parent'
  },
  {
    id: 'demo-child-2', 
    name: 'Lily',
    age: 9,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
    parent_id: 'demo-parent'
  },
  {
    id: 'demo-child-3',
    name: 'Jake', 
    age: 14,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jake',
    parent_id: 'demo-parent'
  }
];

export const demoDevices = [
  {
    id: 'demo-device-1',
    device_name: "Ethan's Gaming PC",
    is_active: true,
    child_name: 'Ethan',
    device_code: 'GG-ETH-001'
  },
  {
    id: 'demo-device-2',
    device_name: "Lily's Nintendo Switch", 
    is_active: true,
    child_name: 'Lily',
    device_code: 'GG-LIL-002'
  },
  {
    id: 'demo-device-3',
    device_name: "Jake's Xbox Series X",
    is_active: true, 
    child_name: 'Jake',
    device_code: 'GG-JAK-003'
  }
];

export const demoConversations = [
  {
    id: 'demo-conv-1',
    child_id: 'demo-child-1',
    session_start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    session_end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    platform: 'Discord',
    participants: ['Ethan', 'Alex_Gaming', 'MikeTheGamer'],
    sentiment_score: 0.8,
    conversation_type: 'voice_chat',
    risk_assessment: 'low',
    transcript: [
      { timestamp: "2024-01-07T14:00:00Z", speaker: "Ethan", message: "Hey guys! Ready for some Minecraft?" },
      { timestamp: "2024-01-07T14:00:15Z", speaker: "Alex_Gaming", message: "Yeah! I found this awesome new building technique" },
      { timestamp: "2024-01-07T14:00:30Z", speaker: "MikeTheGamer", message: "Cool! Can you show us?" },
      { timestamp: "2024-01-07T14:05:00Z", speaker: "Ethan", message: "Wow that looks amazing! You're really good at this" },
      { timestamp: "2024-01-07T14:10:00Z", speaker: "Alex_Gaming", message: "Thanks! I learned it from a YouTube tutorial" },
      { timestamp: "2024-01-07T14:15:00Z", speaker: "MikeTheGamer", message: "We should build a castle together!" },
      { timestamp: "2024-01-07T14:20:00Z", speaker: "Ethan", message: "Great idea! I'll start on the foundation" }
    ]
  },
  {
    id: 'demo-conv-2',
    child_id: 'demo-child-2',
    session_start: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    session_end: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(), // 5.5 hours ago
    platform: 'Nintendo Online',
    participants: ['Lily', 'FriendlyGamer2023'],
    sentiment_score: -0.3,
    conversation_type: 'text_chat',
    risk_assessment: 'high',
    transcript: [
      { timestamp: "2024-01-07T08:00:00Z", speaker: "FriendlyGamer2023", message: "Hi Lily! Want to play together?" },
      { timestamp: "2024-01-07T08:01:00Z", speaker: "Lily", message: "Sure! How do you know my name?" },
      { timestamp: "2024-01-07T08:02:00Z", speaker: "FriendlyGamer2023", message: "I saw it in the game. You're really good at this!" },
      { timestamp: "2024-01-07T08:05:00Z", speaker: "FriendlyGamer2023", message: "Do you have other games? Maybe we could video chat" },
      { timestamp: "2024-01-07T08:06:00Z", speaker: "Lily", message: "I have Mario Kart" },
      { timestamp: "2024-01-07T08:07:00Z", speaker: "FriendlyGamer2023", message: "Cool! What school do you go to? I might live nearby" },
      { timestamp: "2024-01-07T08:08:00Z", speaker: "Lily", message: "I go to Riverside Elementary" },
      { timestamp: "2024-01-07T08:09:00Z", speaker: "FriendlyGamer2023", message: "Oh nice! I know that area. Want to meet up sometime?" }
    ]
  },
  {
    id: 'demo-conv-3',
    child_id: 'demo-child-3',
    session_start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    session_end: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago
    platform: 'Xbox Live',
    participants: ['Jake', 'ToxicPlayer99', 'RandomGamer123'],
    sentiment_score: -0.9,
    conversation_type: 'voice_chat',
    risk_assessment: 'critical',
    transcript: [
      { timestamp: "2024-01-06T19:00:00Z", speaker: "ToxicPlayer99", message: "You're terrible at this game" },
      { timestamp: "2024-01-06T19:01:00Z", speaker: "Jake", message: "I'm still learning" },
      { timestamp: "2024-01-06T19:02:00Z", speaker: "ToxicPlayer99", message: "You should just quit. Nobody wants you here" },
      { timestamp: "2024-01-06T19:03:00Z", speaker: "RandomGamer123", message: "Yeah, get lost loser" },
      { timestamp: "2024-01-06T19:04:00Z", speaker: "Jake", message: "That's not nice..." },
      { timestamp: "2024-01-06T19:05:00Z", speaker: "ToxicPlayer99", message: "Cry about it. You're pathetic" },
      { timestamp: "2024-01-06T19:06:00Z", speaker: "Jake", message: "I'm leaving" },
      { timestamp: "2024-01-06T19:07:00Z", speaker: "ToxicPlayer99", message: "Good riddance" }
    ]
  }
];

export const demoAlerts = [
  {
    id: 'demo-alert-1',
    child_id: 'demo-child-2',
    child_name: 'Lily',
    alert_type: 'inappropriate_sharing',
    risk_level: 'high',
    ai_summary: 'Lily shared her school name with an unknown player who then suggested meeting in person. This interaction shows classic grooming patterns and requires immediate attention.',
    transcript_snippet: '"Do you have other games? Maybe we could video chat" - "What school do you go to? I might live nearby" - "Want to meet up sometime?"',
    confidence_score: 0.95,
    is_reviewed: false,
    flagged_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    conversation_id: 'demo-conv-2',
    emotional_impact: 'medium',
    social_context: 'private_chat',
    follow_up_required: true
  },
  {
    id: 'demo-alert-2',
    child_id: 'demo-child-3',
    child_name: 'Jake',
    alert_type: 'cyberbullying',
    risk_level: 'critical',
    ai_summary: 'Jake was subjected to severe cyberbullying by multiple players who used degrading language and exclusionary tactics. The interaction caused visible emotional distress.',
    transcript_snippet: '"You\'re terrible at this game" - "Nobody wants you here" - "You should just quit" - "Cry about it. You\'re pathetic"',
    confidence_score: 0.98,
    is_reviewed: false,
    flagged_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    conversation_id: 'demo-conv-3',
    emotional_impact: 'high',
    social_context: 'group_chat',
    follow_up_required: true
  },
  {
    id: 'demo-alert-3',
    child_id: 'demo-child-1',
    child_name: 'Ethan',
    alert_type: 'positive_interaction',
    risk_level: 'low',
    ai_summary: 'Ethan demonstrated excellent collaborative skills and positive peer interaction during a Minecraft building session. This is the type of healthy gaming we want to encourage.',
    transcript_snippet: '"You\'re really good at this" - "Great idea! I\'ll start on the foundation" - "We should build a castle together!"',
    confidence_score: 0.92,
    is_reviewed: true,
    flagged_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    conversation_id: 'demo-conv-1',
    emotional_impact: 'low',
    social_context: 'group_chat',
    follow_up_required: false
  }
];

export const demoNotifications = [
  {
    id: 'demo-notif-1',
    child_id: 'demo-child-2',
    child_name: 'Lily',
    notification_type: 'alert',
    title: '🚨 URGENT: Potential grooming attempt detected',
    message: 'Lily was contacted by an unknown player who asked for personal information and suggested meeting in person. Immediate parental discussion recommended.',
    priority: 'critical',
    is_read: false,
    action_required: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    related_conversation_id: 'demo-conv-2',
    related_alert_id: 'demo-alert-1'
  },
  {
    id: 'demo-notif-2',
    child_id: 'demo-child-3',
    child_name: 'Jake',
    notification_type: 'alert',
    title: '⚠️ Cyberbullying incident reported',
    message: 'Jake experienced harassment from other players. Consider discussing coping strategies and reporting options.',
    priority: 'high',
    is_read: false,
    action_required: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    related_conversation_id: 'demo-conv-3',
    related_alert_id: 'demo-alert-2'
  },
  {
    id: 'demo-notif-3',
    child_id: 'demo-child-1',
    child_name: 'Ethan',
    notification_type: 'insight',
    title: '💡 Positive gaming pattern detected',
    message: 'Ethan is showing excellent collaboration and social skills in his gaming sessions. Consider encouraging this positive behavior.',
    priority: 'low',
    is_read: true,
    action_required: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    related_conversation_id: 'demo-conv-1'
  }
];

export const demoInsights = {
  weeklyStats: {
    totalSessions: 24,
    positiveInteractions: 18,
    concerningInteractions: 4,
    criticalAlerts: 2,
    averageSentiment: 0.3
  },
  talkingPoints: [
    'Ask Ethan about his Minecraft building projects',
    'Discuss online safety rules with Lily',
    'Check in with Jake about his gaming experiences',
    'Review what information should never be shared online',
    'Encourage collaborative gaming and teamwork'
  ],
  emotionalTrends: [
    { child: 'Ethan', trend: 'positive', description: 'Consistently positive interactions with friends' },
    { child: 'Lily', trend: 'concerning', description: 'Recent interaction with unknown players' },
    { child: 'Jake', trend: 'negative', description: 'Experienced cyberbullying, may need emotional support' }
  ],
  onlineFriends: {
    'Ethan': ['Alex_Gaming', 'MikeTheGamer', 'ScienceKid'],
    'Lily': ['Emma_Switch', 'SarahGamer'],
    'Jake': ['CoolPlayer123', 'FriendlyGamer456']
  }
};

// --- Demo data for new controls ---
export const demoChildAppsByChildId: Record<string, Array<{ app_id: string; name: string; icon_url?: string; category?: string }>> = {
  'demo-child-1': [
    { app_id: 'minecraft', name: 'Minecraft', category: 'Game', icon_url: 'https://assets.ggai.dev/icons/minecraft.png' },
    { app_id: 'fortnite', name: 'Fortnite', category: 'Game', icon_url: 'https://assets.ggai.dev/icons/fortnite.png' },
    { app_id: 'roblox', name: 'Roblox', category: 'Game', icon_url: 'https://assets.ggai.dev/icons/roblox.png' },
    { app_id: 'youtube', name: 'YouTube', category: 'Streaming', icon_url: 'https://assets.ggai.dev/icons/youtube.png' },
    { app_id: 'word', name: 'Microsoft Word', category: 'Education', icon_url: '/placeholder.svg' },
    { app_id: 'excel', name: 'Microsoft Excel', category: 'Education', icon_url: '/placeholder.svg' },
    { app_id: 'discord', name: 'Discord', category: 'Messaging', icon_url: 'https://assets.ggai.dev/icons/discord.png' },
  ],
  'demo-child-2': [
    { app_id: 'mario-kart', name: 'Mario Kart 8', category: 'Game', icon_url: 'https://assets.ggai.dev/icons/mario-kart.png' },
    { app_id: 'nintendo-online', name: 'Nintendo Online', category: 'Social', icon_url: 'https://assets.ggai.dev/icons/nintendo.png' },
  ],
  'demo-child-3': [
    { app_id: 'fortnite', name: 'Fortnite', category: 'Game', icon_url: 'https://assets.ggai.dev/icons/fortnite.png' },
    { app_id: 'xbox-live', name: 'Xbox Live', category: 'Social', icon_url: 'https://assets.ggai.dev/icons/xbox.png' },
  ],
};

export const demoChildTimePolicyByChildId: Record<string, { daily_total_minutes: number | null; bedtime: string | null }> = {
  'demo-child-1': { daily_total_minutes: 90, bedtime: '[21,7)' },
  'demo-child-2': { daily_total_minutes: 60, bedtime: '[20,7)' },
  'demo-child-3': { daily_total_minutes: 120, bedtime: '[22,6)' },
};

export const demoCategoryPoliciesByChildId: Record<string, Record<string, { allowed: boolean; daily_limit_minutes: number | null }>> = {
  'demo-child-1': {
    Game: { allowed: true, daily_limit_minutes: 60 },
    Streaming: { allowed: true, daily_limit_minutes: 30 },
    Messaging: { allowed: true, daily_limit_minutes: null },
    Social: { allowed: false, daily_limit_minutes: null },
    App: { allowed: true, daily_limit_minutes: null },
    Education: { allowed: true, daily_limit_minutes: null },
    Browser: { allowed: true, daily_limit_minutes: 20 },
    Other: { allowed: true, daily_limit_minutes: null },
  },
  'demo-child-2': {
    Game: { allowed: true, daily_limit_minutes: 45 },
    Streaming: { allowed: true, daily_limit_minutes: 20 },
    Messaging: { allowed: true, daily_limit_minutes: null },
    Social: { allowed: true, daily_limit_minutes: 15 },
    App: { allowed: true, daily_limit_minutes: null },
    Education: { allowed: true, daily_limit_minutes: null },
    Browser: { allowed: true, daily_limit_minutes: 15 },
    Other: { allowed: true, daily_limit_minutes: null },
  },
  'demo-child-3': {
    Game: { allowed: true, daily_limit_minutes: 90 },
    Streaming: { allowed: false, daily_limit_minutes: null },
    Messaging: { allowed: true, daily_limit_minutes: null },
    Social: { allowed: false, daily_limit_minutes: null },
    App: { allowed: true, daily_limit_minutes: null },
    Education: { allowed: true, daily_limit_minutes: null },
    Browser: { allowed: true, daily_limit_minutes: 10 },
    Other: { allowed: true, daily_limit_minutes: null },
  },
};

export const demoCurrentActivityByChildId: Record<string, { app_id: string; session_start: string } | null> = {
  'demo-child-1': { app_id: 'minecraft', session_start: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  'demo-child-2': null,
  'demo-child-3': { app_id: 'fortnite', session_start: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
};
