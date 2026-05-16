package com.example.demo.repository;

import com.example.demo.entity.AnalysisReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// This tells Spring: "This hand manages the AnalysisReport table using Long
// (ID) as the key"
public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {
    // You don't need to write anything else!
    // .save(), .findAll(), and .delete() are already built-in.
}