FROM alpine:3.17.2

WORKDIR /app

COPY /app /app

EXPOSE 1163

RUN apk update && apk add \
python3 \
py3-pip \
py3-flask

RUN addgroup -S docker \
&& adduser -S --shell /bin/sh --ingroup docker vscode

ENTRYPOINT [ "python3" ]
CMD ["/app/app.py"]