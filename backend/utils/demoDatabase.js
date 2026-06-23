// Demo Database - In-memory storage for when MongoDB is not available
const demoDB = {
  users: [],
  interviews: [],
  resumes: [],
  progress: []
};

// Generate mock ID
const generateId = () => Math.random().toString(36).substr(2, 9);

class DemoDatabase {
  // Users
  static createUser(userData) {
    const user = {
      _id: generateId(),
      ...userData,
      createdAt: new Date()
    };
    demoDB.users.push(user);
    return user;
  }

  static findUserByEmail(email) {
    return demoDB.users.find(u => u.email === email);
  }

  static findUserById(id) {
    return demoDB.users.find(u => u._id === id);
  }

  // Interviews
  static createInterview(interviewData) {
    const interview = {
      _id: generateId(),
      ...interviewData,
      createdAt: new Date()
    };
    demoDB.interviews.push(interview);
    return interview;
  }

  static getInterviewsByUserId(userId) {
    return demoDB.interviews.filter(i => i.userId === userId);
  }

  static findInterviewById(id) {
    return demoDB.interviews.find(i => i._id === id);
  }

  // Progress
  static createProgress(progressData) {
    const progress = {
      _id: generateId(),
      ...progressData,
      createdAt: new Date()
    };
    demoDB.progress.push(progress);
    return progress;
  }

  static getProgressByUserId(userId) {
    return demoDB.progress.find(p => p.userId === userId);
  }

  static updateProgress(userId, updateData) {
    const progress = this.getProgressByUserId(userId);
    if (progress) {
      Object.assign(progress, updateData);
      return progress;
    }
    return null;
  }

  // Resumes
  static createResume(resumeData) {
    const resume = {
      _id: generateId(),
      ...resumeData,
      createdAt: new Date()
    };
    demoDB.resumes.push(resume);
    return resume;
  }

  static getResumeByUserId(userId) {
    return demoDB.resumes.find(r => r.userId === userId);
  }

  static getResumeById(id) {
    return demoDB.resumes.find(r => r._id === id);
  }

  // Clear all data
  static clearAll() {
    demoDB.users = [];
    demoDB.interviews = [];
    demoDB.resumes = [];
    demoDB.progress = [];
  }

  // Get stats for demo
  static getDemoStats() {
    return {
      users: demoDB.users.length,
      interviews: demoDB.interviews.length,
      resumes: demoDB.resumes.length,
      progress: demoDB.progress.length
    };
  }
}

module.exports = DemoDatabase;
