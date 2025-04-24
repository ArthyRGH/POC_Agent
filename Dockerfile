FROM python:3.9-slim-buster

WORKDIR /app

# Install git (if needed for your project, e.g., cloning repositories)
RUN apt-get update && apt-get install -y git --no-install-recommends

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the project files
COPY . .

# Set the working directory for running scripts
WORKDIR /app/scripts

# Define a default command (you can override this when running the container)
CMD ["echo", "Docker container started. Use 'docker exec' to run specific scripts."]
