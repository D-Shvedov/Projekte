const Gun = require('gun');
const http = require('http');

const server = http.createServer();
Gun({ web: server });

const PORT = 8765;
server.listen(PORT, () => {
    console.log(`GUN Server läuft auf http://localhost:${PORT}/gun`);
});
