FROM gradle:8.7-jdk17 AS build
WORKDIR /workspace
COPY . .
RUN gradle --no-daemon build -x test

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/build/*-runner.jar /app/app.jar
EXPOSE 8081
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
