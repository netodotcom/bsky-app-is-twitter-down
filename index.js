const dns = require('dns');
const https = require('https');

function verificarDNS(dominio) {
    dns.resolve(dominio, 'A', (err, enderecos) => {
        if (err) {
            if (err.code === 'ENOTFOUND') {
                console.log(`${dominio} não resolve no DNS. Pode estar bloqueado.`);
            } else {
                console.log(`Erro ao resolver DNS de ${dominio}:`, err);
            }
        } else {
            console.log(`${dominio} resolve no DNS. Endereços IP:`);
            console.log(enderecos);
            verificarAcessoHTTPS(dominio);
        }
    });
}

function verificarAcessoHTTPS(dominio) {
    https.get(`https://${dominio}`, (res) => {
        console.log(`Conseguiu conectar ao ${dominio} via HTTPS. Status Code: ${res.statusCode}`);
        res.on('data', (chunk) => {});
        res.on('end', () => {});
    }).on('error', (err) => {
        console.log(`Erro ao tentar conectar ao ${dominio} via HTTPS:`, err.message);
    });
}

const dominio = 'twitter.com';
verificarDNS(dominio);
