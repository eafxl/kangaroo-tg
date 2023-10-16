
timedatectl set-timezone Europe/<capital>
apt update
apt install nginx curl
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.bashrc


nvm install 20 && nvm use 20

Create the SSL certificate -
Let us make a directory to store all our ssl configuration.

sudo mkdir /etc/nginx/ssl
Next, create the key -

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
These options will create both a key file and a certificate. We will be asked a few questions about our server in order to embed the information correctly in the certificate.

Fill out the prompts appropriately. The most important line is the one that requests the Common Name (e.g. server FQDN or YOUR name).
You need to enter the domain name that you want to be associated with your server. You can enter the public IP address instead if you do not have a domain name.

Then configure Nginx to use SSL
Your server block may look something like this:

server {
        listen 80 default_server;
        listen [::]:80 default_server ipv6only=on;

        root /usr/share/nginx/html;
        index index.html index.htm;

        server_name your_domain.com;

        location / {
                try_files $uri $uri/ =404;
        }
}
The only thing we would need to do to get SSL working on this same server block, while still allowing regular HTTP connections, is add a these lines:

server {
        listen 80 default_server;
        listen [::]:80 default_server ipv6only=on;

        listen 443 ssl;

        root /usr/share/nginx/html;
        index index.html index.htm;

        server_name your_domain.com;
        ssl_certificate /etc/nginx/ssl/nginx.crt;
        ssl_certificate_key /etc/nginx/ssl/nginx.key;

        location / {
                try_files $uri $uri/ =404;
        }
}
When you are finished, save and close the file.
Check to see that there are no errors in the file by running nginx -t
Now, all you have to do is restart Nginx to use your new settings:

sudo service nginx restart
Now test your setup
Do this by specifying the https protocol instead of the http protocol.

https://server_domain_or_IP



pnpm install
npx playwright install chrome
