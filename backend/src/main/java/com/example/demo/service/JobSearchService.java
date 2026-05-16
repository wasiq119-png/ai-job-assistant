package com.example.demo.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * JobSearchService — Powered by Adzuna (Germany /de/ endpoint).
 */
@Service
public class JobSearchService {

    private final ChatClient chatClient;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ADZUNA_APP_ID:PLACEHOLDER_APP_ID}")
    private String ADZUNA_APP_ID;

    @Value("${ADZUNA_APP_KEY:PLACEHOLDER_APP_KEY}")
    private String ADZUNA_APP_KEY;

    // ── SerpApi key kept as fallback ──────────────────────────────────────────
    private final String SERP_API_KEY = "8338ffc5395c4640830de704f9014f9182b5cf8c538952de13390fbbdedb50c4";

    public JobSearchService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // Simple container — URL is locked here, AI never sees it
    private static class JobEntry {
        final int index;
        final String title;
        final String company;
        final String location;
        final String url;
        final String summary;

        JobEntry(int index, String title, String company, String location, String url, String summary) {
            this.index = index;
            this.title = title;
            this.company = company;
            this.location = location;
            this.url = url;
            this.summary = summary;
        }
    }

    public String findMatchingJobs(String resumeText) {
        try {
            // ── STEP 1: Generate search query from resume ─────────────────────
            String queryContent = chatClient.prompt()
                    .system("Analyze this resume and return exactly one short job title (2-3 words). " +
                            "Do NOT include country or location. " +
                            "Examples: 'Java Developer', 'Data Scientist', 'Full Stack Developer'. " +
                            "Return ONLY the job title, nothing else.")
                    .user("RESUME:\n" + resumeText)
                    .call()
                    .content();

            String searchQuery = (queryContent != null ? queryContent.trim() : "Software Developer")
                    .replace("\"", "").replace("'", "")
                    .replaceAll("(?i)\\s*(germany|deutschland|berlin|munich|frankfurt)\\s*", " ").trim();

            String[] words = searchQuery.split("\\s+");
            if (words.length > 3) searchQuery = words[0] + " " + words[1] + " " + words[2];

            System.out.println("[JobSearch] Job title query: " + searchQuery);

            // ── STEP 2: Fetch from Adzuna Germany endpoint (/de/) ─────────────
            List<JobEntry> entries = fetchFromAdzuna(searchQuery, resumeText);

            // If Adzuna has no credentials yet, fall back to SerpApi
            if (entries == null) {
                System.out.println("[JobSearch] Adzuna not configured — falling back to SerpApi");
                entries = fetchFromSerpApi(searchQuery);
            }

            if (entries == null || entries.isEmpty()) {
                return "[{\"error\": \"No jobs found. Please configure Adzuna API at developer.adzuna.com\"}]";
            }

            // ── STEP 3: Build AI summary (NO URLs — AI never sees them) ───────
            StringBuilder jobSummaryForAi = new StringBuilder("[\n");
            for (int i = 0; i < entries.size(); i++) {
                JobEntry e = entries.get(i);
                jobSummaryForAi.append("{\"idx\":").append(e.index)
                        .append(", \"title\":\"").append(e.title.replace("\"", "'").replace("\\", ""))
                        .append("\", \"company\":\"").append(e.company.replace("\"", "'").replace("\\", ""))
                        .append("\", \"location\":\"").append(e.location.replace("\"", "'").replace("\\", ""))
                        .append("\", \"summary\":\"").append(e.summary.replace("\"", "'").replace("\\", ""))
                        .append("\"}");
                if (i < entries.size() - 1) {
                    jobSummaryForAi.append(",\n");
                } else {
                    jobSummaryForAi.append("\n");
                }
            }
            jobSummaryForAi.append("]");

            // ── STEP 4: AI picks top 5 — returns ONLY idx numbers ─────────────
            String aiRaw = chatClient.prompt()
                    .system("You are a strict JSON API. Given a resume and job list, pick the top 5 best matching jobs. " +
                            "Output ONLY a valid JSON array of objects. Do not include any markdown formatting, backticks, or conversational text. " +
                            "Each object MUST have EXACTLY these keys: " +
                            "\"idx\" (Integer, exactly from source — MANDATORY), " +
                            "\"match_reason\" (String, 2 sentences), " +
                            "\"match_score\" (Integer 0-100).")
                    .user("RESUME:\n" + resumeText + "\n\nJOBS:\n" + jobSummaryForAi.toString())
                    .call()
                    .content();

            if (aiRaw == null) return "[{\"error\": \"AI returned null\"}]";

            int start = aiRaw.indexOf('[');
            int end = aiRaw.lastIndexOf(']');
            if (start < 0 || end <= start) {
                System.err.println("[JobSearch] AI failed to return JSON array. Raw response: " + aiRaw);
                return "[{\"error\": \"AI did not return valid JSON array\"}]";
            }
            String aiJson = aiRaw.substring(start, end + 1);

            // ── STEP 5: Inject URLs from Java list (simple index lookup) ──────
            JsonNode aiArray = objectMapper.readTree(aiJson);
            ArrayNode result = objectMapper.createArrayNode();

            if (aiArray.isArray()) {
                for (JsonNode item : aiArray) {
                    int idx = item.path("idx").asInt(-1);
                    if (idx < 0 || idx >= entries.size()) {
                        System.out.println("[JobSearch] WARNING: invalid idx=" + idx + " skipped");
                        continue;
                    }
                    JobEntry e = entries.get(idx);
                    ObjectNode out = objectMapper.createObjectNode();
                    out.put("title", e.title);
                    out.put("company", e.company);
                    out.put("location", e.location);
                    out.put("match_reason", item.path("match_reason").asText("Good match for your skills."));
                    out.put("match_score", item.path("match_score").asInt(75));
                    out.put("url", e.url); // ← Direct from Java, 0% AI involvement
                    result.add(out);
                    System.out.println("[JobSearch] Output job[" + idx + "] → " + e.url);
                }
            }

            if (result.isEmpty()) return "[{\"error\": \"AI could not match any jobs. Try again.\"}]";

            String finalJson = objectMapper.writeValueAsString(result);
            System.out.println("[JobSearch] Done. " + result.size() + " jobs returned.");
            return finalJson;

        } catch (Exception e) {
            e.printStackTrace();
            return "[{\"error\": \"Service error: " + e.getMessage().replace("\"", "'") + "\"}]";
        }
    }

    /**
     * Fetches jobs from Adzuna's German endpoint.
     * Returns null if Adzuna is not yet configured (credentials are placeholders).
     * API docs: https://developer.adzuna.com/activedocs#!/adzuna/search
     */
    private List<JobEntry> fetchFromAdzuna(String searchQuery, String resumeText) {
        if (ADZUNA_APP_ID.equals("PLACEHOLDER_APP_ID")) {
            return null; // Not configured yet
        }

        try {
            String encoded = URLEncoder.encode(searchQuery, StandardCharsets.UTF_8.toString());
            // /de/ = Germany, /gb/ = UK, /us/ = US, /fr/ = France, etc.
            String url = "https://api.adzuna.com/v1/api/jobs/de/search/1" +
                    "?app_id=" + ADZUNA_APP_ID +
                    "&app_key=" + ADZUNA_APP_KEY +
                    "&results_per_page=10" +
                    "&what=" + encoded +
                    "&content-type=application/json";

            System.out.println("[JobSearch] Querying Adzuna DE: " + searchQuery);
            String rawJson = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode jobsArray = root.path("results");

            System.out.println("[JobSearch] Adzuna returned " + (jobsArray.isArray() ? jobsArray.size() : 0) + " jobs");

            List<JobEntry> entries = new ArrayList<>();
            if (jobsArray.isArray()) {
                for (JsonNode job : jobsArray) {
                    if (entries.size() >= 10) break;

                    String title    = job.path("title").asText("Untitled");
                    String company  = job.path("company").path("display_name").asText("Unknown Company");
                    String location = job.path("location").path("display_name").asText("Germany");
                    String applyUrl = job.path("redirect_url").asText(null); // Direct Adzuna redirect to job portal

                    if (applyUrl == null || applyUrl.isBlank()) continue;

                    String desc = job.path("description").asText("")
                            .replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
                    if (desc.length() > 400) desc = desc.substring(0, 400) + "...";

                    entries.add(new JobEntry(entries.size(), title, company, location, applyUrl, desc));
                    System.out.println("[JobSearch] Adzuna job[" + (entries.size()-1) + "] at " + location + " → " + applyUrl);
                }
            }
            return entries;
        } catch (Exception ex) {
            System.err.println("[JobSearch] Adzuna fetch error: " + ex.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Fallback: SerpApi (returns non-Germany jobs but keeps app functional).
     */
    private List<JobEntry> fetchFromSerpApi(String searchQuery) {
        try {
            String encodedQuery = URLEncoder.encode(searchQuery, StandardCharsets.UTF_8.toString());
            String apiUrl = "https://serpapi.com/search.json?engine=google_jobs&q=" + encodedQuery
                    + "&google_domain=google.de&hl=en&api_key=" + SERP_API_KEY;

            String rawJson = restTemplate.getForObject(apiUrl, String.class);
            JsonNode root = objectMapper.readTree(rawJson);

            if (root.has("error")) {
                System.out.println("[JobSearch] SerpApi error: " + root.path("error").asText());
                // Try without google.de domain
                apiUrl = "https://serpapi.com/search.json?engine=google_jobs&q=" + encodedQuery
                        + "&hl=en&api_key=" + SERP_API_KEY;
                rawJson = restTemplate.getForObject(apiUrl, String.class);
                root = objectMapper.readTree(rawJson);
            }

            if (root.has("error")) return new ArrayList<>();

            JsonNode jobsArray = root.path("jobs_results");
            System.out.println("[JobSearch] SerpApi returned " + (jobsArray.isArray() ? jobsArray.size() : 0) + " jobs");

            List<JobEntry> entries = new ArrayList<>();
            if (jobsArray.isArray()) {
                for (JsonNode job : jobsArray) {
                    if (entries.size() >= 10) break;
                    String title    = job.path("title").asText("Untitled");
                    String company  = job.path("company_name").asText("Unknown");
                    String location = job.path("location").asText("Unknown");
                    String url      = null;

                    if (job.has("apply_options") && job.path("apply_options").isArray() && job.path("apply_options").size() > 0)
                        url = job.path("apply_options").get(0).path("link").asText(null);
                    if (url == null || url.isBlank())
                        url = job.path("share_link").asText(null);
                    if (url == null || url.isBlank()) continue;

                    String desc = job.path("description").asText("").replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
                    if (desc.length() > 400) desc = desc.substring(0, 400) + "...";
                    entries.add(new JobEntry(entries.size(), title, company, location, url, desc));
                }
            }
            return entries;
        } catch (Exception ex) {
            System.err.println("[JobSearch] SerpApi fetch error: " + ex.getMessage());
            return new ArrayList<>();
        }
    }
}
