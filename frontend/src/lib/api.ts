import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface ApiOptions {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    isFormData?: boolean;
}

class ApiClient {
    private getToken(): string | undefined {
        return Cookies.get('mindmirror_token') || Cookies.get('evolveai_token');
    }

    private getHeaders(isFormData = false): Record<string, string> {
        const headers: Record<string, string> = {};
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const { method = 'GET', body, isFormData = false } = options;

        const config: RequestInit = {
            method,
            headers: this.getHeaders(isFormData),
        };

        if (body) {
            config.body = isFormData ? (body as FormData) : JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    }

    // Auth
    async register(name: string, email: string, password: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { name, email, password },
        });
    }

    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async updateProfile(data: Record<string, unknown>) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: data,
        });
    }

    // Interview
    async startInterview(mode: string, targetRole: string) {
        return this.request('/interview/start', {
            method: 'POST',
            body: { mode, targetRole },
        });
    }

    async submitAnswer(interviewId: string, questionIndex: number, userAnswer: string) {
        return this.request('/interview/submit-answer', {
            method: 'POST',
            body: { interviewId, questionIndex, userAnswer },
        });
    }

    async completeInterview(interviewId: string) {
        return this.request(`/interview/${interviewId}/complete`, {
            method: 'POST',
        });
    }

    async getInterviewHistory() {
        return this.request('/interview/history');
    }

    // Voice Analysis — send transcript + duration as JSON (no audio file needed)
    async analyzeVoiceTranscript(transcript: string, duration: number, interviewId?: string) {
        return this.request('/voice/analyze', {
            method: 'POST',
            body: { transcript, duration: Math.max(1, Math.round(duration)), interviewId },
        });
    }

    // Legacy form-data voice upload (kept for compatibility)
    async analyzeVoice(formData: FormData) {
        return this.request('/voice/analyze', {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    // DSA Practice Quiz (public endpoints — no auth required)
    async generateDSAQuestions(topic: string, difficulty: string, count: number, language: string) {
        return this.request('/dsa/generate', {
            method: 'POST',
            body: { topic, difficulty, count, language },
        });
    }

    async analyzeDSAResults(results: { questionId: string; topic: string; correct: boolean; skipped: boolean }[]) {
        return this.request('/dsa/analyze', {
            method: 'POST',
            body: { results },
        });
    }

    // Candidate Memory & AI Context
    async getCandidateMemory() {
        return this.request('/auth/candidate-memory');
    }

    async updateCandidateMemory(data: Record<string, unknown>) {
        return this.request('/auth/candidate-memory', {
            method: 'PUT',
            body: data,
        });
    }

    // Placement Roadmap
    async getRoadmap() {
        return this.request('/roadmap');
    }

    async generateRoadmap(data: { targetRole?: string; targetCompany?: string; targetDays?: number }) {
        return this.request('/roadmap/generate', {
            method: 'POST',
            body: data,
        });
    }

    async toggleRoadmapTask(day: number) {
        return this.request('/roadmap/toggle-task', {
            method: 'PUT',
            body: { day },
        });
    }

    // Company Prep
    async getCompanyList() {
        return this.request('/company/list');
    }

    async getCompanyPack(companyName: string, role?: string, experienceLevel?: string) {
        const query = new URLSearchParams({
            companyName,
            ...(role && { role }),
            ...(experienceLevel && { experienceLevel }),
        }).toString();
        return this.request(`/company/pack?${query}`);
    }

    // Project Deep Dive
    async getProjectDeepDive(title: string, description: string, techStack: string[]) {
        return this.request('/interview/project-deep-dive', {
            method: 'POST',
            body: { title, description, techStack },
        });
    }

    // Dashboard
    async getDashboard() {
        return this.request('/dashboard');
    }

    async getProgress() {
        return this.request('/dashboard/progress');
    }

    async getPlacementScore() {
        return this.request('/dashboard/placement-score', {
            method: 'POST',
        });
    }
}

export const api = new ApiClient();
export default api;

