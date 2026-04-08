# Update Docker Image

```bash
cd /home/sanamo/MCMerchant/mcmerchant
docker rm -f clamav-daemon || true
docker run -d --name clamav-daemon \
	--restart unless-stopped \
	--network host \
	clamav/clamav:latest
docker build -t mcmerchant:latest .
docker rm -f mcmerchant-prod || true
docker run -d --name mcmerchant-prod --network host --env-file .env mcmerchant:latest
```

If Docker networking is fixed later, the last command can go back to `-p 3000:3000`.
