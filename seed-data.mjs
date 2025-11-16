import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { appUsers, notifications, transactions, withdrawals } from "./drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não configurada");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("🌱 Populando banco de dados com dados de exemplo...");

// Inserir usuários de exemplo
const users = [
  { name: "João Silva", email: "joao@example.com", phone: "11999999999", balance: 1500, totalEarned: 2000, totalWithdrawn: 500, tasksCompleted: 25, currentStreak: 7 },
  { name: "Maria Santos", email: "maria@example.com", phone: "11888888888", balance: 2300, totalEarned: 3000, totalWithdrawn: 700, tasksCompleted: 35, currentStreak: 12 },
  { name: "Pedro Oliveira", email: "pedro@example.com", phone: "11777777777", balance: 890, totalEarned: 1200, totalWithdrawn: 310, tasksCompleted: 18, currentStreak: 3 },
  { name: "Ana Costa", email: "ana@example.com", phone: "11666666666", balance: 3200, totalEarned: 4500, totalWithdrawn: 1300, tasksCompleted: 52, currentStreak: 15 },
  { name: "Carlos Mendes", email: "carlos@example.com", phone: "11555555555", balance: 670, totalEarned: 900, totalWithdrawn: 230, tasksCompleted: 12, currentStreak: 2 },
  { name: "Juliana Rocha", email: "juliana@example.com", phone: "11444444444", balance: 1890, totalEarned: 2500, totalWithdrawn: 610, tasksCompleted: 28, currentStreak: 9 },
  { name: "Roberto Lima", email: "roberto@example.com", phone: "11333333333", balance: 4100, totalEarned: 5000, totalWithdrawn: 900, tasksCompleted: 60, currentStreak: 20 },
  { name: "Fernanda Alves", email: "fernanda@example.com", phone: "11222222222", balance: 560, totalEarned: 800, totalWithdrawn: 240, tasksCompleted: 10, currentStreak: 1 },
  { name: "Lucas Ferreira", email: "lucas@example.com", phone: "11111111111", balance: 2750, totalEarned: 3500, totalWithdrawn: 750, tasksCompleted: 42, currentStreak: 14 },
  { name: "Patricia Souza", email: "patricia@example.com", phone: "11000000000", balance: 1200, totalEarned: 1800, totalWithdrawn: 600, tasksCompleted: 22, currentStreak: 5 },
];

await db.insert(appUsers).values(users.map(user => ({
  name: user.name,
  email: user.email,
  phone: user.phone,
  balance: user.balance,
  totalEarned: user.totalEarned,
  totalWithdrawn: user.totalWithdrawn,
  tasksCompleted: user.tasksCompleted,
  currentStreak: user.currentStreak,
  status: "active",
})));

console.log(`✅ ${users.length} usuários criados`);

// Inserir transações de exemplo
const transactionsData = [
  { userId: 1, amount: 100, type: "task", description: "Completou tarefa diária" },
  { userId: 1, amount: 50, type: "reward", description: "Bônus de streak" },
  { userId: 2, amount: 200, type: "task", description: "Completou desafio semanal" },
  { userId: 3, amount: -100, type: "withdrawal", description: "Saque via PIX" },
  { userId: 4, amount: 150, type: "admin_add", description: "Compensação por bug", adminId: 1 },
  { userId: 5, amount: 75, type: "task", description: "Assistiu vídeo" },
  { userId: 6, amount: 120, type: "reward", description: "Indicação de amigo" },
  { userId: 7, amount: -50, type: "admin_remove", description: "Correção de saldo", adminId: 1 },
  { userId: 8, amount: 90, type: "task", description: "Completou quiz" },
  { userId: 9, amount: 180, type: "task", description: "Participou de pesquisa" },
];

await db.insert(transactions).values(transactionsData.map(tx => ({
  userId: tx.userId,
  amount: tx.amount,
  type: tx.type,
  description: tx.description,
  adminId: tx.adminId || null,
})));

console.log(`✅ ${transactionsData.length} transações criadas`);

// Inserir notificações de exemplo
const notificationsData = [
  { userId: 1, title: "Bem-vindo!", message: "Obrigado por se juntar ao YoungMoney!", type: "info" },
  { userId: 2, title: "Parabéns!", message: "Você está em 2º lugar no ranking!", type: "ranking" },
  { userId: 4, title: "Você ganhou pontos!", message: "Recebeu 150 pontos de compensação", type: "reward" },
  { userId: null, title: "Novo desafio disponível", message: "Complete o desafio semanal e ganhe 200 pontos!", type: "info" },
  { userId: 7, title: "🏆 Primeiro lugar!", message: "Parabéns! Você alcançou o primeiro lugar no ranking!", type: "ranking" },
];

await db.insert(notifications).values(notificationsData.map(notif => ({
  userId: notif.userId,
  title: notif.title,
  message: notif.message,
  type: notif.type,
  isRead: 0,
  sentBy: 1,
})));

console.log(`✅ ${notificationsData.length} notificações criadas`);

// Inserir saques de exemplo
const withdrawalsData = [
  { userId: 1, amount: 500, method: "pix", accountInfo: JSON.stringify({ cpf: "123.456.789-00", chave: "joao@example.com" }), status: "completed" },
  { userId: 3, amount: 310, method: "pix", accountInfo: JSON.stringify({ cpf: "987.654.321-00", chave: "11999999999" }), status: "pending" },
  { userId: 4, amount: 1000, method: "paypal", accountInfo: JSON.stringify({ email: "ana@paypal.com" }), status: "approved" },
  { userId: 6, amount: 200, method: "pix", accountInfo: JSON.stringify({ cpf: "456.789.123-00", chave: "juliana@example.com" }), status: "pending" },
];

await db.insert(withdrawals).values(withdrawalsData.map(withdrawal => ({
  userId: withdrawal.userId,
  amount: withdrawal.amount,
  method: withdrawal.method,
  accountInfo: withdrawal.accountInfo,
  status: withdrawal.status,
})));

console.log(`✅ ${withdrawalsData.length} saques criados`);

console.log("✅ Rankings serão atualizados automaticamente");

await connection.end();

console.log("🎉 Seed concluído com sucesso!");
