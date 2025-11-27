# to start all services inside the root where the docker compose file is present
docker compose up -d (The -d is for the detached mode)

# to start the services from another root folder where the compose file is not present 
docker compose -f filepathtothecompose up -d

# to start specific service from the docker compose use 
docker compose -f File_path_to_docker_compose up -d service_name(kafka) but not in brackets just use simple name

# to stop docker services for single and all containers

docker compose stop kafka
docker compose stop
