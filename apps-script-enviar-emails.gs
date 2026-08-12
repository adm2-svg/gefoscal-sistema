/**
 * Gefoscal — envia os e-mails da caixa para o sistema
 *
 * Roda dentro do Google Workspace, como a própria pessoa dona da caixa.
 * Por isso não precisa de conta de serviço, chave privada nem mexer em
 * política da organização: o script já tem permissão de ler o próprio Gmail.
 *
 * COMO INSTALAR (repetir nas três contas)
 *  1. Entre no Gmail com a conta (ex: financeiro@grupogefoscal.com.br)
 *  2. Abra script.google.com → Novo projeto
 *  3. Nome do projeto: "Gefoscal — enviar e-mails ao sistema"
 *  4. Apague o conteúdo do arquivo Código.gs e cole TODO este arquivo
 *  5. Troque o valor de SEGREDO abaixo pelo CRON_SECRET do Supabase
 *  6. Salve (ícone de disquete)
 *  7. No seletor de função, escolha "enviarEmails" e clique em Executar
 *     → vai pedir autorização: Revisar permissões → escolher a conta →
 *       "Avançado" → "Acessar Gefoscal (não seguro)" → Permitir
 *       (aparece "não seguro" porque o script é seu, não é publicado na loja)
 *  8. Menu Acionadores (relógio, à esquerda) → Adicionar acionador
 *       Função: enviarEmails
 *       Origem: Baseado no tempo
 *       Tipo: Timer de hora em hora
 *     → Salvar
 *
 * Pronto. De hora em hora ele manda os e-mails novos para o sistema.
 */

// ============ CONFIGURAÇÃO ============

// A mesma senha que está no segredo CRON_SECRET do Supabase
const SEGREDO = 'COLE_AQUI_O_CRON_SECRET';

const URL_SISTEMA =
  'https://dudouxbuhqjvkhhkdtas.supabase.co/functions/v1/receber-emails';

// Quantas horas para trás olhar a cada execução.
// 2 dá folga suficiente para uma execução falhar sem perder e-mail.
const HORAS = 2;

// Quantas conversas no máximo por execução (evita estourar o tempo limite)
const LIMITE = 50;

// ============ O SCRIPT ============

function enviarEmails() {
  const conta = Session.getActiveUser().getEmail();
  const desde = Math.floor(HORAS * 3600);

  // newer_than aceita d (dias); para horas usamos a busca por data
  const corte = new Date(Date.now() - HORAS * 3600 * 1000);
  const busca = 'in:inbox after:' + Math.floor(corte.getTime() / 1000);

  const conversas = GmailApp.search(busca, 0, LIMITE);
  const emails = [];

  conversas.forEach(function (conversa) {
    conversa.getMessages().forEach(function (msg) {
      if (msg.getDate() < corte) return; // mensagem antiga da mesma conversa

      emails.push({
        mensagem_id: msg.getId(),
        thread_id: conversa.getId(),
        remetente: msg.getFrom(),
        assunto: msg.getSubject(),
        // só um trecho: o conteúdo completo continua no Gmail
        resumo: msg.getPlainBody().substring(0, 300).replace(/\s+/g, ' ').trim(),
        recebido_em: msg.getDate().toISOString(),
        tem_anexo: msg.getAttachments().length > 0,
        link: 'https://mail.google.com/mail/u/0/#inbox/' + conversa.getId()
      });
    });
  });

  const resposta = UrlFetchApp.fetch(URL_SISTEMA, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-cron-secret': SEGREDO },
    payload: JSON.stringify({ conta: conta, emails: emails }),
    muteHttpExceptions: true
  });

  const codigo = resposta.getResponseCode();
  const texto = resposta.getContentText();
  Logger.log(conta + ' → ' + emails.length + ' e-mail(s) · resposta ' + codigo + ': ' + texto);

  if (codigo >= 300) {
    throw new Error('O sistema recusou: ' + codigo + ' ' + texto);
  }
  return texto;
}

/**
 * Use uma vez, na mão, para trazer os últimos 7 dias.
 * Depois é só deixar o acionador de hora em hora trabalhando.
 */
function enviarUltimos7Dias() {
  const conta = Session.getActiveUser().getEmail();
  const corte = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const conversas = GmailApp.search('in:inbox newer_than:7d', 0, 200);
  const emails = [];

  conversas.forEach(function (conversa) {
    conversa.getMessages().forEach(function (msg) {
      if (msg.getDate() < corte) return;
      emails.push({
        mensagem_id: msg.getId(),
        thread_id: conversa.getId(),
        remetente: msg.getFrom(),
        assunto: msg.getSubject(),
        resumo: msg.getPlainBody().substring(0, 300).replace(/\s+/g, ' ').trim(),
        recebido_em: msg.getDate().toISOString(),
        tem_anexo: msg.getAttachments().length > 0,
        link: 'https://mail.google.com/mail/u/0/#inbox/' + conversa.getId()
      });
    });
  });

  // manda em blocos de 100 para não estourar o tamanho da requisição
  let enviados = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const bloco = emails.slice(i, i + 100);
    const r = UrlFetchApp.fetch(URL_SISTEMA, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-cron-secret': SEGREDO },
      payload: JSON.stringify({ conta: conta, emails: bloco }),
      muteHttpExceptions: true
    });
    Logger.log('bloco ' + (i / 100 + 1) + ': ' + r.getResponseCode() + ' ' + r.getContentText());
    enviados += bloco.length;
  }
  Logger.log('total enviado: ' + enviados);
  return enviados;
}
