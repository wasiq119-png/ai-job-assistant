package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories; // Add this
import org.springframework.boot.autoconfigure.domain.EntityScan; // Add this

@SpringBootApplication
@EnableJpaRepositories("com.example.demo.repository") // Force scan here
@EntityScan("com.example.demo.entity") // Force scan here
public class DemoApplication {
	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}