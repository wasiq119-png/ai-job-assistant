package com.example.demo.service;

import com.example.demo.entity.AnalysisReport;
import com.example.demo.repository.AnalysisReportRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final ChatClient chatClient;
    private final AnalysisReportRepository repository;

    public AiService(ChatClient.Builder builder, AnalysisReportRepository repository) {
        this.chatClient = builder.build();
        this.repository = repository;
    }

    public AnalysisReport analyze(String jobText, String resumeText) {
        String systemPrompt = "You are a career coach and professional writer. Compare the Resume against the Job Description.\n\n"
                +
                "PROVIDE THE FOLLOWING EXACT FORMAT:\n" +
                "1. ---REQUIRED_SKILLS_START---\n" +
                "[Extract all specific technical skills and tools required by the JD as a comma-separated list here]\n"
                +
                "---REQUIRED_SKILLS_END---\n\n" +
                "2. ---CANDIDATE_SKILLS_START---\n" +
                "[Extract all specific technical skills and tools found on the Resume as a comma-separated list here]\n"
                +
                "---CANDIDATE_SKILLS_END---\n\n" +
                "3. **Analysis Report**: 3-5 concise tips comparing the resume to the JD.\n\n" +
                "4. **Cover Letter**: A high-impact, tailored cover letter in a TRADITIONAL, FLUID style (paragraphs only, no meta-headers like 'Introduction').\n\n"
                +
                "STYLE GUIDELINES:\n" +
                "- Start with 'Dear Hiring Manager,' or 'Dear Hiring Team at [Company],'.\n" +
                "- Use 4-5 well-structured paragraphs that connect the candidate's skills to the company's mission.\n" +
                "- EXTRACTION: Locate the candidate's Full Name, LinkedIn URL, GitHub profile, and Portfolio link. \n" +
                "  NOTE: Check the 'EXTRACTED HYPERLINKS (HIDDEN)' section at the end of the resume text for URLs that may be behind clickable icons.\n"
                +
                "- SIGN-OFF: End with 'Sincerely,' followed by a professional signature block:\n\n" +
                "  **[Full Name]**\n\n" +
                "  - **LinkedIn**: [URL]\n" +
                "  - **GitHub**: [URL]\n" +
                "  - **Portfolio**: [URL]\n\n" +
                "DELIMITER: Use '---COVER_LETTER_START---' as a unique separator between the Analysis and the Cover Letter.\n"
                +
                "TONE: Confident, professional, and persuasive.";

        String aiResponse = chatClient.prompt()
                .system(systemPrompt)
                .user("JOB: " + jobText + "\n\nRESUME: " + resumeText)
                .call()
                .content();

        if (aiResponse == null) {
            return null;
        }

        // 2. Extract components from the AI response
        String reportContent = aiResponse;
        String coverLetterContent = "";

        if (aiResponse.contains("---COVER_LETTER_START---")) {
            String[] parts = aiResponse.split("---COVER_LETTER_START---");
            reportContent = parts[0].trim();
            coverLetterContent = parts[1].trim();
        }

        // 3. Jaccard Similarity Mathematical Calculation
        String requiredSkillsCsv = extractBlock(reportContent, "---REQUIRED_SKILLS_START---",
                "---REQUIRED_SKILLS_END---");
        String candidateSkillsCsv = extractBlock(reportContent, "---CANDIDATE_SKILLS_START---",
                "---CANDIDATE_SKILLS_END---");

        Set<String> requiredSet = parseToSet(requiredSkillsCsv);
        Set<String> candidateSet = parseToSet(candidateSkillsCsv);

        System.out.println("====== MATHEMATICAL MATCH CALCULATION ======");
        System.out.println("Required Skills: " + requiredSet);
        System.out.println("Candidate Skills: " + candidateSet);

        int extractedScore = 0;
        if (!requiredSet.isEmpty()) {
            // Fuzzy match: normalize both sides so React / React.js / ReactJS all count as
            // the same
            Set<String> normalizedRequired = requiredSet.stream().map(this::normalizeSkill).collect(Collectors.toSet());
            Set<String> normalizedCandidate = candidateSet.stream().map(this::normalizeSkill)
                    .collect(Collectors.toSet());

            Set<String> intersection = new HashSet<>(normalizedRequired);
            intersection.retainAll(normalizedCandidate);

            // Score is (Matches / Total Job Requirements) * 100
            extractedScore = (int) Math.round(((double) intersection.size() / normalizedRequired.size()) * 100);

            System.out.println("Normalized Required: " + normalizedRequired);
            System.out.println("Normalized Candidate: " + normalizedCandidate);
            System.out.println("Fuzzy Intersection (Matches): " + intersection);
            System.out.println("Math: (" + intersection.size() + " / " + normalizedRequired.size() + ") * 100 = "
                    + extractedScore + "%");
        } else {
            System.out.println("Math: No required skills found to match against.");
        }
        System.out.println("=============================================");

        // Clean up the text response by removing the raw data blocks so the user
        // doesn't see them
        reportContent = reportContent.replaceAll("---REQUIRED_SKILLS_START---[\\s\\S]*?---REQUIRED_SKILLS_END---", "");
        reportContent = reportContent.replaceAll("---CANDIDATE_SKILLS_START---[\\s\\S]*?---CANDIDATE_SKILLS_END---",
                "");
        reportContent = "**Calculated Match Score**: " + extractedScore + "%\n\n" + reportContent.trim();

        // 4. Save to History Database
        AnalysisReport report = new AnalysisReport();

        String title = (jobText != null && jobText.length() > 30)
                ? jobText.substring(0, 27) + "..."
                : (jobText != null ? jobText : "Untitled Position");

        report.setJobTitle(title);
        report.setMatchScore(extractedScore);
        report.setMissingSkills(reportContent);
        report.setCoverLetter(coverLetterContent);

        return repository.save(report);
    }

    public String generateCoverLetter(String jobText, String resumeText, Long reportId) {
        String systemPrompt = "You are a professional career advisor and hiring manager. Based on the provided Job Description and Resume, "
                +
                "draft a compelling, highly-tailored cover letter in a TRADITIONAL FLUID style.\n\n" +
                "STYLE 1 GUIDELINES:\n" +
                "- Use only fluid paragraphs. DO NOT use meta-headers like 'Introduction' or 'Key Strengths'.\n" +
                "- Start with a professional salutation: 'Dear Hiring Manager,'.\n" +
                "- Highlight the mission alignment and technical expertise naturally.\n" +
                "- VARIETY: If this is a regeneration, use a slightly different perspective/tone each time.\n" +
                "- EXTRACTION: Pull candidate Name, LinkedIn, GitHub, and Portfolio URLs. Check the 'EXTRACTED HYPERLINKS (HIDDEN)' section if provided.\n"
                +
                "- SIGN-OFF: Use a professional vertical signature block:\n\n" +
                "  Sincerely,\n\n" +
                "  **[Full Name]**\n\n" +
                "  - **LinkedIn**: [URL]\n" +
                "  - **GitHub**: [URL]\n" +
                "  - **Portfolio**: [URL]\n\n" +
                "FORMAT: Professional Markdown.\n" +
                "LENGTH: Under 400 words.";

        String content = chatClient.prompt()
                .system(systemPrompt)
                .user("JOB DESCRIPTION:\n" + jobText + "\n\nRESUME:\n" + resumeText)
                .call()
                .content();

        if (content != null && reportId != null) {
            repository.findById(reportId).ifPresent(report -> {
                report.setCoverLetter(content);
                repository.save(report);
            });
        }

        return content;
    }

    public String chat(String message, String resumeText) {
        String systemPrompt = "You are J.A.R.V.I.S., an elite AI Career Coach and assistant. " +
                "Provide highly intelligent, concise, and actionable advice on interviews, resumes, or career negotiation. " +
                "Use a professional, slightly futuristic, but extremely helpful tone. Format responses in clean Markdown.";
        
        if (resumeText != null && !resumeText.isEmpty()) {
            systemPrompt += "\n\nThe user has provided their resume for context. Tailor your advice to their experience if relevant:\n\nRESUME:\n" + resumeText;
        }

        return chatClient.prompt()
                .system(systemPrompt)
                .user(message != null ? message : "")
                .call()
                .content();
    }

    // Helper method to extract text between delimiters
    private String extractBlock(String text, String startDelim, String endDelim) {
        int start = text.indexOf(startDelim);
        int end = text.indexOf(endDelim);
        if (start != -1 && end != -1 && start < end) {
            return text.substring(start + startDelim.length(), end).trim();
        }
        return "";
    }

    // Helper method to parse CSV to Set and normalize case
    private Set<String> parseToSet(String csv) {
        if (csv == null || csv.isEmpty())
            return new HashSet<>();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty() && !s.equals("none") && !s.equals("n/a"))
                .collect(Collectors.toSet());
    }

    /**
     * Normalizes a skill string so that common variants map to the same token.
     * Examples:
     * "React.js" -> "react"
     * "ReactJS" -> "react"
     * "Node.js" -> "node"
     * "nodeJS" -> "node"
     * "Vue.js" -> "vue"
     * "Next.js" -> "next"
     * "Python 3" -> "python"
     * "ES6" -> "es6" (kept as-is)
     */
    private String normalizeSkill(String skill) {
        if (skill == null)
            return "";
        String s = skill.toLowerCase().trim();

        // Remove trailing version numbers like " 3", " 3.x", " 11", etc.
        s = s.replaceAll("\\s+\\d+(\\.\\d+)*$", "");

        // Remove .js / .ts / .py extensions
        if (s.endsWith(".js"))
            s = s.substring(0, s.length() - 3);
        else if (s.endsWith(".ts"))
            s = s.substring(0, s.length() - 3);
        else if (s.endsWith(".py"))
            s = s.substring(0, s.length() - 3);

        // Strip trailing "js" or "ts" for camelCase variants like ReactJS, NodeJS,
        // VueJS
        if (s.endsWith("js") && s.length() > 3)
            s = s.substring(0, s.length() - 2);
        else if (s.endsWith("ts") && s.length() > 3)
            s = s.substring(0, s.length() - 2);

        // Explicit aliases for edge cases
        switch (s) {
            case "javascript":
                return "javascript";
            case "typescript":
                return "typescript";
            case "postgresql":
                return "postgresql";
            case "postgres":
                return "postgresql";
            default:
                return s.trim();
        }
    }
}
