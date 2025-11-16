# Deploy no Railway - YoungMoney Admin Panel

## 🚀 Guia de Deploy Rápido

### Pré-requisitos
- Conta no Railway (https://railway.app)
- Repositório GitHub: https://github.com/Carlos20473736/youngmoney-admin

### Passo 1: Criar Novo Projeto no Railway

1. Acesse https://railway.app/dashboard
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório **`Carlos20473736/youngmoney-admin`**
5. Railway detectará automaticamente o projeto Node.js

### Passo 2: Configurar Variáveis de Ambiente

No Railway Dashboard, vá para a aba **Variables** e adicione as seguintes variáveis:

```env
DATABASE_URL=<sua-connection-string-mysql>
NODE_ENV=production
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=youngmoney-admin
VITE_APP_TITLE=YoungMoney Admin
```

**Nota**: Substitua `<sua-connection-string-mysql>` pela connection string real do seu banco de dados MySQL.

**Importante**: Railway define automaticamente a variável `PORT`, não é necessário configurá-la.

### Passo 3: Configurar Domínio Personalizado

1. Após o deploy bem-sucedido, vá para a aba **Settings**
2. Role até a seção **Domains**
3. Clique em **"Generate Domain"** para obter um domínio Railway gratuito
4. Ou clique em **"Custom Domain"** para adicionar seu domínio personalizado

#### Para domínio personalizado:

1. Clique em **"Custom Domain"**
2. Digite seu domínio ou subdomínio (ex: `admin.seudominio.com`)
3. Railway fornecerá um registro CNAME
4. Adicione o registro CNAME no seu provedor de DNS:
   - **Type**: CNAME
   - **Name**: admin (ou subdomínio escolhido)
   - **Value**: [valor fornecido pelo Railway]
   - **TTL**: 3600 (ou automático)

### Passo 4: Deploy Automático

Railway fará o deploy automaticamente após a configuração. O processo inclui:

1. ✅ Clone do repositório
2. ✅ Instalação de dependências (`pnpm install`)
3. ✅ Build do projeto (`pnpm build`)
4. ✅ Inicialização do servidor (`node dist/index.js`)

### Passo 5: Verificar Deploy

1. Aguarde o deploy completar (geralmente 2-5 minutos)
2. Acesse o domínio gerado ou personalizado
3. Verifique se o painel está funcionando corretamente

## 📋 Comandos de Build

O Railway executará automaticamente:

```bash
# Instalação
pnpm install

# Build
pnpm build

# Start
node dist/index.js
```

## 🔧 Configurações Técnicas

### Build Configuration
- **Builder**: Nixpacks (detectado automaticamente)
- **Node Version**: Detectada via `package.json`
- **Package Manager**: pnpm

### Runtime
- **Start Command**: `node dist/index.js`
- **Restart Policy**: ON_FAILURE (até 10 tentativas)

### Recursos Recomendados
- **RAM**: Mínimo 512MB (recomendado 1GB)
- **CPU**: 1 vCPU suficiente
- **Região**: Escolha a mais próxima dos usuários

## 🌐 Domínios

### Domínio Railway Gratuito
Railway fornece automaticamente um domínio no formato:
- `youngmoney-admin-production.up.railway.app`

### Domínio Personalizado
Configure qualquer domínio ou subdomínio de sua preferência.

## 🔐 Segurança

### Variáveis Sensíveis
- ✅ Todas as variáveis de ambiente são criptografadas
- ✅ Conexão SSL/TLS automática
- ✅ DATABASE_URL protegida (não aparece em logs)

### Autenticação
- Em produção (`NODE_ENV=production`), o OAuth está ativo
- Usuários precisam autenticar via https://oauth.manus.im

## 📊 Monitoramento

Railway oferece:
- **Logs em tempo real**: Aba "Deployments" → "View Logs"
- **Métricas**: CPU, RAM, Network
- **Healthcheck**: Automático via HTTP

## 🔄 Atualizações Futuras

Para atualizar o painel:

1. Faça commit das mudanças no GitHub
2. Railway fará deploy automático da nova versão

## 🆘 Troubleshooting

### Build Falhou
- Verifique os logs na aba "Deployments"
- Confirme que todas as dependências estão no `package.json`

### Aplicação não inicia
- Verifique se `DATABASE_URL` está configurada corretamente
- Confirme que o banco de dados está acessível
- Verifique os logs de runtime

### Domínio não funciona
- Aguarde propagação DNS (até 48h, geralmente 1-2h)
- Verifique se o registro CNAME está correto

## ✅ Checklist de Deploy

- [ ] Repositório GitHub configurado
- [ ] Projeto criado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] Domínio configurado
- [ ] Aplicação acessível
- [ ] Autenticação funcionando
- [ ] Banco de dados conectado

---

**Repositório**: https://github.com/Carlos20473736/youngmoney-admin
**Railway**: https://railway.app
