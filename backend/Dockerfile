# Step 1: Build the Java application using Maven (Updated to stable Eclipse Temurin)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src
COPY .mvn ./.mvn
COPY mvnw .

# Ensure the Maven wrapper has execution permissions and compile the .jar file
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Step 2: Run the compiled .jar file using a lightweight Java runtime (Updated to stable Eclipse Temurin)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Spring Boot default port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]