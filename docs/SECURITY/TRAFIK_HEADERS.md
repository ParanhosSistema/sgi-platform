
Labels de segurança (Traefik):
- traefik.http.middlewares.sgi-sec.headers.stsSeconds=31536000
- traefik.http.middlewares.sgi-sec.headers.stsIncludeSubdomains=true
- traefik.http.middlewares.sgi-sec.headers.stsPreload=true
- traefik.http.middlewares.sgi-sec.headers.frameDeny=true
- traefik.http.middlewares.sgi-sec.headers.contentTypeNosniff=true
- traefik.http.middlewares.sgi-sec.headers.referrerPolicy=same-origin
Routers:
- traefik.http.routers.sgi-api.middlewares=sgi-sec@docker
- traefik.http.routers.sgi-web.middlewares=sgi-sec@docker
