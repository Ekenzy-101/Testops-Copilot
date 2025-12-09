# Use official Python image 
FROM python:3.13-slim AS base

# Create a non-privileged user to run the application
RUN adduser \
   --disabled-password \
   --gecos "" \
   --home "/nonexistent" \
   --shell "/sbin/nologin" \
   --no-create-home \
   --uid "10001" \
   python

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY --chown=python:python ./requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip --no-cache-dir && \ 
    pip install --no-cache-dir -r requirements.txt

# Switch to the non-privileged user
USER python

# Expose the application port
EXPOSE 8000

# Copy the remaining source code
COPY --chown=python:python . .

# Command to run the application
CMD ["sh", "-c", "uvicorn app.app:app"]