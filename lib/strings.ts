/** All user-facing pt-BR copy lives here so i18n can be added later. */
export const strings = {
  app: {
    name: "Lastro",
    tagline: "Planeje hoje, conquiste amanhã.",
    description: "Sua visão financeira, em um só lugar.",
  },
  transactionTypes: {
    income: "Receita",
    expense: "Despesa",
    transfer: "Transferência",
    refund: "Reembolso",
    investment_return: "Rendimento",
    adjustment: "Ajuste de saldo",
  },
  paymentMethods: {
    pix: "PIX",
    debit: "Débito",
    credit: "Crédito",
    boleto: "Boleto",
    auto_debit: "Débito automático",
    bank_transfer: "Transferência",
    cash: "Dinheiro",
  },
  accountKinds: {
    checking: "Conta corrente",
    savings: "Poupança",
    investment: "Investimento",
    cash: "Dinheiro",
    wallet: "Carteira digital",
  },
  categoryKinds: {
    income: "Receita",
    expense: "Despesa",
  },
  errors: {
    required: "Campo obrigatório.",
    invalidDate: "Data inválida.",
    invalidOption: "Opção inválida.",
    positiveAmount: "Informe um valor maior que zero.",
    sameAccount: "Escolha uma conta de destino diferente da origem.",
    transferCategory: "Transferências não têm categoria.",
  },
} as const;
