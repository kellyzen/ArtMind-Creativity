const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files from the public directories
app.use(express.static('public'));

app.get('/', async (req, res) => {
    // Read the contents of each HTML file
    const navbarContent = readFileContent('public/dev/navbar.html');
    const homeContent = readFileContent('public/dev/home/home.html');
    const aboutContent = readFileContent('public/dev/about/about.html');
    const instructionsContent = readFileContent('public/dev/instructions/instructions.html');
    const testContent = readFileContent('public/dev/test/test.html');

    // Read the contents of index.html
    const indexContent = fs.readFileSync('index.html', 'utf8');

    // Replace placeholders in index.html with the corresponding content
    const finalContent = indexContent
        .replace('<!-- {{navbar}} -->', navbarContent)
        .replace('<!-- {{home}} -->', homeContent)
        .replace('<!-- {{about}} -->', aboutContent)
        .replace('<!-- {{instructions}} -->', instructionsContent)
        .replace('<!-- {{test}} -->', testContent);

    // Send the modified HTML to the client
    res.send(finalContent);
});

function readFileContent(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
