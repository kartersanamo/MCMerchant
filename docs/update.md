# Update Docker Image (quick copy/paste)

```bash
# 1) Build the new image
docker build -t mcmerchant:latest .

# 2) Stop and remove old container (ignore errors if it doesn't exist)
docker stop mcmerchant-prod || true
docker rm mcmerchant-prod || true

# 3) Start the updated container
docker run -d --name mcmerchant-prod -p 3000:3000 --env-file .env mcmerchant:latest
```
