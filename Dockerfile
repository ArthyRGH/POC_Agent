FROM python:3.9-slim-buster

WORKDIR /app

# Copy requirements and install dependencies (if you have a requirements.txt)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the entire project directory (including .git if not ignored)
COPY . .

# Set the working directory for running your application
WORKDIR /app/<your_project_subdirectory> # If your main code is in a subfolder

# Define the command to run your application
CMD ["python", "main.py"] # Replace with your application's entry point
