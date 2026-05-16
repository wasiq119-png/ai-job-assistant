package com.example.demo;

import com.example.demo.entity.AnalysisReport;
import com.example.demo.repository.AnalysisReportRepository;
import com.example.demo.service.AiService;
import com.example.demo.service.JobSearchService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

// Word Support Imports
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotation;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationLink;
import org.apache.pdfbox.pdmodel.interactive.action.PDAction;
import org.apache.pdfbox.pdmodel.interactive.action.PDActionURI;
import org.apache.poi.xwpf.usermodel.XWPFHyperlink;

import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    private final AnalysisReportRepository repository;
    private final AiService aiService;
    private final JobSearchService jobSearchService;

    // Use constructor injection for dependencies
    public AiController(AnalysisReportRepository repository, AiService aiService, JobSearchService jobSearchService) {
        this.repository = repository;
        this.aiService = aiService;
        this.jobSearchService = jobSearchService;
    }

    @PostMapping("/analyze")
    public Object analyzeMatch(@RequestParam("jobFile") MultipartFile jobFile,
                               @RequestParam("resumeFile") MultipartFile resumeFile) {
        try {
            // 1. Extract text from the Job Description (PDF or Word)
            String jobText = extractTextFromFile(jobFile);

            // 2. Extract text from the Resume (PDF or Word)
            String resumeText = extractTextFromFile(resumeFile);

            // 3. Pass the extracted text to your AI logic service
            AnalysisReport report = aiService.analyze(jobText, resumeText);
            if (report == null) return "Error: AI failed to generate response.";
            return report;

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // HELPER METHOD: This handles PDF, DOCX, and DOC files
    private String extractTextFromFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("The uploaded file is empty or missing.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IOException("Filename is missing.");
        }

        System.out.println("Processing: " + filename + " (" + file.getSize() + " bytes)");

        String lowerName = filename.toLowerCase();

        // 1. Handle PDF
        if (lowerName.endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                String mainText = stripper.getText(document);

                // EXTRACTION: Deep-scan for clickable hyperlinks in PDF annotations
                List<String> links = new ArrayList<>();
                for (PDPage page : document.getPages()) {
                    for (PDAnnotation annot : page.getAnnotations()) {
                        if (annot instanceof PDAnnotationLink) {
                            PDAnnotationLink link = (PDAnnotationLink) annot;
                            PDAction action = link.getAction();
                            if (action instanceof PDActionURI) {
                                PDActionURI uriAction = (PDActionURI) action;
                                String uri = uriAction.getURI();
                                if (uri != null) links.add(uri);
                            }
                        }
                    }
                }

                if (!links.isEmpty()) {
                    mainText += "\n\nEXTRACTED HYPERLINKS (HIDDEN):\n" + String.join("\n", links.stream().distinct().collect(Collectors.toList()));
                }
                return mainText;
            }
        } 
        // 2. Handle DOCX (Modern Word)
        else if (lowerName.endsWith(".docx")) {
            try (XWPFDocument doc = new XWPFDocument(file.getInputStream());
                 XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                
                String mainText = extractor.getText();

                // EXTRACTION: Deep-scan for clickable hyperlinks in Word
                List<String> links = new ArrayList<>();
                for (XWPFHyperlink link : doc.getHyperlinks()) {
                    String url = link.getURL();
                    if (url != null) links.add(url);
                }

                if (!links.isEmpty()) {
                    mainText += "\n\nEXTRACTED HYPERLINKS (HIDDEN):\n" + String.join("\n", links.stream().distinct().collect(Collectors.toList()));
                }
                return mainText;
            }
        } 
        // 3. Handle DOC (Old Word)
        else if (lowerName.endsWith(".doc")) {
            try (HWPFDocument doc = new HWPFDocument(file.getInputStream());
                 WordExtractor extractor = new WordExtractor(doc)) {
                return extractor.getText();
            }
        } 
        // 4. Unsupported Format
        else {
            throw new IOException("Unsupported format: " + filename + ". Please use PDF, DOCX, or DOC.");
        }
    }

    @GetMapping("/history")
    public List<AnalysisReport> getHistory() {
        return repository.findAll();
    }

    @DeleteMapping("/history/{id}")
    public void deleteReport(@PathVariable long id) {
        repository.deleteById(id);
    }

    @PostMapping("/cover-letter")
    public String generateCoverLetter(@RequestParam("jobFile") MultipartFile jobFile,
                                     @RequestParam("resumeFile") MultipartFile resumeFile,
                                     @RequestParam(value = "reportId", required = false) Long reportId) {
        try {
            String jobText = extractTextFromFile(jobFile);
            String resumeText = extractTextFromFile(resumeFile);
            return aiService.generateCoverLetter(jobText, resumeText, reportId);
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @PostMapping("/chat")
    public String chat(@RequestParam("message") String message,
                       @RequestParam(value = "resumeFile", required = false) MultipartFile resumeFile) {
        try {
            String resumeText = "";
            if (resumeFile != null && !resumeFile.isEmpty()) {
                resumeText = extractTextFromFile(resumeFile);
            }
            return aiService.chat(message, resumeText);
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @PostMapping(value = "/find-jobs", produces = "application/json")
    public String findJobs(@RequestParam("resumeFile") MultipartFile resumeFile) {
        try {
            if (resumeFile == null || resumeFile.isEmpty()) {
                return "[{\"error\": \"Resume is required to find matching jobs.\"}]";
            }
            String resumeText = extractTextFromFile(resumeFile);
            return jobSearchService.findMatchingJobs(resumeText);
        } catch (Exception e) {
            return "[{\"error\": \"" + e.getMessage() + "\"}]";
        }
    }
}