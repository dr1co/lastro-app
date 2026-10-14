export type TestUser = { name: string; email: string; password: string };

export const giovane: TestUser = { name: "Giovane", email: "giovane@example.com", password: "segredo123" };
export const rosangela: TestUser = { name: "Rosangela", email: "rosangela@example.com", password: "segredo456" };

type Email = { to: string; subject: string; text: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      resetDb(): Chainable<null>;
      /** Signs a user up through the auth API and marks the email as verified. */
      createUser(user: TestUser): Chainable<void>;
      /** Signs in through the auth API; the session cookie is kept for the next visits. */
      signIn(user: TestUser): Chainable<void>;
      /** Creates and verifies the user, then signs in. */
      login(user: TestUser): Chainable<void>;
      /** Creates a household from the onboarding page and waits for the dashboard. */
      createHousehold(name: string): Chainable<void>;
      /** The most recent email sent to `to`, with the first link it contains. */
      lastEmail(to: string): Chainable<Email & { link: string }>;
    }
  }
}

const origin = () => ({ Origin: Cypress.config("baseUrl")! });

Cypress.Commands.add("resetDb", () => cy.task("db:reset"));

Cypress.Commands.add("createUser", (user: TestUser) => {
  cy.request({ method: "POST", url: "/api/auth/sign-up/email", headers: origin(), body: user });
  cy.task("user:verify", user.email);
  cy.clearCookies();
});

Cypress.Commands.add("signIn", (user: TestUser) => {
  cy.request({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: origin(),
    body: { email: user.email, password: user.password },
  });
});

Cypress.Commands.add("login", (user: TestUser) => {
  cy.createUser(user);
  cy.signIn(user);
});

Cypress.Commands.add("createHousehold", (name: string) => {
  cy.visit("/bem-vindo");
  cy.findField("Nome da casa").type(name);
  cy.contains("button", "Criar casa").click();
  cy.location("pathname").should("eq", "/inicio");
});

/** Polls the outbox, since tasks are not retried by Cypress assertions. */
function pollEmail(to: string, attempts = 20): Cypress.Chainable<Email> {
  return cy.task<Email | null>("email:last", to, { log: false }).then((email) => {
    if (email) return cy.wrap(email, { log: false });
    if (attempts <= 1) throw new Error(`No email sent to ${to}`);
    return cy.wait(250, { log: false }).then(() => pollEmail(to, attempts - 1));
  });
}

Cypress.Commands.add("lastEmail", (to: string) =>
  pollEmail(to).then((email) => ({ ...email, link: email.text.match(/https?:\/\/\S+/)?.[0] ?? "" })),
);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** The visible form control labelled `label` (routes kept hidden by `<Activity>` are ignored). */
      findField(label: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("findField", (label: string) =>
  cy.contains("label:visible", new RegExp(`^${Cypress._.escapeRegExp(label)}$`)).then(($label) => cy.get(`[id="${$label.attr("for")}"]`)),
);
