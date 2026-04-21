import { sendMessageToGemini } from './gemini';

export const generateRoadmapWithGemini = async (user, formData) => {
  try {
    const prompt = `Create an ultra-detailed, personalized career roadmap for ${user?.firstName || 'a professional'} who wants to become a ${formData.targetCareer}.

**Current Status:**
- Current Role/Level: ${formData.currentLevel}
- Existing Skills: ${formData.skills?.join(', ') || 'No specific skills listed yet'}
- Total Experience Points: ${user?.totalXP || 0} XP

**Required Output Format (MUST be valid JSON):**
{
  "overview": "2-3 sentence personalized introduction",
  "totalDuration": "Overall timeline (e.g., 12-18 months)",
  "phases": [
    {
      "title": "Phase name (e.g., Foundation Phase)",
      "duration": "Time needed (e.g., 2-3 months)",
      "description": "What you'll achieve in this phase",
      "goals": ["Specific goal 1", "Specific goal 2", "Specific goal 3"],
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "projects": ["Project idea 1 with description", "Project idea 2", "Project idea 3"],
      "resources": ["Specific course/book/tutorial 1", "Resource 2", "Resource 3"],
      "milestones": ["Checkpoint 1", "Checkpoint 2"],
      "tips": ["Practical tip 1", "Practical tip 2"]
    }
  ]
}

**Requirements:**
1. Create 4-6 detailed phases (Foundation → Intermediate → Advanced → Specialized → Professional → Expert)
2. Each phase should have 5+ specific skills to learn
3. Provide 3-5 real project ideas with brief descriptions
4. List 3-5 specific resources (courses, books, platforms)
5. Include 2-3 measurable milestones per phase
6. Add 2-3 practical tips for each phase
7. Make it personalized based on their current skills
8. Be realistic about timelines
9. Focus on in-demand skills for ${formData.targetCareer} role
10. Include both technical and soft skills

Generate ONLY valid JSON, no markdown formatting or code blocks.`;

    const response = await sendMessageToGemini(prompt, 'You are an expert career development advisor who creates detailed, actionable career roadmaps in JSON format.');
    
    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.substring(7);
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.substring(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
    }
    cleanedResponse = cleanedResponse.trim();
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(cleanedResponse);
      return JSON.stringify(parsed);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      // Return fallback roadmap
      return generateFallbackRoadmap(formData.targetCareer);
    }
  } catch (error) {
    console.error('Error generating roadmap with Gemini:', error);
    return generateFallbackRoadmap(formData.targetCareer);
  }
};

const generateFallbackRoadmap = (targetCareer) => {
  return JSON.stringify({
    overview: `A comprehensive roadmap to help you become a ${targetCareer}. This plan is tailored to your current experience and will guide you step by step.`,
    totalDuration: '12-18 months',
    phases: [
      {
        title: 'Foundation Phase',
        duration: '2-3 months',
        description: 'Build strong fundamentals and core technical skills',
        goals: ['Master programming basics', 'Understand core concepts', 'Build first projects'],
        skills: ['Programming fundamentals', 'Data structures', 'Algorithms', 'Version control (Git)', 'Problem solving'],
        projects: ['Build a portfolio website', 'Create simple command-line tools', 'Contribute to open source'],
        resources: ['FreeCodeCamp', 'The Odin Project', 'CS50 by Harvard', 'LeetCode Easy problems'],
        milestones: ['Complete 50 coding problems', 'Build 3 small projects'],
        tips: ['Practice coding daily for at least 1 hour', 'Join developer communities like Discord/Reddit', 'Document your learning journey on a blog']
      },
      {
        title: 'Intermediate Phase',
        duration: '3-4 months',
        description: 'Deepen technical expertise and build real-world projects',
        goals: ['Master frameworks and tools', 'Build complex applications', 'Learn best practices and design patterns'],
        skills: ['Modern frameworks', 'Database design', 'API development', 'Testing & debugging', 'Deployment & DevOps'],
        projects: ['Full-stack web application with auth', 'RESTful API service', 'Database-driven project with real data'],
        resources: ['Official framework documentation', 'Udemy comprehensive courses', 'YouTube tutorials (Traversy Media, Net Ninja)', 'Medium articles and tech blogs'],
        milestones: ['Deploy a live application', 'Complete 100 coding problems', 'Get first code review'],
        tips: ['Focus on code quality and best practices', 'Learn by building, not just watching', 'Get feedback through code reviews']
      },
      {
        title: 'Advanced Phase',
        duration: '4-5 months',
        description: 'Specialize and build production-ready skills',
        goals: ['Master advanced patterns', 'Build scalable systems', 'Contribute to large codebases'],
        skills: ['System design', 'Performance optimization', 'Security best practices', 'Cloud services (AWS/Azure)', 'CI/CD pipelines'],
        projects: ['Microservices architecture', 'Real-time application with WebSockets', 'Major open source contributions'],
        resources: ['System Design Primer', 'AWS/Azure certification courses', 'Engineering blogs (Netflix, Uber)', 'Conference talks on YouTube'],
        milestones: ['Build app handling 1000+ concurrent users', 'Contribute to major open source project', 'Implement complex system design'],
        tips: ['Think about scalability from day one', 'Learn from production issues', 'Network with professionals in your field']
      },
      {
        title: 'Specialized Phase',
        duration: '2-3 months',
        description: 'Deep dive into your specialization area',
        goals: ['Become expert in niche area', 'Build advanced projects', 'Establish yourself in community'],
        skills: ['Advanced specialization topics', 'Architecture patterns', 'Technical leadership', 'Code review skills', 'Mentoring'],
        projects: ['Innovative project in specialization', 'Technical blog series', 'Open source tool/library'],
        resources: ['Advanced books in your field', 'Research papers', 'Specialized online courses', 'Community meetups'],
        milestones: ['Publish technical content', 'Speak at meetup/conference', 'Mentor junior developers'],
        tips: ['Share your knowledge through blogs/videos', 'Build a personal brand', 'Contribute to technical discussions']
      },
      {
        title: 'Professional Phase',
        duration: '3-6 months',
        description: 'Job preparation and portfolio building',
        goals: ['Build impressive portfolio', 'Master technical interviews', 'Land your dream job'],
        skills: ['Interview preparation', 'Resume building', 'Professional networking', 'Salary negotiation', 'Portfolio presentation'],
        projects: ['Showcase portfolio project', 'Technical blog/YouTube channel', 'Open source maintainer role'],
        resources: ['Cracking the Coding Interview', 'LeetCode Premium', 'System Design Interview books', 'LinkedIn Learning'],
        milestones: ['Complete 200+ interview problems', 'Get 5+ job interviews', 'Receive job offers'],
        tips: ['Practice mock interviews weekly', 'Network actively on LinkedIn', 'Refine your personal story and pitch']
      }
    ]
  });
};
