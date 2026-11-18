# 1. Start with a standard Node.js image
FROM node:22-bookworm-slim

# 2. Install Python and pip
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the server
WORKDIR /app

# 4. Copy Node package files and install dependencies
COPY package*.json ./
RUN npm ci

# 5. Copy Python requirements and install them
COPY ml/requirements.txt ./ml/
RUN python3 -m venv .venv && .venv/bin/pip install --no-cache-dir -r ml/requirements.txt

# 6. Copy all the rest of your server code
COPY . .

# 7. Expose the port (Render automatically assigns one, but this is a good default)
EXPOSE 5000

# 8. Start the Node server
CMD ["npm", "run", "start:all"]
