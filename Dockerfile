# testing build
# docker build -t like-follow-image:latest .
# docker run -p 9000:8080 like-follow-image:latest
# curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d {\"id\":\"01085656981\"}

FROM amazon/aws-lambda-nodejs:12
RUN curl https://intoli.com/install-google-chrome.sh | bash
COPY jsFiles/*.js package*.json ./
RUN npm install
CMD ["post.lambdaHandler"]