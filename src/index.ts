import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import * as dns from 'dns';
import * as https from 'https';

dotenv.config();

const agent = new BskyAgent({ service: 'https://bsky.social' });

async function main() {
    const dominio = 'twitter.com';

    dns.resolve(dominio, 'A', async (err, enderecos) => {
        if (err) {
            if (err.code === 'ENOTFOUND') {
                await publicarStatus(`🚫 ${dominio} não resolve no DNS. Pode estar bloqueado no nível DNS.`);
            } else {
                await publicarStatus(`⚠️ Erro ao resolver DNS de ${dominio}: ${err.message}`);
            }
        } else {
            const ips = enderecos.join(', ');
            await publicarStatus(`✅ X (Antigo Twitter) resolve no DNS.\n Endereços IP: [${ips}]`);
            verificarAcessoHTTPS(dominio);
        }
    });
}

function verificarAcessoHTTPS(dominio: string) {
    https.get(`https://${dominio}`, async (res) => {
        const statusMessage = `🔗 Conexão HTTPS com X (Antigo Twitter) estabelecida.`;
        if (res.statusCode === 200) {
            await publicarStatus(`${statusMessage}\n✅ DNS e HTTPS funcionam. O site está acessível.`);
        } else {
            await publicarStatus(`${statusMessage}\n⚠️ Pode haver um bloqueio parcial. O status é ${res.statusCode}.`);
        }
    }).on('error', async (err) => {
        await publicarStatus(`🚫 Erro na conexão HTTPS com X (Antigo Twitter): ${err.message}\n🚫 DNS resolve, mas HTTPS falha. Pode estar bloqueado em outro nível.`);
    });
}

async function publicarStatus(status: string) {
    try {
        await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD! });
        await agent.post({ text: status });
        console.log("Post realizado com sucesso!");
    } catch (error) {
        console.error("Erro ao postar:", error);
    }
}

const interval = 60000;

async function startPosting() {
    await main();
    setInterval(main, interval);
}

startPosting();
