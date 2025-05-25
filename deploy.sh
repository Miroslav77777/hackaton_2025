echo "Switching to branch master"
git checkout master

echo "Building app..."
npm run build

echo "Deploying files to server..."
scp -r dist/* miro@51.250.38.26:/var/www/84.201.169.184/

echo "Done!"