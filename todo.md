# YoungMoney Admin Panel - TODO

## Backend (Database & APIs)

- [x] Schema do banco de dados
  - [x] Tabela de usuários do app (app_users)
  - [x] Tabela de notificações (notifications)
  - [x] Tabela de transações/pontos (transactions)
  - [x] Tabela de histórico de saques (withdrawals)
  - [x] Tabela de ranking (rankings)

- [x] APIs tRPC
  - [x] Dashboard: estatísticas gerais
  - [x] Usuários: listar, buscar, visualizar detalhes
  - [x] Pontos: adicionar, remover, histórico
  - [x] Notificações: criar, listar, enviar
  - [x] Ranking: listar top usuários, atualizar
  - [x] Saques: listar, aprovar, rejeitar

## Frontend (Interface Admin)

- [x] Layout e navegação
  - [x] DashboardLayout com sidebar
  - [x] Navegação entre páginas

- [x] Dashboard (Home)
  - [x] Cards de estatísticas (total usuários, pontos distribuídos, saques pendentes)
  - [x] Últimas transações

- [x] Gerenciamento de Usuários
  - [x] Tabela de usuários com busca e filtros
  - [x] Visualizar detalhes do usuário
  - [x] Adicionar pontos manualmente
  - [x] Remover pontos
  - [x] Histórico de transações do usuário

- [x] Sistema de Notificações
  - [x] Formulário para criar notificação
  - [x] Enviar para usuário específico ou todos
  - [x] Histórico de notificações enviadas
  - [ ] Notificações automáticas (1º, 2º, 3º lugar no ranking)

- [x] Monitoramento de Ranking
  - [x] Tabela de ranking atualizada
  - [x] Botão para atualizar rankings

- [x] Gestão de Saques
  - [x] Lista de saques pendentes
  - [x] Aprovar/Rejeitar saques
  - [x] Histórico de saques

## Funcionalidades Especiais

- [ ] Notificações automáticas (implementação futura)
  - [ ] Detectar mudanças no ranking
  - [ ] Enviar notificação para top 3
  - [ ] Notificar quando usuário recebe pontos

- [x] Sistema de logs
  - [x] Registrar todas as ações admin
  - [x] Auditoria de alterações de pontos

## Testes e Deploy

- [x] Testar funcionalidades principais
- [ ] Criar checkpoint final
- [ ] Documentação de uso

## Configuração Banco de Dados Real (Aiven)

- [x] Configurar variáveis de ambiente com credenciais MySQL Aiven
- [x] Aplicar schema no banco de dados Aiven
- [x] Testar conexão e verificar dados reais

## Adaptação para Banco de Dados Real

- [x] Inspecionar tabelas existentes no banco Aiven
- [x] Adaptar schema para usar tabelas reais do projeto YoungMoney
- [x] Atualizar queries e routers para dados reais
- [x] Testar conexão e exibição de dados reais

## Correção OAuth Callback

- [x] Criar tabela admin_auth_users no banco Aiven
- [x] Testar login e verificar funcionamento

## Correção de Queries SQL

- [x] Corrigir mapeamento de colunas no schema Drizzle (camelCase vs snake_case)
- [x] Atualizar queries no server/db.ts
- [x] Testar todas as páginas

## Correção de Erros de Queries e Procedures

- [x] Diagnosticar causa dos erros de query SQL
- [x] Verificar logs do servidor para detalhes
- [x] Corrigir procedures ausentes (appUsers.list, ranking.top, withdrawals.all)
- [x] Testar todas as páginas

## Diagnóstico de Erros Persistentes

- [ ] Acessar console Aiven e verificar configurações do servidor
- [ ] Diagnosticar erros que ainda ocorrem no painel
- [ ] Corrigir problemas identificados
