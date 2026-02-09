# Use the official lightweight Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# 1. Copy dependency files first (for better caching)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 2. Install dependencies AND generate Prisma Client
# We do this as root so we have full write permissions
RUN npm install
RUN npx prisma generate

# 3. Copy the rest of the application code
COPY . .

# 4. Build the Next.js application
RUN npm run build

# 5. Expose the port (Coolify needs this)
EXPOSE 3000

# 6. Start the application
CMD ["npm", "start"]
