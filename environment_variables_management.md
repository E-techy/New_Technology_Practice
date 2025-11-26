#to load env from the .env file
set -a; source .env; set +a

# to print env 
echo $nameofenv

# to add env directly without file
export name=value

# to delete 
unset nameofenv without $ symbol
