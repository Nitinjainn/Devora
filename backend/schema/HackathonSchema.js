const { Schema } = require('mongoose');

const HackathonSchema = new Schema({
  title: { type: String, required: true },
  description: String,

  images: {
    banner: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },
    logo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },
    gallery: [{
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    }]
  },

  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  category: {
    type: String,
    enum: [
    'Artificial Intelligence', 'Blockchain', 'Cybersecurity',
    'Fintech', 'Gaming', 'Healthcare', 'Sustainability',
    'Mobile Development', 'Web Development', 'IoT',
    'Data Science', 'DevOps', 'EdTech' // <-- added EdTech
  ],
    required: true
  },

  difficultyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },

  location: { type: String },

  // Dates
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  submissionDeadline: { type: Date }, // optional

  maxParticipants: { type: Number, default: 100 },

  problemStatements: [String],
  problemStatementTypes: [String], // <-- NEW FIELD

  rounds: [{ // <-- NEW FIELD
    name: { type: String },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
  }],

  requirements: [String],
  perks: [String],
  tags: [String],

  judges: [{ type: String }],       // Email strings
  mentors: [{ type: String }],      // Email strings
  participants: [{ type: String }],
  
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  submissions: [{ type: Schema.Types.ObjectId, ref: 'Project' }],

  chatRoom: { type: Schema.Types.ObjectId, ref: 'ChatRoom' },

  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'online'
  },

  prizePool: {
    amount: { type: Number },
    currency: { type: String, default: 'USD' },
    breakdown: { type: String }
  },

  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'ended'],
    default: 'upcoming'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = HackathonSchema;
